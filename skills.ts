import { TRAVEL_EMOJI } from "./rendering_constants.js";

export enum SkillType {
    Charisma,
    Study,
    Combat,
    Search,
    Subterfuge,
    Crafting,
    Survival,
    Travel,
    Magic,
    Fortitude,
    REMOVED,
    Ascension,

    Count
}

export const SKILLS : SkillType[] = [
    SkillType.Charisma,
    SkillType.Study,
    SkillType.Combat,
    SkillType.Search,
    SkillType.Subterfuge,
    SkillType.Crafting,
    SkillType.Survival,
    SkillType.Travel,
    SkillType.Magic,
    SkillType.Fortitude,
    SkillType.Ascension,
]

export class SkillDefinition {
    type: SkillType = SkillType.Count;
    name = "";
    icon = "";
    xp_needed_mult = 1.0;

    constructor(overrides: Partial<SkillDefinition> = {}) {
        Object.assign(this, overrides);
    }
}

export const SKILL_DEFINITIONS: SkillDefinition[] = [
    new SkillDefinition({ type: SkillType.Charisma, name: "Charisma", icon: "🎭" }),
    new SkillDefinition({ type: SkillType.Study, name: "Study", icon: "🧠" }),
    new SkillDefinition({ type: SkillType.Combat, name: "Combat", icon: "⚔️", xp_needed_mult: 5 }),
    new SkillDefinition({ type: SkillType.Search, name: "Search", icon: "🔎" }),
    new SkillDefinition({ type: SkillType.Subterfuge, name: "Subterfuge", icon: "🗡️" }),
    new SkillDefinition({ type: SkillType.Crafting, name: "Crafting", icon: "🔨" }),
    new SkillDefinition({ type: SkillType.Survival, name: "Survival", icon: "⛺" }),
    new SkillDefinition({ type: SkillType.Travel, name: "Travel", icon: TRAVEL_EMOJI }),
    new SkillDefinition({ type: SkillType.Magic, name: "Magic", icon: "🔮", xp_needed_mult: 3 }),
    new SkillDefinition({ type: SkillType.Fortitude, name: "Fortitude", icon: "🛡️", xp_needed_mult: 10 }),
    new SkillDefinition({ type: SkillType.REMOVED, name: "REMOVED", icon: "⁉" }),
    new SkillDefinition({ type: SkillType.Ascension, name: "Ascension", icon: "🙏", xp_needed_mult: 1000 }),
]