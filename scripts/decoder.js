importScripts('aes.js');

var me = self;

(function (){
    'use strict';
    let mimerPort, sharedMimerPort;

    onmessage = (e) => {
        const data = e.data;
        switch (data.cmd) {
            case 'connect':
                handleConnect(e);
                break;
            case 'sharedConnect':
                handleSharedConnect(e);
                break;
            default:
                processData(data);
                break;
        }
    };

    const processData = (data) => {
        loadData2(data.urls[0], (result) => {
            data.data = result;
            data.data = decode(data.data, data.pass, data.isImg);
            if(data.isImg && mimerPort) {
                postData(data, mimerPort);
            }
            else if(data.isImg && sharedMimerPort) {
                postData(data, sharedMimerPort);
            }
            else {
                postData(data);
            }
        });
    }

    , postData = (data, port) => {
        if(data.cmd === 'connect') {
            return;
        }
        port = port || me;
        //https://bugs.chromium.org/p/chromium/issues/detail?id=334408
        const canTransfer = data.isImg && (port === me);
        port.postMessage(data, canTransfer ? [data.data.buffer] : null);
    }

    , decode = (data, pass, binary) => {
        const prefix = 'U2FsdGVkX1';
        data = data.replace(/[\t\s\r\n]/g, '');
        if(!data.startsWith(prefix)) {
            data = prefix + data;
        }
        const wa = CryptoJS.AES.decrypt(data, pass);
        if(binary) {
            return toOutput(wa);
        }
        return wa.toString(CryptoJS.enc.Utf8);
    }

    , toOutput = (wordArray) => {
        const words = wordArray.words;
        const len = +wordArray.sigBytes;
        const buffer = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            buffer[i] = byte;
        }
        return buffer;
    }

    , handleConnect = (e) => {
        mimerPort = e.ports[0];
        mimerPort.onmessage = function(event) {
            console.log(`from mimer ${event.data.cmd}`);
            postData(event.data, me);
        };
    }

    , handleSharedConnect = (e) => {
        sharedMimerPort = e.ports[0];
        sharedMimerPort.onmessage = function(event) {
            switch(event.data.cmd) {
                case 'process':
                    console.log(`from shared mimer ${event.data.cmd} : ${event.data.count}`);
                    postData(event.data, me);
                    break;
                case 'broadcast':
                    console.log(`from shared mimer broadcast ${event.data.count}`);
                    break;
            }
        };
    }

    , loadData = (url, onloadFn) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() { onloadFn(this.response); };
        xhr.open('GET', url);
        xhr.send();
    }

    , loadData2 = (url, onloadFn) => {
        self.fetch(url).then(response => {
            bufferedReader(response.body.getReader()).then(onloadFn);
        });
    }

    , bufferedReader = (reader) => {
        let data = null;
        return new Promise((resolve, reject) => {
            let pump = () => {
                reader.read().then(readResult => {
                    if(readResult.done) {
                        resolve((new TextDecoder('utf-8')).decode(data));
                        return;
                    }
                    if(!data) {
                        data = readResult.value;
                    }
                    else {
                        let temp = new Uint8Array(data.byteLength + readResult.value.byteLength);
                        temp.set(data, 0);
                        temp.set(readResult.value, data.byteLength);
                        data = temp;
                    }
                    pump();
                }).catch(reject);
            };
            pump();
        });
    }

    ;

})();




