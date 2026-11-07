# Manual browser test

The automated checks validate formatting, JavaScript syntax and relative import paths. They do not execute the game or verify its visual behavior. Complete this checklist in a browser before treating the refactor as runtime-verified.

## Start

1. Open the project through a local HTTP server (ES modules should not be tested from a `file://` URL).
2. Open the browser developer console and keep it visible.
3. Load `index.html` and confirm the main menu appears without console errors.

## Normal game

- [ ] Start a normal New Game.
- [ ] Confirm the Cassandra starting ship and its expected starting layout appear.
- [ ] Open and close the build menu; switch categories and materials.
- [ ] Toggle the grid and verify it redraws correctly.
- [ ] Select a pawn or object and use the available interaction.
- [ ] Open and close the sections panel.
- [ ] Advance one or more turns and confirm the HUD/resources update as before.
- [ ] Open pause, resume, use Escape, and return to the main menu.
- [ ] Resize the browser and confirm the canvas redraws without errors.

## DEV mode

- [ ] Start DEV New Game and confirm DEV-only controls are visible.
- [ ] Confirm DEV tools can be opened and closed.
- [ ] Open the AST panel and DEV creator; verify their controls respond.
- [ ] Open the damage simulator and toggle it.
- [ ] Export the ship layout and confirm a `cassandra_ship_layout.json` file downloads with format version 2.
- [ ] Return to the main menu and start a normal game; confirm DEV-only controls are hidden.

## Regression checks

- [ ] Repeat New Game after returning to the menu.
- [ ] Confirm no duplicate event handling occurs after multiple sessions.
- [ ] Check the console for uncaught errors throughout.
- [ ] Compare the starting ship layout and turn behavior against the pre-refactor baseline.

Record any failure with the exact steps and browser-console error. Do not treat a passing CI run as a substitute for this checklist.
