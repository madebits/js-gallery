(function (){
    'use strict';
    let decoderPort;

    onmessage = function (e) {
        const data = e.data;
        switch (data.cmd) {
            case 'connect':
                decoderPort = e.ports[0];
                decoderPort.onmessage = function(event) {
                    console.log(`nested from decoder ${event.data.cmd}`);
                    event.data.mime = getMime(event.data.data);
                    decoderPort.postMessage(event.data);
                };
                break;
        }
    };

    const getMime = (raw) => {
        const match = p => ((raw.byteLength >= p.length) && p.every((b, i) => raw[i] === b));
        if(match([0xff, 0xd8, 0xff])) return 'image/jpeg';
        if(match([0x89, 0x50, 0x4e, 0x47])) return 'image/png';
        if(match([0x47, 0x49, 0x46])) return 'image/gif';
        return null;
    }

    ;

})();

