// Theme menu: pick "auto" (follows the system), "dark" or "light".
// The stored mode is applied before first paint by an inline script in the layouts.
(function () {
    var root = document.documentElement;
    var button = document.querySelector('[data-theme-toggle]');
    var choices = document.querySelectorAll('[data-theme-choice]');
    var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    var MODES = ['auto', 'dark', 'light'];
    var ICONS = {
        auto: 'fa-circle-half-stroke',
        dark: 'fa-moon',
        light: 'fa-sun'
    };
    var NAMES = {
        auto: 'auto',
        dark: 'dark',
        light: 'light'
    };

    function currentMode() {
        var mode = root.getAttribute('data-theme-mode');
        return MODES.indexOf(mode) >= 0 ? mode : 'auto';
    }

    function prefersDark() {
        return !!(media && media.matches);
    }

    function isDark(mode) {
        return mode === 'dark' || (mode === 'auto' && prefersDark());
    }

    function render() {
        var mode = currentMode();

        root.setAttribute('data-theme-mode', mode);

        if (isDark(mode)) {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }

        if (button) {
            var icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-circle-half-stroke', 'fa-moon', 'fa-sun');
                icon.classList.add(ICONS[mode]);
            }
            button.setAttribute('aria-label', 'Theme: ' + NAMES[mode] + '. Open menu to change.');
            button.setAttribute('title', 'Theme: ' + NAMES[mode]);
        }

        choices.forEach(function (choice) {
            var active = choice.getAttribute('data-theme-choice') === mode;
            choice.classList.toggle('active', active);
            choice.setAttribute('aria-checked', active ? 'true' : 'false');
        });
    }

    function setMode(mode) {
        root.setAttribute('data-theme-mode', mode);
        try {
            localStorage.setItem('theme', mode);
        } catch (e) {
            /* private mode / storage disabled */
        }
        render();
    }

    render();

    // The menu is opened/closed here rather than by Bootstrap, so it keeps working
    // even if the jQuery/Bootstrap bundle from the CDN is slow or blocked.
    var dropdown = button ? button.closest('.dropdown') : null;
    var menu = dropdown ? dropdown.querySelector('.theme-menu') : null;

    function closeMenu() {
        if (menu) { menu.classList.remove('show'); }
        if (button) { button.setAttribute('aria-expanded', 'false'); }
    }

    function openMenu() {
        if (menu) { menu.classList.add('show'); }
        if (button) { button.setAttribute('aria-expanded', 'true'); }
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (menu && menu.classList.contains('show')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    choices.forEach(function (choice) {
        choice.addEventListener('click', function (event) {
            event.preventDefault();
            setMode(choice.getAttribute('data-theme-choice'));
            closeMenu();
        });
    });

    document.addEventListener('click', function (event) {
        if (dropdown && !dropdown.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    // Keep "auto" in sync when the system switches between light and dark.
    if (media) {
        var onSystemChange = function () {
            if (currentMode() === 'auto') {
                render();
            }
        };
        if (media.addEventListener) {
            media.addEventListener('change', onSystemChange);
        } else if (media.addListener) {
            media.addListener(onSystemChange);
        }
    }
})();
