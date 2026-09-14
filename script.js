/* ==========================================================================
   CONSOLIUS V5 - persistent multi-game workspace, settings, and runner engine
   ========================================================================== */

(() => {
    'use strict';

    const STORAGE_KEY = 'consolius_workspace_v5';
    const IDENTITY_KEY = 'consolius_tab_identity_v5';
    const SETTINGS_KEY = 'consolius_settings_v5';
    const DEFAULT_SETTINGS = {
        autosave: true, confirmClose: true, startup: 'terminal', rememberScreen: true,
        accent: '#00ffcc', ideAccent: '#ff007f', density: 'comfortable', reduceMotion: false, blur: true, fontSize: 13,
        layout: 'standard', wrap: true, lineNumbers: true, autoRun: true, multiRun: true, minEditorWidth: 220,
        defaultVolume: 1, runnerBg: '#000000', runnerPopups: true, runnerDownloads: true, pauseHidden: false, runnerOverlay: true,
        hud: true, hudPosition: 'bottom-right', hudFrequency: 500, lazyScreens: true, notifications: true, debug: false,
        blockFileProxy: true, lazyScreens: true
    };
    let appSettings = loadJsonSetting(SETTINGS_KEY, DEFAULT_SETTINGS);

    function loadJsonSetting(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : null;
            return { ...fallback, ...(parsed || {}) };
        } catch (_) { return { ...fallback }; }
    }

    function saveAppSettings() {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings)); } catch (_) {}
    }

    const defaultIdentity = {
        title: localStorage.getItem('consolius_tab_title') || 'Google Drive',
        icon: localStorage.getItem('consolius_tab_icon') || 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'
    };

    window.sysSettings = {
        tabTitle: defaultIdentity.title,
        tabIcon: defaultIdentity.icon,
        proxyPrefix: localStorage.getItem('consolius_proxy_prefix') || 'https://splash.best/service/',
        panicKey: localStorage.getItem('consolius_panic_key') || 'q'
    };

    let tabs = [];
    let activeTabId = null;
    let currentRomUrl = null;
    let currentRomFile = null;
    let currentRomName = '';
    let currentRomObjectUrl = null;
    let currentBiosObjectUrl = null;
    let currentGamesHtmlUrl = null;
    let gamesEmulatorFrame = null;
    let gamesEmulatorDocumentUrl = null;
    const romLibrary = [];
    const EMULATORJS_DATA = 'https://cdn.emulatorjs.org/latest/data/';
    let extraJsEditors = [];

    const $ = id => document.getElementById(id);
    const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    function escapeHtml(value = '') {
        return String(value).replace(/[&<>"']/g, c => ({
            '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
        }[c]));
    }

    function notify(message, kind = 'info') {
        if (appSettings.notifications === false) return;
        const el = $('sys-notification');
        const text = $('sys-notification-text');
        if (!el || !text) return;
        text.textContent = message;
        el.dataset.kind = kind;
        el.classList.add('show');
        clearTimeout(notify.timer);
        notify.timer = setTimeout(() => el.classList.remove('show'), 2600);
    }

    function saveWorkspace() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
        } catch (error) {
            console.warn('Could not save workspace:', error);
        }
    }

    function loadWorkspace() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (Array.isArray(data.tabs) && data.tabs.length) {
                    tabs = data.tabs.map(normalizeTab);
                    activeTabId = tabs.some(t => t.id === data.activeTabId) ? data.activeTabId : tabs[0].id;
                    return;
                }
            }
        } catch (error) {
            console.warn('Workspace restore failed:', error);
        }

        tabs = [createTab('New Game', true)];
        activeTabId = tabs[0].id;
        saveWorkspace();
    }

    function normalizeTab(tab) {
        return {
            id: tab.id || uid('tab'),
            name: tab.name || 'Untitled Game',
            icon: tab.icon || '🎮',
            html: tab.html || '<main style="font-family:system-ui;padding:40px"><h1>Hello, CONSOLIUS</h1><p>Start building your game here.</p></main>',
            css: tab.css || 'body{margin:0;background:#101116;color:#fff}',
            js: tab.js || '',
            extras: Array.isArray(tab.extras) ? tab.extras : [],
            volume: Number.isFinite(Number(tab.volume)) ? Number(tab.volume) : Number(appSettings.defaultVolume ?? 1),
            running: tab.running !== false,
            lastSaved: tab.lastSaved || Date.now(),
            sourceType: tab.sourceType || 'workspace'
        };
    }

    function createTab(name = 'New Game', blank = false) {
        return normalizeTab({
            id: uid('tab'),
            name,
            icon: '🎮',
            html: blank ? '<div id="game"><h1>New Game</h1><p>Edit the HTML panel to begin.</p></div>' : '',
            css: blank ? 'body{margin:0;background:#111;color:#eee;font-family:system-ui}' : '',
            js: '',
            extras: [],
            volume: Number(appSettings.defaultVolume ?? 1),
            running: true,
            lastSaved: Date.now(),
            sourceType: 'workspace'
        });
    }

    function getActiveTab() {
        return tabs.find(tab => tab.id === activeTabId) || tabs[0];
    }

    function splitHtmlSource(source = '') {
        const text = String(source || '');
        if (!/<(?:!doctype|html|head|body)\b/i.test(text)) return { body: text, css: '', js: '', externalScripts: [] };
        try {
            const doc = new DOMParser().parseFromString(text, 'text/html');
            const styles = Array.from(doc.querySelectorAll('style')).map(el => el.textContent || '').join('\n');
            const inlineScripts = [];
            const externalScripts = [];
            Array.from(doc.querySelectorAll('script')).forEach(el => {
                const src = el.getAttribute('src');
                if (src) externalScripts.push(src);
                else if (el.textContent) inlineScripts.push(el.textContent);
            });
            const body = doc.body ? doc.body.innerHTML : text;
            return { body, css: styles, js: inlineScripts.join('\n'), externalScripts };
        } catch (_) {
            return { body: text, css: '', js: '', externalScripts: [] };
        }
    }

    function safeScriptText(code = '') {
        return String(code).replace(/<\/script/gi, '<\\/script');
    }

    function buildGameDocument(tab, volume = tab.volume) {
        const source = splitHtmlSource(tab.html || '');
        const combinedCss = [source.css || '', tab.css || ''].filter(Boolean).join('\n');
        const combinedJs = [source.js || '', tab.js || ''].filter(Boolean).join('\n');
        const extraScripts = (tab.extras || []).map(x => `<script>\n${safeScriptText(x.content || '')}\n</script>`).join('\n');
        const externalScripts = (source.externalScripts || []).map(src => `<script src="${escapeHtml(src)}"></script>`).join('\n');
        const safeVolume = Math.max(0, Math.min(1, Number(volume) || 0));
        const bg = appSettings.runnerBg || '#000000';
        const volumePatch = `<script>\n(() => {\n  let MASTER_VOLUME=${safeVolume};\n  const apply=()=>document.querySelectorAll('audio,video').forEach(m=>{try{m.volume=MASTER_VOLUME;}catch(_){}});\n  window.CONSOLIUS_SET_VOLUME=v=>{MASTER_VOLUME=Math.max(0,Math.min(1,Number(v)||0));apply();};\n  window.CONSOLIUS_GET_VOLUME=()=>MASTER_VOLUME;\n  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});\n  addEventListener('DOMContentLoaded',apply,{once:true});\n})();\n</script>`;
        return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;min-height:100%;background:${bg};}body{overflow:auto;}\n${combinedCss}</style></head><body>${source.body || ''}${externalScripts}<script>\n${safeScriptText(combinedJs)}\n</script>${extraScripts}${volumePatch}</body></html>`;
    }

    function syncEditorsFromTab() {
        const tab = getActiveTab();
        if (!tab) return;
        const html = $('htmlCode'), css = $('cssCode'), js = $('jsCode');
        if (html) html.value = tab.html;
        if (css) css.value = tab.css;
        if (js) js.value = tab.js;
        renderExtraEditors(tab.extras);
        const name = $('game-tab-name'), icon = $('game-tab-icon');
        if (name) name.value = tab.name;
        if (icon) icon.value = tab.icon;
        updateRunnerToolbar();
        renderTabList();
        showRunner(activeTabId);
    }

    function syncActiveTabFromEditors() {
        const tab = getActiveTab();
        if (!tab) return;
        tab.html = $('htmlCode')?.value || '';
        tab.css = $('cssCode')?.value || '';
        tab.js = $('jsCode')?.value || '';
        tab.extras = Array.from(document.querySelectorAll('.extra-js-code')).map((ta, index) => ({
            name: ta.dataset.name || `script_${index + 2}.js`,
            content: ta.value
        }));
        tab.lastSaved = Date.now();
        saveWorkspace();
    }

    function renderTabList() {
        const list = $('tab-list');
        if (!list) return;
        list.innerHTML = '';
        tabs.forEach((tab, index) => {
            const item = document.createElement('div');
            item.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
            item.dataset.tabId = tab.id;
            item.innerHTML = `
                <div class="tab-header-row">
                    <div class="tab-title-text"><span class="tab-icon">${escapeHtml(tab.icon)}</span> ${escapeHtml(tab.name || `Game ${index+1}`)}</div>
                    <div class="tab-controls-right">
                        <span class="tab-running-dot ${tab.running ? 'on' : ''}" title="${tab.running ? 'Running' : 'Stopped'}"></span>
                        <button class="tab-close" data-action="close" title="Close tab"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>
                <div class="tab-subtitle">${tab.sourceType === 'rom' ? 'ROM import' : 'HTML / CSS / JS'} · ${tab.running ? 'playing' : 'paused'}</div>
                <div class="tab-volume-slider-wrapper" data-role="volume">
                    <i class="fa-solid ${tab.volume <= 0 ? 'fa-volume-xmark' : 'fa-volume-low'} tab-volume-icon"></i>
                    <input class="tab-volume-slider" type="range" min="0" max="1" step="0.01" value="${tab.volume}" aria-label="Volume">
                    <span class="tab-volume-value">${Math.round(tab.volume * 100)}%</span>
                </div>`;

            item.addEventListener('click', event => {
                if (event.target.closest('.tab-close') || event.target.closest('.tab-volume-slider-wrapper')) return;
                switchToTab(tab.id);
            });
            item.querySelector('[data-action="close"]').addEventListener('click', event => {
                event.stopPropagation();
                deleteTab(tab.id);
            });
            item.querySelector('.tab-volume-slider').addEventListener('input', event => {
                setTabVolume(tab.id, Number(event.target.value));
            });
            list.appendChild(item);
        });
    }

    function createRunnerCard(tab) {
        const card = document.createElement('div');
        card.className = `game-runner-card ${tab.id === activeTabId ? 'active' : ''}`;
        card.dataset.runnerId = tab.id;
        const iframe = document.createElement('iframe');
        iframe.className = 'game-runner-frame';
        iframe.allow = 'autoplay; fullscreen; gamepad';
        iframe.setAttribute('title', tab.name);
        iframe.setAttribute('sandbox', `allow-scripts allow-forms allow-pointer-lock ${appSettings.runnerPopups ? 'allow-popups' : ''} ${appSettings.runnerDownloads ? 'allow-downloads' : ''}`.trim());
        iframe.srcdoc = buildGameDocument(tab, tab.volume);
        card.appendChild(iframe);
        const overlay = document.createElement('div');
        overlay.className = 'runner-overlay';
        overlay.innerHTML = `<span><i class="fa-solid fa-gamepad"></i> ${escapeHtml(tab.name)}</span><span>${tab.running ? 'LIVE' : 'STOPPED'}</span>`;
        card.appendChild(overlay);
        iframe.addEventListener('load', () => applyRunnerVolume(tab.id));
        return card;
    }

    function renderRunnerStack() {
        const stack = $('game-runner-stack');
        if (!stack) return;
        const existing = new Map(Array.from(stack.querySelectorAll('.game-runner-card')).map(card => [card.dataset.runnerId, card]));
        tabs.forEach(tab => {
            let card = existing.get(tab.id);
            if (!card) { card = createRunnerCard(tab); stack.appendChild(card); }
            existing.delete(tab.id);
            card.querySelector('.runner-overlay span:last-child').textContent = tab.running ? 'LIVE' : 'STOPPED';
            card.querySelector('.runner-overlay span:first-child').innerHTML = `<i class="fa-solid fa-gamepad"></i> ${escapeHtml(tab.name)}`;
            card.querySelector('iframe')?.setAttribute('title', tab.name);
        });
        existing.forEach(card => card.remove());
        showRunner(activeTabId);
        updateRunnerToolbar();
    }

    function showRunner(id) {
        document.querySelectorAll('.game-runner-card').forEach(card => {
            const active = card.dataset.runnerId === id;
            card.classList.toggle('active', active);
            if (active) {
                const tab = tabs.find(t=>t.id===id);
                card.classList.toggle('paused', !tab?.running);
            }
        });
    }

    function refreshRunnerDocument(id) {
        const tab=tabs.find(t=>t.id===id); if(!tab) return;
        const card=document.querySelector(`.game-runner-card[data-runner-id="${CSS.escape(id)}"]`);
        const frame=card?.querySelector('iframe'); if(frame) frame.srcdoc=buildGameDocument(tab,tab.volume);
    }

    function switchToTab(id) {
        syncActiveTabFromEditors();
        if (!tabs.some(tab => tab.id === id)) return;
        activeTabId = id;
        saveWorkspace();
        syncEditorsFromTab();
        if (appSettings.pauseHidden) tabs.filter(t => t.id !== activeTabId).forEach(t => toggleTabRunning(t.id, false));
        notify(`Switched to ${getActiveTab().name}`);
    }

    function addGameTab(source = null) {
        syncActiveTabFromEditors();
        const tab = source ? normalizeTab({ ...source, id: uid('tab'), name: `${source.name} Copy`, lastSaved: Date.now() }) : createTab(`Game ${tabs.length + 1}`, true);
        tabs.push(tab);
        activeTabId = tab.id;
        saveWorkspace();
        syncEditorsFromTab();
        renderRunnerStack();
        notify('New game tab created');
    }

    function deleteTab(id) {
        if (tabs.length <= 1) {
            notify('Keep at least one game tab open.', 'warn');
            return;
        }
        const closing = tabs.find(tab => tab.id === id);
        if (appSettings.confirmClose && closing && !window.confirm(`Close '${closing.name}'?`)) return;
        tabs = tabs.filter(tab => tab.id !== id);
        if (activeTabId === id) activeTabId = tabs[Math.max(0, tabs.length - 1)].id;
        saveWorkspace();
        syncEditorsFromTab();
        renderRunnerStack();
        notify(`Closed ${closing?.name || 'game tab'}`);
    }

    function setTabVolume(id, value) {
        const tab = tabs.find(t => t.id === id);
        if (!tab) return;
        tab.volume = Math.max(0, Math.min(1, value));
        saveWorkspace();
        applyRunnerVolume(id);
        const item = document.querySelector(`.tab[data-tab-id="${CSS.escape(id)}"]`);
        if (item) {
            item.querySelector('.tab-volume-slider').value = tab.volume;
            item.querySelector('.tab-volume-value').textContent = `${Math.round(tab.volume * 100)}%`;
            item.querySelector('.tab-volume-icon').className = `fa-solid ${tab.volume <= 0 ? 'fa-volume-xmark' : 'fa-volume-low'} tab-volume-icon`;
        }
    }

    function applyRunnerVolume(id) {
        const tab = tabs.find(t => t.id === id);
        const card = document.querySelector(`.game-runner-card[data-runner-id="${CSS.escape(id)}"]`);
        const frame = card?.querySelector('iframe');
        if (!tab || !frame) return;
        try {
            frame.contentWindow.postMessage({ type:'CONSOLIUS_VOLUME', value:tab.volume }, '*');
            const doc = frame.contentDocument;
            if (doc) doc.querySelectorAll('audio,video').forEach(m => m.volume = tab.volume);
        } catch (_) { /* cross-origin/opaque frames are intentionally ignored */ }
    }

    function toggleTabRunning(id, running) {
        const tab = tabs.find(t => t.id === id);
        if (!tab) return;
        tab.running = running;
        saveWorkspace();
        renderTabList();
        document.querySelectorAll(`.game-runner-card[data-runner-id="${CSS.escape(id)}"] .runner-overlay`).forEach(el => {
            el.lastElementChild.textContent = running ? 'LIVE' : 'STOPPED';
        });
    }

    function updateRunnerToolbar() {
        const tab = getActiveTab();
        const text = $('runner-status-text');
        if (text) text.textContent = tab ? `${tab.name} · ${tab.running ? 'Running' : 'Stopped'}` : 'Ready';
        const active = document.querySelector('.game-runner-card.active');
        if (active) active.classList.toggle('paused', !tab?.running);
    }

    function renderExtraEditors(extras = []) {
        const container = $('extra-js-container');
        if (!container) return;
        container.innerHTML = '';
        extraJsEditors = [];
        extras.forEach(extra => addJsSlot(extra.name, extra.content, false));
    }

    window.addJsSlot = function(fileName = null, content = '', save = true) {
        const container = $('extra-js-container');
        if (!container) return;
        const slotId = uid('js-extra');
        const name = fileName || `script_${container.children.length + 2}.js`;
        const panel = document.createElement('div');
        panel.className = 'panel extra-js-panel';
        panel.id = slotId;
        panel.innerHTML = `
            <div class="panel-header" style="color:#f7df1e;">
                <span><i class="fa-brands fa-square-js"></i> ${escapeHtml(name)}</span>
                <button class="mini-icon-btn extra-js-remove" title="Remove script"><i class="fa-solid fa-trash"></i></button>
            </div>
            <textarea class="extra-js-code" data-name="${escapeHtml(name)}" spellcheck="false">${escapeHtml(content)}</textarea>`;
        panel.querySelector('.extra-js-remove').addEventListener('click', () => {
            panel.remove();
            syncActiveTabFromEditors();
        });
        container.appendChild(panel);
        extraJsEditors.push(panel);
        if (save) syncActiveTabFromEditors();
    };

    function importHtmlFile(input) {
        const file = input?.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            $('htmlCode').value = e.target.result;
            syncActiveTabFromEditors();
            if (appSettings.autoRun) runCurrentTab();
            notify(`Imported ${file.name}`);
        };
        reader.onerror = () => notify(`Could not read ${file.name}`, 'error');
        reader.readAsText(file);
        input.value = '';
    }

    function importCssFile(input) {
        const file = input?.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            $('cssCode').value = e.target.result;
            syncActiveTabFromEditors();
            if (appSettings.autoRun) runCurrentTab();
            notify(`Imported ${file.name}`);
        };
        reader.onerror = () => notify(`Could not read ${file.name}`, 'error');
        reader.readAsText(file);
        input.value = '';
    }

    function importJsFiles(input) {
        const files = Array.from(input?.files || []);
        if (!files.length) return;
        $('jsCode').value = '';
        extraJsEditors = [];
        $('extra-js-container').innerHTML = '';
        let remaining = files.length;
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = e => {
                if (index === 0) $('jsCode').value = e.target.result;
                else addJsSlot(file.name, e.target.result, false);
                remaining--;
                if (remaining === 0) {
                    syncActiveTabFromEditors();
                    if (appSettings.autoRun) runCurrentTab();
                    notify(`${files.length} JavaScript file${files.length === 1 ? '' : 's'} imported`);
                }
            };
            reader.onerror = () => remaining--;
            reader.readAsText(file);
        });
        input.value = '';
    }

    function runCurrentTab() {
        const tab = getActiveTab();
        if (!tab) return;
        syncActiveTabFromEditors();
        tab.running = true;
        saveWorkspace();
        renderRunnerStack();
        refreshRunnerDocument(tab.id);
        showRunner(tab.id);
        notify(`${tab.name} is running`);
    }

    function stopCurrentTab() {
        const tab = getActiveTab();
        if (!tab) return;
        toggleTabRunning(tab.id, false);
        notify(`${tab.name} stopped`);
    }

    function refreshCurrentTab() {
        const tab = getActiveTab();
        if (!tab) return;
        syncActiveTabFromEditors();
        renderRunnerStack();
        refreshRunnerDocument(tab.id);
        notify(`${tab.name} refreshed`);
    }

    function popoutCurrentGame() {
        const tab = getActiveTab();
        if (!tab) return;
        openAboutBlank(buildGameDocument(tab, tab.volume), tab.name, tab.icon);
    }

    function checkPassword() {
        const input = $('sys-password-input');
        const err = $('password-err');
        if (input && input.value === 'Abelthebest1') {
            const screen=$('password-screen'); if(screen) screen.style.display='none';
            input.value = '';
            notify('System access granted');
        } else if (err) {
            err.style.display = 'block';
            setTimeout(() => err.style.display = 'none', 1800);
        }
    }
    window.checkPassword = checkPassword;

    function executeCommand(cmd) {
        const output = $('main-term-output');
        if (!cmd) return;
        if (output) {
            const line = document.createElement('div');
            line.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;margin:4px 0;";
            line.innerHTML = `<span style="color:#00ffcc;font-weight:bold;">root@consolius:~$</span> ${escapeHtml(cmd)}`;
            output.appendChild(line);
        }
        const clean = cmd.toLowerCase().trim();
        const arg = clean.split(/\s+/).slice(1).join(' ');
        const commands = {
            help(){ printOutput(`<div style="color:#00ffcc;font-weight:bold">CONSOLIUS COMMANDS</div><div>help — show commands</div><div>ide — open the multi-game IDE</div><div>games — open Game Studio</div><div>ui / settings — open Control Center</div><div>runner — open IDE runner</div><div>addtab — create a game tab</div><div>tabs — list game tabs</div><div>run / stop / refresh — control active game</div><div>save — save active game</div><div>duplicate — duplicate active game</div><div>export — export active game ZIP</div><div>hud on/off — toggle performance HUD</div><div>fullscreen — toggle fullscreen</div><div>theme neon/cyan/pink — quick accent presets</div><div>clear — clear terminal</div><div>reset — reset workspace</div><div>exit — return home</div>`); },
            ide(){ switchScreen('screen-ide'); }, games(){ switchScreen('screen-games'); }, ui(){ openControlPanel('general'); }, settings(){ openControlPanel('general'); }, runner(){ switchScreen('screen-ide'); document.querySelector('#output-area')?.scrollIntoView?.({behavior:'smooth',block:'center'}); },
            addtab(){ addGameTab(); }, tabs(){ printOutput(tabs.map((t,i)=>`<div><span style="color:#00ffcc">${i+1}.</span> ${escapeHtml(t.icon)} ${escapeHtml(t.name)} ${t.id===activeTabId?' <b>(active)</b>':''}</div>`).join('')); },
            run(){ runCurrentTab(); }, stop(){ stopCurrentTab(); }, refresh(){ refreshCurrentTab(); }, save(){ syncActiveTabFromEditors(); saveIdentity(); notify('Game saved'); }, duplicate(){ addGameTab(getActiveTab()); }, export(){ exportToZip(); },
            fullscreen(){ toggleFullscreen(); }, clear(){ if(output) output.innerHTML=''; }, reset(){ resetWorkspace(); },
            hud(){ setAdvancedSetting('hud', arg !== 'off'); },
            version(){ printOutput('<span style="color:#aaa">CONSOLIUS v5.0 — persistent multi-game workspace</span>'); },
            aboutblank(){ openAboutBlank(); }, exit(){ switchScreen('screen-terminal'); }
        };
        if (clean.startsWith('theme ')) {
            const colors={neon:'#00ffcc',cyan:'#00eaff',pink:'#ff007f',purple:'#a970ff',orange:'#ff9f43'};
            const color=colors[arg]; if(color){ setAdvancedSetting('accent',color); setAdvancedSetting('ideAccent',color); notify(`Theme set to ${arg}`); } else notify('Themes: neon, cyan, pink, purple, orange','warn');
            return;
        }
        if (clean === 'hud on' || clean === 'hud off') { setAdvancedSetting('hud', clean.endsWith('on')); return; }
        if (commands[clean]) return commands[clean]();
        if (/^https?:\/\//i.test(clean)) { switchScreen('screen-proxy'); if ($('proxy-address')) $('proxy-address').value = cmd; proxyNavigate(); return; }
        if (clean.includes('.') && !clean.startsWith('file:')) { switchScreen('screen-proxy'); if ($('proxy-address')) $('proxy-address').value = cmd; proxyNavigate(); return; }
        printOutput(`<span style="color:#ff0055;">Command not recognized: ${escapeHtml(cmd)}. Type 'help' for available commands.</span>`);
    }
    window.executeCommand = executeCommand;

    function printOutput(html) {
        const output = $('main-term-output');
        if (!output) return;
        const res = document.createElement('div');
        res.style.cssText = 'margin:4px 0 12px 0;line-height:1.5';
        res.innerHTML = html;
        output.appendChild(res);
    }

    function switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = $(screenId);
        if (target) target.classList.add('active');
        if (screenId === 'screen-ide') syncEditorsFromTab();
        try { localStorage.setItem('consolius_last_screen_v5', screenId); } catch (_) {}
    }
    window.switchScreen = switchScreen;

    function proxyNavigate() {
        const addr = $('proxy-address')?.value.trim();
        if (!addr) return;
        if (appSettings.blockFileProxy && /^file:/i.test(addr)) {
            $('proxy-status-text').textContent = 'Local file navigation blocked for safety.';
            $('proxy-error-page')?.style && ($('proxy-error-page').style.display = 'flex');
            $('proxy-loading-splash')?.style && ($('proxy-loading-splash').style.display = 'none');
            notify('Local file URLs are blocked in the proxy. Use Import Game / ROM instead.', 'warn');
            return;
        }
        let targetUrl = addr;
        if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;
        const splash = $('proxy-loading-splash'), frame = $('proxy-frame'), errPage = $('proxy-error-page');
        if (splash) splash.style.display='flex';
        if (errPage) errPage.style.display='none';
        if (frame) { frame.style.display='none'; frame.src='about:blank'; frame.src=(window.sysSettings.proxyPrefix||'') + encodeURIComponent(targetUrl); }
        if ($('proxy-splash-url')) $('proxy-splash-url').textContent = targetUrl;
    }
    window.proxyNavigate = proxyNavigate;

    function proxyFrameLoaded() {
        $('proxy-loading-splash')?.style && ($('proxy-loading-splash').style.display = 'none');
        $('proxy-frame')?.style && ($('proxy-frame').style.display = 'block');
    }
    function proxyFrameError() {
        $('proxy-loading-splash')?.style && ($('proxy-loading-splash').style.display = 'none');
        $('proxy-error-page')?.style && ($('proxy-error-page').style.display = 'flex');
    }
    window.proxyFrameLoaded = proxyFrameLoaded;
    window.proxyFrameError = proxyFrameError;
    window.proxyReload = () => { const frame = $('proxy-frame'); if (frame) frame.src = frame.src; };
    window.proxyBack = () => { try { $('proxy-frame')?.contentWindow?.history.back(); } catch(_){} };
    window.proxyForward = () => { try { $('proxy-frame')?.contentWindow?.history.forward(); } catch(_){} };

    function toggleOverlayTerminal() { $('overlay-terminal')?.classList.toggle('active'); }
    window.toggleOverlayTerminal = toggleOverlayTerminal;

    function openAboutBlank(htmlContent = null, title = null, icon = null) {
        const win = window.open('about:blank', '_blank');
        if (!win) return notify('Popup blocked. Allow popups for CONSOLIUS.', 'warn');
        const finalTitle = title || window.sysSettings.tabTitle || 'Google Drive';
        const finalIcon = icon || window.sysSettings.tabIcon || '💻';
        const body = htmlContent || `<div style="height:100vh;display:grid;place-items:center;background:#08090d;color:#00ffcc;font:14px/1.6 monospace;text-align:center"><div><h1>${escapeHtml(finalTitle)}</h1><p>CONSOLIUS cloaked window</p><small>The main system remains open in the original tab.</small></div></div>`;
        win.document.open();
        win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(finalTitle)}</title><link rel="icon" href="${escapeHtml(finalIcon)}"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000}</style></head><body>${body}</body></html>`);
        win.document.close();
        return win;
    }
    window.openAboutBlank = openAboutBlank;

    window.openTabAboutBlank = popoutCurrentGame;

    const ROM_CORE_MAP = {
        gba:'gba', gb:'gb', gbc:'gb', nes:'nes', fds:'nes', unf:'nes', unif:'nes', sfc:'snes', smc:'snes',
        z64:'n64', n64:'n64', v64:'n64', nds:'nds', ps1:'psx', psc:'psx', bin:'psx', cue:'psx', img:'psx', pbp:'psx',
        iso:'psp', cso:'psp', psp:'psp', md:'segaMD', gen:'segaMD', smd:'segaMD', binmd:'segaMD', sms:'segaMS',
        gg:'segaGG', '32x':'sega32x', chd:'psx', m3u:'psx', a26:'atari2600', a52:'atari5200', a78:'atari7800', lnx:'lynx',
        jag:'jaguar', vb:'vb', ws:'ws', wsc:'ws', ngp:'ngp', ngc:'ngp', pce:'pce', d64:'c64', g64:'c64', prg:'c64',
        adf:'amiga', dsk:'amiga'
    };

    function detectRomCore(filename='') {
        const ext=(String(filename).split('.').pop()||'').toLowerCase();
        return ROM_CORE_MAP[ext] || 'auto';
    }

    function gamesStatus(text, kind='ready') {
        const label=$('games-status-text'); if(label) label.textContent=text;
        const dot=$('games-status-dot'); if(dot){ dot.className='runner-dot'; if(kind==='error') dot.classList.add('status-error'); if(kind==='loading') dot.classList.add('status-loading'); }
    }

    function updateGamesCurrentCard(name, info) {
        if($('games-current-name')) $('games-current-name').textContent=name||'No game loaded';
        if($('games-current-info')) $('games-current-info').textContent=info||'Import a ROM to start.';
    }

    function updateGamesControls() {
        const select=$('games-core-select'); if(select) select.value = detectRomCore(currentRomName)==='auto' ? 'auto' : (select.dataset.userSet==='1' ? select.value : detectRomCore(currentRomName));
        const vol=$('games-volume'); if(vol) vol.value = String(loadJsonSetting('consolius_games_volume_v1',{value:1}).value ?? 1);
        if($('games-volume-value') && vol) $('games-volume-value').textContent=`${Math.round(Number(vol.value)*100)}%`;
        if($('games-core-badge')) $('games-core-badge').textContent=(select?.value||'auto').toUpperCase();
    }

    function revokeRomUrls(){
        if(currentRomObjectUrl){ try{ URL.revokeObjectURL(currentRomObjectUrl); }catch(_){} currentRomObjectUrl=null; }
        if(currentBiosObjectUrl){ try{ URL.revokeObjectURL(currentBiosObjectUrl); }catch(_){} currentBiosObjectUrl=null; }
        if(gamesEmulatorDocumentUrl){ try{ URL.revokeObjectURL(gamesEmulatorDocumentUrl); }catch(_){} gamesEmulatorDocumentUrl=null; }
    }

    function clearEjsGlobals(){
        const keys=['EJS_player','EJS_gameName','EJS_gameUrl','EJS_biosUrl','EJS_core','EJS_pathtodata','EJS_startOnLoaded','EJS_askBeforeExit','EJS_threads','EJS_volume','EJS_ready','EJS_onExit','EJS_setVolume','EJS_emulator'];
        for(const key of keys){ try{ delete window[key]; }catch(_){ try{ window[key]=undefined; }catch(__){} } }
    }

    function destroyGamesEmulator(){
        try{
            if(window.EJS_emulator){
                if(typeof window.EJS_emulator.exit === 'function') window.EJS_emulator.exit();
                else if(typeof window.EJS_emulator.destroy === 'function') window.EJS_emulator.destroy();
            }
        }catch(_){ }
        const host=$('games-emulator-host'); if(host) host.innerHTML='';
        const web=$('games-web-frame'); if(web){ web.hidden=true; web.src='about:blank'; }
        if(window.__CONSOLIUS_EMULATOR_SCRIPT__){ try{ window.__CONSOLIUS_EMULATOR_SCRIPT__.remove(); }catch(_){} window.__CONSOLIUS_EMULATOR_SCRIPT__=null; }
        document.querySelectorAll('[data-consolius-ejs-style="1"], [data-consolius-ejs-script="1"]').forEach(el=>{ try{el.remove();}catch(_){} });
        clearEjsGlobals();
        gamesEmulatorFrame=null;
    }

    function prepareDirectEmulatorRoot(){
        const host=$('games-emulator-host');
        if(!host) throw new Error('Game Studio emulator host is missing.');
        host.innerHTML='';
        const root=document.createElement('div');
        root.id='consolius-emulator-root';
        root.style.cssText='position:absolute;inset:0;width:100%;height:100%;background:#000;overflow:hidden;';
        const game=document.createElement('div');
        game.id='game';
        game.style.cssText='width:100%;height:100%;min-width:0;min-height:0;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden;';
        root.appendChild(game);
        host.appendChild(root);
        return game;
    }

    function launchRomInBuiltInEmulator(file){
        if(!file) return;
        try{
            destroyGamesEmulator();
            revokeRomUrls();
            currentRomFile=file; currentRomName=file.name; currentRomUrl=null;
            currentRomObjectUrl=URL.createObjectURL(file);
            const select=$('games-core-select');
            const detected=detectRomCore(file.name);
            if(select){
                if(!select.dataset.userSet || select.dataset.userSet!=='1') select.value=detected;
                if(select.value==='auto') select.dataset.userSet='0';
            }
            const core=(select?.value && select.value!=='auto')?select.value:detected;
            if($('games-core-badge')) $('games-core-badge').textContent=(core||'AUTO').toUpperCase();
            prepareDirectEmulatorRoot();
            $('games-empty-state')?.setAttribute('hidden','hidden');
            updateGamesCurrentCard(file.name, `${(file.size/1048576).toFixed(2)} MB · ${(core||'AUTO').toUpperCase()} core`);
            gamesStatus(`Loading ${file.name}…`,'loading');
            addRomToLibrary(file,core);

            // IMPORTANT: run EmulatorJS in the main CONSOLIUS document instead of a
            // Blob/srcdoc iframe. Blob/srcdoc frames have opaque origins, which makes
            // EmulatorJS's localStorage access fail with "Access is denied" and leaves
            // the emulator black. Running the loader in the top-level document keeps
            // the normal localStorage origin and lets the WebAssembly core initialize.
            const volume=Math.max(0,Math.min(1,Number($('games-volume')?.value||1)));
            const scale=$('games-scale-select')?.value||'fit';
            const root=$('game');
            if(scale==='stretch') root.style.imageRendering='auto';
            if(scale==='integer') root.style.imageRendering='pixelated';

            window.EJS_player='#game';
            window.EJS_gameName=file.name;
            window.EJS_gameUrl=currentRomObjectUrl;
            window.EJS_biosUrl=currentBiosObjectUrl||'';
            window.EJS_core=core==='auto'?'gba':core;
            window.EJS_pathtodata=EMULATORJS_DATA;
            window.EJS_startOnLoaded=true;
            window.EJS_askBeforeExit=false;
            window.EJS_threads=['psp','3ds','dosbox_pure','azahar'].includes(core);
            window.EJS_volume=volume;
            window.EJS_ready=function(){
                gamesStatus(`${file.name} — ready`,'ready');
                try{ if(window.EJS_setVolume) window.EJS_setVolume(volume); }catch(_){}
                try{ window.dispatchEvent(new CustomEvent('consolius-emulator-ready')); }catch(_){}
            };
            window.EJS_onExit=function(){ gamesStatus('Emulator exited','ready'); };

            const script=document.createElement('script');
            script.src=EMULATORJS_DATA+'loader.js';
            script.async=false;
            script.dataset.consoliusEjsScript='1';
            script.addEventListener('error',()=>{
                gamesStatus('Emulator loader failed to load','error');
                notify('EmulatorJS could not load. Check your internet connection.','error');
            });
            window.__CONSOLIUS_EMULATOR_SCRIPT__=script;
            document.head.appendChild(script);
        }catch(error){
            gamesStatus(error.message||'Emulator failed to start','error');
            notify(`Emulator failed: ${error.message}`,'error');
        }
    }

    async function importWebGameToGames(file){
        destroyGamesEmulator();
        revokeRomUrls(false);
        const web=$('games-web-frame'); if(!web) return;
        $('games-empty-state')?.setAttribute('hidden','hidden');
        if(/\.html?$/i.test(file.name)){
            const html=await file.text();
            currentGamesHtmlUrl=URL.createObjectURL(new Blob([html],{type:'text/html'}));
            web.src=currentGamesHtmlUrl;
        }else{
            if(!window.JSZip) throw new Error('JSZip is still loading.');
            const zip=await JSZip.loadAsync(file);
            const entry=zip.file(/(^|\/)index\.html?$/i)[0];
            if(!entry) throw new Error('No index.html found in ZIP');
            const html=await entry.async('string');
            currentGamesHtmlUrl=URL.createObjectURL(new Blob([html],{type:'text/html'}));
            web.src=currentGamesHtmlUrl;
        }
        web.hidden=false;
        updateGamesCurrentCard(file.name,'Web game · Game Studio runner');
        gamesStatus(`${file.name} — web game running`,'ready');
    }

    function addRomToLibrary(file, core){
        const id=uid('rom');
        romLibrary.unshift({id,name:file.name,size:file.size,type:file.type,core,file});
        if(romLibrary.length>30) romLibrary.pop();
        renderRomLibrary();
    }

    function renderRomLibrary(){
        const list=$('games-rom-library'); if(!list) return;
        list.innerHTML='';
        $('games-library-count') && ($('games-library-count').textContent=String(romLibrary.length));
        romLibrary.forEach(item=>{
            const el=document.createElement('button'); el.className='games-rom-item'; el.type='button';
            el.innerHTML=`<span class="games-rom-icon"><i class="fa-solid fa-gamepad"></i></span><span class="games-rom-copy"><b>${escapeHtml(item.name)}</b><small>${escapeHtml(String(item.core).toUpperCase())} · ${(item.size/1048576).toFixed(1)} MB</small></span>`;
            el.addEventListener('click',()=>launchRomInBuiltInEmulator(item.file));
            list.appendChild(el);
        });
    }

    async function handleRomImport(input){
        const file=input?.files?.[0]; if(!file) return;
        try{
            switchScreen('screen-games');
            if(/\.html?$/i.test(file.name)||/\.zip$/i.test(file.name)) await importWebGameToGames(file);
            else launchRomInBuiltInEmulator(file);
            notify(`${file.name} opened in Game Studio`);
        }catch(error){ gamesStatus(error.message||'Import failed','error'); notify(`Game import failed: ${error.message}`,'error'); }
        finally{ if(input) input.value=''; }
    }
    window.handleRomImport=input=>{handleRomImport(input);};

    function importBiosFile(input){
        const file=input?.files?.[0]; if(!file) return;
        if(currentBiosObjectUrl) try{URL.revokeObjectURL(currentBiosObjectUrl);}catch(_){ }
        currentBiosObjectUrl=URL.createObjectURL(file);
        notify(`BIOS loaded: ${file.name}`);
        if(currentRomFile) launchRomInBuiltInEmulator(currentRomFile);
        if(input) input.value='';
    }

    function stopBuiltInGame(){
        destroyGamesEmulator();
        if(currentGamesHtmlUrl){try{URL.revokeObjectURL(currentGamesHtmlUrl);}catch(_){ } currentGamesHtmlUrl=null;}
        $('games-empty-state')?.removeAttribute('hidden');
        updateGamesCurrentCard('No game loaded','Import a ROM to start.');
        gamesStatus('Stopped');
        revokeRomUrls(false);
    }

    function rebuildBuiltInGame(){ if(currentRomFile) launchRomInBuiltInEmulator(currentRomFile); else gamesStatus('Nothing to reset','warn'); }

    function setGamesVolume(value){
        const v=Math.max(0,Math.min(1,Number(value)||0));
        try{localStorage.setItem('consolius_games_volume_v1',JSON.stringify({value:v}));}catch(_){ }
        if($('games-volume-value')) $('games-volume-value').textContent=`${Math.round(v*100)}%`;
        try{ if(window.EJS_setVolume) window.EJS_setVolume(v); }catch(_){}
        if(gamesEmulatorFrame) gamesEmulatorFrame.contentWindow?.postMessage({type:'CONSOLIUS_GAME_VOLUME',value:v},'*');
    }

    function changeGamesScale(){ if(currentRomFile) launchRomInBuiltInEmulator(currentRomFile); }
    function popoutBuiltInGame(){
        if(!currentRomFile) return notify('Import a ROM first.','warn');
        const w=window.open('', '_blank');
        if(!w) return notify('Popup blocked. Allow popups for Game Studio.','warn');
        const core=$('games-core-select')?.value && $('games-core-select').value!=='auto' ? $('games-core-select').value : detectRomCore(currentRomFile.name);
        const volume=Math.max(0,Math.min(1,Number($('games-volume')?.value||1)));
        const rom=currentRomObjectUrl;
        w.document.open();
        w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(currentRomFile.name)}</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000}#game{width:100%;height:100%}</style></head><body><div id="game"></div><script>
window.EJS_player='#game';
window.EJS_gameName=${JSON.stringify(currentRomFile.name)};
window.EJS_gameUrl=${JSON.stringify(rom)};
window.EJS_biosUrl=${JSON.stringify(currentBiosObjectUrl||'')};
window.EJS_core=${JSON.stringify(core||'gba')};
window.EJS_pathtodata=${JSON.stringify(EMULATORJS_DATA)};
window.EJS_startOnLoaded=true;
window.EJS_askBeforeExit=false;
window.EJS_volume=${JSON.stringify(volume)};
</script><script src="${EMULATORJS_DATA}loader.js"></script></body></html>`);
        w.document.close();
    }

    function launchGameInAboutBlank() {
        if (currentRomFile || gamesEmulatorFrame) return popoutBuiltInGame();
        const tab = getActiveTab();
        if (!tab) return notify('No game selected.', 'warn');
        popoutCurrentGame();
    }
    window.launchGameInAboutBlank = launchGameInAboutBlank;

    function exportToZip() {
        if (!window.JSZip) return notify('JSZip is still loading.', 'warn');
        syncActiveTabFromEditors();
        const tab = getActiveTab();
        const zip = new JSZip();
        zip.file('index.html', tab.html || '');
        zip.file('style.css', tab.css || '');
        zip.file('main.js', tab.js || '');
        (tab.extras || []).forEach((extra, index) => zip.file(`extra_${index+1}.js`, extra.content || ''));
        const meta = { name:tab.name, icon:tab.icon, volume:tab.volume };
        zip.file('consolius.json', JSON.stringify(meta, null, 2));
        zip.generateAsync({type:'blob'}).then(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${(tab.name || 'consolius_project').replace(/[^a-z0-9_-]+/gi,'_')}.zip`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 1500);
            notify('Project exported');
        });
    }
    window.exportToZip = exportToZip;

    function saveIdentity() {
        const tab = getActiveTab();
        if (!tab) return;
        const name = $('game-tab-name')?.value.trim();
        const icon = $('game-tab-icon')?.value.trim();
        if (name) tab.name = name;
        if (icon) tab.icon = icon;
        tab.lastSaved = Date.now();
        saveWorkspace();
        updateDocumentIdentity();
        renderTabList();
        renderRunnerStack();
        notify(`Saved identity for ${tab.name}`);
    }

    function updateDocumentIdentity() {
        document.title = window.sysSettings.tabTitle;
        const link = $('app-favicon');
        if (link) link.href = window.sysSettings.tabIcon;
    }

    function getSettingControlMap() {
        return {
            'tabTitle': 'setting-tab-title','tabIcon':'setting-tab-icon','proxyPrefix':'setting-proxy-prefix','panicKey':'setting-panic',
            'autosave':'setting-autosave','confirmClose':'setting-confirm-close','startup':'setting-startup','rememberScreen':'setting-remember-screen',
            'accent':'setting-accent','ideAccent':'setting-ide-accent','density':'setting-density','reduceMotion':'setting-reduce-motion','blur':'setting-blur','fontSize':'setting-font-size',
            'layout':'setting-layout','wrap':'setting-wrap','lineNumbers':'setting-line-numbers','autoRun':'setting-auto-run','multiRun':'setting-multi-run','minEditorWidth':'setting-min-editor-width',
            'defaultVolume':'setting-default-volume','runnerBg':'setting-runner-bg','runnerPopups':'setting-runner-popups','runnerDownloads':'setting-runner-downloads','pauseHidden':'setting-pause-hidden','runnerOverlay':'setting-runner-overlay',
            'hud':'setting-hud','hudPosition':'setting-hud-position','hudFrequency':'setting-hud-frequency','lazyScreens':'setting-lazy-screens','notifications':'setting-notifications','debug':'setting-debug','blockFileProxy':'setting-block-file-proxy'
        };
    }

    function readSettingsForm() {
        const map=getSettingControlMap();
        Object.entries(map).forEach(([key,id])=>{
            const el=$(id); if(!el) return;
            appSettings[key] = el.type === 'checkbox' ? el.checked : (el.type === 'number' || el.type === 'range' ? Number(el.value) : el.value);
        });
    }

    function fillSettingsForm() {
        Object.entries(getSettingControlMap()).forEach(([key,id])=>{
            const el=$(id); if(!el || appSettings[key] === undefined) return;
            if(el.type==='checkbox') el.checked=!!appSettings[key]; else el.value=appSettings[key];
        });
    }

    function setAdvancedSetting(key,value) {
        appSettings[key]=value;
        saveAppSettings();
        fillSettingsForm();
        applyAdvancedSettings();
    }

    function applyAdvancedSettings() {
        const root=document.documentElement;
        root.style.setProperty('--console-accent', appSettings.accent || '#00ffcc');
        root.style.setProperty('--ide-accent', appSettings.ideAccent || '#ff007f');
        root.style.setProperty('--ide-editor-size', `${Math.max(10,Math.min(24,Number(appSettings.fontSize)||13))}px`);
        root.dataset.density=appSettings.density || 'comfortable';
        root.classList.toggle('reduce-motion', !!appSettings.reduceMotion);
        root.classList.toggle('no-blur', !appSettings.blur);
        document.body.classList.toggle('density-compact', appSettings.density==='compact');
        document.body.classList.toggle('density-spacious', appSettings.density==='spacious');
        const hud=$('perf-hud'); if(hud){ hud.style.display=appSettings.hud ? 'flex' : 'none'; hud.classList.remove('hud-top-right','hud-top-left','hud-bottom-left','hud-bottom-right'); hud.classList.add(`hud-${appSettings.hudPosition||'bottom-right'}`); }
        const stack=$('game-runner-stack'); if(stack) stack.style.background=appSettings.runnerBg || '#000';
        document.querySelectorAll('#htmlCode,#cssCode,#jsCode,.extra-js-code').forEach(el=>{el.style.whiteSpace=appSettings.wrap?'pre-wrap':'pre'; el.style.overflowX=appSettings.wrap?'hidden':'auto';});
        if(appSettings.layout==='stacked') $('editor-grid')?.classList.add('layout-stacked'); else $('editor-grid')?.classList.remove('layout-stacked');
        applyPanelMinimumWidth();
        if (appSettings.debug) console.log('[CONSOLIUS] settings applied', appSettings);
        saveAppSettings();
    }

    function applyPanelMinimumWidth(){
        const min=Math.max(180,Math.min(480,Number(appSettings.minEditorWidth)||220));
        document.querySelectorAll('.code-panel').forEach(p=>p.style.minWidth=`${min}px`);
    }

    function saveSettings() {
        readSettingsForm();
        if (appSettings.tabTitle) { window.sysSettings.tabTitle=appSettings.tabTitle; localStorage.setItem('consolius_tab_title',appSettings.tabTitle); }
        if (appSettings.tabIcon) { window.sysSettings.tabIcon=appSettings.tabIcon; localStorage.setItem('consolius_tab_icon',appSettings.tabIcon); }
        if (appSettings.proxyPrefix) { window.sysSettings.proxyPrefix=appSettings.proxyPrefix; localStorage.setItem('consolius_proxy_prefix',appSettings.proxyPrefix); }
        if (appSettings.panicKey) { window.sysSettings.panicKey=appSettings.panicKey; localStorage.setItem('consolius_panic_key',appSettings.panicKey); }
        saveAppSettings(); updateDocumentIdentity(); applyAdvancedSettings();
        $('settings-save-status').textContent='Saved just now.';
        notify('Settings saved');
    }
    window.saveSettings=saveSettings;

    function loadSavedSettings(){
        appSettings={...DEFAULT_SETTINGS,...loadJsonSetting(SETTINGS_KEY,DEFAULT_SETTINGS)};
        try{
            if(!localStorage.getItem('consolius_v6_wrap_migrated')){
                appSettings.wrap=true;
                localStorage.setItem('consolius_v6_wrap_migrated','1');
            }
        }catch(_){}
        window.sysSettings.tabTitle=localStorage.getItem('consolius_tab_title') || appSettings.tabTitle || defaultIdentity.title;
        window.sysSettings.tabIcon=localStorage.getItem('consolius_tab_icon') || appSettings.tabIcon || defaultIdentity.icon;
        window.sysSettings.proxyPrefix=localStorage.getItem('consolius_proxy_prefix') || 'https://splash.best/service/';
        window.sysSettings.panicKey=localStorage.getItem('consolius_panic_key') || 'q';
        appSettings.tabTitle=window.sysSettings.tabTitle; appSettings.tabIcon=window.sysSettings.tabIcon; appSettings.proxyPrefix=window.sysSettings.proxyPrefix; appSettings.panicKey=window.sysSettings.panicKey;
        saveAppSettings(); fillSettingsForm(); applyAdvancedSettings(); updateDocumentIdentity();
    }

    function openControlPanel(page='general'){
        const modal=$('control-panel-modal'); if(!modal) return;
        modal.style.display='flex';
        document.querySelectorAll('.settings-nav-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.settingsPage===page));
        document.querySelectorAll('.settings-page').forEach(p=>p.classList.toggle('active',p.dataset.settingsPage===page));
        fillSettingsForm();
    }
    function closeControlPanel(){ const modal=$('control-panel-modal'); if(modal) modal.style.display='none'; }
    window.openControlPanel=openControlPanel; window.closeControlPanel=closeControlPanel;

    function resetWorkspace(){
        if(!window.confirm('Reset all saved game tabs and restore a blank workspace?')) return;
        localStorage.removeItem(STORAGE_KEY); tabs=[createTab('New Game',true)]; activeTabId=tabs[0].id; saveWorkspace(); syncEditorsFromTab(); notify('Workspace reset');
    }
    function exportWorkspaceJson(){ syncActiveTabFromEditors(); const blob=new Blob([JSON.stringify({version:5,tabs,activeTabId,settings:appSettings,identity:defaultIdentity},null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='consolius_workspace.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
    function importWorkspaceFile(file){ if(!file) return; file.text().then(text=>{ const data=JSON.parse(text); if(Array.isArray(data.tabs)&&data.tabs.length){tabs=data.tabs.map(normalizeTab); activeTabId=tabs.some(t=>t.id===data.activeTabId)?data.activeTabId:tabs[0].id; if(data.settings) appSettings={...DEFAULT_SETTINGS,...data.settings}; saveWorkspace(); saveAppSettings(); syncEditorsFromTab(); fillSettingsForm(); applyAdvancedSettings(); notify('Workspace imported'); } }).catch(e=>notify(`Import failed: ${e.message}`,'error')); }
    function clearAllSettings(){ if(!confirm('Reset CONSOLIUS settings and identity? Your game tabs will remain.')) return; localStorage.removeItem(SETTINGS_KEY); localStorage.removeItem('consolius_tab_title'); localStorage.removeItem('consolius_tab_icon'); localStorage.removeItem('consolius_proxy_prefix'); localStorage.removeItem('consolius_panic_key'); loadSavedSettings(); notify('Settings reset'); }

    function toggleFullscreen(){ if(!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }
    window.toggleFullscreen=toggleFullscreen;

    // Backward-compatible inline handlers.
    window.importHtmlFile = importHtmlFile;
    window.importCssFile = importCssFile;
    window.importJsFiles = importJsFiles;
    window.runCurrentTab = runCurrentTab;
    window.stopCurrentTab = stopCurrentTab;
    window.refreshCurrentTab = refreshCurrentTab;

    function wireUi() {
        // Critical fix: all local file/import buttons are wired with direct listeners.
        $('btn-import-html')?.addEventListener('click', () => $('ide-import-html')?.click());
        $('btn-import-css')?.addEventListener('click', () => $('ide-import-css')?.click());
        $('btn-import-js')?.addEventListener('click', () => $('ide-import-js')?.click());
        $('ide-import-html')?.addEventListener('change', e => importHtmlFile(e.target));
        $('ide-import-css')?.addEventListener('change', e => importCssFile(e.target));
        $('ide-import-js')?.addEventListener('change', e => importJsFiles(e.target));
        $('btn-add-tab')?.addEventListener('click', () => addGameTab());
        $('btn-duplicate-tab')?.addEventListener('click', () => addGameTab(getActiveTab()));
        $('btn-delete-tab')?.addEventListener('click', () => deleteTab(activeTabId));
        $('btn-rename-tab')?.addEventListener('click', saveIdentity);
        $('btn-save-tab')?.addEventListener('click', () => { syncActiveTabFromEditors(); saveIdentity(); });
        $('btn-run-game')?.addEventListener('click', runCurrentTab);
        $('btn-stop-game')?.addEventListener('click', stopCurrentTab);
        $('btn-refresh-game')?.addEventListener('click', refreshCurrentTab);
        $('btn-popout-game')?.addEventListener('click', popoutCurrentGame);
        $('btn-open-cloaked')?.addEventListener('click', popoutCurrentGame);
        $('btn-export-zip')?.addEventListener('click', exportToZip);
        $('btn-fullscreen')?.addEventListener('click', toggleFullscreen);
        $('btn-style-center')?.addEventListener('click', openControlPanel);
        $('btn-exit-ide')?.addEventListener('click', () => switchScreen('screen-terminal'));
        $('btn-import-rom')?.addEventListener('click', () => $('rom-file-input')?.click());
        $('btn-empty-import')?.addEventListener('click', () => $('rom-file-input')?.click());
        $('rom-file-input')?.addEventListener('change', e => window.handleRomImport(e.target));
        $('btn-rom-cloak')?.addEventListener('click', launchGameInAboutBlank);
        $('btn-import-bios')?.addEventListener('click', () => $('rom-bios-input')?.click());
        $('rom-bios-input')?.addEventListener('change', e => importBiosFile(e.target));
        $('btn-games-stop')?.addEventListener('click', stopBuiltInGame);
        $('btn-games-play')?.addEventListener('click', ()=> currentRomFile ? launchRomInBuiltInEmulator(currentRomFile) : $('rom-file-input')?.click());
        $('btn-games-reset')?.addEventListener('click', rebuildBuiltInGame);
        $('btn-games-clear')?.addEventListener('click', stopBuiltInGame);
        $('btn-games-popout')?.addEventListener('click', popoutBuiltInGame);
        $('btn-games-fullscreen')?.addEventListener('click', ()=>document.querySelector('#game-container')?.requestFullscreen?.());
        $('games-volume')?.addEventListener('input', e=>setGamesVolume(e.target.value));
        $('games-scale-select')?.addEventListener('change', changeGamesScale);
        $('games-core-select')?.addEventListener('change', e=>{e.target.dataset.userSet=e.target.value==='auto'?'0':'1'; if(currentRomFile) launchRomInBuiltInEmulator(currentRomFile);});
        $('btn-games-help')?.addEventListener('click', ()=>openControlPanel('runner'));

        $('btn-add-js-slot')?.addEventListener('click', () => addJsSlot());
        $('btn-close-settings')?.addEventListener('click', closeControlPanel);
        $('btn-close-settings-footer')?.addEventListener('click', closeControlPanel);
        $('btn-save-settings')?.addEventListener('click', saveSettings);
        $('btn-open-settings-ide')?.addEventListener('click', () => openControlPanel('general'));
        $('btn-open-settings-proxy')?.addEventListener('click', () => openControlPanel('general'));
        $('btn-reset-editor-layout')?.addEventListener('click', resetEditorLayout);
        $('btn-format-current')?.addEventListener('click', basicFormatCurrent);
        document.querySelectorAll('.settings-nav-btn').forEach(btn=>btn.addEventListener('click',()=>openControlPanel(btn.dataset.settingsPage)));
        $('btn-export-workspace')?.addEventListener('click', exportWorkspaceJson);
        $('btn-import-workspace')?.addEventListener('click', () => $('workspace-import-file')?.click());
        $('workspace-import-file')?.addEventListener('change', e=>{ importWorkspaceFile(e.target.files?.[0]); e.target.value=''; });
        $('btn-reset-workspace')?.addEventListener('click', resetWorkspace);
        $('btn-clear-settings')?.addEventListener('click', clearAllSettings);


        document.querySelectorAll('#htmlCode,#cssCode,#jsCode').forEach(el => el.addEventListener('input', () => {
            syncActiveTabFromEditors();
        }));

        $('main-term-input')?.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const command = e.target.value.trim();
                e.target.value = '';
                executeCommand(command);
            }
        });

        $('sys-password-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') checkPassword(); });
        document.querySelectorAll('.settings-page input,.settings-page select').forEach(el=>el.addEventListener('change',()=>{ readSettingsForm(); saveSettings(); }));
        $('btn-exit-games')?.addEventListener('click', () => switchScreen('screen-terminal'));
        $('proxy-frame')?.addEventListener('load', proxyFrameLoaded);
        $('proxy-frame')?.addEventListener('error', proxyFrameError);
        document.querySelectorAll('.proxy-hud-badge').forEach(el => el.addEventListener('click', toggleOverlayTerminal));
    }


    function installPanelResizers(){
        const saved=loadJsonSetting('consolius_editor_widths_v5',{htmlWidth:0,cssWidth:0,jsWidth:0});
        const panels=[['panel-html','htmlWidth'],['panel-css','cssWidth'],['panel-js','jsWidth']];
        panels.forEach(([id,key])=>{
            const panel=$(id); if(!panel) return;
            if(saved[key]) panel.style.flex=`0 0 ${saved[key]}px`;
            const handle=panel.querySelector('.panel-resizer'); if(!handle || handle.dataset.bound) return;
            handle.dataset.bound='1';
            handle.addEventListener('pointerdown',ev=>{
                ev.preventDefault(); handle.setPointerCapture?.(ev.pointerId);
                const grid=$('editor-grid'); const startX=ev.clientX; const start=panel.getBoundingClientRect().width;
                const min=Math.max(180,Math.min(480,Number(appSettings.minEditorWidth)||220));
                const max=Math.max(min+40,Math.min(window.innerWidth*0.55,760));
                const move=e=>{ const w=Math.max(min,Math.min(max,start+(e.clientX-startX))); panel.style.flex=`0 0 ${w}px`; };
                const up=()=>{ const w=Math.round(panel.getBoundingClientRect().width); const next=loadJsonSetting('consolius_editor_widths_v5',{htmlWidth:0,cssWidth:0,jsWidth:0}); next[key]=w; try{localStorage.setItem('consolius_editor_widths_v5',JSON.stringify(next));}catch(_){} window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); };
                window.addEventListener('pointermove',move); window.addEventListener('pointerup',up,{once:true});
            });
        });
    }

    function resetEditorLayout(){ localStorage.removeItem('consolius_editor_widths_v5'); document.querySelectorAll('.code-panel').forEach(p=>p.style.flex='1 1 0'); applyPanelMinimumWidth(); installPanelResizers(); notify('Editor widths reset'); }
    function basicFormatCurrent(){
        const active=document.activeElement; if(!active || !['TEXTAREA','INPUT'].includes(active.tagName)) return;
        if(!active.value) return;
        active.value=active.value.replace(/\r\n/g,'\n').replace(/\t/g,'    ');
        syncActiveTabFromEditors(); notify('Normalized indentation and line endings');
    }


    function startPerformanceSampler(){
        const hud=$('perf-hud'); if(!hud) return;
        let frames=0, last=performance.now();
        const tick=now=>{
            frames++;
            const elapsed=now-last;
            if(elapsed>=Math.max(250,Number(appSettings.hudFrequency)||500)){
                const fps=Math.round((frames*1000)/elapsed); frames=0; last=now;
                $('perf-fps') && ($('perf-fps').textContent=String(Math.max(0,Math.min(240,fps))));
                $('perf-cpu') && ($('perf-cpu').textContent=(navigator.hardwareConcurrency?`${Math.max(0,Math.min(100,Math.round((1-(fps/60))*35*10)/10))}%`:'n/a'));
                if(performance.memory) $('perf-mem') && ($('perf-mem').textContent=`${(performance.memory.usedJSHeapSize/1048576).toFixed(1)} MB`);
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function startAutosave() {
        setInterval(() => {
            if (!appSettings.autosave) return;
            const tab = getActiveTab();
            if (tab && document.activeElement && ['TEXTAREA','INPUT'].includes(document.activeElement.tagName)) syncActiveTabFromEditors();
        }, 1500);
    }

    // Compatibility placeholders for legacy tour controls.
    window.tourSkip = () => { $('tour-overlay')?.classList.remove('active'); $('tour-spotlight')?.classList.remove('active'); $('tour-tooltip')?.classList.remove('active'); };
    window.tourNext = window.tourSkip;

    // Receive volume commands from runner frames.
    window.addEventListener('message', event => {
        if (event.data?.type === 'CONSOLIUS_EMULATOR_READY') gamesStatus(`${event.data.name||'Game'} — ready`,'ready');
        if (event.data?.type === 'CONSOLIUS_EMULATOR_EXIT') gamesStatus('Emulator exited');
        if (event.data?.type === 'CONSOLIUS_VOLUME') {
            const tab = getActiveTab();
            if (tab) setTabVolume(tab.id, Number(event.data.value));
        }
        if (event.data?.type === 'CONSOLIUS_READY') {
            const tab = getActiveTab();
            if (tab) applyRunnerVolume(tab.id);
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        loadWorkspace();
        loadSavedSettings();
        wireUi();
        installPanelResizers();
        syncEditorsFromTab();
        renderRunnerStack();
        updateGamesControls();
        const startupMap={terminal:'screen-terminal',ide:'screen-ide',games:'screen-games'};
        let startupScreen=startupMap[appSettings.startup] || 'screen-terminal';
        if(appSettings.rememberScreen){ try { const saved=localStorage.getItem('consolius_last_screen_v5'); if(saved && $(''+saved)) startupScreen=saved; } catch(_){} }
        switchScreen(startupScreen);
        startPerformanceSampler();
        startAutosave();

        window.addEventListener('keydown', e => {
            if (e.key === 'Escape') { closeControlPanel(); $('overlay-terminal')?.classList.remove('active'); }
            if ((e.key === '`' || e.key === '+') && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') toggleOverlayTerminal();
            if (e.ctrlKey && e.key.toLowerCase() === window.sysSettings.panicKey.toLowerCase()) {
                window.location.href = 'https://www.google.com';
            }
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullscreen(); return; }
            if (e.ctrlKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                syncActiveTabFromEditors();
                saveIdentity();
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                addGameTab();
            }
            if (e.altKey && e.key === 'ArrowLeft') {
                const idx = tabs.findIndex(t => t.id === activeTabId);
                if (idx > 0) switchToTab(tabs[idx-1].id);
            }
            if (e.altKey && e.key === 'ArrowRight') {
                const idx = tabs.findIndex(t => t.id === activeTabId);
                if (idx >= 0 && idx < tabs.length-1) switchToTab(tabs[idx+1].id);
            }
        });
    });
})();
