import { GAMESTATE } from "./game.js";
import { SkillType } from "./skills.js";
import { getSkill } from "./simulation.js"
import { getSkillString } from "./rendering.js";
import { ENERGY_TEXT } from "./rendering_constants.js";

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
        enum: ItemType.Food, name: `Food`, tooltip: `Gives 5 ${ENERGY_TEXT} each<br>Can take you above your Max Energy`, icon: `🍲`,
        get_effect_text: (amount) => { return `Gained ${amount * 5} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += 5 * amount; },
    },
    {
        enum: ItemType.Arrow, name: `Arrow`, tooltip: `Improves ${getSkillString(SkillType.Combat)} Task speed by 15% each`, icon: `🏹`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Combat)} Task speed increased ${amount * 15}%`; },
        on_consume: (amount) => { getSkill(SkillType.Combat).speed_modifier += 0.15 * amount; },
    },
    {
        enum: ItemType.Coin, name: `Coin`, tooltip: `Improves ${getSkillString(SkillType.Charisma)} Task speed by 15% each`, icon: `💰`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Charisma)} Task speed increased ${amount * 15}%`; },
        on_consume: (amount) => { getSkill(SkillType.Charisma).speed_modifier += 0.15 * amount; },
    },
    {
        enum: ItemType.Mushroom, name: `Mushroom`, tooltip: `Improves ${getSkillString(SkillType.Magic)} Task speed by 20% and ${getSkillString(SkillType.Search)} Task speed by 10% each`, icon: `🍄`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Magic)} Task speed increased ${amount * 20}%; ${getSkillString(SkillType.Search)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Search).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.GoblinSupplies, name: `Goblin Supplies`, tooltip: `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 15% and ${getSkillString(SkillType.Combat)} Task speed by 10% each`, icon: `📦`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Subterfuge)} Task speed increased ${amount * 15}%; ${getSkillString(SkillType.Combat)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.15 * amount;
            getSkill(SkillType.Combat).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.TravelEquipment, name: `Travel Equipment`, tooltip: `Improves ${getSkillString(SkillType.Travel)} Task speed by 10% and ${getSkillString(SkillType.Survival)} Task speed by 10% each`, icon: `🎒`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Travel)} Task speed increased ${amount * 10}%; ${getSkillString(SkillType.Survival)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Travel).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.Book, name: `Books`, tooltip: `Improves ${getSkillString(SkillType.Study)} Task speed by 10% each`, icon: `📚`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Study)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Study).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.ScrollOfHaste, name: `Scroll of Haste`, tooltip: `The next Task you start is ${HASTE_MULT}x as fast`, icon: `⚡`,
        get_effect_text: (amount) => { return `Next ${amount} Tasks are ${HASTE_MULT}x as fast`; },
        on_consume: (amount) => { GAMESTATE.queued_scrolls_of_haste += amount; },
    },
    {
        enum: ItemType.GoblinWaraxe, name: `Goblin Waraxe`, tooltip: `Improves ${getSkillString(SkillType.Combat)} Task speed by 100% each`, icon: `🪓`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Combat)} Task speed increased ${amount * 100}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Combat).speed_modifier += 1.0 * amount;
        },
    },
    {
        enum: ItemType.FiremakingKit, name: `Firemaking Kit`, tooltip: `Improves ${getSkillString(SkillType.Survival)} Task speed by 15% each`, icon: `🔥`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Survival)} Task speed increased ${amount * 15}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Survival).speed_modifier += 0.15 * amount;
        },
    },
    {
        enum: ItemType.Reagents, name: `Reagents`, tooltip: `Improves ${getSkillString(SkillType.Magic)} Task speed by 20%, and ${getSkillString(SkillType.Crafting)} Crafting and ${getSkillString(SkillType.Druid)} Task speed by 10% each`, icon: `🌿`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Magic)} Task speed increased ${amount * 20}%; ${getSkillString(SkillType.Crafting)} and ${getSkillString(SkillType.Druid)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Crafting).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Druid).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.MagicalRoots, name: `Magical Roots`, tooltip: `Improves ${getSkillString(SkillType.Survival)}, ${getSkillString(SkillType.Magic)}, and ${getSkillString(SkillType.Druid)} Task speed by 10% each`, icon: `🌲`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Survival)}, ${getSkillString(SkillType.Magic)}, and ${getSkillString(SkillType.Druid)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Magic).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Druid).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.GoblinTreasure, name: `Goblin Treasure`, tooltip: `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 50% and ${getSkillString(SkillType.Survival)} Task speed by 50% each`, icon: `💎`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Subterfuge)} Task speed increased ${amount * 50}%; ${getSkillString(SkillType.Survival)} Task speed increased ${amount * 50}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.5 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.5 * amount;
        },
    },
    {
        enum: ItemType.Fish, name: `Fish`, tooltip: `Gives 10 ${ENERGY_TEXT} each`, icon: `🐟`,
        get_effect_text: (amount) => { return `Gained ${amount * 10} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += 10 * amount; },
    },
    {
        enum: ItemType.BanditWeapons, name: `Bandit Weapons`, tooltip: `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 10% and ${getSkillString(SkillType.Combat)} Task speed by 20% each`, icon: `🔪`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Subterfuge)} Task speed increased ${amount * 10}%; ${getSkillString(SkillType.Combat)} Task speed increased ${amount * 20}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Combat).speed_modifier += 0.2 * amount;
        },
    },
    {
        enum: ItemType.BanditWeapons, name: `Cactus`, tooltip: `Improves ${getSkillString(SkillType.Survival)} and ${getSkillString(SkillType.Fortitude)} Task speed by 10% each`, icon: `🌵`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Survival)} and ${getSkillString(SkillType.Fortitude)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Fortitude).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.CityChain, name: `City Chain`, tooltip: `Improves ${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Subterfuge)} Task speed by 50% each`, icon: `🔗`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Subterfuge)} Task speed increased ${amount * 50}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Charisma).speed_modifier += 0.5 * amount;
            getSkill(SkillType.Subterfuge).speed_modifier += 0.5 * amount;
        },
    },
    {
        enum: ItemType.WerewolfFur, name: `Werewolf Fur`, tooltip: `Improves ${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Survival)} Task speed by 20% each`, icon: `🐺`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Survival)} Task speed increased ${amount * 20}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Charisma).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.2 * amount;
        },
    },
    {
        enum: ItemType.OasisWater, name: `Oasis Water`, tooltip: `Improves ${getSkillString(SkillType.Magic)} Task speed by 20% and ${getSkillString(SkillType.Survival)} Task speed by 10% each`, icon: `💧`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Magic)} Task speed increased ${amount * 20}%; ${getSkillString(SkillType.Survival)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.Calamari, name: `Calamari`, tooltip: `Gives 50 ${ENERGY_TEXT} each`, icon: `🦑`,
        get_effect_text: (amount) => { return `Gained ${amount * 50} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += 50 * amount; },
    },
    {
        enum: ItemType.MagicalIncense, name: `Magical Incense`, tooltip: `Improves ${getSkillString(SkillType.Ascension)} Task speed by 10% each`, icon: `🕯️`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Ascension)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Ascension).speed_modifier += 0.1 * amount;
        },
    },
]

export var ITEMS_TO_NOT_AUTO_USE = [ItemType.ScrollOfHaste];
