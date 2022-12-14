import "./lib/timers";
import "./lib/notifications";
import "./lib/lumber"
import "libraries/buildinghelper"
import "libraries/blight"
import { GameMode } from "./GameMode";

// Connect GameMode.Activate and GameMode.Precache to the dota engine
Object.assign(getfenv(), {
    Activate: GameMode.Activate,
    Precache: GameMode.Precache,
});

if (GameRules.Addon) {
    // This code is only run after script_reload, not at startup
    GameRules.Addon.Reload();
}