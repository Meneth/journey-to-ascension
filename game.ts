import { Rendering, updateRendering } from "./rendering.js";
import { Gamestate, saveGame, updateGamestate, resetTasks } from "./simulation.js";

function gameLoop() {
    updateGamestate();
    updateRendering();
}

export var GAMESTATE = new Gamestate();
export var RENDERING = new Rendering();

document.addEventListener("DOMContentLoaded", () => {
    GAMESTATE.start();
    RENDERING.initialize();
    RENDERING.start();

    setInterval(gameLoop, GAMESTATE.tick_interval_ms);
});

(window as any).getGamestate = GAMESTATE;
(window as any).resetSave = () => {
    GAMESTATE = new Gamestate();
    GAMESTATE.initialize();
    saveGame();
    location.reload();
}
(window as any).resetZone = () => {
    resetTasks();
    RENDERING = new Rendering();
    RENDERING.initialize();
    RENDERING.start();
}
