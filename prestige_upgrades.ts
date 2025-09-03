import { getSkillString } from "./rendering.js";
import { ATTUNEMENT_EMOJI, ATTUNEMENT_TEXT, DEEP_TRANCE_EMOJI, DIVINE_SPARK_TEXT, ENERGETIC_MEMORY_EMOJI, ENERGY_TEXT, REFLECTIONS_ON_THE_JOURNEY_EMOJI, XP_TEXT } from "./rendering_constants.js";
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

    TranscendantMemory,
    DivineSpeed,
    TranscendHumanityPlaceholder3,
    SeeBeyondTheVeil,
    
    Count
}

export enum PrestigeRepeatableType {
    DivineKnowledge,
    UnlimitedPower,
    DivineAppetite,
    GottaGoFast,

    DivineLightning,
    TranscendantAptitude,
    Energized,
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
        type: PrestigeUnlockType.TranscendantMemory,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Transcendant Memory",
        get_description: () => { return `Permanently unlocks the ${ENERGETIC_MEMORY_EMOJI} Energetic Memory Perk<br>Squares the Max ${ENERGY_TEXT} gain after Zone 10`; },
        cost: 10
    },
    {
        type: PrestigeUnlockType.DivineSpeed,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Divine Speed",
        get_description: () => { return `Makes the game tick 0.5% faster (additively) for every Max ${ENERGY_TEXT} beyond 100<br>No effect on ${ENERGY_TEXT} use, but makes tasks take less real-world time`; },
        cost: 500
    },
    {
        type: PrestigeUnlockType.TranscendHumanityPlaceholder3,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placheolder",
        get_description: () => { return `Placeholder`; },
        cost: 10000
    },
    {
        type: PrestigeUnlockType.SeeBeyondTheVeil,
        layer: PrestigeLayer.TranscendHumanity,
        name: "See Beyond the Veil",
        get_description: () => { return `Unlocks NUMBER new tasks before Zone 20`; },
        cost: 2500
    },
];

export const DIVINE_KNOWLEDGE_MULT = 0.5;
export const DIVINE_APPETITE_ENERGY_ITEM_BOOST_MULT = 0.2;
export const GOTTA_GO_FAST_BASE = 1.1;
export const TRANSCENDANT_APTITUDE_MULT = 100;
export const DIVINE_LIGHTNING_EXPONENT_INCREASE = 0.1;
export const ENERGIZED_INCREASE = 20;

export const PRESTIGE_REPEATABLES: PrestigeRepeatable[] = [
    {
        type: PrestigeRepeatableType.DivineKnowledge,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Divine Knowledge",
        get_description: () => { return `Increases ${XP_TEXT}${hasPrestigeUnlock(PrestigeUnlockType.FullyAttuned) ? ` and ${ATTUNEMENT_TEXT}` : ""} gain by ${DIVINE_KNOWLEDGE_MULT * 100}%`; },
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
        type: PrestigeRepeatableType.DivineAppetite,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Divine Appetite",
        get_description: () => { return `Increases ${ENERGY_TEXT} gained from Items by ${DIVINE_APPETITE_ENERGY_ITEM_BOOST_MULT * 100}%`; },
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
        type: PrestigeRepeatableType.DivineLightning,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Divine Lightning",
        get_description: () => { return `Increases the exponent for the ${DIVINE_SPARK_TEXT} gain calculation by ${DIVINE_LIGHTNING_EXPONENT_INCREASE}`; },
        initial_cost: 50,
        scaling_exponent: 3
    },
    {
        type: PrestigeRepeatableType.TranscendantAptitude,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Transcendant Aptitude",
        get_description: () => { return `Increases starting skill levels by ${TRANSCENDANT_APTITUDE_MULT}<br>${getSkillString(SkillType.Ascension)} has its starting level increased by only half`; },
        initial_cost: 20,
        scaling_exponent: 2
    },
    {
        type: PrestigeRepeatableType.Energized,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Energized",
        get_description: () => { return `Increases Max ${ENERGY_TEXT} by ${ENERGIZED_INCREASE}`; },
        initial_cost: 100,
        scaling_exponent: 1.75
    },
    {
        type: PrestigeRepeatableType.TranscendHumanityPlaceholder4,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Placeholder",
        get_description: () => { return `Placeholder`; },
        initial_cost: 50000,
        scaling_exponent: 2
    },
];
