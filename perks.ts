import { PrestigeUnlockType } from "./prestige_upgrades.js";
import { formatNumber, getSkillString } from "./rendering.js";
import {
    DIVINE_SPARK_TEXT,
    ENERGY_TEXT,
    XP_TEXT
} from "./rendering_constants.js";
import { hasPrestigeUnlock } from "./simulation.js";
import { REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE, REFLECTIONS_ON_THE_JOURNEY_BASE, AWAKENING_DIVINE_SPARK_MULT } from "./simulation_constants.js";
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
    TowerOfBabel,
    Awakening,
    MajorTimeCompression,
    HideInPlainSight,
    DreamPrism,
    DragonKillingPlan,
    UnifiedTheoryOfMagic,
    Headmaster,
    DragonSlayer,

    Count
}

export function getPerkNameWithEmoji(type: PerkType) {
    const perk = PERKS[type] as PerkDefinition;
    return perk.icon + perk.name;
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
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Study)} Task speed by 50%`; },
        icon: `📖`,
    },
    {
        enum: PerkType.Writing,
        name: `How to Write`,
        get_tooltip: () => { return `Improves ${XP_TEXT} gain by 50%`; },
        icon: `📝`,
    },
    {
        enum: PerkType.VillagerGratitude,
        name: `Villager Gratitude`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Charisma)} Task speed by 50%`; },
        icon: `❤️`,
    },
    {
        enum: PerkType.Amulet,
        name: `Mysterious Amulet`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Magic)} Task speed by 50%`; },
        icon: `📿`,
    },
    {
        enum: PerkType.EnergySpell,
        name: `Energetic Spell`,
        get_tooltip: () => { return `Increases starting ${ENERGY_TEXT} by 50`; },
        icon: `⚡️`,
    },
    {
        enum: PerkType.ExperiencedTraveler,
        name: `Experienced Traveler`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Travel)} Task speed by 50%`; },
        icon: `🦶`,
    },
    {
        enum: PerkType.UndergroundConnection,
        name: `Underground Connection`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 40% and ${getSkillString(SkillType.Charisma)} Task speed by 20%`; },
        icon: `🎲`,
    },
    {
        enum: PerkType.MinorTimeCompression,
        name: `Minor Time Compression`,
        get_tooltip: () => { return `Tasks reps that are completed instantly (in a single ⏰Tick) now cost 80% less ${ENERGY_TEXT}<br>Zones where all Tasks are instant without using Items are completed for free in a single ⏰Tick when doing an ${ENERGY_TEXT} Reset`; },
        icon: `⌚`,
    },
    {
        enum: PerkType.HighAltitudeClimbing,
        name: `High Altitude Climbing`,
        get_tooltip: () => { return `Reduces all ${ENERGY_TEXT} consumption 20%`; },
        icon: `🗻`,
    },
    {
        enum: PerkType.DeepTrance,
        name: `Deep Trance`,
        get_tooltip: () => { return `Unlocks Zone Automation<br>Unlocks automatic Item use`; },
        icon: `💫`,
    },
    {
        enum: PerkType.VillageHero,
        name: `Village Hero`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Charisma)} Task speed by 20% and ${getSkillString(SkillType.Combat)} Task speed by 20%`; },
        icon: `🎖️`,
    },
    {
        enum: PerkType.Attunement,
        name: `Attunement`,
        get_tooltip: () => { return `Unlocks the 🌀Attunement mechanic`; },
        icon: `🌀`,
    },
    {
        enum: PerkType.GoblinScourge,
        name: `Goblin Scourge`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Combat)} Task speed by 30% and ${getSkillString(SkillType.Fortitude)} Task speed by 30%`; },
        icon: `💀`,
    },
    {
        enum: PerkType.SunkenTreasure,
        name: `Sunken Treasure`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Survival)} Task speed by 30% and ${getSkillString(SkillType.Fortitude)} Task speed by 30%`; },
        icon: `⚓`,
    },
    {
        enum: PerkType.LostTemple,
        name: `Found Lost Temple`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Druid)} Task speed by 50%`; },
        icon: `🏯`,
    },
    {
        enum: PerkType.WalkWithoutRhythm,
        name: `Walk Without Rhythm`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 40% and ${getSkillString(SkillType.Travel)} Task speed by 20%`; },
        icon: `👣`,
    },
    {
        enum: PerkType.ReflectionsOnTheJourney,
        name: `Reflections on the Journey`,
        get_tooltip: () => { return `Reduce ${ENERGY_TEXT} drain based on the highest Zone reached<br>In each Zone ${ENERGY_TEXT} consumption is reduced ${((1 - getReflectionsOnTheJourneyExponent()) * 100).toFixed(0)}% compounding for each Zone you've reached past it<br>So Zone 12 has ${ENERGY_TEXT} cost multiplied by ${getReflectionsOnTheJourneyExponent()}^2 if the highest Zone reached is 14`; },
        icon: `🕰️`,
    },
    {
        enum: PerkType.PurgedBureaucracy,
        name: `Purged Bureaucracy`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Crafting)} Task speed by 30%`; },
        icon: `⚖️`,
    },
    {
        enum: PerkType.DeepSeaDiving,
        name: `Deep Sea Diving`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Search)} and ${getSkillString(SkillType.Druid)} Task speed by 30%`; },
        icon: `🤿`,
    },
    {
        enum: PerkType.EnergeticMemory,
        name: `Energetic Memory`,
        get_tooltip: () => { return `On each Energy Reset, increase max ${ENERGY_TEXT} by the current Zone / 10<br>So Zone 9 gives 0.9 max ${ENERGY_TEXT}${hasPrestigeUnlock(PrestigeUnlockType.TranscendantMemory) ? `<br>Squared after Zone 10, so Zone 20 gives 2 * 2 = 4 max ${ENERGY_TEXT}`: ``}`; },
        icon: `💭`,
    },
    {
        enum: PerkType.TheWorm,
        name: `The Worm`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Charisma)} Task speed by 50%`; },
        icon: `💃`,
    },
    {
        enum: PerkType.TowerOfBabel,
        name: `Tower of Babel`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Ascension)} Task speed by 30%`; },
        icon: `🧱`,
    },
    {
        enum: PerkType.Awakening,
        name: `Awakening`,
        get_tooltip: () => { return `Improves ${DIVINE_SPARK_TEXT} gain by ${formatNumber(AWAKENING_DIVINE_SPARK_MULT * 100)}%`; },
        icon: `💤`,
    },
    {
        enum: PerkType.MajorTimeCompression,
        name: `Major Time Compression`,
        get_tooltip: () => { return `Tasks with instant reps now complete the whole Task in a single ⏰Tick, rather than a single ⏰Tick per rep<br>This also means the ${ENERGY_TEXT} cost is that of a single ⏰Tick<br>Reduces the real-world time for non-instant Tasks by 50% (does not affect ${ENERGY_TEXT} use)`; },
        icon: `⏰`,
    },
    {
        enum: PerkType.HideInPlainSight,
        name: `Hide in Plain Sight`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 50%`; },
        icon: `👥`,
    },
    {
        enum: PerkType.DreamPrism,
        name: `Dream Prism`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Magic)} and ${getSkillString(SkillType.Travel)} Task speed by 30%`; },
        icon: `🔷`,
    },
    {
        enum: PerkType.DragonKillingPlan,
        name: `Dragon Killing Plan`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Combat)} Task speed by 50%`; },
        icon: `🏔️`,
    },
    {
        enum: PerkType.UnifiedTheoryOfMagic,
        name: `Unified Theory of Magic`,
        get_tooltip: () => { return `Each Zone fully completed in this Prestige increases Task Speed 2%<br>For instance, having fully completed the 15th Zone would speed up Task speed 1.02^15 = 35%<br>Note that it's based on your highest fully completed, so you can skip fully completing earlier Zones if you want`; },
        icon: `📜`,
    },
    {
        enum: PerkType.Headmaster,
        name: `Headmaster`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Magic)} and ${getSkillString(SkillType.Study)} Task speed by 30%`; },
        icon: `🧙‍♂️`,
    },
    {
        enum: PerkType.DragonSlayer,
        name: `Dragon Slayer`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Combat)} and ${getSkillString(SkillType.Charisma)} Task speed by 30%`; },
        icon: `🐉`,
    },
]
