const THEME_KEY = "theme";

const THEMES = ["caramellatte", "dark", "cyberpunk", "coffee", "bumblebee", "night", "retro"];

const themeButton = document.getElementById("theme-btn");
const savedTheme = localStorage.getItem(THEME_KEY) || THEMES[0];
let currentThemeIndex = THEMES.indexOf(savedTheme);

function setup() {
    console.log("Setting theme");
    applyTheme(savedTheme);

    themeButton.addEventListener("click", () => {
        console.log("Changing theme");
        currentThemeIndex = ++currentThemeIndex % THEMES.length;
        applyTheme(THEMES[currentThemeIndex]);
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    console.log(`Set theme to ${theme}`);
    return theme;
}

setup();
