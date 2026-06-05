/* ==========================================================================
   STATE & CONFIG
   ========================================================================== */
let tabs = [];
let activeTabId = null;
let htmlEditor, cssEditor, jsEditor;
let commandHistory = [];
let historyIndex = -1;

let config = {
    disablePopups: false,
    adblock: false,
    preventClose: false,
    panicKey: 'q',
    wispUrl: "wss://wisp.mercurywork.shop",
    proxyPrefix: "https://splash.best/service/"
};

// UI Customization State
let currentUiTarget = 'ide'; // 'console' or 'ide'
let customStyles = {
    console: {
        fontFamily: "'Fira Code', monospace",
        fontWeight: "400",
        fontSize: "14",
        padding: "24",
        borderRadius: "6",
        borderWidth: "1",
        colorBg: "#050508",
        colorAccent: "#00ffcc",
        colorText: "#e0e0f0",
        glassBlur: "8",
        lineHeight: "1.4",
        letterSpacing: "0.0",
        marginSize: "0",
        accentGlow: "0",
        borderStyle: "solid",
        scaleModal: false,
        hideHTML: false,
        hideCSS: false,
        hideJS: false
    },
    ide: {
        fontFamily: "'Inter', sans-serif",
        fontWeight: "600",
        fontSize: "13",
        editorFontSize: "13",
        sidebarWidth: "260",
        gridGap: "8",
        padding: "12",
        borderRadius: "8",
        borderWidth: "1",
        colorBg: "#0d0d12",
        colorPanel: "#12121a",
        colorHeader: "#09090d",
        colorAccent: "#ff007f",
        colorText: "#e0e0ea",
        glassBlur: "10",
        layoutTemplate: "layout-standard",
        lineHeight: "1.4",
        letterSpacing: "0.0",
        marginSize: "0",
        accentGlow: "0",
        borderStyle: "solid",
        scaleModal: false,
        hideHTML: false,
        hideCSS: false,
        hideJS: false
    }
};

const presetThemes = {
    cyberpunk: {
        console: {
            fontFamily: "'Fira Code', monospace",
            fontWeight: "600",
            fontSize: "14",
            padding: "24",
            borderRadius: "4",
            borderWidth: "1",
            colorBg: "#040408",
            colorAccent: "#00ffcc",
            colorText: "#d8f8ff",
            glassBlur: "6"
        },
        ide: {
            fontFamily: "'Fira Code', monospace",
            fontWeight: "600",
            fontSize: "13",
            editorFontSize: "13",
            sidebarWidth: "250",
            gridGap: "8",
            padding: "12",
            borderRadius: "4",
            borderWidth: "1",
            colorBg: "#05050a",
            colorPanel: "#0c0d16",
            colorHeader: "#07080f",
            colorAccent: "#ff007f",
            colorText: "#f0f0f8",
            glassBlur: "8",
            layoutTemplate: "layout-standard"
        }
    },
    dracula: {
        console: {
            fontFamily: "'Fira Code', monospace",
            fontWeight: "400",
            fontSize: "14",
            padding: "24",
            borderRadius: "8",
            borderWidth: "1",
            colorBg: "#282a36",
            colorAccent: "#bd93f9",
            colorText: "#f8f8f2",
            glassBlur: "8"
        },
        ide: {
            fontFamily: "'Inter', sans-serif",
            fontWeight: "400",
            fontSize: "13",
            editorFontSize: "13",
            sidebarWidth: "260",
            gridGap: "6",
            padding: "10",
            borderRadius: "8",
            borderWidth: "1",
            colorBg: "#1e1f29",
            colorPanel: "#282a36",
            colorHeader: "#191a21",
            colorAccent: "#50fa7b",
            colorText: "#f8f8f2",
            glassBlur: "10",
            layoutTemplate: "layout-standard"
        }
    },
    nord: {
        console: {
            fontFamily: "'Roboto', sans-serif",
            fontWeight: "400",
            fontSize: "14",
            padding: "24",
            borderRadius: "8",
            borderWidth: "1",
            colorBg: "#2e3440",
            colorAccent: "#88c0d0",
            colorText: "#eceff4",
            glassBlur: "8"
        },
        ide: {
            fontFamily: "'Inter', sans-serif",
            fontWeight: "600",
            fontSize: "13",
            editorFontSize: "12",
            sidebarWidth: "270",
            gridGap: "10",
            padding: "14",
            borderRadius: "10",
            borderWidth: "1",
            colorBg: "#242933",
            colorPanel: "#2e3440",
            colorHeader: "#1b2028",
            colorAccent: "#81a1c1",
            colorText: "#d8dee9",
            glassBlur: "12",
            layoutTemplate: "layout-standard"
        }
    },
    aurora: {
        console: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: "600",
            fontSize: "15",
            padding: "26",
            borderRadius: "16",
            borderWidth: "1",
            colorBg: "#050a12",
            colorAccent: "#80ffdb",
            colorText: "#ffffff",
            glassBlur: "16"
        },
        ide: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: "600",
            fontSize: "13",
            editorFontSize: "13",
            sidebarWidth: "280",
            gridGap: "12",
            padding: "16",
            borderRadius: "16",
            borderWidth: "1",
            colorBg: "#03060c",
            colorPanel: "rgba(25, 35, 55, 0.4)",
            colorHeader: "rgba(10, 15, 25, 0.6)",
            colorAccent: "#7209b7",
            colorText: "#e0e5ff",
            glassBlur: "20",
            layoutTemplate: "layout-standard"
        }
    },
    matrix: {
        console: {
            fontFamily: "'Fira Code', monospace",
            fontWeight: "400",
            fontSize: "14",
            padding: "20",
            borderRadius: "0",
            borderWidth: "1",
            colorBg: "#000000",
            colorAccent: "#00ff00",
            colorText: "#00ff00",
            glassBlur: "0"
        },
        ide: {
            fontFamily: "'Fira Code', monospace",
            fontWeight: "400",
            fontSize: "12",
            editorFontSize: "13",
            sidebarWidth: "240",
            gridGap: "4",
            padding: "8",
            borderRadius: "0",
            borderWidth: "1",
            colorBg: "#000000",
            colorPanel: "#000000",
            colorHeader: "#050505",
            colorAccent: "#00cc00",
            colorText: "#00ff00",
            glassBlur: "0",
            layoutTemplate: "layout-vsplit"
        }
    },
    synthwave: {
        console: {
            fontFamily: "'Fira Code', monospace",
            fontWeight: "600",
            fontSize: "14",
            padding: "24",
            borderRadius: "6",
            borderWidth: "1",
            colorBg: "#170f2b",
            colorAccent: "#fede5d",
            colorText: "#ff79c6",
            glassBlur: "8"
        },
        ide: {
            fontFamily: "'Inter', sans-serif",
            fontWeight: "600",
            fontSize: "13",
            editorFontSize: "13",
            sidebarWidth: "260",
            gridGap: "8",
            padding: "12",
            borderRadius: "10",
            borderWidth: "1",
            colorBg: "#140e24",
            colorPanel: "#21153d",
            colorHeader: "#11091f",
            colorAccent: "#f08080",
            colorText: "#ff79c6",
            glassBlur: "10",
            layoutTemplate: "layout-standard"
        }
    },
    monokai: {
        console: {
            fontFamily: "'Fira Code', monospace",
            fontWeight: "400",
            fontSize: "14",
            padding: "24",
            borderRadius: "4",
            borderWidth: "1",
            colorBg: "#272822",
            colorAccent: "#f92672",
            colorText: "#f8f8f2",
            glassBlur: "6"
        },
        ide: {
            fontFamily: "'Fira Code', monospace",
            fontWeight: "400",
            fontSize: "13",
            editorFontSize: "12",
            sidebarWidth: "250",
            gridGap: "6",
            padding: "10",
            borderRadius: "4",
            borderWidth: "1",
            colorBg: "#1e1f1c",
            colorPanel: "#272822",
            colorHeader: "#181915",
            colorAccent: "#a6e22e",
            colorText: "#f8f8f2",
            glassBlur: "8",
            layoutTemplate: "layout-standard"
        }
    },
    sakura: {
        console: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: "400",
            fontSize: "14",
            padding: "24",
            borderRadius: "12",
            borderWidth: "1",
            colorBg: "#2d1b24",
            colorAccent: "#ffb6c1",
            colorText: "#ffe4e1",
            glassBlur: "10"
        },
        ide: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: "600",
            fontSize: "13",
            editorFontSize: "13",
            sidebarWidth: "260",
            gridGap: "8",
            padding: "12",
            borderRadius: "12",
            borderWidth: "1",
            colorBg: "#20121a",
            colorPanel: "#351e2a",
            colorHeader: "#1a0e15",
            colorAccent: "#ff8da1",
            colorText: "#ffe4e1",
            glassBlur: "12",
            layoutTemplate: "layout-standard"
        }
    }
};

/* =========================================
   UI BUILDER / COMPILER & DESIGN ENGINE
   ========================================= */
function initCustomizerStyles() {
    // Load config settings from storage if existing
    const savedConfig = localStorage.getItem('consolius_config');
    if (savedConfig) {
        try {
            config = { ...config, ...JSON.parse(savedConfig) };
        } catch (e) {
            console.log(e);
        }
    }
    
    // Sync UI elements
    const popupsEl = document.getElementById('setting-popups');
    const adblockEl = document.getElementById('setting-adblock');
    const autosaveEl = document.getElementById('setting-autosave');
    const prefixEl = document.getElementById('setting-proxy-prefix');
    const panicEl = document.getElementById('setting-panic');
    
    if (popupsEl) popupsEl.checked = config.disablePopups;
    if (adblockEl) adblockEl.checked = config.adblock;
    if (autosaveEl) autosaveEl.checked = config.autosave || false;
    if (prefixEl) prefixEl.value = config.proxyPrefix || "https://splash.best/service/";
    if (panicEl) panicEl.value = config.panicKey.toUpperCase();

    // Load styling settings from storage if existing
    const saved = localStorage.getItem('consolius_custom_styles');
    if (saved) {
        try {
            customStyles = JSON.parse(saved);
        } catch (e) {
            console.log("Error reading styles:", e);
        }
    }
    compileStylesToCSS();
}

function compileStylesToCSS() {
    let styleEl = document.getElementById('dynamic-user-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-user-styles';
        document.head.appendChild(styleEl);
    }

    // Generate shadow glow value from accentGlow variable
    const ideGlow = parseInt(customStyles.ide.accentGlow) > 0 
        ? `0 0 ${customStyles.ide.accentGlow}px ${customStyles.ide.colorAccent}33` 
        : 'none';
    const consoleGlow = parseInt(customStyles.console.accentGlow) > 0 
        ? `0 0 ${customStyles.console.accentGlow}px ${customStyles.console.colorAccent}33` 
        : 'none';

    let css = `
    :root {
        /* Console Custom Variables */
        --console-bg: ${customStyles.console.colorBg};
        --console-text: ${customStyles.console.colorText};
        --console-accent: ${customStyles.console.colorAccent};
        --console-font: ${customStyles.console.fontFamily};
        --console-font-weight: ${customStyles.console.fontWeight};
        --console-font-size: ${customStyles.console.fontSize}px;
        --console-radius: ${customStyles.console.borderRadius}px;
        --console-blur: ${customStyles.console.glassBlur}px;
        --console-padding: ${customStyles.console.padding}px;
        --console-border: ${customStyles.console.borderWidth}px ${customStyles.console.borderStyle || 'solid'} ${customStyles.console.colorAccent}33;
        --console-line-height: ${customStyles.console.lineHeight || '1.4'};
        --console-letter-spacing: ${customStyles.console.letterSpacing || '0'}px;
        --console-margin: ${customStyles.console.marginSize || '0'}px;
        --console-glow: ${consoleGlow};

        /* IDE Custom Variables */
        --ide-bg: ${customStyles.ide.colorBg};
        --ide-sidebar-bg: ${customStyles.ide.colorBg};
        --ide-panel-bg: ${customStyles.ide.colorPanel};
        --ide-header-bg: ${customStyles.ide.colorHeader};
        --ide-text: ${customStyles.ide.colorText};
        --ide-accent: ${customStyles.ide.colorAccent};
        --ide-font: ${customStyles.ide.fontFamily};
        --ide-font-weight: ${customStyles.ide.fontWeight};
        --ide-font-size: ${customStyles.ide.fontSize}px;
        --ide-radius: ${customStyles.ide.borderRadius}px;
        --ide-blur: ${customStyles.ide.glassBlur}px;
        --ide-sidebar-width: ${customStyles.ide.sidebarWidth}px;
        --ide-editor-size: ${customStyles.ide.editorFontSize}px;
        --ide-gap: ${customStyles.ide.gridGap}px;
        --ide-border-color: rgba(255, 255, 255, 0.08);
        --ide-border-style: ${customStyles.ide.borderStyle || 'solid'};
        --ide-line-height: ${customStyles.ide.lineHeight || '1.4'};
        --ide-letter-spacing: ${customStyles.ide.letterSpacing || '0'}px;
        --ide-margin: ${customStyles.ide.marginSize || '0'}px;
        --ide-panel-glow: ${ideGlow};
        --ide-border-width: ${customStyles.ide.borderWidth}px;
    }
    
    #sidebar {
        width: var(--ide-sidebar-width) !important;
    }
    
    #screen-terminal {
        padding: var(--console-padding) !important;
        font-family: var(--console-font) !important;
        font-size: var(--console-font-size) !important;
        line-height: var(--console-line-height) !important;
        letter-spacing: var(--console-letter-spacing) !important;
        box-shadow: var(--console-glow) !important;
        border: var(--console-border) !important;
    }
    
    #screen-ide {
        font-family: var(--ide-font) !important;
        font-size: var(--ide-font-size) !important;
        line-height: var(--ide-line-height) !important;
        letter-spacing: var(--ide-letter-spacing) !important;
    }

    #workspace {
        padding: var(--ide-margin) !important;
        gap: var(--ide-gap) !important;
    }

    .panel {
        border: var(--ide-border-width) var(--ide-border-style) var(--ide-border-color) !important;
        border-radius: var(--ide-radius) !important;
        box-shadow: var(--ide-panel-glow) !important;
        background: var(--ide-panel-bg) !important;
    }

    /* Individual Pane Hiding rules */
    #panel-html { display: ${customStyles.ide.hideHTML ? 'none !important' : 'flex'} }
    #panel-css  { display: ${customStyles.ide.hideCSS ? 'none !important' : 'flex'} }
    #panel-js   { display: ${customStyles.ide.hideJS ? 'none !important' : 'flex'} }
    `;
    styleEl.innerHTML = css;

    // Handle modal scaling classes on Control Hub modal element
    const modalEl = document.querySelector('#control-panel-modal .modal');
    if (modalEl) {
        modalEl.classList.toggle('scaled', !!customStyles.ide.scaleModal);
    }

    // Apply layout configuration
    const grid = document.getElementById('editor-grid');
    if (grid) {
        grid.className = 'layout-standard'; // reset
        grid.classList.add(customStyles.ide.layoutTemplate);
    }
}

function selectUiTarget(target) {
    playSound('click');
    currentUiTarget = target;
    document.getElementById('target-ui-console-btn').classList.toggle('active', target === 'console');
    document.getElementById('target-ui-ide-btn').classList.toggle('active', target === 'ide');
    
    // Sync slider panel controls with the chosen target UI state variables
    syncControlsWithTargetData();
}

function syncControlsWithTargetData() {
    const data = customStyles[currentUiTarget];
    
    // Set selects
    document.getElementById('builder-font-family').value = data.fontFamily;
    document.getElementById('builder-font-weight').value = data.fontWeight;
    
    // Set sliders and label indicators
    document.getElementById('builder-font-size').value = data.fontSize;
    document.getElementById('val-font-size').innerText = `${data.fontSize}px`;
    
    document.getElementById('builder-border-radius').value = data.borderRadius;
    document.getElementById('val-border-radius').innerText = `${data.borderRadius}px`;
    
    document.getElementById('builder-border-width').value = data.borderWidth;
    document.getElementById('val-border-width').innerText = `${data.borderWidth}px`;
    
    document.getElementById('builder-padding').value = data.padding;
    document.getElementById('val-padding').innerText = `${data.padding}px`;

    // Extended inputs
    document.getElementById('builder-line-height').value = data.lineHeight || "1.4";
    document.getElementById('val-line-height').innerText = data.lineHeight || "1.4";

    document.getElementById('builder-letter-spacing').value = data.letterSpacing || "0.0";
    document.getElementById('val-letter-spacing').innerText = `${data.letterSpacing || "0.0"}px`;

    document.getElementById('builder-margin-size').value = data.marginSize || "0";
    document.getElementById('val-margin-size').innerText = `${data.marginSize || "0"}px`;

    document.getElementById('builder-accent-glow').value = data.accentGlow || "0";
    document.getElementById('val-accent-glow').innerText = `${data.accentGlow || "0"}px`;

    document.getElementById('builder-border-style').value = data.borderStyle || "solid";
    document.getElementById('builder-scale-modal').checked = !!data.scaleModal;

    document.getElementById('builder-hide-html').checked = !!data.hideHTML;
    document.getElementById('builder-hide-css').checked = !!data.hideCSS;
    document.getElementById('builder-hide-js').checked = !!data.hideJS;
    
    // Colors
    document.getElementById('builder-color-bg').value = convertToHex(data.colorBg);
    document.getElementById('builder-color-accent').value = convertToHex(data.colorAccent);
    document.getElementById('builder-color-text').value = convertToHex(data.colorText);
    
    document.getElementById('builder-glass-blur').value = data.glassBlur;
    document.getElementById('val-glass-blur').innerText = `${data.glassBlur}px`;

    // Show or Hide targeted elements inside UI Maker panel depending on Console vs IDE
    if (currentUiTarget === 'console') {
        document.getElementById('row-editor-font-size').style.display = 'none';
        document.getElementById('row-sidebar-width').style.display = 'none';
        document.getElementById('row-grid-gap').style.display = 'none';
        document.getElementById('row-color-panel').style.display = 'none';
        document.getElementById('row-color-header').style.display = 'none';
        document.getElementById('row-ide-layout').style.display = 'none';
        document.getElementById('row-hide-html').style.display = 'none';
        document.getElementById('row-hide-css').style.display = 'none';
        document.getElementById('row-hide-js').style.display = 'none';
    } else {
        document.getElementById('row-editor-font-size').style.display = 'flex';
        document.getElementById('row-sidebar-width').style.display = 'flex';
        document.getElementById('row-grid-gap').style.display = 'flex';
        document.getElementById('row-color-panel').style.display = 'flex';
        document.getElementById('row-color-header').style.display = 'flex';
        document.getElementById('row-ide-layout').style.display = 'flex';
        document.getElementById('row-hide-html').style.display = 'flex';
        document.getElementById('row-hide-css').style.display = 'flex';
        document.getElementById('row-hide-js').style.display = 'flex';
        
        document.getElementById('builder-editor-font-size').value = data.editorFontSize;
        document.getElementById('val-editor-font-size').innerText = `${data.editorFontSize}px`;
        
        document.getElementById('builder-sidebar-width').value = data.sidebarWidth;
        document.getElementById('val-sidebar-width').innerText = `${data.sidebarWidth}px`;
        
        document.getElementById('builder-grid-gap').value = data.gridGap;
        document.getElementById('val-grid-gap').innerText = `${data.gridGap}px`;
        
        document.getElementById('builder-color-panel').value = convertToHex(data.colorPanel);
        document.getElementById('builder-color-header').value = convertToHex(data.colorHeader);
        document.getElementById('builder-layout-template').value = data.layoutTemplate;
    }
}

function applyBuilderChange(prop) {
    const data = customStyles[currentUiTarget];
    
    switch(prop) {
        case 'font-family':
            data.fontFamily = document.getElementById('builder-font-family').value;
            break;
        case 'font-weight':
            data.fontWeight = document.getElementById('builder-font-weight').value;
            break;
        case 'font-size':
            const fs = document.getElementById('builder-font-size').value;
            data.fontSize = fs;
            document.getElementById('val-font-size').innerText = `${fs}px`;
            break;
        case 'editor-font-size':
            const efs = document.getElementById('builder-editor-font-size').value;
            data.editorFontSize = efs;
            document.getElementById('val-editor-font-size').innerText = `${efs}px`;
            break;
        case 'sidebar-width':
            const sw = document.getElementById('builder-sidebar-width').value;
            data.sidebarWidth = sw;
            document.getElementById('val-sidebar-width').innerText = `${sw}px`;
            break;
        case 'grid-gap':
            const gg = document.getElementById('builder-grid-gap').value;
            data.gridGap = gg;
            document.getElementById('val-grid-gap').innerText = `${gg}px`;
            break;
        case 'padding':
            const pd = document.getElementById('builder-padding').value;
            data.padding = pd;
            document.getElementById('val-padding').innerText = `${pd}px`;
            break;
        case 'border-radius':
            const br = document.getElementById('builder-border-radius').value;
            data.borderRadius = br;
            document.getElementById('val-border-radius').innerText = `${br}px`;
            break;
        case 'border-width':
            const bw = document.getElementById('builder-border-width').value;
            data.borderWidth = bw;
            document.getElementById('val-border-width').innerText = `${bw}px`;
            break;
        case 'color-bg':
            data.colorBg = document.getElementById('builder-color-bg').value;
            break;
        case 'color-panel':
            data.colorPanel = document.getElementById('builder-color-panel').value;
            break;
        case 'color-header':
            data.colorHeader = document.getElementById('builder-color-header').value;
            break;
        case 'color-accent':
            data.colorAccent = document.getElementById('builder-color-accent').value;
            break;
        case 'color-text':
            data.colorText = document.getElementById('builder-color-text').value;
            break;
        case 'glass-blur':
            const gb = document.getElementById('builder-glass-blur').value;
            data.glassBlur = gb;
            document.getElementById('val-glass-blur').innerText = `${gb}px`;
            break;
        case 'layout-template':
            data.layoutTemplate = document.getElementById('builder-layout-template').value;
            clearPanelFlexStyles();
            break;
        
        // Expanded dynamic options
        case 'line-height':
            const lh = document.getElementById('builder-line-height').value;
            data.lineHeight = lh;
            document.getElementById('val-line-height').innerText = lh;
            break;
        case 'letter-spacing':
            const ls = document.getElementById('builder-letter-spacing').value;
            data.letterSpacing = ls;
            document.getElementById('val-letter-spacing').innerText = `${ls}px`;
            break;
        case 'margin-size':
            const ms = document.getElementById('builder-margin-size').value;
            data.marginSize = ms;
            document.getElementById('val-margin-size').innerText = `${ms}px`;
            break;
        case 'accent-glow':
            const ag = document.getElementById('builder-accent-glow').value;
            data.accentGlow = ag;
            document.getElementById('val-accent-glow').innerText = `${ag}px`;
            break;
        case 'border-style':
            data.borderStyle = document.getElementById('builder-border-style').value;
            break;
        case 'scale-modal':
            data.scaleModal = document.getElementById('builder-scale-modal').checked;
            break;
        case 'hide-html':
            data.hideHTML = document.getElementById('builder-hide-html').checked;
            break;
        case 'hide-css':
            data.hideCSS = document.getElementById('builder-hide-css').checked;
            break;
        case 'hide-js':
            data.hideJS = document.getElementById('builder-hide-js').checked;
            break;
    }

    compileStylesToCSS();
    
    // Save to storage
    localStorage.setItem('consolius_custom_styles', JSON.stringify(customStyles));
}

function convertToHex(colorStr) {
    if (colorStr.startsWith('#')) return colorStr;
    // Fallback simple conversion if string is rgba
    if (colorStr.includes('rgba')) return '#12121a';
    return '#ffffff';
}

function toggleFoldout(foldoutId) {
    playSound('click');
    const el = document.getElementById(`foldout-${foldoutId}`);
    if (el) {
        el.classList.toggle('collapsed');
    }
}

/* =========================================
   PRESETS THEMES & SYSTEM SETTINGS
   ========================================= */
function applyPresetTheme(themeKey) {
    if (!presetThemes[themeKey]) return;
    playSound('success');
    customStyles = JSON.parse(JSON.stringify(presetThemes[themeKey]));
    localStorage.setItem('consolius_custom_styles', JSON.stringify(customStyles));
    
    compileStylesToCSS();
    syncControlsWithTargetData();
    showNotification(`Theme preset "${themeKey.toUpperCase()}" loaded.`);
}

function saveSettings() {
    config.disablePopups = document.getElementById('setting-popups').checked;
    config.adblock = document.getElementById('setting-adblock').checked;
    
    const prefixEl = document.getElementById('setting-proxy-prefix');
    if (prefixEl) {
        config.proxyPrefix = prefixEl.value.trim() || "https://splash.best/service/";
    }
    
    config.panicKey = document.getElementById('setting-panic').value.toLowerCase();
    
    if(config.disablePopups) {
        window.alert = function() { console.log("Alert suppressed"); };
        window.confirm = function() { return true; };
    } else {
        delete window.alert; delete window.confirm;
    }
    
    localStorage.setItem('consolius_config', JSON.stringify(config));
    showNotification("System options saved.");
}

function togglePopups() {
    config.disablePopups = document.getElementById('setting-popups').checked;
    saveSettings();
}

function toggleAdblock() {
    config.adblock = document.getElementById('setting-adblock').checked;
    saveSettings();
}

/* =========================================
   SAVE / LOAD LAYOUTS MANAGER
   ========================================= */
function renderSavedConfigs() {
    const listEl = document.getElementById('saved-configs-box');
    listEl.innerHTML = '';
    
    let savedConfigs = [];
    const stored = localStorage.getItem('consolius_saved_layouts_list');
    if (stored) {
        try { savedConfigs = JSON.parse(stored); } catch(e){}
    }
    
    if (savedConfigs.length === 0) {
        listEl.innerHTML = `<div style="font-size:11px; color:#666675; text-align:center; padding:12px;">No custom profiles saved yet.</div>`;
        return;
    }
    
    savedConfigs.forEach(cfg => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.innerHTML = `
            <span>${cfg.name}</span>
            <div class="config-item-actions">
                <button class="config-btn" onclick="loadSavedConfig('${cfg.name}')"><i class="fa-solid fa-play"></i> Apply</button>
                <button class="config-btn delete" onclick="deleteSavedConfig('${cfg.name}')"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        listEl.appendChild(item);
    });
}

function saveCurrentConfig() {
    const nameInput = document.getElementById('preset-save-name');
    const name = nameInput.value.trim();
    if (!name) {
        playSound('error');
        showNotification("Please enter a custom design name.");
        return;
    }
    
    let savedConfigs = [];
    const stored = localStorage.getItem('consolius_saved_layouts_list');
    if (stored) {
        try { savedConfigs = JSON.parse(stored); } catch(e){}
    }
    
    // Filter duplicates
    savedConfigs = savedConfigs.filter(cfg => cfg.name !== name);
    savedConfigs.push({ name, styles: JSON.parse(JSON.stringify(customStyles)) });
    
    localStorage.setItem('consolius_saved_layouts_list', JSON.stringify(savedConfigs));
    playSound('success');
    showNotification(`Profile "${name}" saved to library.`);
    nameInput.value = '';
    renderSavedConfigs();
}

function loadSavedConfig(name) {
    let savedConfigs = [];
    const stored = localStorage.getItem('consolius_saved_layouts_list');
    if (stored) {
        try { savedConfigs = JSON.parse(stored); } catch(e){}
    }
    
    const cfg = savedConfigs.find(c => c.name === name);
    if (cfg) {
        playSound('success');
        customStyles = JSON.parse(JSON.stringify(cfg.styles));
        localStorage.setItem('consolius_custom_styles', JSON.stringify(customStyles));
        compileStylesToCSS();
        syncControlsWithTargetData();
        showNotification(`Applied configuration: ${name}`);
    }
}

function deleteSavedConfig(name) {
    let savedConfigs = [];
    const stored = localStorage.getItem('consolius_saved_layouts_list');
    if (stored) {
        try { savedConfigs = JSON.parse(stored); } catch(e){}
    }
    
    savedConfigs = savedConfigs.filter(cfg => cfg.name !== name);
    localStorage.setItem('consolius_saved_layouts_list', JSON.stringify(savedConfigs));
    playSound('click');
    showNotification(`Deleted layout profile: ${name}`);
    renderSavedConfigs();
}

/* =========================================
   MODAL PANEL INTERFACES
   ========================================= */
function openControlPanel(tab = 'style') {
    playSound('click');
    document.getElementById('control-panel-modal').classList.add('active');
    setControlHubTab(tab);
    syncControlsWithTargetData();
    renderSavedConfigs();
}

function closeControlPanel() {
    playSound('click');
    document.getElementById('control-panel-modal').classList.remove('active');
}

/**
 * Cleanly switch between screens with spaceship loading transition.
 * Shows the canvas loading animation between screen switches.
 */
let _hasVisitedIDE = false;
function switchScreen(targetId, skipAnimation) {
    if (skipAnimation) {
        // Instant switch (used during initial boot)
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            s.classList.remove('active', 'fading-out');
        });
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');
        // Auto-start tour on first IDE visit
        if (targetId === 'screen-ide' && !_hasVisitedIDE) {
            _hasVisitedIDE = true;
            if (!localStorage.getItem('consolius_tour_done')) {
                setTimeout(() => { tourStart(); }, 600);
            }
        }
        return;
    }

    // Play spaceship loading animation between screen transitions
    playLoadingAnimation(() => {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            s.classList.remove('active', 'fading-out');
        });
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.add('active');
        }
        // Auto-start tour on first IDE visit
        if (targetId === 'screen-ide' && !_hasVisitedIDE) {
            _hasVisitedIDE = true;
            if (!localStorage.getItem('consolius_tour_done')) {
                setTimeout(() => { tourStart(); }, 600);
            }
        }
    });
}

function setControlHubTab(tabId) {
    playSound('click');
    document.querySelectorAll('.style-center-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.hub-section').forEach(sec => sec.style.display = 'none');
    
    document.getElementById(`tab-btn-${tabId}`).classList.add('active');
    document.getElementById(`hub-section-${tabId}`).style.display = 'block';
}

function setBuilderSubPage(pageId) {
    playSound('click');
    document.querySelectorAll('.builder-subtabs .subtab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.builder-page').forEach(page => page.style.display = 'none');
    
    document.getElementById(`subtab-${pageId}`).classList.add('active');
    const pageEl = document.getElementById(`builder-page-${pageId}`);
    if (pageEl) {
        pageEl.style.display = 'flex';
    }
}

function showNotification(text) {
    const el = document.getElementById('sys-notification');
    document.getElementById('sys-notification-text').innerText = text;
    el.classList.add('active');
    
    setTimeout(() => {
        el.classList.remove('active');
    }, 3000);
}

/* =========================================
   PANIC & HOTKEYS
   ========================================= */
window.addEventListener('beforeunload', (e) => {
    if(config.preventClose) { e.preventDefault(); e.returnValue = ''; }
});

window.addEventListener('keydown', (e) => {
    // Panic Key Action (Control + Config Key)
    if(config.panicKey && e.ctrlKey && e.key.toLowerCase() === config.panicKey) {
        document.body.innerHTML = '';
        window.location.replace("https://classroom.google.com");
    }
    
    // Sliding Overlay Terminal Hotkeys (` or +)
    if ((e.key === '`' || e.key === '+') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleOverlayTerminal();
    }
});

function toggleOverlayTerminal() {
    const overlay = document.getElementById('overlay-terminal');
    overlay.classList.toggle('active');
    if (overlay.classList.contains('active')) {
        playSound('click');
        setTimeout(() => document.getElementById('overlay-term-input').focus(), 100);
    }
}

/* =========================================
   ULTRAVIOLET WEB PROXY CODEC ENGINE
   ========================================= */
function ultravioletXorEncode(str) {
    if (!str) return str;
    return encodeURIComponent(
        str
            .split('')
            .map((char, ind) =>
                ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char
            )
            .join('')
    );
}

function getProxiedUrl(targetUrl) {
    const prefix = config.proxyPrefix || "https://splash.best/service/";
    return prefix + ultravioletXorEncode(targetUrl);
}

function printLine(text, type='main', color='#e0e0e0') {
    const out = type === 'main' ? document.getElementById('main-term-output') : document.getElementById('overlay-output');
    if (!out) return;
    const div = document.createElement('div');
    div.className = 'term-output'; div.style.color = color; div.innerText = text;
    out.appendChild(div); out.scrollTop = out.scrollHeight;
}

function executeCommand(cmdStr, type='main') {
    const cmd = cmdStr.trim();
    if (!cmd) return;
    
    // Store in console history
    commandHistory.push(cmd);
    historyIndex = commandHistory.length;

    printLine(`root@consolius:~$ ${cmd}`, type, 'var(--console-accent)');
    const args = cmd.split(' ');
    const base = args[0].toLowerCase();
    
    const validCommands = ['help', 'ui', 'tour', 'ide', 'zip', 'export', 'games', 'game', 'panic', 'home', 'exit', 'aboutblank', 'runner'];

    if (validCommands.includes(base)) {
        switch(base) {
            case 'help':
                printLine("CONSOLIUS SYSTEM HELP PANEL:", type, 'var(--console-accent)');
                printLine("  ui          : Open Design and Style Control Center Panel", type);
                printLine("  tour        : Glide Spotlight Tour walk-through", type);
                printLine("  ide         : Load full workspace Code Editor", type);
                printLine("  zip/export  : Package IDE workspace into single download", type);
                printLine("  games       : Display pre-made workspace game scripts", type);
                printLine("  aboutblank  : Re-open sandbox console inside a stealth wrapper", type);
                printLine("  runner      : Switch screen interface directly into IDE viewport", type);
                printLine("  panic {key} : Customise key combination escape route", type);
                printLine("  exit        : Unload current viewport to core terminal console", type);
                printLine("Or type search strings / links to open in proxy browser.", type, '#666675');
                break;
            case 'ui':
                openControlPanel('style'); 
                break;
            case 'tour':
                tourStart(); 
                break;
            case 'ide':
                switchScreen('screen-ide');
                setTimeout(() => { if(htmlEditor) htmlEditor.refresh(); if(cssEditor) cssEditor.refresh(); if(jsEditor) jsEditor.refresh(); }, 300);
                break;
            case 'zip':
            case 'export':
                exportToZip(); 
                break;
            case 'games':
                printLine("Games: flappy, retro_racer. Type 'game flappy' to play.", type); 
                break;
            case 'game':
                printLine(`Launching ${args[1]}...`, type); 
                break;
            case 'panic':
                if(args[1]) { 
                    config.panicKey = args[1].toLowerCase(); 
                    printLine(`Panic set to Ctrl+${args[1]}`, type); 
                } 
                break;
            case 'runner':
                executeCommand('ide', type);
                break;
            case 'aboutblank':
                openAboutBlank();
                break;
            case 'home':
            case 'exit':
                document.getElementById('overlay-terminal').classList.remove('active');
                switchScreen('screen-terminal');
                break;
        }
    } else {
        // Assume text is a search term or a link -> Open in Proxy frame
        let url = cmd;
        if (!url.startsWith('http') && url.includes('.')) {
            url = 'https://' + url;
        } else if (!url.startsWith('http')) {
            url = 'https://search.brave.com/search?q=' + encodeURIComponent(cmd);
        }
        
        switchScreen('screen-proxy');
        document.getElementById('proxy-address').value = url;
        document.getElementById('overlay-terminal').classList.remove('active');
        proxyLoadUrl(url);
    }
}

// Bind Enter events + Up/Down key indices on terminal input lines
function setupTerminalInputs() {
    const mainIn = document.getElementById('main-term-input');
    const overlayIn = document.getElementById('overlay-term-input');
    const proxyAddress = document.getElementById('proxy-address');
    
    [mainIn, overlayIn].forEach(inputEl => {
        if (!inputEl) return;
        inputEl.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                executeCommand(e.target.value, inputEl.id === 'main-term-input' ? 'main' : 'overlay');
                e.target.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    e.target.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    e.target.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    e.target.value = '';
                }
            }
        });
    });

    if (proxyAddress) {
        proxyAddress.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                proxyNavigate();
            }
        });
    }
}

function openAboutBlank() {
    try {
        const win = window.open('about:blank', '_blank');
        if (win) {
            win.document.write(`<iframe src="${window.location.href}" style="position:fixed;top:0;left:0;bottom:0;right:0;width:100%;height:100%;border:none;margin:0;padding:0;overflow:hidden;z-index:999999;"></iframe>`);
            win.document.close();
            showNotification("Consolius re-loaded in about:blank container.");
        } else {
            playSound('error');
            showNotification("Popup blocked. Please authorize window openings.");
        }
    } catch(e) {
        playSound('error');
        showNotification("Failed to open blank canvas window.");
    }
}

/* =========================================
   PROXY BROWSER ENGINE
   ========================================= */

let _proxyLoadTimer = null;

function proxySetStatus(dot, text, engine) {
    const d = document.getElementById('proxy-status-dot');
    const t = document.getElementById('proxy-status-text');
    const e = document.getElementById('proxy-engine-label');
    if (d) d.style.color = dot;
    if (t) t.textContent = text;
    if (e && engine) e.textContent = engine;
}

function proxyLoadUrl(rawUrl) {
    const frame   = document.getElementById('proxy-frame');
    const splash  = document.getElementById('proxy-loading-splash');
    const errPage = document.getElementById('proxy-error-page');
    const urlText = document.getElementById('proxy-splash-url');
    const splashText = document.getElementById('proxy-splash-text');
    if (!frame) return;

    // Show loading splash, hide error page and iframe
    if (splash)  { splash.style.display = 'flex'; }
    if (errPage) { errPage.style.display = 'none'; }
    frame.style.display = 'none';

    if (urlText)    urlText.textContent  = rawUrl;
    if (splashText) splashText.textContent = 'Routing through proxy engine...';

    proxySetStatus('#ffcc00', 'Connecting...', 'UV / XOR');

    const proxied = getProxiedUrl(rawUrl);
    frame.src = proxied;
    document.getElementById('proxy-address').value = rawUrl;

    // Fallback timeout — if onload never fires (blocked), show error
    clearTimeout(_proxyLoadTimer);
    _proxyLoadTimer = setTimeout(() => {
        // Frame still hidden = likely blocked
        if (frame.style.display === 'none') {
            proxyFrameError();
        }
    }, 12000);
}

function proxyNavigate() {
    let url = (document.getElementById('proxy-address').value || '').trim();
    if (!url) return;
    if (!url.startsWith('http') && url.includes('.')) url = 'https://' + url;
    else if (!url.startsWith('http')) url = 'https://search.brave.com/search?q=' + encodeURIComponent(url);
    proxyLoadUrl(url);
}

function proxyFrameLoaded() {
    clearTimeout(_proxyLoadTimer);
    const frame   = document.getElementById('proxy-frame');
    const splash  = document.getElementById('proxy-loading-splash');
    const errPage = document.getElementById('proxy-error-page');
    if (!frame) return;

    // Check if frame actually loaded real content or just an empty document
    try {
        const inner = frame.contentDocument || frame.contentWindow?.document;
        const bodyText = inner?.body?.innerText || '';
        if (frame.src && frame.src !== 'about:blank' && bodyText.length < 5) {
            // Probably blocked / empty
            proxyFrameError();
            return;
        }
    } catch(e) {
        // Cross-origin — frame loaded something, trust it
    }

    if (splash)  splash.style.display  = 'none';
    if (errPage) errPage.style.display = 'none';
    frame.style.display = 'block';
    proxySetStatus('#00ff88', 'Connected via proxy', 'UV / XOR');
    playSound('click');
}

function proxyFrameError() {
    clearTimeout(_proxyLoadTimer);
    const frame   = document.getElementById('proxy-frame');
    const splash  = document.getElementById('proxy-loading-splash');
    const errPage = document.getElementById('proxy-error-page');
    if (splash)  splash.style.display  = 'none';
    if (errPage) errPage.style.display = 'flex';
    if (frame)   frame.style.display   = 'none';
    proxySetStatus('#ff3b30', 'Blocked by remote server', 'UV / XOR');
    playSound('error');
}

function proxyBack() {
    try {
        const frame = document.getElementById('proxy-frame');
        frame.contentWindow.history.back();
    } catch(e) {
        showNotification("Nav back blocked by cross-origin policy.");
    }
}
function proxyForward() {
    try {
        const frame = document.getElementById('proxy-frame');
        frame.contentWindow.history.forward();
    } catch(e) {
        showNotification("Nav forward blocked by cross-origin policy.");
    }
}
function proxyReload() {
    const frame = document.getElementById('proxy-frame');
    const addr  = document.getElementById('proxy-address');
    if (frame && addr && addr.value) {
        playSound('click');
        proxyLoadUrl(addr.value);
    }
}

/* =========================================
   BOOT UP LOADER SIMULATOR
   ========================================= */
function runBootSequence() {
    // Show spaceship loading animation first, then boot text sequence
    playLoadingAnimation(() => {
        const bootContainer = document.getElementById('boot-log-container');
        const mainContent = document.getElementById('terminal-main-content');
        const welcomeOutput = document.getElementById('main-term-output');
        
        bootContainer.style.display = 'block';
        mainContent.style.display = 'none';
        
        const lines = [
            "Initializing CONSOLIUS CORE OS v3.0...",
            "Allocating memory heap partitions...",
            "Checking visibility event registry [ OK ]",
            "Binding browser iframe audio intercept layers...",
            "Setting layout nodes & grid systems...",
            "Compiling custom theme stylesheets...",
            "System diagnostics completed. Launching prompt."
        ];
        
        let lineIdx = 0;
        
        function printBootLine() {
            if (lineIdx < lines.length) {
                const div = document.createElement('div');
                div.innerText = `> ${lines[lineIdx]} [OK]`;
                bootContainer.appendChild(div);
                lineIdx++;
                playSound('click');
                setTimeout(printBootLine, 120 + Math.random() * 80);
            } else {
                setTimeout(() => {
                    bootContainer.style.display = 'none';
                    mainContent.style.display = 'block';
                    welcomeOutput.innerHTML = '';
                    printLine("Welcome to CONSOLIUS OS v3.0", "main", "var(--console-accent)");
                    printLine("Type 'help' for a list of commands, or 'tour' to start the guide.", "main", "#888899");
                    printLine("Type 'ui' to open the UI Builder Control Hub.", "main", "#888899");
                    playSound('success');
                    
                    const mainIn = document.getElementById('main-term-input');
                    if (mainIn) mainIn.focus();
                }, 500);
            }
        }
        printBootLine();
    });
}

/* =========================================
   SPACESHIP WARP FLIGHT LOADING ANIMATION
   ========================================= */
function playLoadingAnimation(onComplete) {
    const overlay = document.getElementById('screen-loading');
    const canvas = document.getElementById('loading-canvas');
    if (!overlay || !canvas) { if (onComplete) onComplete(); return; }

    overlay.style.display = 'block';
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();

    // Phase timing
    const PHASE_FLY = 3200;     // Flying through space with asteroids
    const PHASE_APPROACH = 1800; // Moon glides in, ship approaches
    const PHASE_LAND = 1200;    // Ship spins and lands
    const TOTAL = PHASE_FLY + PHASE_APPROACH + PHASE_LAND;

    const startTime = performance.now();

    // Stars
    const stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * 2000 - 500,
            y: Math.random() * 2000 - 500,
            z: Math.random() * 1500 + 100,
            size: Math.random() * 2 + 0.5
        });
    }

    // Asteroids
    const asteroids = [];
    for (let i = 0; i < 12; i++) {
        asteroids.push({
            x: Math.random() * 800 - 400,
            y: Math.random() * 600 - 300,
            z: 1200 + Math.random() * 2000,
            size: 10 + Math.random() * 25,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            craters: Math.floor(Math.random() * 4) + 2,
            hue: 20 + Math.random() * 30
        });
    }

    // Moon state
    let moonX = -300;
    let moonTargetX;
    const moonY_ratio = 0.55;
    const moonRadius = Math.min(W, H) * 0.18;

    // Ship state
    let shipX, shipY, shipAngle = 0;
    let shipTargetX, shipTargetY;
    const shipSize = 28;

    // Ship exhaust particles
    const exhaust = [];

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOutQuad(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; }

    function drawStar(sx, sy, brightness, size) {
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${brightness})`;
        ctx.fill();
        // Subtle glow on brighter stars
        if (brightness > 0.6) {
            ctx.beginPath();
            ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 210, 255, ${brightness * 0.15})`;
            ctx.fill();
        }
    }

    function drawAsteroid(ax, ay, size, rot, craters, hue) {
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(rot);

        // Lumpy asteroid shape
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const wobble = 0.7 + 0.3 * Math.sin(angle * 3.7 + rot);
            const r = size * wobble;
            if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fillStyle = `hsl(${hue}, 15%, 28%)`;
        ctx.fill();
        ctx.strokeStyle = `hsl(${hue}, 10%, 18%)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Craters
        for (let c = 0; c < craters; c++) {
            const ca = (c / craters) * Math.PI * 2 + 0.5;
            const cr = size * 0.4;
            ctx.beginPath();
            ctx.arc(Math.cos(ca) * cr, Math.sin(ca) * cr, size * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${hue}, 10%, 20%)`;
            ctx.fill();
        }
        ctx.restore();
    }

    function drawMoon(mx, my, radius) {
        // Full moon glow
        const grad = ctx.createRadialGradient(mx, my, radius * 0.2, mx, my, radius * 2.5);
        grad.addColorStop(0, 'rgba(200, 210, 230, 0.12)');
        grad.addColorStop(1, 'rgba(200, 210, 230, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(mx - radius * 3, my - radius * 3, radius * 6, radius * 6);

        // Moon body - full moon (not crescent)
        ctx.beginPath();
        ctx.arc(mx, my, radius, 0, Math.PI * 2);
        const moonGrad = ctx.createRadialGradient(mx - radius * 0.3, my - radius * 0.3, 0, mx, my, radius);
        moonGrad.addColorStop(0, '#e8e4de');
        moonGrad.addColorStop(0.6, '#c8c4bb');
        moonGrad.addColorStop(1, '#9a968e');
        ctx.fillStyle = moonGrad;
        ctx.fill();

        // Crater details on full moon
        const craterData = [
            { x: -0.25, y: -0.2, r: 0.12 },
            { x: 0.2, y: -0.35, r: 0.08 },
            { x: 0.1, y: 0.2, r: 0.15 },
            { x: -0.35, y: 0.15, r: 0.07 },
            { x: 0.3, y: 0.05, r: 0.1 },
            { x: -0.1, y: 0.35, r: 0.06 },
            { x: -0.05, y: -0.45, r: 0.05 }
        ];
        craterData.forEach(c => {
            ctx.beginPath();
            ctx.arc(mx + c.x * radius, my + c.y * radius, c.r * radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100, 95, 85, 0.35)';
            ctx.fill();
            // Inner shadow
            ctx.beginPath();
            ctx.arc(mx + c.x * radius + 1, my + c.y * radius + 1, c.r * radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80, 75, 65, 0.2)';
            ctx.fill();
        });
    }

    function drawShip(sx, sy, angle, thrust) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);

        // Ship body
        ctx.beginPath();
        ctx.moveTo(0, -shipSize);
        ctx.lineTo(-shipSize * 0.6, shipSize * 0.5);
        ctx.lineTo(-shipSize * 0.3, shipSize * 0.7);
        ctx.lineTo(0, shipSize * 0.5);
        ctx.lineTo(shipSize * 0.3, shipSize * 0.7);
        ctx.lineTo(shipSize * 0.6, shipSize * 0.5);
        ctx.closePath();

        const shipGrad = ctx.createLinearGradient(0, -shipSize, 0, shipSize);
        shipGrad.addColorStop(0, '#e0e8ff');
        shipGrad.addColorStop(0.4, '#8899cc');
        shipGrad.addColorStop(1, '#445577');
        ctx.fillStyle = shipGrad;
        ctx.fill();
        ctx.strokeStyle = '#aabbdd';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Cockpit window
        ctx.beginPath();
        ctx.arc(0, -shipSize * 0.2, shipSize * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffcc';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -shipSize * 0.22, shipSize * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();

        // Thrust exhaust
        if (thrust) {
            const flicker = 0.7 + Math.random() * 0.3;
            const exhaustLen = shipSize * (0.8 + Math.random() * 0.6);
            ctx.beginPath();
            ctx.moveTo(-shipSize * 0.2, shipSize * 0.6);
            ctx.lineTo(0, shipSize * 0.6 + exhaustLen * flicker);
            ctx.lineTo(shipSize * 0.2, shipSize * 0.6);
            ctx.closePath();
            const exGrad = ctx.createLinearGradient(0, shipSize * 0.6, 0, shipSize * 0.6 + exhaustLen);
            exGrad.addColorStop(0, 'rgba(0, 255, 204, 0.9)');
            exGrad.addColorStop(0.4, 'rgba(0, 180, 255, 0.6)');
            exGrad.addColorStop(1, 'rgba(0, 100, 255, 0)');
            ctx.fillStyle = exGrad;
            ctx.fill();

            // Outer glow
            ctx.beginPath();
            ctx.moveTo(-shipSize * 0.35, shipSize * 0.55);
            ctx.lineTo(0, shipSize * 0.6 + exhaustLen * flicker * 1.2);
            ctx.lineTo(shipSize * 0.35, shipSize * 0.55);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 255, 200, 0.08)';
            ctx.fill();
        }

        ctx.restore();
    }

    function addExhaustParticle(sx, sy) {
        exhaust.push({
            x: sx + (Math.random() - 0.5) * 8,
            y: sy,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 3 + 1,
            life: 1,
            size: Math.random() * 3 + 1
        });
    }

    function updateExhaust() {
        for (let i = exhaust.length - 1; i >= 0; i--) {
            const p = exhaust[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
            if (p.life <= 0) exhaust.splice(i, 1);
        }
    }

    function drawExhaust() {
        exhaust.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 204, ${p.life * 0.4})`;
            ctx.fill();
        });
    }

    // Loading progress text
    function drawLoadingText(progress) {
        const pct = Math.floor(progress * 100);
        ctx.font = '600 12px "Fira Code", monospace';
        ctx.fillStyle = 'rgba(0, 255, 204, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(`LOADING CONSOLIUS... ${pct}%`, W / 2, H - 40);

        // Progress bar
        const barW = 200, barH = 3;
        const barX = (W - barW) / 2, barY = H - 25;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = 'rgba(0, 255, 204, 0.6)';
        ctx.fillRect(barX, barY, barW * progress, barH);
    }

    function frame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / TOTAL, 1);

        resize();
        ctx.clearRect(0, 0, W, H);

        // Deep space background gradient
        const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.7);
        bgGrad.addColorStop(0, '#06080e');
        bgGrad.addColorStop(0.5, '#030406');
        bgGrad.addColorStop(1, '#010102');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // -- WARP STARS --
        const warpSpeed = elapsed < PHASE_FLY ? 1 + (elapsed / PHASE_FLY) * 4 : 5 - (elapsed - PHASE_FLY) / (TOTAL - PHASE_FLY) * 4.5;
        stars.forEach(s => {
            s.z -= warpSpeed * 6;
            if (s.z < 1) {
                s.z = 1500;
                s.x = Math.random() * 2000 - 500;
                s.y = Math.random() * 2000 - 500;
            }
            const sx = (s.x / s.z) * W * 0.5 + W / 2;
            const sy = (s.y / s.z) * H * 0.5 + H / 2;
            const brightness = Math.min(1, (1500 - s.z) / 600);

            // Draw warp streak in flying phase
            if (elapsed < PHASE_FLY + PHASE_APPROACH * 0.5 && warpSpeed > 1.5) {
                const streakLen = warpSpeed * 3;
                const prevZ = s.z + warpSpeed * 6;
                const prevSx = (s.x / prevZ) * W * 0.5 + W / 2;
                const prevSy = (s.y / prevZ) * H * 0.5 + H / 2;
                ctx.beginPath();
                ctx.moveTo(prevSx, prevSy);
                ctx.lineTo(sx, sy);
                ctx.strokeStyle = `rgba(180, 210, 255, ${brightness * 0.6})`;
                ctx.lineWidth = s.size * 0.6;
                ctx.stroke();
            }
            drawStar(sx, sy, brightness, s.size);
        });

        // -- PHASE 1: Flying through space dodging asteroids --
        if (elapsed < PHASE_FLY) {
            const flyT = elapsed / PHASE_FLY;

            // Ship position - center, with sine-wave dodging
            shipX = W / 2 + Math.sin(flyT * Math.PI * 6) * 60;
            shipY = H * 0.55 + Math.cos(flyT * Math.PI * 4) * 20;
            shipAngle = Math.sin(flyT * Math.PI * 6) * -0.15; // Subtle tilt while dodging

            // Draw asteroids flying past
            asteroids.forEach(a => {
                a.z -= 12;
                a.rot += a.rotSpeed;
                if (a.z < -100) {
                    a.z = 2200 + Math.random() * 800;
                    a.x = Math.random() * 800 - 400;
                    a.y = Math.random() * 600 - 300;
                }
                if (a.z > 0) {
                    const ax = (a.x / a.z) * W * 0.5 + W / 2;
                    const ay = (a.y / a.z) * H * 0.5 + H / 2;
                    const scale = 300 / a.z;
                    drawAsteroid(ax, ay, a.size * scale, a.rot, a.craters, a.hue);
                }
            });

            // Draw ship with thrust
            drawShip(shipX, shipY, shipAngle, true);
            if (Math.random() > 0.3) addExhaustParticle(shipX, shipY + shipSize * 0.7);

        // -- PHASE 2: Moon glides in from left, ship approaches --
        } else if (elapsed < PHASE_FLY + PHASE_APPROACH) {
            const approachT = (elapsed - PHASE_FLY) / PHASE_APPROACH;
            const easedT = easeOutCubic(approachT);

            // Moon glides in smoothly from the left
            moonTargetX = W * 0.5;
            moonX = -moonRadius * 2 + (moonTargetX + moonRadius * 2) * easedT;
            const moonY = H * moonY_ratio;
            drawMoon(moonX, moonY, moonRadius);

            // Ship moves toward moon center
            shipX = W / 2 + (1 - easedT) * 80 * Math.sin(approachT * Math.PI * 3);
            shipY = H * 0.55 - easedT * (H * 0.55 - moonY + moonRadius + 60);
            shipAngle = (1 - easedT) * Math.sin(approachT * Math.PI * 4) * 0.1;

            drawShip(shipX, shipY, shipAngle, true);
            if (Math.random() > 0.4) addExhaustParticle(shipX, shipY + shipSize * 0.7);

        // -- PHASE 3: Ship spins and lands on moon --
        } else {
            const landT = (elapsed - PHASE_FLY - PHASE_APPROACH) / PHASE_LAND;
            const easedLand = easeInOutQuad(Math.min(landT, 1));

            // Moon stays in final position
            const moonY = H * moonY_ratio;
            drawMoon(W * 0.5, moonY, moonRadius);

            // Ship spins (2 full rotations) then settles upright on moon surface
            const spinAmount = (1 - easedLand) * Math.PI * 4;
            const landingY = moonY - moonRadius - shipSize * 0.5;

            shipX = W / 2;
            shipY = shipY + (landingY - shipY) * easedLand * 0.3;
            if (landT < 0.1) {
                shipY = H * 0.55 - (H * 0.55 - moonY + moonRadius + 60); // from approach end
            }
            shipY = (1 - easedLand) * (moonY - moonRadius - 80) + easedLand * landingY;
            shipAngle = spinAmount;

            drawShip(shipX, shipY, shipAngle, landT < 0.7);
            if (landT < 0.5 && Math.random() > 0.5) addExhaustParticle(shipX, shipY + shipSize * 0.7);

            // Landing dust effect
            if (landT > 0.6 && landT < 0.9) {
                const dustAlpha = (1 - (landT - 0.6) / 0.3) * 0.3;
                for (let d = 0; d < 5; d++) {
                    const dx = shipX + (Math.random() - 0.5) * 60;
                    const dy = landingY + shipSize + Math.random() * 10;
                    ctx.beginPath();
                    ctx.arc(dx, dy, 2 + Math.random() * 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(180, 170, 150, ${dustAlpha})`;
                    ctx.fill();
                }
            }
        }

        updateExhaust();
        drawExhaust();
        drawLoadingText(progress);

        if (elapsed < TOTAL) {
            requestAnimationFrame(frame);
        } else {
            // Fade out
            overlay.style.transition = 'opacity 0.5s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.style.opacity = '1';
                overlay.style.transition = '';
                exhaust.length = 0;
                if (onComplete) onComplete();
            }, 500);
        }
    }

    requestAnimationFrame(frame);
}

/* =========================================
   IDE: MULTI-IFRAME ARCHITECTURE & TABS
   ========================================= */
let autosaveTimeout = null;
function initEditors() {
    const cmConfig = { lineNumbers: true, theme: "material-darker", lineWrapping: true };
    htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlCode'), { ...cmConfig, mode: "htmlmixed" });
    cssEditor = CodeMirror.fromTextArea(document.getElementById('cssCode'), { ...cmConfig, mode: "css" });
    jsEditor = CodeMirror.fromTextArea(document.getElementById('jsCode'), { ...cmConfig, mode: "javascript" });

    [htmlEditor, cssEditor, jsEditor].forEach(editor => { 
        editor.on('change', () => { 
            saveCurrentTab(); 
            if (config.autosave) {
                clearTimeout(autosaveTimeout);
                autosaveTimeout = setTimeout(() => {
                    runCurrentTab();
                }, 500);
            }
        }); 
    });
    setupResizers(); 
    loadTabs();
}

function generateId() { return 'tab_' + Math.random().toString(36).substr(2, 9); }

function createNewTab(name = "New Game") {
    playSound('click');
    const id = generateId();
    const newTab = { id, name, html: '', css: '', js: '', volume: 1.0 };
    tabs.push(newTab);
    
    const iframe = document.createElement('iframe');
    iframe.id = `iframe_${id}`; iframe.className = 'preview-iframe';
    document.getElementById('output-area').appendChild(iframe);
    
    switchTab(id);
}

function renderTabs() {
    const list = document.getElementById('tab-list');
    list.innerHTML = '';
    tabs.forEach(tab => {
        const div = document.createElement('div');
        div.className = `tab ${tab.id === activeTabId ? 'active' : ''}`;
        
        // Click anywhere on the tab to switch (not on contenteditable title)
        div.onclick = (e) => {
            // Don't switch if clicking on contenteditable title (let dblclick handle rename)
            if (e.target.classList.contains('tab-title-text') && e.target.isContentEditable) return;
            switchTab(tab.id);
        };
        
        // Tab row header + closed cross + custom volume slider inputs
        div.innerHTML = `
            <div class="tab-header-row">
                <span class="tab-title-text" data-tab-id="${tab.id}">${tab.name}</span>
                <div class="tab-controls-right">
                    <button class="tab-close" onclick="closeTab(event, '${tab.id}')"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="tab-volume-slider-wrapper" onclick="event.stopPropagation()">
                <i class="fa-solid fa-volume-low tab-volume-icon"></i>
                <input type="range" class="tab-volume-slider" min="0" max="1" step="0.05" value="${tab.volume !== undefined ? tab.volume : 1.0}" oninput="setTabVolume('${tab.id}', this.value)">
            </div>
        `;

        // Double-click on title to enable rename
        const titleSpan = div.querySelector('.tab-title-text');
        titleSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            switchTab(tab.id); // Single click still switches tab
        });
        titleSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            titleSpan.contentEditable = 'true';
            titleSpan.focus();
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(titleSpan);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });
        titleSpan.addEventListener('blur', () => {
            titleSpan.contentEditable = 'false';
            renameTab(tab.id, titleSpan.innerText);
        });
        titleSpan.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                titleSpan.blur();
            }
        });

        list.appendChild(div);
    });
}

function switchTab(id) {
    if (activeTabId) {
        saveCurrentTab();
        const oldIframe = document.getElementById(`iframe_${activeTabId}`);
        if(oldIframe) {
            oldIframe.classList.remove('active');
            if(oldIframe.contentWindow) oldIframe.contentWindow.postMessage({ type: 'visibility', visible: false }, '*');
        }
    }
    
    playSound('click');
    activeTabId = id;
    const tab = tabs.find(t => t.id === id);
    htmlEditor.setValue(tab.html); cssEditor.setValue(tab.css); jsEditor.setValue(tab.js);
    
    const newIframe = document.getElementById(`iframe_${id}`);
    if(newIframe) {
        newIframe.classList.add('active');
        if(newIframe.contentWindow) newIframe.contentWindow.postMessage({ type: 'visibility', visible: true }, '*');
        if(!newIframe.getAttribute('data-has-run')) {
            runCurrentTab();
        } else {
            // Restore volume scale immediately to the active iframe
            if (newIframe.contentWindow) {
                newIframe.contentWindow.postMessage({ type: 'volume', volume: tab.volume !== undefined ? tab.volume : 1.0 }, '*');
            }
        }
    }
    renderTabs();
}

function setTabVolume(id, value) {
    const tab = tabs.find(t => t.id === id);
    if (tab) {
        tab.volume = parseFloat(value);
        // Post the volume level target message channel to the active tab's script context inside iframe
        const iframe = document.getElementById(`iframe_${id}`);
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'volume', volume: value }, '*');
        }
    }
}

function saveCurrentTab() {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) { tab.html = htmlEditor.getValue(); tab.css = cssEditor.getValue(); tab.js = jsEditor.getValue(); }
}

function closeTab(event, id) {
    event.stopPropagation();
    if (tabs.length === 1) return;
    playSound('click');
    const iframe = document.getElementById(`iframe_${id}`);
    if(iframe) iframe.remove();
    tabs = tabs.filter(t => t.id !== id);
    if (activeTabId === id) switchTab(tabs[tabs.length - 1].id);
    else renderTabs();
}

function renameTab(id, newName) { 
    const tab = tabs.find(t => t.id === id);
    if (tab) tab.name = newName; 
}
function loadTabs() { createNewTab("Project_1"); }

/* =========================================
   BROWSER TAB FOCUS RECOVERY ENGINE
   ========================================= */
document.addEventListener('visibilitychange', () => {
    // Determine the actively running IDE tab
    const activeIframe = document.getElementById(`iframe_${activeTabId}`);
    if (document.hidden) {
        // Switching away from the browser tab -> Suspend active iframe audio
        if (activeIframe && activeIframe.contentWindow) {
            activeIframe.contentWindow.postMessage({ type: 'visibility', visible: false }, '*');
        }
    } else {
        // Returning to the browser tab -> ONLY resume active tab audio!
        if (activeIframe && activeIframe.contentWindow) {
            activeIframe.contentWindow.postMessage({ type: 'visibility', visible: true }, '*');
        }
    }
});

/* =========================================
   RUNNER & AUDIO / RAF SUSPEND INJECTOR
   ========================================= */
const freezeHook = `
<script>
    (function(){
        let isVisible = true;
        let tabVolume = 1.0;
        const audios = [];
        const contexts = [];

        // Intercept standard HTML5 Audio constructor
        const OriginalAudio = window.Audio;
        window.Audio = function(...args) { 
            const a = new OriginalAudio(...args); 
            audios.push(a);
            // set starting volumes based on visibilities
            a.volume = isVisible ? tabVolume : 0;
            return a; 
        };

        // Intercept Audio tags volume property setter in prototype layers
        const origVolProp = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
        Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
            get: function() {
                return origVolProp.get.call(this);
            },
            set: function(val) {
                this.dataset.origVolume = val;
                const target = isVisible ? (val * tabVolume) : 0;
                origVolProp.set.call(this, target);
            }
        });

        // Intercept WebAudio context constructor connects
        const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
        if(OriginalAudioContext) {
            window.AudioContext = function(...args) {
                const ctx = new OriginalAudioContext(...args); 
                contexts.push(ctx);
                
                // Add node gain controllers
                const originalConnect = AudioNode.prototype.connect;
                ctx.masterGain = ctx.createGain();
                ctx.masterGain.gain.value = isVisible ? tabVolume : 0;
                originalConnect.call(ctx.masterGain, ctx.destination);

                // Re-route connect targets matching destination to our custom gain node
                AudioNode.prototype.connect = function(dest, ...args2) {
                    if (dest === ctx.destination) {
                        return originalConnect.call(this, ctx.masterGain, ...args2);
                    }
                    return originalConnect.call(this, dest, ...args2);
                };

                if(!isVisible) ctx.suspend(); 
                return ctx;
            };
        }

        const origRAF = window.requestAnimationFrame;
        let rafCallbacks = [];
        window.requestAnimationFrame = function(cb) {
            if(!isVisible) { rafCallbacks.push(cb); return 99999; }
            return origRAF(cb);
        };

        window.addEventListener('message', e => {
            if(e.data.type === 'visibility') {
                isVisible = e.data.visible;
                syncVolumes();
                if(isVisible) {
                    contexts.forEach(c => { if(c.state === 'suspended') c.resume(); });
                    const cbs = rafCallbacks; rafCallbacks = []; cbs.forEach(cb => origRAF(cb));
                } else {
                    contexts.forEach(c => { if(c.state === 'running') c.suspend(); });
                }
            } else if (e.data.type === 'volume') {
                tabVolume = parseFloat(e.data.volume);
                syncVolumes();
            }
        });

        function syncVolumes() {
            audios.forEach(a => {
                a.volume = isVisible ? tabVolume : 0;
            });
            document.querySelectorAll('audio, video').forEach(m => {
                const origVal = m.dataset.origVolume !== undefined ? parseFloat(m.dataset.origVolume) : 1.0;
                origVolProp.set.call(m, isVisible ? (origVal * tabVolume) : 0);
            });
            contexts.forEach(c => {
                if (c.masterGain) {
                    c.masterGain.gain.setValueAtTime(isVisible ? tabVolume : 0, c.currentTime);
                }
            });
        }
    })();
<\/script>
`;

function runCurrentTab() {
    if(!activeTabId) return;
    saveCurrentTab();
    playSound('success');
    const tab = tabs.find(t=>t.id===activeTabId);
    const iframe = document.getElementById(`iframe_${activeTabId}`);
    const html = tab.html, css = `<style>${tab.css}</style>`, js = tab.js;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(freezeHook + html + css + `<script>${js}<\/script>`); doc.close();
    iframe.setAttribute('data-has-run', 'true');
    
    // Broadcast parameters to setup volume scales inside sandbox
    setTimeout(() => {
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'volume', volume: tab.volume !== undefined ? tab.volume : 1.0 }, '*');
            iframe.contentWindow.postMessage({ type: 'visibility', visible: activeTabId === tab.id }, '*');
        }
    }, 50);
}

/* =========================================
   ZIP EXPORTER ENGINE
   ========================================= */
function exportToZip() {
    if (typeof JSZip === 'undefined') { 
        playSound('error');
        showNotification("JSZip compiler files are currently unloading."); 
        return; 
    }
    saveCurrentTab();
    playSound('success');
    const zip = new JSZip();
    
    tabs.forEach(tab => {
        const safeName = tab.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const folder = zip.folder(safeName);
        const htmlFile = `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>${tab.name}</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n${tab.html}\n    <script src="script.js"><\/script>\n</body>\n</html>`;
        folder.file("index.html", htmlFile);
        folder.file("style.css", tab.css);
        folder.file("script.js", tab.js);
    });

    zip.generateAsync({type:"blob"}).then(function(content) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "Consolius_Workspace.zip";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        showNotification("ZIP exported and downloaded successfully.");
    });
}

/* =========================================
   RESIZERS
   ========================================= */
function setupResizers() {
    const MIN_PANEL_WIDTH = 80; // Minimum panel width to prevent collapse
    document.querySelectorAll('.resizer').forEach(resizer => {
        resizer.addEventListener('mousedown', e => {
            e.preventDefault();
            const left = resizer.previousElementSibling, right = resizer.nextElementSibling;
            if (!left || !right) return;
            let prevX = e.clientX, prevLeftSize = left.getBoundingClientRect().width, prevRightSize = right.getBoundingClientRect().width;
            
            function mouseMove(ev) {
                const deltaX = ev.clientX - prevX;
                const newLeft = prevLeftSize + deltaX;
                const newRight = prevRightSize - deltaX;
                // Enforce minimum width constraint on both panels
                if (newLeft >= MIN_PANEL_WIDTH && newRight >= MIN_PANEL_WIDTH) {
                    left.style.flex = `0 0 ${newLeft}px`; 
                    right.style.flex = `0 0 ${newRight}px`;
                }
            }
            function mouseUp() { window.removeEventListener('mousemove', mouseMove); window.removeEventListener('mouseup', mouseUp); }
            window.addEventListener('mousemove', mouseMove); window.addEventListener('mouseup', mouseUp);
        });
    });
}

/* =========================================
   SYSTEM TELEMETRY HUD MONITOR
   ========================================= */
function startPerformanceMonitor() {
    setInterval(() => {
        const mockFps = Math.floor(58 + Math.random() * 3);
        const mockCpu = (0.5 + Math.random() * 1.5).toFixed(1);
        const mockMem = (38.2 + Math.random() * 4.4).toFixed(1);
        
        const fpsEl = document.getElementById('perf-fps');
        const cpuEl = document.getElementById('perf-cpu');
        const memEl = document.getElementById('perf-mem');
        
        if (fpsEl) fpsEl.innerText = mockFps;
        if (cpuEl) cpuEl.innerText = `${mockCpu}%`;
        if (memEl) memEl.innerText = `${mockMem} MB`;
    }, 1500);
}

/* =========================================
   AUDIO SYNTHESIZER UTILITIES (UI SOUNDS)
   ========================================= */
function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'click') {
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.08);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'boot') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(75, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.25);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        }
    } catch (e) {
        // Browser block overrides
    }
}

/* =========================================
   CUSTOM SMOOTH GLIDING TOUR MODULE
   ========================================= */
const tourSteps = [
    {
        element: "#screen-terminal",
        title: "Consolius Terminal Shell",
        text: "This is the main command deck. Type standard utility names like 'help', or search queries to route proxy queries."
    },
    {
        element: "#sidebar",
        title: "Workspace Panel & Tabs",
        text: "Switch files or launch projects. Control audio levels on each sandbox independently with customized slider controls."
    },
    {
        element: "#panel-html",
        title: "HTML Sandboxed File",
        text: "Construct elements structure inside CodeMirror. Real-time content saves apply instantly."
    },
    {
        element: "#panel-css",
        title: "CSS Stylesheet File",
        text: "Adjust layout looks. Style definitions inject dynamically directly into output frames."
    },
    {
        element: "#panel-js",
        title: "Javascript Script File",
        text: "Script operational logic. Context APIs intercept and suspend CPU/sound hooks when visibility is hidden."
    },
    {
        element: "#output-area",
        title: "Real-time Live Viewport",
        text: "Execute game code inside frame windows. Volume settings scale automatically when tabs are active."
    },
    {
        element: "button[onclick=\"openControlPanel('style')\"]",
        title: "Control Panel Styles Hub",
        text: "Adjust fonts, sizes, grid arrangements, presets, and radii down to the smallest detail. Custom styling configurations save dynamically."
    }
];

let currentTourStep = 0;

function tourStart() {
    playSound('boot');
    currentTourStep = 0;
    document.getElementById('tour-spotlight').style.display = 'block';
    document.getElementById('tour-overlay').classList.add('active');
    showTourStep(0);
}

function showTourStep(index) {
    if (index < 0 || index >= tourSteps.length) {
        tourEnd();
        return;
    }
    
    currentTourStep = index;
    const step = tourSteps[index];
    const target = document.querySelector(step.element);
    
    if (!target) {
        tourNext();
        return;
    }
    
    // Switch active view screens to render appropriate tabs if needed
    if (step.element === '#sidebar' || step.element.includes('panel') || step.element === '#output-area') {
        if (!document.getElementById('screen-ide').classList.contains('active')) {
            switchScreen('screen-ide', true);
        }
    }
    
    // Add brief timing offset to ensure page renders elements
    setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const spotlight = document.getElementById('tour-spotlight');
        const tooltip = document.getElementById('tour-tooltip');
        
        // Check if the target is full-screen sized (covers most of viewport)
        const isFullScreen = rect.width >= window.innerWidth * 0.8 && rect.height >= window.innerHeight * 0.8;
        
        if (isFullScreen) {
            // For full-screen targets, use a smaller centered spotlight + center tooltip
            const spotW = Math.min(400, window.innerWidth * 0.5);
            const spotH = Math.min(200, window.innerHeight * 0.25);
            const spotX = (window.innerWidth - spotW) / 2;
            const spotY = (window.innerHeight - spotH) / 2 - 60;

            spotlight.style.top = `${spotY}px`;
            spotlight.style.left = `${spotX}px`;
            spotlight.style.width = `${spotW}px`;
            spotlight.style.height = `${spotH}px`;

            // Center tooltip below spotlight
            const ttTop = spotY + spotH + 20;
            const ttLeft = (window.innerWidth - 280) / 2;
            tooltip.style.top = `${ttTop}px`;
            tooltip.style.left = `${ttLeft}px`;
        } else {
            // Normal spotlight positioning
            spotlight.style.top = `${rect.top + window.scrollY}px`;
            spotlight.style.left = `${rect.left + window.scrollX}px`;
            spotlight.style.width = `${rect.width}px`;
            spotlight.style.height = `${rect.height}px`;

            // Compute relative tooltip positions
            let ttTop = rect.bottom + 16;
            let ttLeft = rect.left + (rect.width / 2) - 140;
            
            // Out of viewport safeguards
            if (ttTop + 200 > window.innerHeight) {
                ttTop = rect.top - 200 - 16;
            }
            if (ttTop < 10) {
                // If still off-screen, center vertically
                ttTop = (window.innerHeight - 180) / 2;
            }
            if (ttLeft < 10) ttLeft = 10;
            if (ttLeft + 280 > window.innerWidth) ttLeft = window.innerWidth - 290;
            
            tooltip.style.top = `${ttTop}px`;
            tooltip.style.left = `${ttLeft}px`;
        }
        
        // Tooltip content updates
        document.getElementById('tour-title').innerText = step.title;
        document.getElementById('tour-text').innerText = step.text;
        document.getElementById('tour-step').innerText = `${index + 1} / ${tourSteps.length}`;
        
        const nextBtn = document.getElementById('tour-btn-next');
        nextBtn.innerText = index === tourSteps.length - 1 ? "Finish ✨" : "Next →";
        
        // Smooth entrance with a slight pop
        tooltip.classList.remove('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                tooltip.classList.add('active');
            });
        });
        playSound('click');
    }, 200);
}

function tourNext() {
    playSound('click');
    showTourStep(currentTourStep + 1);
}

function tourSkip() {
    tourEnd();
}

function tourEnd() {
    document.getElementById('tour-overlay').classList.remove('active');
    document.getElementById('tour-tooltip').classList.remove('active');
    
    const spotlight = document.getElementById('tour-spotlight');
    spotlight.style.width = '0px';
    spotlight.style.height = '0px';
    spotlight.style.display = 'none';
    
    // Mark tour as completed for first-visit auto-trigger
    localStorage.setItem('consolius_tour_done', 'true');
    
    playSound('success');
    showNotification("🚀 Consolius Tour complete! You're all set.");
}

/* =========================================
   ADDITIONAL SYSTEM UTILITY COMMANDS
   ========================================= */
function toggleFullscreen() {
    playSound('click');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            showNotification("Fullscreen mode enabled.");
        }).catch(err => {
            showNotification("Fullscreen requests requires direct user gesture triggers.");
        });
    } else {
        document.exitFullscreen().then(() => {
            showNotification("Fullscreen mode disabled.");
        });
    }
}

function openTabAboutBlank() {
    if (!activeTabId) return;
    saveCurrentTab();
    playSound('success');
    const tab = tabs.find(t => t.id === activeTabId);
    
    try {
        const win = window.open('about:blank', '_blank');
        if (win) {
            const html = tab.html, css = `<style>${tab.css}</style>`, js = tab.js;
            win.document.open();
            win.document.write(html + css + `<script>${js}<\/script>`);
            win.document.close();
            showNotification("Active game compiled to about:blank.");
        } else {
            playSound('error');
            showNotification("Popup blocked. Please authorize page window outputs.");
        }
    } catch(e) {
        playSound('error');
        showNotification("Failed compilation sandbox loader.");
    }
}

function toggleAutosave() {
    config.autosave = document.getElementById('setting-autosave').checked;
    saveSettings();
    showNotification(`Autosave ${config.autosave ? 'Enabled' : 'Disabled'}`);
}

function clearPanelFlexStyles() {
    document.querySelectorAll('.panel, #output-area').forEach(el => {
        el.style.flex = '';
    });
}

function resetAllStyles() {
    if (confirm("Are you sure you want to restore default OS styles? This clears custom presets.")) {
        playSound('boot');
        localStorage.removeItem('consolius_custom_styles');
        customStyles = {
            console: {
                fontFamily: "'Fira Code', monospace",
                fontWeight: "400",
                fontSize: "14",
                padding: "24",
                borderRadius: "6",
                borderWidth: "1",
                colorBg: "#050508",
                colorAccent: "#00ffcc",
                colorText: "#e0e0f0",
                glassBlur: "8"
            },
            ide: {
                fontFamily: "'Inter', sans-serif",
                fontWeight: "600",
                fontSize: "13",
                editorFontSize: "13",
                sidebarWidth: "260",
                gridGap: "8",
                padding: "12",
                borderRadius: "8",
                borderWidth: "1",
                colorBg: "#0d0d12",
                colorPanel: "#12121a",
                colorHeader: "#09090d",
                colorAccent: "#ff007f",
                colorText: "#e0e0ea",
                glassBlur: "10",
                layoutTemplate: "layout-standard"
            }
        };
        compileStylesToCSS();
        syncControlsWithTargetData();
        clearPanelFlexStyles();
        showNotification("Reset default styling properties.");
    }
}

/* =========================================
   BOOT ENTRY INITIALIZATION
   ========================================= */
window.onload = function() {
    initCustomizerStyles();
    initEditors();
    setupTerminalInputs();
    startPerformanceMonitor();
    
    // Trigger boot terminal loading sequence
    runBootSequence();
};