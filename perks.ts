import { GAMESTATE } from "./game.js";
import { PerkSkillModifierList } from "./modifiers.js";
import { PrestigeUnlockType } from "./prestige_upgrades.js";
import { formatNumber } from "./rendering.js";
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
    DELETED,
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
    UnderstandingTheReset,

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
    get_custom_tooltip: PerkTooltipLambda = () => { return "" };
    icon = "";
    skill_modifiers: PerkSkillModifierList = new PerkSkillModifierList([]);

    constructor(overrides: Partial<PerkDefinition> = {}) {
        Object.assign(this, overrides);
    }

    public getTooltip() {
        const custom = this.get_custom_tooltip();
        const skill_modifiers = this.skill_modifiers.getDescription();
        if (custom.length != 0 && skill_modifiers.length != 0) {
            return skill_modifiers + "<br>" + custom;
        }

        return skill_modifiers + custom; // Whichever has length
    }
}



function getReflectionsOnTheJourneyExponent() {
    return hasPrestigeUnlock(PrestigeUnlockType.LookInTheMirror) ? REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE : REFLECTIONS_ON_THE_JOURNEY_BASE;
}

export const PERKS: PerkDefinition[] = [
    new PerkDefinition({
        enum: PerkType.Reading,
        name: `How to Read`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Study, 0.5]
        ]),
        icon: `📖`,
    }),
    new PerkDefinition({
        enum: PerkType.Writing,
        name: `How to Write`,
        get_custom_tooltip: () => { return `Improves ${XP_TEXT} gain by 50%`; },
        icon: `📝`,
    }),
    new PerkDefinition({
        enum: PerkType.VillagerGratitude,
        name: `Villager Gratitude`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Charisma, 0.5]
        ]),
        icon: `❤️`,
    }),
    new PerkDefinition({
        enum: PerkType.Amulet,
        name: `Mysterious Amulet`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Magic, 0.5]
        ]),
        icon: `📿`,
        get_custom_tooltip: () => { return `Unlocks Zone Automation<br>Unlocks automatic Item use`; },
    }),
    new PerkDefinition({
        enum: PerkType.EnergySpell,
        name: `Energetic Spell`,
        get_custom_tooltip: () => { return `Increases starting ${ENERGY_TEXT} by 50`; },
        icon: `⚡️`,
    }),
    new PerkDefinition({
        enum: PerkType.ExperiencedTraveler,
        name: `Experienced Traveler`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Travel, 0.5]
        ]),
        icon: `🦶`,
    }),
    new PerkDefinition({
        enum: PerkType.UndergroundConnection,
        name: `Underground Connection`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Subterfuge, 0.4],
            [SkillType.Charisma, 0.2],
        ]),
        icon: `🎲`,
    }),
    new PerkDefinition({
        enum: PerkType.MinorTimeCompression,
        name: `Minor Time Compression`,
        get_custom_tooltip: () => { return `Tasks reps that are completed instantly (in a single ⏰Tick) now cost 80% less ${ENERGY_TEXT}<br>Zones where all Tasks are instant without using Items are completed for free in a single ⏰Tick when doing an ${ENERGY_TEXT} Reset`; },
        icon: `⌚`,
    }),
    new PerkDefinition({
        enum: PerkType.HighAltitudeClimbing,
        name: `High Altitude Climbing`,
        get_custom_tooltip: () => { return `Reduces all ${ENERGY_TEXT} consumption 20%`; },
        icon: `🗻`,
    }),
    new PerkDefinition({
        enum: PerkType.DELETED,
        name: `DELETED PERK - Deep Trance`,
        icon: `❓`,
    }),
    new PerkDefinition({
        enum: PerkType.VillageHero,
        name: `Village Hero`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Charisma, 0.4],
            [SkillType.Combat, 0.2],
        ]),
        icon: `🎖️`,
    }),
    new PerkDefinition({
        enum: PerkType.Attunement,
        name: `Attunement`,
        get_custom_tooltip: () => { return `Unlocks the 🌀Attunement mechanic`; },
        icon: `🌀`,
    }),
    new PerkDefinition({
        enum: PerkType.GoblinScourge,
        name: `Goblin Scourge`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Combat, 0.3],
            [SkillType.Fortitude, 0.3],
        ]),
        icon: `💀`,
    }),
    new PerkDefinition({
        enum: PerkType.SunkenTreasure,
        name: `Sunken Treasure`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Search, 0.3],
            [SkillType.Fortitude, 0.3],
        ]),
        icon: `⚓`,
    }),
    new PerkDefinition({
        enum: PerkType.LostTemple,
        name: `Found Lost Temple`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Magic, 0.5]
        ]),
        icon: `🏯`,
    }),
    new PerkDefinition({
        enum: PerkType.WalkWithoutRhythm,
        name: `Walk Without Rhythm`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Subterfuge, 0.4],
            [SkillType.Travel, 0.2],
        ]),
        icon: `👣`,
    }),
    new PerkDefinition({
        enum: PerkType.ReflectionsOnTheJourney,
        name: `Reflections on the Journey`,
        get_custom_tooltip: () => { return `Reduce ${ENERGY_TEXT} drain based on the highest Zone reached<br>In each Zone ${ENERGY_TEXT} consumption is reduced ${((1 - getReflectionsOnTheJourneyExponent()) * 100).toFixed(0)}% compounding for each Zone you've reached past it<br>So Zone 12 has ${ENERGY_TEXT} cost multiplied by ${getReflectionsOnTheJourneyExponent()}^2 if the highest Zone reached is 14`; },
        icon: `🕰️`,
    }),
    new PerkDefinition({
        enum: PerkType.PurgedBureaucracy,
        name: `Purged Bureaucracy`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Charisma, 0.3],
            [SkillType.Crafting, 0.3],
        ]),
        icon: `⚖️`,
    }),
    new PerkDefinition({
        enum: PerkType.DeepSeaDiving,
        name: `Deep Sea Diving`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Search, 0.3],
            [SkillType.Magic, 0.3],
        ]),
        icon: `🤿`,
    }),
    new PerkDefinition({
        enum: PerkType.EnergeticMemory,
        name: `Energetic Memory`,
        get_custom_tooltip: () => { return `On each Energy Reset, increase max ${ENERGY_TEXT} by the current Zone / 10<br>So Zone 9 gives 0.9 max ${ENERGY_TEXT}${hasPrestigeUnlock(PrestigeUnlockType.TranscendantMemory) ? `<br>Squared after Zone 10, so Zone 20 gives 2 * 2 = 4 max ${ENERGY_TEXT}`: ``}`; },
        icon: `💭`,
    }),
    new PerkDefinition({
        enum: PerkType.TheWorm,
        name: `The Worm`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Charisma, 0.5]
        ]),
        icon: `💃`,
    }),
    new PerkDefinition({
        enum: PerkType.TowerOfBabel,
        name: `Tower of Babel`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Charisma, 0.3],
            [SkillType.Ascension, 0.3],
        ]),
        icon: `🧱`,
    }),
    new PerkDefinition({
        enum: PerkType.Awakening,
        name: `Awakening`,
        get_custom_tooltip: () => { return `Improves ${DIVINE_SPARK_TEXT} gain by ${formatNumber(AWAKENING_DIVINE_SPARK_MULT * 100)}%`; },
        icon: `💤`,
    }),
    new PerkDefinition({
        enum: PerkType.MajorTimeCompression,
        name: `Major Time Compression`,
        get_custom_tooltip: () => { return `Tasks with instant reps now complete the whole Task in a single ⏰Tick, rather than a single ⏰Tick per rep<br>This also means the ${ENERGY_TEXT} cost is that of a single ⏰Tick<br>Reduces the real-world time for non-instant Tasks by 33% (does not affect ${ENERGY_TEXT} use)`; },
        icon: `⏰`,
    }),
    new PerkDefinition({
        enum: PerkType.HideInPlainSight,
        name: `Hide in Plain Sight`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Subterfuge, 0.5]
        ]),
        icon: `👥`,
    }),
    new PerkDefinition({
        enum: PerkType.DreamPrism,
        name: `Dream Prism`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Magic, 0.3],
            [SkillType.Travel, 0.3],
        ]),
        icon: `🔷`,
    }),
    new PerkDefinition({
        enum: PerkType.DragonKillingPlan,
        name: `Dragon Killing Plan`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Combat, 0.5]
        ]),
        icon: `🏔️`,
    }),
    new PerkDefinition({
        enum: PerkType.UnifiedTheoryOfMagic,
        name: `Unified Theory of Magic`,
        get_custom_tooltip: () => { return `Each Zone fully completed in this Prestige increases Task Speed 2%<br>For instance, having fully completed the 15th Zone would speed up Task speed 1.02^15 = 35%<br>Note that it's based on your highest fully completed, so you can skip fully completing earlier Zones if you want<br><br>Highest Zone fully completed currently: ${GAMESTATE.highest_zone_fully_completed + 1}`; },
        icon: `📜`,
    }),
    new PerkDefinition({
        enum: PerkType.Headmaster,
        name: `Headmaster`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Magic, 0.3],
            [SkillType.Study, 0.3],
        ]),
        icon: `🧙‍♂️`,
    }),
    new PerkDefinition({
        enum: PerkType.DragonSlayer,
        name: `Dragon Slayer`,
        skill_modifiers: new PerkSkillModifierList([
            [SkillType.Combat, 0.3],
            [SkillType.Charisma, 0.3],
        ]),
        icon: `🐉`,
    }),
    new PerkDefinition({
        enum: PerkType.UnderstandingTheReset,
        name: `Understanding of the Reset`,
        get_custom_tooltip: () => { return `When you run out of ${ENERGY_TEXT} and reincarnate you keep half your remaining Items (rounded up)<br>This means you can use more Items in a run than just those gained in that specific run`; },
        icon: `🔁`,
    }),
]
