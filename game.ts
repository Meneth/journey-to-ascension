import { Rendering, updateRendering } from "./rendering.js";
import { Gamestate, saveGame, updateGamestate, resetTasks } from "./simulation.js";

function gameLoop() {
    updateGamestate();
    updateRendering();
}

export let GAMESTATE = new Gamestate();
export let RENDERING = new Rendering();

document.addEventListener("DOMContentLoaded", () => {
    GAMESTATE.start();
    RENDERING.initialize();
    RENDERING.start();

    setInterval(gameLoop, GAMESTATE.tick_interval_ms);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).getGamestate = GAMESTATE;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).resetSave = () => {
    GAMESTATE = new Gamestate();
    GAMESTATE.initialize();
    saveGame();
    location.reload();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).resetZone = () => {
    resetTasks();
    RENDERING = new Rendering();
    RENDERING.initialize();
    RENDERING.start();
}
