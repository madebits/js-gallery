var cjsenc = (function() {
    'use strict';

    let pass = ''
        , el = document
        , decoders
        , postProcess
        , baseUri
        ;

    const decodersPool = 2
        , mimerDemo = false
        , sharedMimerDemo = false
        , placeHolder = "data:image/gif;base64,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"
        ;

    const process = (element, password, postProcessFn, force, urlPrefix) => {
        init();
        if(force) cleanUp(null, true);
        el = element || document;
        pass = password || pass || window.prompt("Password");
        if(!pass) return;
        baseUri = urlPrefix || baseUri;
        postProcess = postProcessFn;
        processElements();
    }

    , init = () => {
        if(decoders) return;
        decoders = [];
        for(let i = 0; i < decodersPool; i++) {
            const w = new Worker('scripts/decoder.js');
            w.onmessage = function(event) {
                const data = event.data;
                onNewData(data);
            };
            const m = initDemo(w);
            decoders.push({w: w, m: m});
        }
    }

    , initDemo = w => {
            let m = null;
            if(mimerDemo) {
                m = new Worker('scripts/mimer.js');
                const channel = new MessageChannel();
                w.postMessage({cmd: 'connect'}, [channel.port1]);
                m.postMessage({cmd: 'connect'}, [channel.port2]);
            }
            else if(sharedMimerDemo) {
                const sharedWorker = new SharedWorker('scripts/shared.js');
                sharedWorker.port.start();
                w.postMessage({cmd: 'sharedConnect'}, [sharedWorker.port]);
            }
            return m;
    }

    , cleanUp = (element, cleanPass) => {
        if(cleanPass) {
            pass = null;
            baseUri = null;
        }
        let e = (element || el).querySelectorAll('img.cjsenc');
        if(e) {
            for (let m of e) {
                m.removeAttribute('data-cjsenc');
                window.URL.revokeObjectURL(m.src);
                m.src = placeHolder;
                //m.setAttribute('src', '');
            }
        }
        e = (element || el).querySelectorAll('div.cjsenc');
        if(e) {
            for (let m of e) {
                m.removeAttribute('data-cjsenc');
                //m.innerHTML = '';
            }
        }
    }

    , processElements = () => {
        const e = el.querySelectorAll('.cjsenc');
        if(!e) return;

        const map = new Map();
        for(let m of e) {
            if(m.getAttribute('data-cjsenc')) continue;
            const tagName = m.tagName.toUpperCase();
            const isImg = tagName === 'IMG';
            const isDiv = tagName === 'DIV';
            if(!(isImg || isDiv)) continue;
            const src = m.getAttribute('data-src');
            if(isImg && !m.src) {
                m.src = placeHolder;
            }
            m.setAttribute("data-cjsenc", src);
            map.set(src, { src, isImg, largeSrc: isImg ? m.getAttribute('data-large') : '' });
        }

        for(let data of map.values()) {
            data.urls = toUrl([data.src, data.largeSrc]);
            processData(data);
        }
    }

    , toUrl = (urls) => {
        const anchor = document.createElement('a');
        return urls.map((url) => {
            if(!url) return url;
            const u = url.toLowerCase();
            if(baseUri
                && !u.startsWith(baseUri.toLowerCase())
                && !u.startsWith('http://')
                && !u.startsWith('https://')) url = baseUri + url;
            anchor.href = url;
            return anchor.href;
        });
    }

    , processData = (data) => {
        data.cmd = 'process';
        data.pass = pass;
        const idx = Math.floor(Math.random() * decodersPool);
        decoders[idx].w.postMessage(data);
    }

    , onNewData = (data) => {
        const raw = data.data;
        if(data.isImg) {
            const e = el.querySelectorAll("img.cjsenc[data-cjsenc='" + data.src + "']");
            if(!e || !e.length) return;
            if(!data.mime) data.mime = getMime(raw);
            const blob = new Blob([raw], {type: data.mime });
            const url = URL.createObjectURL(blob);
            for(let m of e) {
                m.src = url;
                m.setAttribute('data-mime', data.mime || '');
                if(data.largeSrc) m.setAttribute('data-largeSrc', data.largeSrc);
                customPostProcess({ element: m, isImg: true, src: data.src, largeSrc: data.largeSrc, urls: data.urls });
            }
        }
        else {
            const e = el.querySelectorAll("div.cjsenc[data-cjsenc='" + data.src + "']");
            if(!e || !e.length) return;
            for(let m of e) {
                m.innerHTML = raw;
                customPostProcess({ element: m, isImg: false, src: data.src, urls: data.urls });
            }
            processElements();
        }
    }

    , customPostProcess = function() {
        if (postProcess) postProcess.apply(null, arguments);
    }

    , getMime = (raw) => {
        const match = p => ((raw.byteLength >= p.length) && p.every((p, i) => raw[i] === p));
        if(match([0xff, 0xd8, 0xff])) return 'image/jpeg';
        if(match([0x89, 0x50, 0x4e, 0x47])) return 'image/png';
        if(match([0x47, 0x49, 0x46])) return 'image/gif';
        return null;
    }

    ;

    return ({ process, cleanUp });

})();
