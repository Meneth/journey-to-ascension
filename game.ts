import { handleHotkeyPressed, handleHotkeyReleased, Rendering, updateRendering } from "./rendering.js";
import { Gamestate, saveGame, updateGamestate, resetTasks, calcTickRate } from "./simulation.js";

function gameLoop() {
    updateGamestate();
    updateRendering();
}

export function setTickRate() {
    if (GAME_LOOP_INTERVAL > 0) {
        clearInterval(GAME_LOOP_INTERVAL);
    }

    GAME_LOOP_INTERVAL = setInterval(gameLoop, calcTickRate());
}

export let GAMESTATE = new Gamestate();
export let RENDERING = new Rendering();
let GAME_LOOP_INTERVAL = 0;

document.addEventListener("DOMContentLoaded", () => {
    GAMESTATE.start();
    RENDERING.initialize();
    RENDERING.start();

    setTickRate();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js").catch(() => { /* SW registration failed, install prompt won't be available */ });
    }
});

document.addEventListener("keyup", handleHotkeyReleased);
document.addEventListener("keydown", handleHotkeyPressed);

export function resetSave() {
    GAMESTATE = new Gamestate();
    GAMESTATE.initialize();
    saveGame();
    location.reload();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).getGamestate = GAMESTATE;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).resetSave = resetSave;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).resetZone = () => {
    resetTasks();
    RENDERING = new Rendering();
    RENDERING.initialize();
    RENDERING.start();
}
