import { getSkillString } from "./rendering.js";
import { ENERGY_TEXT, XP_TEXT } from "./rendering_constants.js";
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

    Count
}

export class PerkDefinition {
    enum = PerkType.Count;
    name = "";
    tooltip = "";
    icon = "";
}

export const ENERGETIC_MEMORY_MULT = 0.1;
export const REFLECTIONS_ON_THE_JOURNEY_EXPONENT = 0.95;
export const REFLECTIONS_ON_THE_JOURNEY_BOOSTED_EXPONENT = 0.9;

export const PERKS: PerkDefinition[] = [
    {
        enum: PerkType.Reading, name: `How to Read`, tooltip: `Improves ${getSkillString(SkillType.Study)} Task speed by 50%`, icon: `📖`,
    },
    {
        enum: PerkType.Writing, name: `How to Write`, tooltip: `Improves ${XP_TEXT} gain by 50%`, icon: `📝`,
    },
    {
        enum: PerkType.VillagerGratitude, name: `Villager Gratitude`, tooltip: `Improves ${getSkillString(SkillType.Charisma)} Task speed by 50%`, icon: `❤️`,
    },
    {
        enum: PerkType.Amulet, name: `Mysterious Amulet`, tooltip: `Improves ${getSkillString(SkillType.Magic)} Task speed by 50%`, icon: `📿`,
    },
    {
        enum: PerkType.EnergySpell, name: `Energetic Spell`, tooltip: `Increases starting ${ENERGY_TEXT} by 50`, icon: `⚡️`,
    },
    {
        enum: PerkType.ExperiencedTraveler, name: `Experienced Traveler`, tooltip: `Improves ${getSkillString(SkillType.Travel)} Task speed by 50%`, icon: `🦶`,
    },
    {
        enum: PerkType.UndergroundConnection, name: `Underground Connection`, tooltip: `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 40% and ${getSkillString(SkillType.Charisma)} Task speed by 20%`, icon: `🎲`,
    },
    {
        enum: PerkType.MinorTimeCompression, name: `Minor Time Compression`, tooltip: `Tasks that are completed instantly (in a single tick) now cost 80% less ${ENERGY_TEXT}`, icon: `⌚`,
    },
    {
        enum: PerkType.HighAltitudeClimbing, name: `High Altitude Climbing`, tooltip: `Reduces all ${ENERGY_TEXT} consumption 20%`, icon: `🗻`,
    },
    {
        enum: PerkType.DeepTrance, name: `Deep Trance`, tooltip: `Unlocks Zone Automation<br>Unlocks automatic Item use`, icon: `💫`,
    },
    {
        enum: PerkType.VillageHero, name: `Village Hero`, tooltip: `Improves ${getSkillString(SkillType.Charisma)} Task speed by 20% and ${getSkillString(SkillType.Combat)} Task speed by 20%`, icon: `🎖️`,
    },
    {
        enum: PerkType.Attunement, name: `Attunement`, tooltip: `Unlocks the 🌀Attunement mechanic`, icon: `🌀`,
    },
    {
        enum: PerkType.GoblinScourge, name: `Goblin Scourge`, tooltip: `Improves ${getSkillString(SkillType.Combat)} Task speed by 30% and ${getSkillString(SkillType.Fortitude)} Task speed by 30%`, icon: `💀`,
    },
    {
        enum: PerkType.SunkenTreasure, name: `Sunken Treasure`, tooltip: `Improves ${getSkillString(SkillType.Survival)} Task speed by 30% and ${getSkillString(SkillType.Fortitude)} Task speed by 30%`, icon: `⚓`,
    },
    {
        enum: PerkType.LostTemple, name: `Found Lost Temple`, tooltip: `Improves ${getSkillString(SkillType.Druid)} Task speed by 50%`, icon: `🏯`,
    },
    {
        enum: PerkType.WalkWithoutRhythm, name: `Walk Without Rhythm`, tooltip: `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 40% and ${getSkillString(SkillType.Travel)} Task speed by 20%`, icon: `👣`,
    },
    {
        enum: PerkType.ReflectionsOnTheJourney, name: `Reflections on the Journey`, tooltip: `Reduce ${ENERGY_TEXT} drain based on the highest zone reached<br>In each zone ${ENERGY_TEXT} consumption is reduced 5% compounding for each zone you've reached past it<br>So zone 12 has ${ENERGY_TEXT} cost multiplied by ${REFLECTIONS_ON_THE_JOURNEY_EXPONENT}^2 if the highest zone reached is 14`, icon: `🕰️`,
    },
    {
        enum: PerkType.PurgedBureaucracy, name: `Purged Bureaucracy`, tooltip: `Improves ${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Crafting)} Task speed by 30%`, icon: `⚖️`,
    },
    {
        enum: PerkType.DeepSeaDiving, name: `Deep Sea Diving`, tooltip: `Improves ${getSkillString(SkillType.Search)} and ${getSkillString(SkillType.Druid)} Task speed by 30%`, icon: `🤿`,
    },
    {
        enum: PerkType.EnergeticMemory, name: `Energetic Memory`, tooltip: `On each Energy Reset, increase max ${ENERGY_TEXT} by the current zone / 10<br>So zone 11 gives 1.1 max ${ENERGY_TEXT}`, icon: `💭`,
    },
]
