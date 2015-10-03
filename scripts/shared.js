(function (){
    'use strict';

    let callsCount = 0;
    const clients = [];

    onconnect = function(e) {
        var port = e.ports[0];
        clients.push(port);
        port.onmessage = function(event) {
            callsCount++;
            console.log(`shared from decoder ${event.data.cmd}`);
            event.data.mime = getMime(event.data.data);
            event.data.count = callsCount;
            port.postMessage(event.data);
            if((callsCount % 4) === 0) clients.forEach(p => p.postMessage({cmd: 'broadcast', count: callsCount}));
        };
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