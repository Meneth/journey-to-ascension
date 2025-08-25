import { DEEP_TRANCE_EMOJI, ENERGY_TEXT, REFLECTIONS_ON_THE_JOURNEY_EMOJI, XP_TEXT } from "./rendering_constants.js";
import { REFLECTIONS_ON_THE_JOURNEY_BASE, REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE } from "./simulation_constants.js";

export enum PrestigeUnlockType {
    PermanentAutomation,
    DivineInspiration,
    LookInTheMirror,
    DummyUnlock4,
    
    Count
}

export enum PrestigeRepeatableType {
    XPBooster,
    UnlimitedPower,
    Gourmet,
    GottaGoFast,

    Count
}

export class PrestigeUnlock {
    type: PrestigeUnlockType = PrestigeUnlockType.Count;
    name = "";
    description = "";
    cost = 0;
}

export class PrestigeRepeatable {
    type: PrestigeRepeatableType = PrestigeRepeatableType.Count;
    name = "";
    description = "";
    initial_cost = 0;
    scaling_exponent = 0;
}

export const PRESTIGE_UNLOCKABLES: PrestigeUnlock[] = [
    {
        type: PrestigeUnlockType.PermanentAutomation,
        name: "Permanent Automation",
        description: `Permanently unlocks the ${DEEP_TRANCE_EMOJI}Deep Trance Perk`,
        cost: 1
    },
    {
        type: PrestigeUnlockType.DivineInspiration,
        name: "Divine Inspiration",
        description: `Increases ${XP_TEXT} gain by 50% and 🌀Attunement gain by 100%<br>Note that 🌀Attunement still needs to be unlocked in Zone 8`,
        cost: 1
    },
    {
        type: PrestigeUnlockType.LookInTheMirror,
        name: "Look in the Mirror",
        description: `Permanently unlocks the ${REFLECTIONS_ON_THE_JOURNEY_EMOJI}Reflections on the Journey Perk<br>Boosts its base from ${REFLECTIONS_ON_THE_JOURNEY_BASE} to ${REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE}`,
        cost: 80
    },
    {
        type: PrestigeUnlockType.DummyUnlock4,
        name: "Test",
        description: "Test",
        cost: 500
    },
];

export const PRESTIGE_XP_BOOSTER_MULT = 0.5;
export const GOURMET_ENERGY_ITEM_BOOST_MULT = 0.2;
export const GOTTA_GO_FAST_BASE = 1.1;

export const PRESTIGE_REPEATABLES: PrestigeRepeatable[] = [
    {
        type: PrestigeRepeatableType.XPBooster,
        name: "XP Booster",
        description: `Increases ${XP_TEXT} gain by ${PRESTIGE_XP_BOOSTER_MULT * 100}%`,
        initial_cost: 15,
        scaling_exponent: 1.23
    },
    {
        type: PrestigeRepeatableType.UnlimitedPower,
        name: "Unlimited Power",
        description: "Doubles 💪Power Gain",
        initial_cost: 10,
        scaling_exponent: 3
    },
    {
        type: PrestigeRepeatableType.Gourmet,
        name: "Gourmet",
        description: `Increases ${ENERGY_TEXT} gained from Items by ${GOURMET_ENERGY_ITEM_BOOST_MULT * 100}%`,
        initial_cost: 40,
        scaling_exponent: 2.5
    },
    {
        type: PrestigeRepeatableType.GottaGoFast,
        name: "Gotta Go Fast",
        description: `Multiplies Task speed by ${GOTTA_GO_FAST_BASE}`,
        initial_cost: 50,
        scaling_exponent: 2
    },
];
