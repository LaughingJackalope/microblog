const THEME_KEY = 'theme-preference';
const DARK_MODE_CLASS = 'dark-mode';
const LIGHT_ICON = '☀️'; // Sun icon for light mode
const DARK_ICON = '🌓'; // Moon icon for dark mode

const themeToggleButton = document.getElementById('theme-toggle-button');
const bodyElement = document.body;

function applyTheme(theme) {
    if (theme === 'dark') {
        bodyElement.classList.add(DARK_MODE_CLASS);
        if (themeToggleButton) {
            themeToggleButton.textContent = LIGHT_ICON;
            themeToggleButton.setAttribute('aria-label', 'Switch to light theme');
        }
    } else {
        bodyElement.classList.remove(DARK_MODE_CLASS);
        if (themeToggleButton) {
            themeToggleButton.textContent = DARK_ICON;
            themeToggleButton.setAttribute('aria-label', 'Switch to dark theme');
        }
    }
}

function toggleTheme() {
    const currentThemeIsDark = bodyElement.classList.contains(DARK_MODE_CLASS);
    const newTheme = currentThemeIsDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    let preferredTheme;

    if (savedTheme) {
        preferredTheme = savedTheme;
    } else {
        // No saved theme, check OS preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            preferredTheme = 'dark';
        } else {
            preferredTheme = 'light'; // Default to light if no preference or not supported
        }
    }
    applyTheme(preferredTheme);
}

// Initialize theme when the script loads
initializeTheme();

// Add event listener to the toggle button
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
}

// Optional: Listen for changes in OS preference if no user preference is set
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const noSavedPreference = !localStorage.getItem(THEME_KEY);
    if (noSavedPreference) {
        applyTheme(event.matches ? 'dark' : 'light');
    }
});
