// Publication figure lightbox: click a publication cover to inspect the
// full-resolution image without leaving the page.
(function () {
    'use strict';

    function init() {
        var root = document.getElementById('pub-lightbox');
        if (!root) {
            return;
        }

        var stage = root.querySelector('[data-pub-lightbox-stage]');
        var image = root.querySelector('[data-pub-lightbox-image]');
        var loader = root.querySelector('[data-pub-lightbox-loader]');
        var titleEl = root.querySelector('#pub-lightbox-title');
        var hintEl = root.querySelector('[data-pub-lightbox-hint]');
        var originalLink = root.querySelector('[data-pub-lightbox-original]');
        var zoomBtn = root.querySelector('[data-pub-lightbox-zoom]');
        var closeBtn = root.querySelector('.pub-lightbox-btn[data-pub-lightbox-close]');
        var zoomIcon = zoomBtn ? zoomBtn.querySelector('i') : null;

        var isOpen = false;
        var lastFocused = null;

        function isZoomed() {
            return stage.classList.contains('is-zoomed');
        }

        function canZoom() {
            if (!image.naturalWidth || !image.naturalHeight) {
                return false;
            }
            return image.naturalWidth > stage.clientWidth + 2 ||
                image.naturalHeight > stage.clientHeight + 2;
        }

        function setZoomIcon(zoomed) {
            if (!zoomIcon) {
                return;
            }
            zoomIcon.classList.toggle('fa-magnifying-glass-plus', !zoomed);
            zoomIcon.classList.toggle('fa-magnifying-glass-minus', zoomed);
        }

        function setHint(text) {
            if (hintEl) {
                hintEl.textContent = text;
            }
        }

        function resetView() {
            stage.classList.remove('is-zoomed');
            root.classList.remove('is-zoomed', 'is-full', 'is-loaded', 'is-error');
            stage.scrollLeft = 0;
            stage.scrollTop = 0;
            zoomBtn.disabled = false;
            zoomBtn.setAttribute('aria-pressed', 'false');
            setZoomIcon(false);
        }

        function applyZoom(zoomed, event) {
            var ratioX = 0.5;
            var ratioY = 0.5;

            if (zoomed && event) {
                var rect = image.getBoundingClientRect();
                if (rect.width && rect.height) {
                    ratioX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
                    ratioY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
                }
            }

            stage.classList.toggle('is-zoomed', zoomed);
            root.classList.toggle('is-zoomed', zoomed);
            zoomBtn.setAttribute('aria-pressed', zoomed ? 'true' : 'false');
            setZoomIcon(zoomed);
            setHint(zoomed ? 'Click the image to fit it to the screen' : 'Click the image to zoom in');

            if (zoomed) {
                // Keep the point that was clicked near the centre of the screen.
                window.requestAnimationFrame(function () {
                    var left = image.offsetLeft + image.offsetWidth * ratioX - stage.clientWidth / 2;
                    var top = image.offsetTop + image.offsetHeight * ratioY - stage.clientHeight / 2;
                    stage.scrollLeft = Math.max(0, left);
                    stage.scrollTop = Math.max(0, top);
                });
            } else {
                stage.scrollLeft = 0;
                stage.scrollTop = 0;
            }
        }

        function toggleZoom(event) {
            if (!isOpen || root.classList.contains('is-error')) {
                return;
            }
            if (!isZoomed() && !canZoom()) {
                return;
            }
            applyZoom(!isZoomed(), event);
        }

        function open(trigger) {
            var src = trigger.getAttribute('href') || trigger.getAttribute('data-pub-lightbox-src');
            if (!src) {
                return;
            }

            lastFocused = trigger;
            isOpen = true;
            resetView();

            var title = trigger.getAttribute('data-pub-lightbox-title') || '';
            titleEl.textContent = title;
            image.alt = title ? title + ' figure' : 'Publication figure';
            originalLink.href = src;
            setHint('Loading image\u2026');

            image.onload = function () {
                if (!isOpen || image.getAttribute('src') !== src) {
                    return;
                }
                root.classList.add('is-loaded');
                if (canZoom()) {
                    setHint('Click the image to zoom in');
                } else {
                    root.classList.add('is-full');
                    zoomBtn.disabled = true;
                    setHint('Shown at full resolution');
                }
            };

            image.onerror = function () {
                if (!isOpen) {
                    return;
                }
                root.classList.add('is-error');
                zoomBtn.disabled = true;
                setHint('The image could not be loaded. Try the open-original button.');
            };

            document.body.classList.add('pub-lightbox-open');
            root.classList.add('is-open');
            root.setAttribute('aria-hidden', 'false');

            closeBtn.focus({ preventScroll: true });

            image.removeAttribute('src');
            image.src = src;
        }

        function close() {
            if (!isOpen) {
                return;
            }
            isOpen = false;
            root.classList.remove('is-open');
            document.body.classList.remove('pub-lightbox-open');

            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus({ preventScroll: true });
            }
            lastFocused = null;
            root.setAttribute('aria-hidden', 'true');

            // Drop the decoded image so it does not stay in memory.
            image.onload = null;
            image.onerror = null;
            image.removeAttribute('src');
            resetView();
        }

        // Thumbnails are ordinary links to the full image, so they still work
        // without JavaScript; here the click is upgraded to the lightbox.
        document.addEventListener('click', function (event) {
            var target = event.target;
            if (!(target instanceof Element)) {
                return;
            }
            var trigger = target.closest('[data-pub-lightbox]');
            if (!trigger) {
                return;
            }
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                return;
            }
            event.preventDefault();
            open(trigger);
        });

        root.addEventListener('click', function (event) {
            var target = event.target;
            if (!(target instanceof Element)) {
                return;
            }
            if (target.closest('[data-pub-lightbox-close]')) {
                event.preventDefault();
                close();
                return;
            }
            if (target.closest('[data-pub-lightbox-zoom]')) {
                toggleZoom(null);
                return;
            }
            if (target === image) {
                toggleZoom(event);
                return;
            }
            if ((target === stage || target === loader) && !isZoomed()) {
                close();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (!isOpen) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                close();
                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            var focusable = Array.prototype.filter.call(
                root.querySelectorAll('button, a[href]'),
                function (element) {
                    return !element.disabled && element.offsetParent !== null;
                }
            );
            if (!focusable.length) {
                return;
            }

            var first = focusable[0];
            var last = focusable[focusable.length - 1];

            if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
