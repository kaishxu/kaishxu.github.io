// Light / dark theme switch for the navbar toggle button.
// The stored preference is applied before first paint by an inline script in the layouts.
(function () {
    var root = document.documentElement;
    var buttons = document.querySelectorAll('[data-theme-toggle]');

    function currentTheme() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        var isDark = theme === 'dark';

        if (isDark) {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }

        var iconClass = isDark ? 'fa-sun' : 'fa-moon';
        var label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

        buttons.forEach(function (button) {
            var icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-sun', 'fa-moon');
                icon.classList.add(iconClass);
            }
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
            button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        });
    }

    function storeTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            /* private mode / storage disabled */
        }
    }

    applyTheme(currentTheme());

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            storeTheme(next);
        });
    });
})();
