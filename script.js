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
        --console-border: ${customStyles.console.borderWidth}px solid ${customStyles.console.colorAccent}33;

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
    }
    
    #sidebar {
        width: var(--ide-sidebar-width) !important;
    }
    
    #screen-terminal {
        padding: var(--console-padding) !important;
        font-family: var(--console-font) !important;
        font-size: var(--console-font-size) !important;
    }
    
    #screen-ide {
        font-family: var(--ide-font) !important;
        font-size: var(--ide-font-size) !important;
    }
    `;
    styleEl.innerHTML = css;

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
    } else {
        document.getElementById('row-editor-font-size').style.display = 'flex';
        document.getElementById('row-sidebar-width').style.display = 'flex';
        document.getElementById('row-grid-gap').style.display = 'flex';
        document.getElementById('row-color-panel').style.display = 'flex';
        document.getElementById('row-color-header').style.display = 'flex';
        document.getElementById('row-ide-layout').style.display = 'flex';
        
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
 * Cleanly switch between screens with proper fade transition.
 * Prevents the "fade stays stuck" bug by using transitionend to hide.
 */
function switchScreen(targetId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        if (s.classList.contains('active')) {
            s.classList.remove('active');
            s.classList.add('fading-out');
            // After transition, fully hide
            const cleanup = () => {
                s.classList.remove('fading-out');
                s.removeEventListener('transitionend', cleanup);
            };
            s.addEventListener('transitionend', cleanup);
            // Safety fallback in case transitionend doesn't fire
            setTimeout(cleanup, 400);
        } else {
            // Ensure any leftover fading-out class is removed
            s.classList.remove('fading-out');
        }
    });
    const target = document.getElementById(targetId);
    if (target) {
        // Small frame delay so fading-out has started first
        requestAnimationFrame(() => {
            target.classList.remove('fading-out');
            target.classList.add('active');
        });
    }
}

function setControlHubTab(tabId) {
    playSound('click');
    document.querySelectorAll('.style-center-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.hub-section').forEach(sec => sec.style.display = 'none');
    
    document.getElementById(`tab-btn-${tabId}`).classList.add('active');
    document.getElementById(`hub-section-${tabId}`).style.display = 'block';
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
        div.onclick = () => switchTab(tab.id);
        
        // Tab row header + closed cross + custom volume slider inputs
        div.innerHTML = `
            <div class="tab-header-row">
                <span class="tab-title-text" contenteditable="true" onblur="renameTab('${tab.id}', this.innerText)" onclick="event.stopPropagation()">${tab.name}</span>
                <div class="tab-controls-right">
                    <button class="tab-close" onclick="closeTab(event, '${tab.id}')"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="tab-volume-slider-wrapper" onclick="event.stopPropagation()">
                <i class="fa-solid fa-volume-low tab-volume-icon"></i>
                <input type="range" class="tab-volume-slider" min="0" max="1" step="0.05" value="${tab.volume !== undefined ? tab.volume : 1.0}" oninput="setTabVolume('${tab.id}', this.value)">
            </div>
        `;
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
    document.querySelectorAll('.resizer').forEach(resizer => {
        resizer.addEventListener('mousedown', e => {
            e.preventDefault();
            const left = resizer.previousElementSibling, right = resizer.nextElementSibling;
            if (!left || !right) return;
            let prevX = e.clientX, prevLeftSize = left.getBoundingClientRect().width, prevRightSize = right.getBoundingClientRect().width;
            
            function mouseMove(ev) {
                const deltaX = ev.clientX - prevX;
                left.style.flex = `0 0 ${prevLeftSize + deltaX}px`; 
                right.style.flex = `0 0 ${prevRightSize - deltaX}px`;
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
            executeCommand('ide');
        }
    }
    
    // Add brief timing offset to ensure page renders elements
    setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const spotlight = document.getElementById('tour-spotlight');
        const tooltip = document.getElementById('tour-tooltip');
        
        // Glide spotlight cutout to the coordinates
        spotlight.style.top = `${rect.top + window.scrollY}px`;
        spotlight.style.left = `${rect.left + window.scrollX}px`;
        spotlight.style.width = `${rect.width}px`;
        spotlight.style.height = `${rect.height}px`;
        
        // Tooltip updates
        document.getElementById('tour-title').innerText = step.title;
        document.getElementById('tour-text').innerText = step.text;
        document.getElementById('tour-step').innerText = `${index + 1} / ${tourSteps.length}`;
        
        const nextBtn = document.getElementById('tour-btn-next');
        nextBtn.innerText = index === tourSteps.length - 1 ? "Finish" : "Next";
        
        // Compute relative positions
        let ttTop = rect.bottom + 16;
        let ttLeft = rect.left + (rect.width / 2) - 140;
        
        // Out of viewport safeguards
        if (ttTop + 180 > window.innerHeight) {
            ttTop = rect.top - 180 - 16;
        }
        if (ttLeft < 10) ttLeft = 10;
        if (ttLeft + 280 > window.innerWidth) ttLeft = window.innerWidth - 290;
        
        tooltip.style.top = `${ttTop}px`;
        tooltip.style.left = `${ttLeft}px`;
        tooltip.classList.add('active');
        playSound('click');
    }, 150);
}

function tourNext() {
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
    
    playSound('success');
    showNotification("Consolius Tour guide finished.");
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