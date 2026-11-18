// Three-state theme switch: auto (follows the system) -> dark -> light -> auto.
// The stored mode is applied before first paint by an inline script in the layouts.
(function () {
    var root = document.documentElement;
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    var MODES = ['auto', 'dark', 'light'];
    var ICONS = {
        auto: 'fa-circle-half-stroke',
        dark: 'fa-moon',
        light: 'fa-sun'
    };
    var NAMES = {
        auto: 'auto (follows system)',
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
        var dark = isDark(mode);
        var next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
        var label = 'Theme: ' + NAMES[mode] + '. Click for ' + NAMES[next] + '.';

        root.setAttribute('data-theme-mode', mode);

        if (dark) {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }

        buttons.forEach(function (button) {
            var icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-circle-half-stroke', 'fa-moon', 'fa-sun');
                icon.classList.add(ICONS[mode]);
            }
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
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

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            var mode = currentMode();
            setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
        });
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
