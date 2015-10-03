var ui = (function() {
    'use strict';

    let lastScroll = [0, 0]
    , lastPreview = null
    ;

    const decode = () => {
        const url = $('#index').getAttribute('data-src');
        const idx = url.lastIndexOf('/');
        const baseUri = (idx >= 0) ? url.substr(0, idx + 1) : null;
        cjsenc.process($('#content'), null, postProcessImage, true, baseUri);
    }

    , postProcessImage = data => {
        if (data.isImg) {
            const e = data.element;
            const largeImgUrl = data.urls.length > 1 ? data.urls[1] : null;
            if (!!largeImgUrl) {
                e.onclick = imgClick;
            }
        }
    }

    , imgClick = e => showImg(e.srcElement)

    , showImg = (m, internalCall) => {
        lastPreview = m;
        const url = m.getAttribute('data-largeSrc');
        const p = $('#preview');
        const setEvent = (event, handler) => {
          if(typeof p[event] !== 'function') {
              p[event] = handler;
          }
        };

        setEvent('onclick', e => {
            if (e && (e.which == 2)) {
                hideImg();
                return;
            }
            nextImg(true);
        });

        setEvent('onkeydown', e => {
            switch (e.keyCode) {
                case 32: // space
                case 39:
                case 40:
                    nextImg(true);
                    break;
                case 13: // enter
                    window.open($('#previewImg').src);
                    break;
                case 38:
                case 37:
                    nextImg(false);
                    break;
                case 27: // esc
                    hideImg();
                    break;
            }
        });

        setEvent('onmousewheel', e => {
            if(e.wheelDelta < 0) nextImg(true);
            else nextImg(false);
        });

        const c = p.firstChild;
        let process = false;
        if(!c || !(c.getAttribute('data-src') === url) || !c.src) {
            p.innerHTML = `<img id="previewImg" class="cjsenc" data-src="${url}"><button id="previewClose">X</button>`;
            process = true;
            $('#previewClose').onclick = e => {
                hideImg();
                e.stopPropagation();
            };
        }

        if(!internalCall) {
            showPreview(true);
        }

        if(process) {
            cjsenc.cleanUp(p);
            cjsenc.process(p, null, postProcessImage, false);
        }
    }

    , hideImg = () => {
        showPreview(false);
        //cjsenc.cleanUp(p);
    }

    , nextImg = next => {
        const n = `${next ? 'next' : 'previous'}ElementSibling`;
        if(lastPreview && lastPreview[n]) {
            showImg(lastPreview[n], true);
            return;
        }
        hideImg();
    }

    , showPreview = on => {
        const show = (id, on) => $(id).style.display = on ? 'block' : 'none'
        , onOn = () => {
            const flow = on ? 'hidden' : 'visible';
            document.body.style.overflow = flow;
            show('#preview', on);
            show('#index', !on);
            fullScreen(on);
        };

        if(on) {
            lastScroll = [window.scrollX, window.scrollY];
            onOn();
            $('#preview').focus();
        }
        else {
            onOn();
            setTimeout(() => window.scrollBy(...lastScroll), 10);
        }
    }

    , onLoad = () => {
        $('#decode').onclick = decode;
        window.onhashchange = function() {
            processHash();
            decode();
        };
        processHash();
    }

    , processHash = () => {
        const url = location.hash.substr(1);
        if(url) {
            $('#index').setAttribute('data-src', url);
        }
    }

    ;

    window.onload = onLoad;

}());