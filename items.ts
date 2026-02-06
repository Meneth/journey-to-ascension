import { GAMESTATE } from "./game.js";
import { SkillType } from "./skills.js";
import { addItem, calcItemEnergyGain } from "./simulation.js"
import { ENERGY_TEXT, HASTE_EMOJI } from "./rendering_constants.js";
import { ItemSkillModifierList } from "./modifiers.js";

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
    CampingEquipment,
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
    MysticIncense,
    OracleBones,
    WormHideCoat,
    DjinnLamp,
    Dreamcatcher,
    MagicEssence,
    CraftingRecipe,
    KnightlyBoots,
    DragonScale,
    CaveInsects,
    MagicalVessel,
    MagicRing,
    BottledLightning,
    HeatEssence,
    DivineNotes,
    GriffinQuill,
    WingsOfShadow,
    RitualSymbol,
    Glasses,

    Count
}

type ItemUseLambda = (amount: number) => void;
type ItemEffectTextLambda = (amount: number) => string;
type ItemTooltipLambda = () => string;

export class ItemDefinition {
    enum = ItemType.Count;
    name = "";
    name_plural = "";
    icon = "";
    skill_modifiers: ItemSkillModifierList = new ItemSkillModifierList([]);
    get_custom_tooltip: ItemTooltipLambda = () => { return ""; };
    get_custom_effect_text: ItemEffectTextLambda = () => { return ""; };
    on_consume: ItemUseLambda = () => { };

    constructor(overrides: Partial<ItemDefinition> = {}) {
        Object.assign(this, overrides);
    }

    public getTooltip() {
        const custom = this.get_custom_tooltip();
        if (custom.length != 0) {
            return custom;
        }

        return this.skill_modifiers.getDescription();
    }

    public getEffectText(amount: number) {
        const custom = this.get_custom_effect_text(amount);
        if (custom.length != 0) {
            return custom;
        }

        return this.skill_modifiers.getStacked(amount).getAppliedDescription();
    }

    public applyEffects(amount: number) {
        this.on_consume(amount);
        this.skill_modifiers.getStacked(amount).applyEffect();
    }

    public getNameWithEmoji(amount: number) {
        return `${this.icon}${amount == 1 ? this.name : this.name_plural}`;
    }
}

export const HASTE_MULT = 5;
export const MAGIC_RING_MULT = 5;
export const BOTTLED_LIGHTNING_MULT = 2;

export const ITEMS: ItemDefinition[] = [
    new ItemDefinition({
        enum: ItemType.Food, name: `Food`, name_plural: `Food`,
        icon: `🍲`,
        get_custom_tooltip: () => { return `Gives ${calcItemEnergyGain(5)} ${ENERGY_TEXT} each<br>Can take you above your Max Energy<br><br>Right-click to use all`; },
        get_custom_effect_text: (amount) => { return `Gained ${amount * calcItemEnergyGain(5)} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += calcItemEnergyGain(5) * amount; },
    }),
    new ItemDefinition({
        enum: ItemType.Arrow, name: `Arrow`, name_plural: `Arrows`,
        icon: `🏹`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Combat, 0.15]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.Coin, name: `Coin`, name_plural: `Coins`,
        icon: `💰`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Charisma, 0.2]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.Mushroom, name: `Mushroom`, name_plural: `Mushrooms`,
        icon: `🍄`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Magic, 0.2],
            [SkillType.Search, 0.2]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.GoblinSupplies, name: `Goblin Supplies`, name_plural: `Goblin Supplies`,
        icon: `📦`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Subterfuge, 0.15],
            [SkillType.Combat, 0.1],
            [SkillType.Fortitude, 0.1],
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.TravelEquipment, name: `Travel Equipment`, name_plural: `Travel Equipment`,
        icon: `🎒`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Travel, 0.1],
            [SkillType.Fortitude, 0.1]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.Book, name: `Book`, name_plural: `Books`,
        icon: `📚`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Study, 0.1],
            [SkillType.Magic, 0.1]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.ScrollOfHaste, name: `Scroll of Haste`, name_plural: `Scrolls of Haste`,
        icon: HASTE_EMOJI,
        get_custom_tooltip: () => { return `The next Task rep you start is ${HASTE_MULT}x as fast`; },
        get_custom_effect_text: (amount) => { return `Next ${amount} Task reps are ${HASTE_MULT}x as fast`; },
        on_consume: (amount) => { GAMESTATE.queued_scrolls_of_haste += amount; },
    }),
    new ItemDefinition({
        enum: ItemType.GoblinWaraxe, name: `Goblin Waraxe`, name_plural: `Goblin Waraxes`,
        icon: `🪓`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Combat, 1]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.CampingEquipment, name: `Camping Equipment`, name_plural: `Camping Equipment`,
        icon: `⛺`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Fortitude, 0.15]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.Reagents, name: `Reagent`, name_plural: `Reagents`,
        icon: `🌿`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Magic, 0.2],
            [SkillType.Crafting, 0.1],
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.MagicalRoots, name: `Magical Root`, name_plural: `Magical Roots`,
        icon: `🌲`,
         skill_modifiers: new ItemSkillModifierList([
            [SkillType.Fortitude, 0.2],
            [SkillType.Magic, 0.1],
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.GoblinTreasure, name: `Goblin Treasure`, name_plural: `Goblin Treasures`,
        icon: `💎`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Subterfuge, 0.5],
            [SkillType.Magic, 0.5]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.Fish, name: `Fish`, name_plural: `Fish`,
        icon: `🐟`,
        get_custom_tooltip: () => { return `Gives ${calcItemEnergyGain(10)} ${ENERGY_TEXT} each`; },
        get_custom_effect_text: (amount) => { return `Gained ${amount * calcItemEnergyGain(10)} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += calcItemEnergyGain(10) * amount; },
    }),
    new ItemDefinition({
        enum: ItemType.BanditWeapons, name: `Bandit Weapon`, name_plural: `Bandit Weapons`,
        icon: `🔪`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Subterfuge, 0.1],
            [SkillType.Combat, 0.2]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.BanditWeapons, name: `Cactus`, name_plural: `Cactuses`,
        icon: `🌵`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Fortitude, 0.15]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.CityChain, name: `City Chain`, name_plural: `City Chains`,
        icon: `🔗`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Charisma, 0.5],
            [SkillType.Subterfuge, 0.5]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.WerewolfFur, name: `Werewolf Fur`, name_plural: `Werewolf Furs`,
        icon: `🐺`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Charisma, 0.2],
            [SkillType.Fortitude, 0.2]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.OasisWater, name: `Oasis Water`, name_plural: `Oasis Water`,
        icon: `💧`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Magic, 0.2],
            [SkillType.Fortitude, 0.1]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.Calamari, name: `Calamari`, name_plural: `Calamari`,
        icon: `🦑`,
        get_custom_tooltip: () => { return `Gives ${calcItemEnergyGain(50)} ${ENERGY_TEXT} each`; },
        get_custom_effect_text: (amount) => { return `Gained ${amount * calcItemEnergyGain(50)} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += calcItemEnergyGain(50) * amount; },
    }),
    new ItemDefinition({
        enum: ItemType.MysticIncense, name: `Mystic Incense`, name_plural: `Mystic Incense`,
        icon: `🕯️`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Ascension, 0.1]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.OracleBones, name: `Oracle Bone`, name_plural: `Oracle Bones`,
        icon: `🦴`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Search, 0.2],
            [SkillType.Magic, 0.2],
            [SkillType.Ascension, 0.1],
            [SkillType.Travel, 0.1],
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.WormHideCoat, name: `Worm Hide Coat`, name_plural: `Worm Hide Coats`,
        icon: `🧥`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Fortitude, 1]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.DjinnLamp, name: `Djinn Lamp`, name_plural: `Djinn Lamps`,
        icon: `🧞`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Ascension, 0.3],
            [SkillType.Magic, 0.3]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.Dreamcatcher, name: `Dreamcatcher`, name_plural: `Dreamcatchers`,
        icon: `🕸️`,
        get_custom_tooltip: () => { return `Creates a copy of every Item type you've obtained this Energy Reset (except Dreamcatchers)`; },
        get_custom_effect_text: (amount) => { return `Copied ${amount * (GAMESTATE.items_found_this_energy_reset.length - 1)} Items`; },
        on_consume: (amount) => {
            for (const item of GAMESTATE.items_found_this_energy_reset) {
                if (item != ItemType.Dreamcatcher) {
                    addItem(item, amount);
                }
            }
        },
    }),
    new ItemDefinition({
        enum: ItemType.MagicEssence, name: `Magical Essence`, name_plural: `Magical Essences`,
        icon: `🌠`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Magic, 4]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.CraftingRecipe, name: `Crafting Recipe`, name_plural: `Crafting Recipes`,
        icon: `🛠️`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Crafting, 0.3]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.KnightlyBoots, name: `Knightly Boots`, name_plural: `Knightly Boots`,
        icon: `👢`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Combat, 0.2],
            [SkillType.Fortitude, 0.2]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.DragonScale, name: `Dragon Scale`, name_plural: `Dragon Scales`,
        icon: `🐲`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Combat, 0.5],
            [SkillType.Fortitude, 0.5]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.CaveInsects, name: `Cave Insect`, name_plural: `Cave Insects`,
        icon: `🦟`,
        get_custom_tooltip: () => { return `Gives ${calcItemEnergyGain(5)} ${ENERGY_TEXT} each`; },
        get_custom_effect_text: (amount) => { return `Gained ${amount * calcItemEnergyGain(5)} ${ENERGY_TEXT}`; },
        on_consume: (amount) => { GAMESTATE.current_energy += calcItemEnergyGain(5) * amount; },
    }),
    new ItemDefinition({
        enum: ItemType.MagicalVessel, name: `Magical Vessel`, name_plural: `Magical Vessels`,
        icon: `🏺`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Ascension, 0.3]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.MagicRing, name: `Magic Ring`, name_plural: `Magic Rings`,
        icon: `💍`,
        get_custom_tooltip: () => { return `The next Task rep you start gives ${MAGIC_RING_MULT}x as much XP`; },
        get_custom_effect_text: (amount) => { return `Next ${amount} Task reps give ${MAGIC_RING_MULT}x as much XP`; },
        on_consume: (amount) => { GAMESTATE.queued_magic_rings += amount; },
    }),
    new ItemDefinition({
        enum: ItemType.BottledLightning, name: `Bottled Lightning`, name_plural: `Bottled Lightning`,
        icon: `⚡`,
        get_custom_tooltip: () => { return `The next Boss Task you start is ${BOTTLED_LIGHTNING_MULT}x as fast<br>This stacks with Scroll of Haste`; },
        get_custom_effect_text: (amount) => { return `Next ${amount} Boss Tasks are ${BOTTLED_LIGHTNING_MULT}x as fast`; },
        on_consume: (amount) => { GAMESTATE.queued_lightning += amount; },
    }),
    new ItemDefinition({
        enum: ItemType.HeatEssence, name: `Heat Essence`, name_plural: `Heat Essence`,
        icon: `🔥`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Charisma, 1.0]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.DivineNotes, name: `Divine Note`, name_plural: `Divine Notes`,
        icon: `📜`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Study, 0.3],
            [SkillType.Search, 0.3],
            [SkillType.Travel, 0.1],
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.GriffinQuill, name: `Griffin Quill`, name_plural: `Griffin Quills`,
        icon: `🕊️`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Study, 1.0]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.WingsOfShadow, name: `Wings of Shadow`, name_plural: `Wings of Shadow`,
        icon: `🦇`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Ascension, 5.0],
            [SkillType.Travel, 1.0],
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.RitualSymbol, name: `Ritual Symbol`, name_plural: `Ritual Symbols`,
        icon: `☯️`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Ascension, 1.0]
        ]),
    }),
    new ItemDefinition({
        enum: ItemType.RitualSymbol, name: `Glasses`, name_plural: `Glasses`,
        icon: `👓`,
        skill_modifiers: new ItemSkillModifierList([
            [SkillType.Search, 1.0]
        ]),
    }),
]

export const ARTIFACTS = [ItemType.ScrollOfHaste, ItemType.Dreamcatcher, ItemType.MagicRing, ItemType.BottledLightning];
