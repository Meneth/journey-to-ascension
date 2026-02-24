import { GAMESTATE } from "./game.js";
import { ItemType } from "./items.js";
import { getPerkNameWithEmoji, PerkType } from "./perks.js";
import { formatPercentage, getItemNameWithIcon, getSkillString } from "./rendering.js";
import { ATTUNEMENT_EMOJI, ATTUNEMENT_TEXT, DIVINE_SPARK_TEXT, ENERGY_TEXT, XP_TEXT } from "./rendering_constants.js";
import { calcPerkySpeedMultiplier, getPrestigeGainExponent, hasPrestigeUnlock } from "./simulation.js";
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
    MasteryOfTime,
    SeeBeyondTheVeil,

    Perky,
    CompulsiveNotetaking,
    CraftingBreakthrough,
    DivinePlaceholder4,
    
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
    Deenergized,

    MandatorySchmandatory,
    DivineAttunement,
    SpiteTheGods,
    DivinePlaceholder4,

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

export const DIVINE_SPEED_TICKS_PER_PERCENT = 4;
export const PERKY_BASE = 1.01;
export const COMPULSIVE_NOTE_TAKING_AMOUNT = 2;

export const PRESTIGE_UNLOCKABLES: PrestigeUnlock[] = [
    {
        type: PrestigeUnlockType.PermanentAutomation,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Permanent Automation",
        get_description: () => { return `Permanently unlocks the ${getPerkNameWithEmoji(PerkType.Amulet)} Perk`; },
        cost: 10
    },
    {
        type: PrestigeUnlockType.DivineInspiration,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Divine Inspiration",
        get_description: () => { return `Increases ${XP_TEXT} gain by 50% and 🌀Attunement gain by 100%<br>Note that 🌀Attunement still needs to be unlocked in Zone 10`; },
        cost: 10
    },
    {
        type: PrestigeUnlockType.LookInTheMirror,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Look in the Mirror",
        get_description: () => { return `Permanently unlocks the ${getPerkNameWithEmoji(PerkType.ReflectionsOnTheJourney)} Perk<br>Boosts its base from ${REFLECTIONS_ON_THE_JOURNEY_BASE} to ${REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE}`; },
        cost: 101
    },
    {
        type: PrestigeUnlockType.FullyAttuned,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Fully Attuned",
        get_description: () => { return `Permanently unlocks the ${ATTUNEMENT_EMOJI}Attunement Perk<br>Makes the Divine Knowledge Prestige upgrade apply to ${ATTUNEMENT_TEXT}<br>Makes ${ATTUNEMENT_TEXT} apply to ${getSkillString(SkillType.Search)}`; },
        cost: 800
    },

    {
        type: PrestigeUnlockType.TranscendantMemory,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Transcendant Memory",
        get_description: () => { return `Permanently unlocks the ${getPerkNameWithEmoji(PerkType.EnergeticMemory)} Perk<br>Squares the Max ${ENERGY_TEXT} gain after Zone 10`; },
        cost: 100
    },
    {
        type: PrestigeUnlockType.DivineSpeed,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Divine Speed",
        get_description: () => { return `Makes the game tick 1% faster (additively) for every ${DIVINE_SPEED_TICKS_PER_PERCENT} Max ${ENERGY_TEXT} beyond 100<br>No effect on ${ENERGY_TEXT} use, but makes tasks take less real-world time`; },
        cost: 500
    },
    {
        type: PrestigeUnlockType.MasteryOfTime,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Mastery of Time",
        get_description: () => { return `Permanently unlocks the ${getPerkNameWithEmoji(PerkType.MinorTimeCompression)} and ${getPerkNameWithEmoji(PerkType.MajorTimeCompression)} Perks<br>1-tick Tasks are now free<br>1-tick Tasks (except Travel) are now automatically completed when you enter a Zone`; },
        cost: 40000
    },
    {
        type: PrestigeUnlockType.SeeBeyondTheVeil,
        layer: PrestigeLayer.TranscendHumanity,
        name: "See Beyond the Veil",
        get_description: () => { return `Unlocks five new tasks before Zone 20<br>Boss Tasks no longer get removed from Automation on Prestige`; },
        cost: 100_000
    },

    {
        type: PrestigeUnlockType.Perky,
        layer: PrestigeLayer.EmbraceDivinity,
        name: "Perky",
        get_description: () => { return `Every Perk unlocked increases Task Speed by ${formatPercentage(PERKY_BASE - 1)} (multiplicative)<br>Current effect: +${formatPercentage(calcPerkySpeedMultiplier() - 1)}`; },
        cost: 100_000
    },
    {
        type: PrestigeUnlockType.CompulsiveNotetaking,
        layer: PrestigeLayer.EmbraceDivinity,
        name: "Compulsive Notetaking",
        get_description: () => { return `Start every reset with at minimum ${COMPULSIVE_NOTE_TAKING_AMOUNT} of each of ${getItemNameWithIcon(ItemType.ScrollOfHaste, true)}, ${getItemNameWithIcon(ItemType.Book, true)}, ${getItemNameWithIcon(ItemType.CraftingRecipe, true)}, ${getItemNameWithIcon(ItemType.DivineNotes, true)}, and ${getItemNameWithIcon(ItemType.GriffinQuill, true)}<br>Takes effect if you would keep fewer of the given Item on Energy Reset`; },
        cost: 1_000_000
    },
    {
        type: PrestigeUnlockType.CraftingBreakthrough,
        layer: PrestigeLayer.EmbraceDivinity,
        name: "Crafting Breakthrough",
        get_description: () => { return `>Makes ${ATTUNEMENT_TEXT} apply to ${getSkillString(SkillType.Crafting)}`; },
        cost: 3_000_000
    },
    {
        type: PrestigeUnlockType.DivinePlaceholder4,
        layer: PrestigeLayer.EmbraceDivinity,
        name: "PLACEHOLDER",
        get_description: () => { return `PLACEHOLDER`; },
        cost: 100_000_000_000
    },
];

export const DIVINE_KNOWLEDGE_MULT = 0.5;
export const DIVINE_APPETITE_ENERGY_ITEM_BOOST_MULT = 0.2;
export const GOTTA_GO_FAST_BASE = 1.1;
export const TRANSCENDANT_APTITUDE_MULT = 100;
export const DIVINE_LIGHTNING_EXPONENT_INCREASE = 0.12;
export const ENERGIZED_INCREASE = 20;
export const ENERGIZED_PERK_INCREASE = 0.05;
export const DEENERGIZED_BASE = 0.9;
export const MANDATORY_SCHMANDATORY_MULT = 0.2;
export const DIVINE_ATTUNEMENT_BASE = 1.25;
export const SPITE_THE_GODS_MULT = 0.25;

function calcDivineSparkIncrease(zone: number) {
    const current_exponent = getPrestigeGainExponent();
    const new_exponent = current_exponent + DIVINE_LIGHTNING_EXPONENT_INCREASE;
    const ratio = Math.pow(new_exponent, zone + 1) / Math.pow(current_exponent, zone + 1);

    return ratio - 1;
}

export const PRESTIGE_REPEATABLES: PrestigeRepeatable[] = [
    {
        type: PrestigeRepeatableType.DivineKnowledge,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Divine Knowledge",
        get_description: () => { return `Increases ${XP_TEXT}${hasPrestigeUnlock(PrestigeUnlockType.FullyAttuned) ? ` and ${ATTUNEMENT_TEXT}` : ""} gain by ${DIVINE_KNOWLEDGE_MULT * 100}%`; },
        initial_cost: 10,
        scaling_exponent: 1.25
    },
    {
        type: PrestigeRepeatableType.UnlimitedPower,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Unlimited Power",
        get_description: () => { return "Doubles 💪Power gain"; },
        initial_cost: 10,
        scaling_exponent: 2.5
    },
    {
        type: PrestigeRepeatableType.DivineAppetite,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Divine Appetite",
        get_description: () => { return `Increases ${ENERGY_TEXT} gained from Items by ${DIVINE_APPETITE_ENERGY_ITEM_BOOST_MULT * 100}%`; },
        initial_cost: 30,
        scaling_exponent: 2.5
    },
    {
        type: PrestigeRepeatableType.GottaGoFast,
        layer: PrestigeLayer.TouchTheDivine,
        name: "Gotta Go Fast",
        get_description: () => { return `Multiplies Task speed by ${GOTTA_GO_FAST_BASE}`; },
        initial_cost: 20,
        scaling_exponent: 1.75
    },

    {
        type: PrestigeRepeatableType.DivineLightning,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Divine Lightning",
        get_description: () => { 
            const highest_zone = GAMESTATE.highest_prestige_zone + 1;
            const current_zone_diff = highest_zone - 15;

            let tooltip = `Increases the exponent for the ${DIVINE_SPARK_TEXT} gain calculation by ${DIVINE_LIGHTNING_EXPONENT_INCREASE}`;
            tooltip += `<br>One more level would increase ${DIVINE_SPARK_TEXT} gain at Zone 19 by ${(calcDivineSparkIncrease(4) * 100).toFixed(0)}%, and ${(calcDivineSparkIncrease(current_zone_diff) * 100).toFixed(0)}% at Zone ${highest_zone}`;
            return tooltip;
         },
        initial_cost: 1000,
        scaling_exponent: 4
    },
    {
        type: PrestigeRepeatableType.TranscendantAptitude,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Transcendant Aptitude",
        get_description: () => { return `Increases starting skill levels by ${TRANSCENDANT_APTITUDE_MULT}<br>${getSkillString(SkillType.Ascension)} has its starting level increased by only half`; },
        initial_cost: 100,
        scaling_exponent: 3
    },
    {
        type: PrestigeRepeatableType.Energized,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Energized",
        get_description: () => { return `Increases Max ${ENERGY_TEXT} by ${ENERGIZED_INCREASE}<br>Increases the ${ENERGY_TEXT} gain from ${getPerkNameWithEmoji(PerkType.EnergeticMemory)} by ${formatPercentage(ENERGIZED_PERK_INCREASE )}`; },
        initial_cost: 1500,
        scaling_exponent: 1.75
    },
    {
        type: PrestigeRepeatableType.Deenergized,
        layer: PrestigeLayer.TranscendHumanity,
        name: "Deenergized",
        get_description: () => { return `Reduces ${ENERGY_TEXT} drain by ${((1 - DEENERGIZED_BASE) * 100).toFixed(0)}%`; },
        initial_cost: 10000,
        scaling_exponent: 2.5
    },

    {
        type: PrestigeRepeatableType.MandatorySchmandatory,
        layer: PrestigeLayer.EmbraceDivinity,
        name: "Mandatory Schmandatory",
        get_description: () => { return `Improves the speed of Travel, Mandatory, and Prestige Tasks by ${formatPercentage(MANDATORY_SCHMANDATORY_MULT)}`; },
        initial_cost: 500_000,
        scaling_exponent: 1.5
    },
    {
        type: PrestigeRepeatableType.DivineAttunement,
        layer: PrestigeLayer.EmbraceDivinity,
        name: "Divine Attunement",
        get_description: () => { return `Multiplies ${ATTUNEMENT_TEXT} Gain by ${DIVINE_ATTUNEMENT_BASE}`; },
        initial_cost: 1_000_000,
        scaling_exponent: 2
    },
    {
        type: PrestigeRepeatableType.SpiteTheGods,
        layer: PrestigeLayer.EmbraceDivinity,
        name: "Spite the Gods",
        get_description: () => { return `Improves the speed of Charisma and Ascension Tasks by ${formatPercentage(SPITE_THE_GODS_MULT)}`; },
        initial_cost: 200_000,
        scaling_exponent: 1.4
    },
    {
        type: PrestigeRepeatableType.DivinePlaceholder4,
        layer: PrestigeLayer.EmbraceDivinity,
        name: "PLACEHOLDER",
        get_description: () => { return `PLACEHOLDER`; },
        initial_cost: 100_000_000_000,
        scaling_exponent: 2.5
    },
];
