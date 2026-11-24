// Publication figure lightbox: click a publication cover to inspect the
// full-resolution image without leaving the page.
(function () {
    'use strict';

    function init() {
        var root = document.getElementById('pub-lightbox');
        if (!root) {
            return;
        }

        var image = root.querySelector('[data-pub-lightbox-image]');
        var titleEl = root.querySelector('#pub-lightbox-title');
        var hintEl = root.querySelector('[data-pub-lightbox-hint]');
        var originalLink = root.querySelector('[data-pub-lightbox-original]');
        var closeBtn = root.querySelector('.pub-lightbox-btn[data-pub-lightbox-close]');

        var isOpen = false;
        var lastFocused = null;

        function setHint(text) {
            if (hintEl) {
                hintEl.textContent = text;
            }
        }

        function open(trigger) {
            var src = trigger.getAttribute('href') || trigger.getAttribute('data-pub-lightbox-src');
            if (!src) {
                return;
            }

            lastFocused = trigger;
            isOpen = true;
            root.classList.remove('is-loaded', 'is-error');

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
                setHint('Click outside the image to close');
            };

            image.onerror = function () {
                if (!isOpen) {
                    return;
                }
                root.classList.add('is-error');
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

        // Clicking anywhere but the figure itself dismisses the viewer, so the
        // page behind it is one click away.
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

            // Leave the toolbar controls to do their own job.
            if (target.closest('.pub-lightbox-btn')) {
                return;
            }

            if (target === image) {
                return;
            }

            close();
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
