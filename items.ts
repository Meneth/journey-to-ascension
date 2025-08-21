import { GAMESTATE } from "./game.js";
import { SkillType } from "./zones.js";
import { getSkill } from "./simulation.js"

export enum ItemType {
    Food,
    Arrow,
    Coin,
    Mushroom,
    GoblinSupplies,
    TravelEquipment,
    Book,
    ScrollOfHaste,
    GoblinWaraxe,
    FiremakingKit,
    Reagents,
    MagicalRoots,
    GoblinTreasure,
    Fish,
    BanditWeapons,
    Cactus,
    CityChain,
    WerewolfFur,
    OasisWater,
    Calamari,
    MagicalIncense,

    Count
}

type itemUseLambda = (amount: number) => void;
type itemEffectTextLambda = (amount: number) => string;

export class ItemDefinition {
    enum = ItemType.Count;
    name = "";
    tooltip = "";
    icon = "";
    get_effect_text: itemEffectTextLambda = () => { return ""; };
    on_consume: itemUseLambda = () => { };
}

export const HASTE_MULT = 5;

export var ITEMS: ItemDefinition[] = [
    {
        enum: ItemType.Food, name: "Food", tooltip: "Gives 5 Energy each<br>Can take you above your Max Energy", icon: "🍲",
        get_effect_text: (amount) => { return `Gained ${amount * 5} Energy`; },
        on_consume: (amount) => { GAMESTATE.current_energy += 5 * amount; },
    },
    {
        enum: ItemType.Arrow, name: "Arrow", tooltip: "Improves Combat speed by 15% each", icon: "🏹",
        get_effect_text: (amount) => { return `Combat speed increased ${amount * 15}%`; },
        on_consume: (amount) => { getSkill(SkillType.Combat).speed_modifier += 0.15 * amount; },
    },
    {
        enum: ItemType.Coin, name: "Coin", tooltip: "Improves Charisma speed by 15% each", icon: "💰",
        get_effect_text: (amount) => { return `Charisma speed increased ${amount * 15}%`; },
        on_consume: (amount) => { getSkill(SkillType.Charisma).speed_modifier += 0.15 * amount; },
    },
    {
        enum: ItemType.Mushroom, name: "Mushroom", tooltip: "Improves Magic speed by 20% and Search speed by 10% each", icon: "🍄",
        get_effect_text: (amount) => { return `Magic speed increased ${amount * 20}%; Search speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Search).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.GoblinSupplies, name: "Goblin Supplies", tooltip: "Improves Subterfuge speed by 15% and Combat speed by 10% each", icon: "📦",
        get_effect_text: (amount) => { return `Subterfuge speed increased ${amount * 15}%; Combat speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.15 * amount;
            getSkill(SkillType.Combat).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.TravelEquipment, name: "Travel Equipment", tooltip: "Improves Travel speed by 10% and Survival speed by 10% each", icon: "🎒",
        get_effect_text: (amount) => { return `Travel speed increased ${amount * 10}%; Survival speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Travel).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.Book, name: "Books", tooltip: "Improves Study speed by 10% each", icon: "📚",
        get_effect_text: (amount) => { return `Study speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Study).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.ScrollOfHaste, name: "Scroll of Haste", tooltip: `The next Task you start is ${HASTE_MULT}x as fast`, icon: "⚡",
        get_effect_text: (amount) => { return `Next ${amount} tasks are ${HASTE_MULT}x as fast`; },
        on_consume: (amount) => { GAMESTATE.queued_scrolls_of_haste += amount; },
    },
    {
        enum: ItemType.GoblinWaraxe, name: "Goblin Waraxe", tooltip: "Improves Combat speed by 100% each", icon: "🪓",
        get_effect_text: (amount) => { return `Combat speed increased ${amount * 100}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Combat).speed_modifier += 1.0 * amount;
        },
    },
    {
        enum: ItemType.FiremakingKit, name: "Firemaking Kit", tooltip: "Improves Survival speed by 15% each", icon: "🔥",
        get_effect_text: (amount) => { return `Survival speed increased ${amount * 15}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Survival).speed_modifier += 0.15 * amount;
        },
    },
    {
        enum: ItemType.Reagents, name: "Reagents", tooltip: "Improves Magic speed by 20%, and Crafting and Druid speed by 10% each", icon: "🌿",
        get_effect_text: (amount) => { return `Magic speed increased ${amount * 20}%; Crafting and Druid speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Crafting).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Druid).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.MagicalRoots, name: "Magical Roots", tooltip: "Improves Survival, Magic, and Druid speed by 10% each", icon: "🌲",
        get_effect_text: (amount) => { return `Survival, Magic, and Druid speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Magic).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Druid).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.GoblinTreasure, name: "Goblin Treasure", tooltip: "Improves Subterfuge speed by 50% and Survival speed by 50% each", icon: "💎",
        get_effect_text: (amount) => { return `Subterfuge speed increased ${amount * 50}%; Survival speed increased ${amount * 50}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.5 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.5 * amount;
        },
    },
    {
        enum: ItemType.Fish, name: "Fish", tooltip: "Gives 10 Energy each", icon: "🐟",
        get_effect_text: (amount) => { return `Gained ${amount * 10} Energy`; },
        on_consume: (amount) => { GAMESTATE.current_energy += 10 * amount; },
    },
    {
        enum: ItemType.BanditWeapons, name: "Bandit Weapons", tooltip: "Improves Subterfuge speed by 10% and Combat speed by 20% each", icon: "🔪",
        get_effect_text: (amount) => { return `Subterfuge speed increased ${amount * 10}%; Combat speed increased ${amount * 20}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Combat).speed_modifier += 0.2 * amount;
        },
    },
    {
        enum: ItemType.BanditWeapons, name: "Cactus", tooltip: "Improves Survival and Fortitude speed by 10% each", icon: "🌵",
        get_effect_text: (amount) => { return `Survival and Fortitude speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Fortitude).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.CityChain, name: "City Chain", tooltip: "Improves Charisma and Subterfuge speed by 50% each", icon: "🔗",
        get_effect_text: (amount) => { return `Charisma and Subterfuge speed increased ${amount * 50}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Charisma).speed_modifier += 0.5 * amount;
            getSkill(SkillType.Subterfuge).speed_modifier += 0.5 * amount;
        },
    },
    {
        enum: ItemType.WerewolfFur, name: "Werewolf Fur", tooltip: "Improves Charisma and Survival speed by 20% each", icon: "🐺",
        get_effect_text: (amount) => { return `Charisma and Survival speed increased ${amount * 20}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Charisma).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.2 * amount;
        },
    },
    {
        enum: ItemType.OasisWater, name: "Oasis Water", tooltip: "Improves Magic speed by 20% and Survival speed by 10% each", icon: "💧",
        get_effect_text: (amount) => { return `Magic speed increased ${amount * 20}%; Survival speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.Calamari, name: "Calamari", tooltip: "Gives 50 Energy each", icon: "🦑",
        get_effect_text: (amount) => { return `Gained ${amount * 50} Energy`; },
        on_consume: (amount) => { GAMESTATE.current_energy += 50 * amount; },
    },
    {
        enum: ItemType.MagicalIncense, name: "Magical Incense", tooltip: "Improves Ascension speed by 10% each", icon: "🕯️",
        get_effect_text: (amount) => { return `Ascension speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Ascension).speed_modifier += 0.1 * amount;
        },
    },
]

export var ITEMS_TO_NOT_AUTO_USE = [ItemType.ScrollOfHaste];
