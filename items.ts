import { GAMESTATE } from "./game.js";
import { SkillType } from "./skills.js";
import { calcItemEnergyGain, getSkill } from "./simulation.js"
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
    OracleBones,
    WormHideCoat,
    DjinnLamp,
    Dreamcatcher,
    MagicEssence,
    CraftingRecipe,

    Count
}

type ItemUseLambda = (amount: number) => void;
type ItemEffectTextLambda = (amount: number) => string;
type ItemTooltipLambda = () => string;

export class ItemDefinition {
    enum = ItemType.Count;
    name = "";
    get_tooltip: ItemTooltipLambda = () => { return ""; };
    icon = "";
    get_effect_text: ItemEffectTextLambda = () => { return ""; };
    on_consume: ItemUseLambda = () => { };
}

export const HASTE_MULT = 5;

export const ITEMS: ItemDefinition[] = [
    {
        enum: ItemType.Food, name: `Food`,
        get_tooltip: () => { return `Gives ${calcItemEnergyGain(5)} ${ENERGY_TEXT} each<br>Can take you above your Max Energy`; },
        icon: `🍲`,
        get_effect_text: (amount) => { return `Gained ${amount * calcItemEnergyGain(5)} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += calcItemEnergyGain(5) * amount; },
    },
    {
        enum: ItemType.Arrow, name: `Arrow`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Combat)} Task speed by 15% each`; },
        icon: `🏹`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Combat)} Task speed increased ${amount * 15}%`; },
        on_consume: (amount) => { getSkill(SkillType.Combat).speed_modifier += 0.15 * amount; },
    },
    {
        enum: ItemType.Coin, name: `Coin`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Charisma)} Task speed by 15% each`; },
        icon: `💰`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Charisma)} Task speed increased ${amount * 15}%`; },
        on_consume: (amount) => { getSkill(SkillType.Charisma).speed_modifier += 0.15 * amount; },
    },
    {
        enum: ItemType.Mushroom, name: `Mushroom`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Magic)} Task speed by 20% and ${getSkillString(SkillType.Search)} Task speed by 10% each`; },
        icon: `🍄`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Magic)} Task speed increased ${amount * 20}%; ${getSkillString(SkillType.Search)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Search).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.GoblinSupplies, name: `Goblin Supplies`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 15% and ${getSkillString(SkillType.Combat)} Task speed by 10% each`; },
        icon: `📦`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Subterfuge)} Task speed increased ${amount * 15}%; ${getSkillString(SkillType.Combat)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.15 * amount;
            getSkill(SkillType.Combat).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.TravelEquipment, name: `Travel Equipment`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Travel)} Task speed by 10% and ${getSkillString(SkillType.Survival)} Task speed by 10% each`; },
        icon: `🎒`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Travel)} Task speed increased ${amount * 10}%; ${getSkillString(SkillType.Survival)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Travel).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.Book, name: `Books`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Study)} Task speed by 10% each`; },
        icon: `📚`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Study)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Study).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.ScrollOfHaste, name: `Scroll of Haste`,
        get_tooltip: () => { return `The next Task you start is ${HASTE_MULT}x as fast`; },
        icon: `🐇`,
        get_effect_text: (amount) => { return `Next ${amount} Tasks are ${HASTE_MULT}x as fast`; },
        on_consume: (amount) => { GAMESTATE.queued_scrolls_of_haste += amount; },
    },
    {
        enum: ItemType.GoblinWaraxe, name: `Goblin Waraxe`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Combat)} Task speed by 100% each`; },
        icon: `🪓`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Combat)} Task speed increased ${amount * 100}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Combat).speed_modifier += 1.0 * amount;
        },
    },
    {
        enum: ItemType.FiremakingKit, name: `Firemaking Kit`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Survival)} Task speed by 15% each`; },
        icon: `🔥`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Survival)} Task speed increased ${amount * 15}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Survival).speed_modifier += 0.15 * amount;
        },
    },
    {
        enum: ItemType.Reagents, name: `Reagents`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Magic)} Task speed by 20%, and ${getSkillString(SkillType.Crafting)} Crafting and ${getSkillString(SkillType.Druid)} Task speed by 10% each`; },
        icon: `🌿`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Magic)} Task speed increased ${amount * 20}%; ${getSkillString(SkillType.Crafting)} and ${getSkillString(SkillType.Druid)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Crafting).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Druid).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.MagicalRoots, name: `Magical Roots`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Survival)}, ${getSkillString(SkillType.Magic)}, and ${getSkillString(SkillType.Druid)} Task speed by 10% each`; },
        icon: `🌲`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Survival)}, ${getSkillString(SkillType.Magic)}, and ${getSkillString(SkillType.Druid)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Magic).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Druid).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.GoblinTreasure, name: `Goblin Treasure`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 50% and ${getSkillString(SkillType.Survival)} Task speed by 50% each`; },
        icon: `💎`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Subterfuge)} Task speed increased ${amount * 50}%; ${getSkillString(SkillType.Survival)} Task speed increased ${amount * 50}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.5 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.5 * amount;
        },
    },
    {
        enum: ItemType.Fish, name: `Fish`,
        get_tooltip: () => { return `Gives ${calcItemEnergyGain(10)} ${ENERGY_TEXT} each`; },
        icon: `🐟`,
        get_effect_text: (amount) => { return `Gained ${amount * calcItemEnergyGain(10)} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += calcItemEnergyGain(10) * amount; },
    },
    {
        enum: ItemType.BanditWeapons, name: `Bandit Weapons`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Subterfuge)} Task speed by 10% and ${getSkillString(SkillType.Combat)} Task speed by 20% each`; },
        icon: `🔪`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Subterfuge)} Task speed increased ${amount * 10}%; ${getSkillString(SkillType.Combat)} Task speed increased ${amount * 20}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Subterfuge).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Combat).speed_modifier += 0.2 * amount;
        },
    },
    {
        enum: ItemType.BanditWeapons, name: `Cactus`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Survival)} and ${getSkillString(SkillType.Fortitude)} Task speed by 10% each`; },
        icon: `🌵`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Survival)} and ${getSkillString(SkillType.Fortitude)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
            getSkill(SkillType.Fortitude).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.CityChain, name: `City Chain`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Subterfuge)} Task speed by 50% each`; },
        icon: `🔗`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Subterfuge)} Task speed increased ${amount * 50}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Charisma).speed_modifier += 0.5 * amount;
            getSkill(SkillType.Subterfuge).speed_modifier += 0.5 * amount;
        },
    },
    {
        enum: ItemType.WerewolfFur, name: `Werewolf Fur`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Survival)} Task speed by 20% each`; },
        icon: `🐺`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Charisma)} and ${getSkillString(SkillType.Survival)} Task speed increased ${amount * 20}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Charisma).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.2 * amount;
        },
    },
    {
        enum: ItemType.OasisWater, name: `Oasis Water`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Magic)} Task speed by 20% and ${getSkillString(SkillType.Survival)} Task speed by 10% each`; },
        icon: `💧`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Magic)} Task speed increased ${amount * 20}%; ${getSkillString(SkillType.Survival)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Survival).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.Calamari, name: `Calamari`,
        get_tooltip: () => { return `Gives ${calcItemEnergyGain(50)} ${ENERGY_TEXT} each`; },
        icon: `🦑`,
        get_effect_text: (amount) => { return `Gained ${amount * calcItemEnergyGain(50)} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += calcItemEnergyGain(50) * amount; },
    },
    {
        enum: ItemType.MagicalIncense, name: `Magical Incense`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Ascension)} Task speed by 10% each`; },
        icon: `🕯️`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Ascension)} Task speed increased ${amount * 10}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Ascension).speed_modifier += 0.1 * amount;
        },
    },
    {
        enum: ItemType.OracleBones, name: `Oracle Bones`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Search)} and ${getSkillString(SkillType.Druid)} Task speed by 20% each`; },
        icon: `🦴`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Search)} and ${getSkillString(SkillType.Druid)} Task speed increased ${amount * 20}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Search).speed_modifier += 0.2 * amount;
            getSkill(SkillType.Druid).speed_modifier += 0.2 * amount;
        },
    },
    {
        enum: ItemType.WormHideCoat, name: `Worm Hide Coat`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Fortitude)} Task speed by 100% each`; },
        icon: `🧥`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Fortitude)} Task speed increased ${amount * 100}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Fortitude).speed_modifier += 1 * amount;
        },
    },
    {
        enum: ItemType.DjinnLamp, name: `Djinn's Lamp`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Ascension)} and ${getSkillString(SkillType.Magic)} Task speed by 30% each`; },
        icon: `🧞`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Ascension)} and ${getSkillString(SkillType.Magic)} Task speed increased ${amount * 30}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Ascension).speed_modifier += 0.3 * amount;
            getSkill(SkillType.Magic).speed_modifier += 0.3 * amount;
        },
    },
    {
        enum: ItemType.DjinnLamp, name: `Dreamcatcher`,
        get_tooltip: () => { return `???`; },
        icon: `🕸️`,
        get_effect_text: (amount) => { return `???? ${amount * 30}%`; },
        on_consume: () => {
            
        },
    },
    {
        enum: ItemType.MagicEssence, name: `Magical Essence`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Magic)} speed by 300% each`; },
        icon: `🌠`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Magic)} Task speed increased ${amount * 300}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Magic).speed_modifier += 3 * amount;
        },
    },
    {
        enum: ItemType.MagicEssence, name: `Crafting Recipes`,
        get_tooltip: () => { return `Improves ${getSkillString(SkillType.Crafting)} speed by 30% each`; },
        icon: `🛠️`,
        get_effect_text: (amount) => { return `${getSkillString(SkillType.Crafting)} Task speed increased ${amount * 30}%`; },
        on_consume: (amount) => {
            getSkill(SkillType.Crafting).speed_modifier += 0.3 * amount;
        },
    },
]

export const ITEMS_TO_NOT_AUTO_USE = [ItemType.ScrollOfHaste];
