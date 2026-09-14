CONSOLIUS V5

FILES
- index.html + style.css + script.js: normal three-file build. Extract the ZIP first, then open index.html.
- CONSOLIUS_Standalone_V5.html: self-contained build with CSS and JavaScript embedded.

MAJOR CHANGES
- Bottom-right Performance HUD by default, with a Settings toggle and configurable position/frequency.
- Expanded Settings Control Center: general, appearance, IDE, runner, performance, proxy/privacy, shortcuts, and workspace data.
- Persistent per-game tab identity, global browser title/favicon identity, autosave, workspace export/import, reset tools.
- Multiple game runners remain alive when switching tabs instead of being recreated on every tab switch.
- Per-game volume controls.
- Robust full-document HTML import parsing to prevent srcdoc JavaScript syntax errors from nested HTML.
- Local file proxy navigation is blocked to prevent unsafe file:/// iframe errors; import local games with Import Game / ROM instead.
- Removed allow-scripts + allow-same-origin sandbox combinations that generated Chromium sandbox warnings.
- HTML/CSS/JS editors fill their panels instead of showing tiny nested text boxes.
- Added draggable right-edge panel handles with persistent widths and a minimum-width clamp so a panel cannot disappear.
- Added command shortcuts: help, ide, games, ui, settings, runner, addtab, tabs, run, stop, refresh, save, duplicate, export, hud on/off, fullscreen, theme, clear, reset, version, aboutblank, exit.

The standalone file still uses the same external CDN dependencies already present in the project for fonts/icons/JSZip.


V6 changes:
- Added integrated EmulatorJS-based Game Studio for a wide range of retro systems.
- ROM imports now open in Game Studio instead of IDE tabs. HTML/ZIP web games also open in Game Studio.
- Auto core detection, manual core selection, BIOS import, video scaling, volume, reset, stop, clear, and ROM library.
- Editor word wrap is enabled by default and uses pre-wrap + overflow-wrap so long code loops inside the visible panel.
- EmulatorJS stable data is loaded from the official CDN at runtime; ROMs/BIOS remain local to the browser.


V6 changes:
- Added integrated EmulatorJS-based Game Studio for a wide range of retro systems.
- ROM imports now open in Game Studio instead of IDE tabs. HTML/ZIP web games also open in Game Studio.
- Auto core detection, manual core selection, BIOS import, video scaling, volume, reset, stop, clear, and recent ROM library.
- Editor word wrap is enabled by default and wraps long lines inside each visible panel while preserving newlines/indentation.
- EmulatorJS stable data is loaded from the official CDN at runtime; CONSOLIUS does not bundle third-party copyrighted ROMs or BIOS files.
