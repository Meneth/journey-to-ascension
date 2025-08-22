import { PERKS, PerkType, REFLECTIONS_ON_THE_JOURNEY_BOOSTED_EXPONENT as REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE, REFLECTIONS_ON_THE_JOURNEY_EXPONENT as REFLECTIONS_ON_THE_JOURNEY_BASE } from "./perks.js";
import { XP_TEXT } from "./rendering_constants.js";

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
    DummyRepeatable3,
    DummyRepeatable4,

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
        description: `Permanently unlocks the ${PERKS[PerkType.DeepTrance]?.icon}Deep Trance Perk`,
        cost: 1
    },
    {
        type: PrestigeUnlockType.DivineInspiration,
        name: "Divine Inspiration",
        description: `Doubles ${XP_TEXT} gain`,
        cost: 1
    },
    {
        type: PrestigeUnlockType.LookInTheMirror,
        name: "Look in the Mirror",
        description: `Permanently unlocks the ${PERKS[PerkType.ReflectionsOnTheJourney]?.icon}Reflections on the Journey Perk<br>Boosts its base from ${REFLECTIONS_ON_THE_JOURNEY_BASE} to ${REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE}`,
        cost: 100
    },
    {
        type: PrestigeUnlockType.DummyUnlock4,
        name: "Test",
        description: "Test",
        cost: 500
    },
];

export const PRESTIGE_XP_BOOSTER_MULT = 0.5;

export const PRESTIGE_REPEATABLES: PrestigeRepeatable[] = [
    {
        type: PrestigeRepeatableType.XPBooster,
        name: "XP Booster",
        description: `Increases ${XP_TEXT} gain by ${PRESTIGE_XP_BOOSTER_MULT * 100}%`,
        initial_cost: 10,
        scaling_exponent: 1.25
    },
    {
        type: PrestigeRepeatableType.UnlimitedPower,
        name: "Unlimited Power",
        description: "Doubles 💪Power Gain",
        initial_cost: 10,
        scaling_exponent: 3
    },
    {
        type: PrestigeRepeatableType.DummyRepeatable3,
        name: "Test",
        description: "Test",
        initial_cost: 44,
        scaling_exponent: 1.5
    },
    {
        type: PrestigeRepeatableType.DummyRepeatable4,
        name: "Test",
        description: "Test",
        initial_cost: 45,
        scaling_exponent: 1.5
    },
];
