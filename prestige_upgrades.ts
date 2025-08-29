import { getSkillString } from "./rendering.js";
import { ATTUNEMENT_EMOJI, ATTUNEMENT_TEXT, DEEP_TRANCE_EMOJI, ENERGY_TEXT, REFLECTIONS_ON_THE_JOURNEY_EMOJI, XP_TEXT } from "./rendering_constants.js";
import { hasPrestigeUnlock } from "./simulation.js";
import { REFLECTIONS_ON_THE_JOURNEY_BASE, REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE } from "./simulation_constants.js";
import { SkillType } from "./skills.js";

export enum PrestigeLayer {
    TouchTheDivine,
    TranscendHumanity,
    EmbraceDivinity,
    AscendToGodhood,

    Count
}

export enum PrestigeUnlockType {
    PermanentAutomation,
    DivineInspiration,
    LookInTheMirror,
    FullyAttuned,

    TranscendHumanityPlaceholder1,
    TranscendHumanityPlaceholder2,
    TranscendHumanityPlaceholder3,
    TranscendHumanityPlaceholder4,
    
    Count
}

export enum PrestigeRepeatableType {
    KnowledgeBoost,
    UnlimitedPower,
    Gourmet,
    GottaGoFast,

    TranscendHumanityPlaceholder1,
    TranscendHumanityPlaceholder2,
    TranscendHumanityPlaceholder3,
    TranscendHumanityPlaceholder4,

    Count
}

type PrestigeDescLambda = () => string;

export class PrestigeUnlock {
    type: PrestigeUnlockType = PrestigeUnlockType.Count;
    layer: PrestigeLayer = PrestigeLayer.Count;
    name = "";
    get_description: PrestigeDescLambda = () => { return ""; };
    cost = 0;
}

export class PrestigeRepeatable {
    type: PrestigeRepeatableType = PrestigeRepeatableType.Count;
    layer: PrestigeLayer = PrestigeLayer.Count;
    name = "";
    get_description: PrestigeDescLambda = () => { return ""; };
    initial_cost = 0;
    scaling_exponent = 0;
}

export const PRESTIGE_UNLOCKABLES: PrestigeUnlock[] = [
    {
        type: PrestigeUnlockType.PermanentAutomation,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Permanent Automation",
        get_description: () => { return `Permanently unlocks the ${DEEP_TRANCE_EMOJI}Deep Trance Perk`; },
        cost: 1
    },
    {
        type: PrestigeUnlockType.DivineInspiration,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Divine Inspiration",
        get_description: () => { return `Increases ${XP_TEXT} gain by 50% and 🌀Attunement gain by 100%<br>Note that 🌀Attunement still needs to be unlocked in Zone 8`; },
        cost: 1
    },
    {
        type: PrestigeUnlockType.LookInTheMirror,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Look in the Mirror",
        get_description: () => { return `Permanently unlocks the ${REFLECTIONS_ON_THE_JOURNEY_EMOJI}Reflections on the Journey Perk<br>Boosts its base from ${REFLECTIONS_ON_THE_JOURNEY_BASE} to ${REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE}`; },
        cost: 80
    },
    {
        type: PrestigeUnlockType.FullyAttuned,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Fully Attuned",
        get_description: () => { return `Permanently unlocks the ${ATTUNEMENT_EMOJI}Attunement Perk<br>Makes the Knowledge Boost Prestige upgrade apply to ${ATTUNEMENT_TEXT}<br>Makes ${ATTUNEMENT_TEXT} apply to ${getSkillString(SkillType.Study)}`; },
        cost: 400
    },

    {
        type: PrestigeUnlockType.TranscendHumanityPlaceholder1,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placheolder",
        get_description: () => { return `Placeholder`; },
        cost: 1
    },
    {
        type: PrestigeUnlockType.TranscendHumanityPlaceholder2,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placheolder",
        get_description: () => { return `Placeholder`; },
        cost: 1
    },
    {
        type: PrestigeUnlockType.TranscendHumanityPlaceholder3,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placheolder",
        get_description: () => { return `Placeholder`; },
        cost: 1
    },
    {
        type: PrestigeUnlockType.TranscendHumanityPlaceholder4,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placheolder",
        get_description: () => { return `Placeholder`; },
        cost: 1
    },
];

export const PRESTIGE_XP_BOOSTER_MULT = 0.5;
export const GOURMET_ENERGY_ITEM_BOOST_MULT = 0.2;
export const GOTTA_GO_FAST_BASE = 1.1;

export const PRESTIGE_REPEATABLES: PrestigeRepeatable[] = [
    {
        type: PrestigeRepeatableType.KnowledgeBoost,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Knowledge Boost",
        get_description: () => { return `Increases ${XP_TEXT}${hasPrestigeUnlock(PrestigeUnlockType.FullyAttuned) ? ` and ${ATTUNEMENT_TEXT}` : ""} gain by ${PRESTIGE_XP_BOOSTER_MULT * 100}%`; },
        initial_cost: 15,
        scaling_exponent: 1.23
    },
    {
        type: PrestigeRepeatableType.UnlimitedPower,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Unlimited Power",
        get_description: () => { return "Doubles 💪Power gain"; },
        initial_cost: 10,
        scaling_exponent: 3
    },
    {
        type: PrestigeRepeatableType.Gourmet,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Gourmet",
        get_description: () => { return `Increases ${ENERGY_TEXT} gained from Items by ${GOURMET_ENERGY_ITEM_BOOST_MULT * 100}%`; },
        initial_cost: 40,
        scaling_exponent: 2.5
    },
    {
        type: PrestigeRepeatableType.GottaGoFast,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Gotta Go Fast",
        get_description: () => { return `Multiplies Task speed by ${GOTTA_GO_FAST_BASE}`; },
        initial_cost: 50,
        scaling_exponent: 2
    },

    {
        type: PrestigeRepeatableType.TranscendHumanityPlaceholder1,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placeholder",
        get_description: () => { return `Placeholder`; },
        initial_cost: 50,
        scaling_exponent: 2
    },
    {
        type: PrestigeRepeatableType.TranscendHumanityPlaceholder2,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placeholder",
        get_description: () => { return `Placeholder`; },
        initial_cost: 50,
        scaling_exponent: 2
    },
    {
        type: PrestigeRepeatableType.TranscendHumanityPlaceholder3,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placeholder",
        get_description: () => { return `Placeholder`; },
        initial_cost: 50,
        scaling_exponent: 2
    },
    {
        type: PrestigeRepeatableType.TranscendHumanityPlaceholder4,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placeholder",
        get_description: () => { return `Placeholder`; },
        initial_cost: 50,
        scaling_exponent: 2
    },
];
