import { PrestigeUnlockType } from "./prestige_upgrades.js";
import { getSkillString } from "./rendering.js";
import {
    DEEP_TRANCE_EMOJI,
    ENERGY_TEXT,
    REFLECTIONS_ON_THE_JOURNEY_EMOJI,
    XP_TEXT
} from "./rendering_constants.js";
import { hasPrestigeUnlock } from "./simulation.js";
import { REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE, REFLECTIONS_ON_THE_JOURNEY_BASE } from "./simulation_constants.js";
import { SkillType } from "./skills.js";

export enum PerkType {
    Reading,
    Writing,
    VillagerGratitude,
    Amulet,
    EnergySpell,
    ExperiencedTraveler,
    UndergroundConnection,
    MinorTimeCompression,
    HighAltitudeClimbing,
    DeepTrance,
    VillageHero,
    Attunement,
    GoblinScourge,
    SunkenTreasure,
    LostTemple,
    WalkWithoutRhythm,
    ReflectionsOnTheJourney,
    PurgedBureaucracy,
    DeepSeaDiving,
    EnergeticMemory,
    TheWorm,

    Count
}

type PerkTooltipLambda = () => string;

export class PerkDefinition {
    enum = PerkType.Count;
    name = "";
    get_tooltip: PerkTooltipLambda = () => { return "" };
    icon = "";
}



function getReflectionsOnTheJourneyExponent() {
    return hasPrestigeUnlock(PrestigeUnlockType.LookInTheMirror) ? REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE : REFLECTIONS_ON_THE_JOURNEY_BASE;
}

export const PERKS: PerkDefinition[] = [
    {
        enum: PerkType.Reading,
        name: `How to Read`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Study)} Task speed by 50%`;},
        icon: `📖`,
    },
    {
        enum: PerkType.Writing,
        name: `How to Write`,
        get_tooltip: () => {return `Improves ${XP_TEXT} gain by 50%`;},
        icon: `📝`,
    },
    {
        enum: PerkType.VillagerGratitude,
        name: `Villager Gratitude`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Charisma)} Task speed by 50%`;},
        icon: `❤️`,
    },
    {
        enum: PerkType.Amulet,
        name: `Mysterious Amulet`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Magic)} Task speed by 50%`;},
        icon: `📿`,
    },
    {
        enum: PerkType.EnergySpell,
        name: `Energetic Spell`,
        get_tooltip: () => {return `Increases starting ${ENERGY_TEXT} by 50`;},
        icon: `⚡️`,
    },
    {
        enum: PerkType.ExperiencedTraveler,
        name: `Experienced Traveler`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Travel)} Task speed by 50%`;},
        icon: `🦶`,
    },
    {
        enum: PerkType.UndergroundConnection,
        name: `Underground Connection`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 40% and ${getSkillString(SkillType.Charisma)} Task speed by 20%`;},
        icon: `🎲`,
    },
    {
        enum: PerkType.MinorTimeCompression,
        name: `Minor Time Compression`,
        get_tooltip: () => {return `Tasks that are completed instantly (in a single tick) now cost 80% less ${ENERGY_TEXT}`;},
        icon: `⌚`,
    },
    {
        enum: PerkType.HighAltitudeClimbing,
        name: `High Altitude Climbing`,
        get_tooltip: () => {return `Reduces all ${ENERGY_TEXT} consumption 20%`;},
        icon: `🗻`,
    },
    {
        enum: PerkType.DeepTrance,
        name: `Deep Trance`,
        get_tooltip: () => {return `Unlocks Zone Automation<br>Unlocks automatic Item use`;},
        icon: DEEP_TRANCE_EMOJI,
    },
    {
        enum: PerkType.VillageHero,
        name: `Village Hero`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Charisma)} Task speed by 20% and ${getSkillString(SkillType.Combat)} Task speed by 20%`;},
        icon: `🎖️`,
    },
    {
        enum: PerkType.Attunement,
        name: `Attunement`,
        get_tooltip: () => {return `Unlocks the 🌀Attunement mechanic`;},
        icon: `🌀`,
    },
    {
        enum: PerkType.GoblinScourge,
        name: `Goblin Scourge`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Combat)} Task speed by 30% and ${getSkillString(SkillType.Fortitude)} Task speed by 30%`;},
        icon: `💀`,
    },
    {
        enum: PerkType.SunkenTreasure,
        name: `Sunken Treasure`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Survival)} Task speed by 30% and ${getSkillString(SkillType.Fortitude)} Task speed by 30%`;},
        icon: `⚓`,
    },
    {
        enum: PerkType.LostTemple,
        name: `Found Lost Temple`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Druid)} Task speed by 50%`;},
        icon: `🏯`,
    },
    {
        enum: PerkType.WalkWithoutRhythm,
        name: `Walk Without Rhythm`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 40% and ${getSkillString(SkillType.Travel)} Task speed by 20%`;},
        icon: `👣`,
    },
    {
        enum: PerkType.ReflectionsOnTheJourney,
        name: `Reflections on the Journey`,
        get_tooltip: () => {return `Reduce ${ENERGY_TEXT} drain based on the highest zone reached<br>In each zone ${ENERGY_TEXT} consumption is reduced ${((1 - getReflectionsOnTheJourneyExponent()) * 100).toFixed(0)}% compounding for each zone you've reached past it<br>So zone 12 has ${ENERGY_TEXT} cost multiplied by ${getReflectionsOnTheJourneyExponent()}^2 if the highest zone reached is 14`;},
        icon: REFLECTIONS_ON_THE_JOURNEY_EMOJI,
    },
    {
        enum: PerkType.PurgedBureaucracy,
        name: `Purged Bureaucracy`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Crafting)} Task speed by 30%`;},
        icon: `⚖️`,
    },
    {
        enum: PerkType.DeepSeaDiving,
        name: `Deep Sea Diving`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Search)} and ${getSkillString(SkillType.Druid)} Task speed by 30%`;},
        icon: `🤿`,
    },
    {
        enum: PerkType.EnergeticMemory,
        name: `Energetic Memory`,
        get_tooltip: () => {return `On each Energy Reset, increase max ${ENERGY_TEXT} by the current zone / 10<br>So zone 11 gives 1.1 max ${ENERGY_TEXT}`; },
        icon: `💭`,
    },
    {
        enum: PerkType.TheWorm,
        name: `The Worm`,
        get_tooltip: () => {return `Improves ${getSkillString(SkillType.Charisma)} Task speed by 50%`;},
        icon: `💃`,
    },
]
