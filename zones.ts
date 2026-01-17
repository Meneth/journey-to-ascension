import { ItemType } from "./items.js";
import { PerkType } from "./perks.js";
import { PrestigeLayer } from "./prestige_upgrades.js";
import { SkillType } from "./skills.js";

export enum TaskType {
    Normal,
    Travel,
    Mandatory,
    Prestige,
    Boss,
}

export class TaskDefinition {
    id = 0;
    name = "";
    type = TaskType.Normal;
    cost_multiplier: number = 1;
    skills: SkillType[] = [];
    xp_mult: number = 1;
    item: ItemType = ItemType.Count;
    perk: PerkType = PerkType.Count;
    prestige_layer: PrestigeLayer = PrestigeLayer.Count;
    max_reps: number = 1;
    hidden_by_default = false;
    unlocks_task: number = -1;
    zone_id: number = 0;

    constructor(overrides: Partial<TaskDefinition> = {}) {
        Object.assign(this, overrides);
    }
}

export class Task {
    task_definition: TaskDefinition;
    progress: number = 0;
    reps: number = 0;
    enabled: boolean = true;
    hasted: boolean = false;
    xp_boosted: boolean = false;

    constructor(definition: TaskDefinition) {
        this.task_definition = definition;
    }
}

export class Zone {
    name: string = "";
    tasks: TaskDefinition[] = [];
}

export const ZONES: Zone[] = [
    {
        name: "The Village",
        tasks: [
            new TaskDefinition({ id: 10, name: "Join the Watch", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 11, name: "Read Noticeboard", type: TaskType.Mandatory, cost_multiplier: 3, skills: [SkillType.Study] }),
            new TaskDefinition({ id: 12, name: "Train with Weapons", type: TaskType.Mandatory, cost_multiplier: 1, max_reps: 3, xp_mult: 3, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 13, name: "Learn How to Read", cost_multiplier: 8, xp_mult: 0.5, skills: [SkillType.Study], perk: PerkType.Reading }),
            new TaskDefinition({ id: 14, name: "Beg for Food", max_reps: 10, skills: [SkillType.Charisma], xp_mult: 2, item: ItemType.Food }),
            new TaskDefinition({ id: 15, name: "Hide and Seek", cost_multiplier: 2, xp_mult: 1.5, max_reps: 3, skills: [SkillType.Search, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 16, name: "Observe Surroundings", cost_multiplier: 1, max_reps: 5, skills: [SkillType.Study], xp_mult: 3 }),
        ],
    },
    {
        name: "The Village Watch",
        tasks: [
            new TaskDefinition({ id: 20, name: "Notice Smoke in the Distance", type: TaskType.Travel, cost_multiplier: 3, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 21, name: "Learn Routines", type: TaskType.Mandatory, cost_multiplier: 1.3, max_reps: 4, skills: [SkillType.Study] }),
            new TaskDefinition({ id: 22, name: "Deal with Drunkards", type: TaskType.Mandatory, cost_multiplier: 1.6, max_reps: 2, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 25, name: "Fletch Arrows", max_reps: 5, cost_multiplier: 0.4, skills: [SkillType.Crafting], item: ItemType.Arrow }),
            new TaskDefinition({ id: 27, name: "Learn How to Write", cost_multiplier: 20, xp_mult: 0.2, skills: [SkillType.Study], perk: PerkType.Writing }),
            new TaskDefinition({ id: 23, name: "Chit-chat", max_reps: 3, skills: [SkillType.Charisma], xp_mult: 3 }),
            new TaskDefinition({ id: 24, name: "Sparring", cost_multiplier: 1.5, xp_mult: 5, max_reps: 4, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 26, name: "Daydream About Leaving", cost_multiplier: 1, max_reps: 6, xp_mult: 3, skills: [SkillType.Travel, SkillType.Search] }),
        ],
    },
    {
        name: "The Raid",
        tasks: [
            new TaskDefinition({ id: 30, name: "Enter the Wilderness", type: TaskType.Travel, cost_multiplier: 2, xp_mult: 0.5, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 31, name: "Fight a Goblin", type: TaskType.Mandatory, cost_multiplier: 3.5, xp_mult: 3, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 32, name: "Warn Villagers", type: TaskType.Mandatory, cost_multiplier: 3, max_reps: 3, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 33, name: "Loot the Fallen", max_reps: 4, cost_multiplier: 0.5, skills: [SkillType.Search], item: ItemType.Coin }),
            new TaskDefinition({ id: 34, name: "Rescue Villager", cost_multiplier: 1, max_reps: 3, xp_mult: 1.5, skills: [SkillType.Subterfuge, SkillType.Search], perk: PerkType.VillagerGratitude }),
            new TaskDefinition({ id: 35, name: "Treat Villager Wounds", cost_multiplier: 1.5, max_reps: 3, xp_mult: 3, skills: [SkillType.Crafting] }),
            new TaskDefinition({ id: 36, name: "Goblin Warlord", type: TaskType.Boss, cost_multiplier: 1300, skills: [SkillType.Combat], item: ItemType.GoblinWaraxe, unlocks_task: 37 }),
            new TaskDefinition({ id: 37, name: "Save the Village", max_reps: 1, cost_multiplier: 1300, skills: [SkillType.Combat, SkillType.Magic], perk: PerkType.VillageHero, hidden_by_default: true }),
        ],
    },
    {
        name: "The Wilderness",
        tasks: [
            new TaskDefinition({ id: 40, name: "Find Cave Entrance", type: TaskType.Travel, cost_multiplier: 2, skills: [SkillType.Travel, SkillType.Search] }),
            new TaskDefinition({ id: 41, name: "Look for Tracks", type: TaskType.Mandatory, cost_multiplier: 0.5, max_reps: 3, skills: [SkillType.Search, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 42, name: "Survive the Night", type: TaskType.Mandatory, cost_multiplier: 2.5, skills: [SkillType.Fortitude] }),
            new TaskDefinition({ id: 43, name: "Find an Amulet", type: TaskType.Mandatory, cost_multiplier: 2.5, xp_mult: 0.1, skills: [SkillType.Search, SkillType.Magic], perk: PerkType.Amulet }),
            new TaskDefinition({ id: 45, name: "Forage for Mushrooms", max_reps: 5, xp_mult: 2, cost_multiplier: 0.3, skills: [SkillType.Search, SkillType.Fortitude], item: ItemType.Mushroom }),
            new TaskDefinition({ id: 44, name: "Build a Fire", cost_multiplier: 2, xp_mult: 3, skills: [SkillType.Crafting] }),
            new TaskDefinition({ id: 46, name: "Befriend a Deer", cost_multiplier: 2, xp_mult: 3, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 47, name: "Angry Ent", type: TaskType.Boss, cost_multiplier: 12000, skills: [SkillType.Combat], unlocks_task: 48, item: ItemType.MagicalRoots }),
            new TaskDefinition({ id: 48, name: "Gather Magical Roots", cost_multiplier: 15, max_reps: 3, skills: [SkillType.Search], item: ItemType.MagicalRoots, hidden_by_default: true }),
        ],
    },
    {
        name: "The Cave System",
        tasks: [
            new TaskDefinition({ id: 50, name: "Leave Via Back Entrance", type: TaskType.Travel, cost_multiplier: 2, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 51, name: "Find a Way Through", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 52, name: "Rescue Captives", type: TaskType.Mandatory, cost_multiplier: 1.5, max_reps: 3, skills: [SkillType.Charisma, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 53, name: "Steal Supplies", max_reps: 5, cost_multiplier: 0.3, skills: [SkillType.Subterfuge], item: ItemType.GoblinSupplies }),
            new TaskDefinition({ id: 54, name: "Try Casting a Spell", cost_multiplier: 3, max_reps: 6, skills: [SkillType.Magic, SkillType.Study], perk: PerkType.EnergySpell }),
            new TaskDefinition({ id: 55, name: "Inspect Wall Paintings", cost_multiplier: 2, xp_mult: 4, skills: [SkillType.Study] }),
            new TaskDefinition({ id: 56, name: "Scout the Cave", cost_multiplier: 0.5, max_reps: 3, xp_mult: 3, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 57, name: "Goblin Chieftain", type: TaskType.Boss, cost_multiplier: 10000, skills: [SkillType.Combat], unlocks_task: 58, item: ItemType.GoblinTreasure }),
            new TaskDefinition({ id: 58, name: "Wipe Out Goblins", cost_multiplier: 10000, skills: [SkillType.Combat], xp_mult: 0.3, hidden_by_default: true, perk: PerkType.GoblinScourge }),
        ],
    },
    {
        name: "The Road to the City",
        tasks: [
            new TaskDefinition({ id: 60, name: "Get to the City", type: TaskType.Travel, cost_multiplier: 3, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 61, name: "Join a Caravan", type: TaskType.Mandatory, cost_multiplier: 4, xp_mult: 0.5, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 62, name: "Scout the Road Ahead", type: TaskType.Mandatory, cost_multiplier: 1.3, max_reps: 3, skills: [SkillType.Study, SkillType.Search] }),
            new TaskDefinition({ id: 63, name: "Make Travel Equipment", max_reps: 4, cost_multiplier: 0.5, skills: [SkillType.Crafting], item: ItemType.TravelEquipment }),
            new TaskDefinition({ id: 64, name: "Get Used to Traveling", cost_multiplier: 1, max_reps: 3, xp_mult: 3, skills: [SkillType.Travel, SkillType.Fortitude], perk: PerkType.ExperiencedTraveler }),
            new TaskDefinition({ id: 65, name: "Chat with Travelers", cost_multiplier: 1, max_reps: 4, xp_mult: 3, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 66, name: "Practice Traveling Unnoticed", cost_multiplier: 2, max_reps: 1, xp_mult: 4, skills: [SkillType.Subterfuge] }),
            new TaskDefinition({ id: 67, name: "Bandits", type: TaskType.Boss, cost_multiplier: 10000, skills: [SkillType.Combat], item: ItemType.BanditWeapons, unlocks_task: 68 }),
            new TaskDefinition({ id: 68, name: "Loot Bandit Camp", cost_multiplier: 35, skills: [SkillType.Subterfuge, SkillType.Search], xp_mult: 3, max_reps: 4, item: ItemType.BanditWeapons, hidden_by_default: true }),
        ],
    },
    {
        name: "The City Outskirts",
        tasks: [
            new TaskDefinition({ id: 70, name: "Enter the City", type: TaskType.Travel, cost_multiplier: 1.5, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 71, name: "Bribe the City Guards", type: TaskType.Mandatory, cost_multiplier: 4, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 72, name: "Survive a Mugging", type: TaskType.Mandatory, cost_multiplier: 1, max_reps: 1, xp_mult: 0.75, skills: [SkillType.Combat, SkillType.Fortitude] }),
            new TaskDefinition({ id: 73, name: "Buy a Book", max_reps: 5, cost_multiplier: 1, skills: [SkillType.Charisma], item: ItemType.Book }),
            new TaskDefinition({ id: 74, name: "Negotiate with a Rogue Guard", cost_multiplier: 12, max_reps: 1, xp_mult: 0.3, skills: [SkillType.Charisma, SkillType.Subterfuge], perk: PerkType.UndergroundConnection }),
            new TaskDefinition({ id: 75, name: "Spar with the Guards", cost_multiplier: 1, max_reps: 3, xp_mult: 1.5, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 76, name: "Fend for Yourself", cost_multiplier: 1, max_reps: 1, xp_mult: 4, skills: [SkillType.Fortitude] }),
            new TaskDefinition({ id: 77, name: "Skulk About", cost_multiplier: 2, skills: [SkillType.Subterfuge], xp_mult: 5 }),
        ],
    },
    {
        name: "The City",
        tasks: [
            new TaskDefinition({ id: 80, name: "Embark on a Quest", type: TaskType.Travel, cost_multiplier: 4, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 81, name: "Investigate Rumors of a Magician", type: TaskType.Mandatory, cost_multiplier: 1.5, max_reps: 4, skills: [SkillType.Charisma, SkillType.Search] }),
            new TaskDefinition({ id: 82, name: "Search the Archives for Magic", type: TaskType.Mandatory, cost_multiplier: 1.2, max_reps: 5, skills: [SkillType.Study, SkillType.Search] }),
            new TaskDefinition({ id: 83, name: "Scribe Scroll of Haste", max_reps: 1, cost_multiplier: 2, skills: [SkillType.Crafting, SkillType.Magic], item: ItemType.ScrollOfHaste }),
            new TaskDefinition({ id: 84, name: "Cast a Spell", cost_multiplier: 1, max_reps: 6, xp_mult: 0.2, skills: [SkillType.Magic], perk: PerkType.MinorTimeCompression }),
            new TaskDefinition({ id: 85, name: "Study at the Mage's Guild", cost_multiplier: 2, xp_mult: 2, skills: [SkillType.Study, SkillType.Magic] }),
            new TaskDefinition({ id: 88, name: "DELETED TASK", hidden_by_default: true }),
            new TaskDefinition({ id: 86, name: "Train for Your Quest", cost_multiplier: 1, max_reps: 3, xp_mult: 3, skills: [SkillType.Search, SkillType.Fortitude] }),
            new TaskDefinition({ id: 87, name: "Corrupt Mayor", type: TaskType.Boss, cost_multiplier: 10000, skills: [SkillType.Combat], item: ItemType.CityChain, unlocks_task: 89 }),
            new TaskDefinition({ id: 89, name: "Purge Corrupt Bureacracy", cost_multiplier: 100000, skills: [SkillType.Study, SkillType.Subterfuge], xp_mult: 0.02, perk: PerkType.PurgedBureaucracy, hidden_by_default: true }),
        ],
    },
    {
        name: "The Forest",
        tasks: [
            new TaskDefinition({ id: 90, name: "Scale the Mountain", type: TaskType.Travel, cost_multiplier: 2, skills: [SkillType.Travel, SkillType.Fortitude], perk: PerkType.HighAltitudeClimbing }),
            new TaskDefinition({ id: 91, name: "Locate the Mountain", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 92, name: "Make Climbing Gear", type: TaskType.Mandatory, cost_multiplier: 0.4, max_reps: 3, skills: [SkillType.Crafting] }),
            new TaskDefinition({ id: 93, name: "Create Firemaking Kit", max_reps: 3, cost_multiplier: 0.15, skills: [SkillType.Crafting], item: ItemType.FiremakingKit }),
            new TaskDefinition({ id: 94, name: "Prepare to Scale the Mountain", cost_multiplier: 1, max_reps: 3, xp_mult: 4, skills: [SkillType.Study, SkillType.Fortitude] }),
            new TaskDefinition({ id: 95, name: "Build a Hut", cost_multiplier: 2, xp_mult: 3, skills: [SkillType.Crafting] }),
            new TaskDefinition({ id: 96, name: "Go Sightseeing", cost_multiplier: 0.5, max_reps: 3, xp_mult: 3, skills: [SkillType.Search, SkillType.Travel] }),
            new TaskDefinition({ id: 97, name: "Meet a Magical Creature", cost_multiplier: 0.5, max_reps: 1, xp_mult: 3, skills: [SkillType.Magic, SkillType.Charisma] }),
            new TaskDefinition({ id: 98, name: "Werewolf", type: TaskType.Boss, cost_multiplier: 20000, skills: [SkillType.Combat], item: ItemType.WerewolfFur, unlocks_task: 99 }),
            new TaskDefinition({ id: 99, name: "Gather Shed Fur from Lair", cost_multiplier: 8, max_reps: 3, skills: [SkillType.Subterfuge], item: ItemType.WerewolfFur, hidden_by_default: true }),
        ],
    },
    {
        name: "The Magician",
        tasks: [
            new TaskDefinition({ id: 100, name: "Hunt for the First Reagent", type: TaskType.Travel, cost_multiplier: 5, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 101, name: "Convince the Magician", type: TaskType.Mandatory, cost_multiplier: 6, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 102, name: "Do a Favor", type: TaskType.Mandatory, cost_multiplier: 1, max_reps: 1, skills: [SkillType.Crafting, SkillType.Subterfuge] }),
            new TaskDefinition({ id: 103, name: "Steal Some Reagents", max_reps: 4, cost_multiplier: 0.15, skills: [SkillType.Subterfuge], item: ItemType.Reagents }),
            new TaskDefinition({ id: 104, name: "Figure Out How to Attune", cost_multiplier: 60, xp_mult: 0.1, skills: [SkillType.Study, SkillType.Magic], perk: PerkType.Attunement }),
            new TaskDefinition({ id: 105, name: "Give Yourself a Pep Talk", cost_multiplier: 1, xp_mult: 4, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 106, name: "Try to Transform Into an Eagle", cost_multiplier: 1, xp_mult: 4, skills: [SkillType.Magic] }),
            new TaskDefinition({ id: 107, name: "Low-oxygen Exercise", cost_multiplier: 0.5, max_reps: 5, xp_mult: 4, skills: [SkillType.Fortitude] }),
        ],
    },
    {
        name: "The Ocean",
        tasks: [
            new TaskDefinition({ id: 110, name: "Land on Island", type: TaskType.Travel, cost_multiplier: 3, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 111, name: "Weather a Storm", type: TaskType.Mandatory, cost_multiplier: 2, skills: [SkillType.Fortitude] }),
            new TaskDefinition({ id: 112, name: "Find the Island", type: TaskType.Mandatory, cost_multiplier: 0.8, max_reps: 1, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 113, name: "Catch Fish", max_reps: 5, cost_multiplier: 0.4, xp_mult: 4, skills: [SkillType.Crafting, SkillType.Search], item: ItemType.Fish }),
            new TaskDefinition({ id: 114, name: "Dive as a Squid", cost_multiplier: 1.5, max_reps: 3, xp_mult: 0.5, skills: [SkillType.Magic, SkillType.Search], perk: PerkType.SunkenTreasure }),
            new TaskDefinition({ id: 115, name: "Look for Land", cost_multiplier: 0.5, max_reps: 3, xp_mult: 8, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 116, name: "Practice Transforming", cost_multiplier: 1, xp_mult: 4, skills: [SkillType.Magic] }),
            new TaskDefinition({ id: 117, name: "Kraken", type: TaskType.Boss, cost_multiplier: 15000, xp_mult: 0.5, skills: [SkillType.Combat], item: ItemType.Calamari, unlocks_task: 118 }),
            new TaskDefinition({ id: 118, name: "Explore Kraken's Lair", cost_multiplier: 15000, skills: [SkillType.Search, SkillType.Magic], xp_mult: 0.6, perk: PerkType.DeepSeaDiving, hidden_by_default: true }),
        ],
    },
    {
        name: "The Island",
        tasks: [
            new TaskDefinition({ id: 120, name: "Hunt for the Second Reagent", type: TaskType.Travel, cost_multiplier: 8, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 121, name: "Gather Reagent", type: TaskType.Mandatory, cost_multiplier: 4, max_reps: 3, skills: [SkillType.Search, SkillType.Magic] }),
            new TaskDefinition({ id: 122, name: "Repair Ship", type: TaskType.Mandatory, cost_multiplier: 1.4, max_reps: 1, skills: [SkillType.Crafting] }),
            new TaskDefinition({ id: 123, name: "Catch More Fish", max_reps: 4, cost_multiplier: 1, skills: [SkillType.Crafting, SkillType.Search], item: ItemType.Fish }),
            new TaskDefinition({ id: 124, name: "Explore the Jungle", cost_multiplier: 6, max_reps: 6, skills: [SkillType.Search, SkillType.Travel, SkillType.Fortitude], perk: PerkType.LostTemple }),
            new TaskDefinition({ id: 125, name: "Build Another Hut", cost_multiplier: 2, max_reps: 1, xp_mult: 4, skills: [SkillType.Crafting] }),
            new TaskDefinition({ id: 126, name: "Talk to the Local Wildlife", cost_multiplier: 2, max_reps: 3, xp_mult: 2, skills: [SkillType.Magic, SkillType.Charisma] }),
            new TaskDefinition({ id: 127, name: "Horde of Lizardfolk", type: TaskType.Boss, cost_multiplier: 150_000, xp_mult: 0.5, skills: [SkillType.Combat], item: ItemType.OracleBones, unlocks_task: 128 }),
            new TaskDefinition({ id: 128, name: "Steal Their Oracle Bones", cost_multiplier: 8, max_reps: 4, skills: [SkillType.Subterfuge, SkillType.Search], item: ItemType.OracleBones, hidden_by_default: true }),
        ],
    },
    {
        name: "The Desert",
        tasks: [
            new TaskDefinition({ id: 130, name: "Enter the Oasis", type: TaskType.Travel, cost_multiplier: 7, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 131, name: "Overcome Mirage", type: TaskType.Mandatory, cost_multiplier: 6, max_reps: 1, skills: [SkillType.Fortitude] }),
            new TaskDefinition({ id: 132, name: "Find the Oasis", type: TaskType.Mandatory, cost_multiplier: 1, max_reps: 1, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 133, name: "Harvest Cactus", max_reps: 3, cost_multiplier: 0.8, skills: [SkillType.Crafting], item: ItemType.Cactus }),
            new TaskDefinition({ id: 134, name: "Avoid Notice by the Sandworm", cost_multiplier: 1, max_reps: 5, skills: [SkillType.Subterfuge], perk: PerkType.WalkWithoutRhythm }),
            new TaskDefinition({ id: 135, name: "Work on Your Tan", cost_multiplier: 1, max_reps: 3, xp_mult: 15, skills: [SkillType.Fortitude] }),
            new TaskDefinition({ id: 136, name: "Comb the Desert", cost_multiplier: 2, max_reps: 6, xp_mult: 10, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 137, name: "Giant Sandworm", type: TaskType.Boss, cost_multiplier: 600_000, xp_mult: 0.4, skills: [SkillType.Combat], item: ItemType.WormHideCoat, unlocks_task: 138 }),
            new TaskDefinition({ id: 138, name: "Learn to Dance the Worm", cost_multiplier: 600_000, xp_mult: 0.1, skills: [SkillType.Study, SkillType.Charisma], perk: PerkType.TheWorm, hidden_by_default: true }),
        ],
    },
    {
        name: "The Oasis",
        tasks: [
            new TaskDefinition({ id: 140, name: "Return to the Magician", type: TaskType.Travel, cost_multiplier: 8, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 141, name: "Banish Evil Spirit", type: TaskType.Mandatory, cost_multiplier: 250, max_reps: 3, skills: [SkillType.Magic] }),
            new TaskDefinition({ id: 142, name: "Gather Second Reagent", type: TaskType.Mandatory, cost_multiplier: 1.25, max_reps: 5, skills: [SkillType.Search] }),
            new TaskDefinition({ id: 143, name: "Bottle Oasis Water", max_reps: 4, cost_multiplier: 1, skills: [SkillType.Crafting], item: ItemType.OasisWater }),
            new TaskDefinition({ id: 144, name: "Reflect on the Journey", cost_multiplier: 30, max_reps: 5, skills: [SkillType.Study], perk: PerkType.ReflectionsOnTheJourney }),
            new TaskDefinition({ id: 145, name: "Prepare for the Journey Ahead", cost_multiplier: 2.5, max_reps: 3, xp_mult: 5, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 146, name: "Talk to the Djinn", cost_multiplier: 30, max_reps: 1, xp_mult: 10, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 147, name: "Sleepy Djinn", type: TaskType.Boss, cost_multiplier: 2_000_000, xp_mult: 0.3, skills: [SkillType.Combat], item: ItemType.DjinnLamp, unlocks_task: 148 }),
            new TaskDefinition({ id: 148, name: "Find More Lamps", cost_multiplier: 30, max_reps: 3, skills: [SkillType.Search, SkillType.Subterfuge], item: ItemType.DjinnLamp, hidden_by_default: true }),
        ],
    },
    {
        name: "The Ritual",
        tasks: [
            new TaskDefinition({ id: 150, name: "Begin Search for the Next Ritual", type: TaskType.Travel, cost_multiplier: 60, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 151, name: "Apologize for Stealing Reagents", type: TaskType.Mandatory, cost_multiplier: 150, max_reps: 3, skills: [SkillType.Charisma], xp_mult: 0.25 }),
            new TaskDefinition({ id: 152, name: "Rest for a While", type: TaskType.Mandatory, cost_multiplier: 1000, max_reps: 5, skills: [SkillType.Fortitude] }),
            new TaskDefinition({ id: 153, name: "Touch the Divine", type: TaskType.Prestige, max_reps: 1, cost_multiplier: 0.03, skills: [SkillType.Ascension], prestige_layer: PrestigeLayer.TouchTheDivine }),
            new TaskDefinition({ id: 154, name: "Infuse Mystic Incense", max_reps: 9, cost_multiplier: 100, skills: [SkillType.Magic], item: ItemType.MysticIncense }),
            new TaskDefinition({ id: 155, name: "Practice Memorization", cost_multiplier: 4000, max_reps: 5, skills: [SkillType.Study, SkillType.Magic], perk: PerkType.EnergeticMemory, xp_mult: 0.5 }),
            new TaskDefinition({ id: 156, name: "Guided Spellcasting", cost_multiplier: 100, max_reps: 3, xp_mult: 10, skills: [SkillType.Magic] }),
            new TaskDefinition({ id: 157, name: "Go for a Walk", cost_multiplier: 4, max_reps: 1, xp_mult: 8, skills: [SkillType.Search, SkillType.Travel] }),
        ],
    },
    {
        name: "The Dream",
        tasks: [
            new TaskDefinition({ id: 160, name: "Wake Up", type: TaskType.Travel, cost_multiplier: 350_000, skills: [SkillType.Magic], xp_mult: 0.25, perk: PerkType.Awakening }),
            new TaskDefinition({ id: 161, name: "Notice Signs You're in a Dream", type: TaskType.Mandatory, cost_multiplier: 2000, max_reps: 3, skills: [SkillType.Study, SkillType.Search], xp_mult: 0.2 }),
            new TaskDefinition({ id: 162, name: "Placate the Voices in Your Head", type: TaskType.Mandatory, cost_multiplier: 1500, max_reps: 1, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 163, name: "Gather Essence", max_reps: 2, cost_multiplier: 20000, skills: [SkillType.Magic], item: ItemType.MagicEssence }),
            new TaskDefinition({ id: 164, name: "Build Giant Tower", cost_multiplier: 60, max_reps: 2, skills: [SkillType.Crafting], xp_mult: 0.25, perk: PerkType.TowerOfBabel }),
            new TaskDefinition({ id: 165, name: "Talk to Mysterious Being", cost_multiplier: 100, max_reps: 5, xp_mult: 10, skills: [SkillType.Charisma] }),
            new TaskDefinition({ id: 166, name: "Travel the Plains", cost_multiplier: 200, max_reps: 3, xp_mult: 2, skills: [SkillType.Travel, SkillType.Fortitude] }),
            new TaskDefinition({ id: 167, name: "The Weaver of Dreams", type: TaskType.Boss, cost_multiplier: 100_000_000, xp_mult: 0.15, skills: [SkillType.Combat], item: ItemType.Dreamcatcher, unlocks_task: 168 }),
            new TaskDefinition({ id: 168, name: "Contain the Dream", cost_multiplier: 200_000_000, xp_mult: 0.05, skills: [SkillType.Magic], perk: PerkType.DreamPrism, hidden_by_default: true }),
        ],
    },
    {
        name: "The Metropolis",
        tasks: [
            new TaskDefinition({ id: 170, name: "Search for the Dragon's Hoard", type: TaskType.Travel, cost_multiplier: 100, skills: [SkillType.Travel], perk: PerkType.Awakening }),
            new TaskDefinition({ id: 171, name: "Figure Out the Next Ritual", type: TaskType.Mandatory, cost_multiplier: 1_000_000, max_reps: 3, skills: [SkillType.Magic, SkillType.Charisma], xp_mult: 0.05 }),
            new TaskDefinition({ id: 172, name: "Figure Out Where to Go Next", type: TaskType.Mandatory, cost_multiplier: 100_000, max_reps: 1, skills: [SkillType.Study], xp_mult: 0.2 }),
            new TaskDefinition({ id: 173, name: "Write Down Crafting Recipes", max_reps: 5, cost_multiplier: 5, skills: [SkillType.Crafting], item: ItemType.CraftingRecipe, xp_mult: 1 }),
            new TaskDefinition({ id: 174, name: "Improve Your Time Compression", cost_multiplier: 1_000_000, max_reps: 3, skills: [SkillType.Magic, SkillType.Study], xp_mult: 0.03, perk: PerkType.MajorTimeCompression }),
            new TaskDefinition({ id: 175, name: "Study at the Artificer Guild", cost_multiplier: 10000, max_reps: 5, xp_mult: 1, skills: [SkillType.Study, SkillType.Crafting] }),
            new TaskDefinition({ id: 176, name: "Practice in the Fighting Pits", cost_multiplier: 100_000, max_reps: 3, xp_mult: 1, skills: [SkillType.Combat] }),
            new TaskDefinition({ id: 177, name: "Mage's Guild Headmaster", type: TaskType.Boss, cost_multiplier: 11_000_000_000, xp_mult: 0.125, skills: [SkillType.Combat], item: ItemType.MagicRing, unlocks_task: 178 }),
            new TaskDefinition({ id: 178, name: "Become Honorary Headmaster", cost_multiplier: 65_000_000_000, max_reps: 5, xp_mult: 0.01, skills: [SkillType.Magic, SkillType.Charisma], perk: PerkType.Headmaster, hidden_by_default: true }),
        ],
    },
    {
        name: "The Foothills",
        tasks: [
            new TaskDefinition({ id: 180, name: "Enter the Dragon's Lair", type: TaskType.Travel, cost_multiplier: 100, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 181, name: "Find the Hidden Entrance", type: TaskType.Mandatory, cost_multiplier: 30_000, max_reps: 1, skills: [SkillType.Search], xp_mult: 0.05 }),
            new TaskDefinition({ id: 182, name: "Evade the Dragon", type: TaskType.Mandatory, cost_multiplier: 100, max_reps: 5, skills: [SkillType.Subterfuge], xp_mult: 0.2 }),
            new TaskDefinition({ id: 183, name: "Loot Dragon's Victims", max_reps: 4, cost_multiplier: 700, skills: [SkillType.Search], item: ItemType.KnightlyBoots, xp_mult: 0.5 }),
            new TaskDefinition({ id: 184, name: "Hide from the Dragon", cost_multiplier: 1_000, max_reps: 3, skills: [SkillType.Subterfuge], xp_mult: 0.1, perk: PerkType.HideInPlainSight }),
            new TaskDefinition({ id: 185, name: "Go on a Long Trek", cost_multiplier: 100, max_reps: 5, xp_mult: 5, skills: [SkillType.Travel, SkillType.Fortitude] }),
            new TaskDefinition({ id: 186, name: "Try to Turn into a Dragon", cost_multiplier: 10000, max_reps: 3, xp_mult: 2, skills: [SkillType.Magic] }),
            new TaskDefinition({ id: 187, name: "Dragon Spawn", type: TaskType.Boss, cost_multiplier: 25_000_000_000, xp_mult: 0.1, skills: [SkillType.Combat], item: ItemType.DragonScale, unlocks_task: 188 }),
            new TaskDefinition({ id: 188, name: "Gather Dragon Scales", cost_multiplier: 1_000_000, xp_mult: 0.1, max_reps: 3, skills: [SkillType.Search], item: ItemType.DragonScale, hidden_by_default: true }),
        ],
    },
    {
        name: "The Dragon's Lair",
        tasks: [
            new TaskDefinition({ id: 190, name: "Go to a Place of Power", type: TaskType.Travel, cost_multiplier: 100, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 191, name: "Grab the Reagent You Need", type: TaskType.Mandatory, cost_multiplier: 2_750_000, max_reps: 3, skills: [SkillType.Search, SkillType.Subterfuge], xp_mult: 0.001 }),
            new TaskDefinition({ id: 192, name: "Build a Contraption to Transport the Reagent", type: TaskType.Mandatory, cost_multiplier: 100, max_reps: 1, skills: [SkillType.Crafting], xp_mult: 0.2 }),
            new TaskDefinition({ id: 193, name: "Catch Some Insects for Later", max_reps: 9, cost_multiplier: 20, skills: [SkillType.Search], item: ItemType.CaveInsects }),
            new TaskDefinition({ id: 194, name: "Plan How to Kill the Dragon", cost_multiplier: 1_000_000, max_reps: 3, skills: [SkillType.Study], xp_mult: 0.1, perk: PerkType.DragonKillingPlan }),
            new TaskDefinition({ id: 195, name: "Hide from the Dragon Some More", cost_multiplier: 3_000, max_reps: 5, xp_mult: 5, skills: [SkillType.Subterfuge] }),
            new TaskDefinition({ id: 196, name: "Practice Magic Under Pressure", cost_multiplier: 5_000_000, max_reps: 3, xp_mult: 1.5, skills: [SkillType.Magic] }),
            new TaskDefinition({ id: 197, name: "Dragon", type: TaskType.Boss, cost_multiplier: 200_000_000_000, xp_mult: 0.02, skills: [SkillType.Combat], item: ItemType.DragonScale, unlocks_task: 198 }),
            new TaskDefinition({ id: 198, name: "Hunt Down the Dragon's Spawn", cost_multiplier: 3_000_000_000_000, xp_mult: 0.0001, skills: [SkillType.Combat, SkillType.Search], perk: PerkType.DragonSlayer,hidden_by_default: true }),
        ],
    },
    {
        name: "The Place of Power",
        tasks: [
            new TaskDefinition({ id: 200, name: "Journey Beyond", type: TaskType.Travel, cost_multiplier: 5000, skills: [SkillType.Travel] }),
            new TaskDefinition({ id: 201, name: "Gather Your Thoughts", type: TaskType.Mandatory, cost_multiplier: 2_000_000, max_reps: 5, skills: [SkillType.Study], xp_mult: 0.01 }),
            new TaskDefinition({ id: 202, name: "Apotheosize", type: TaskType.Mandatory, cost_multiplier: 2_000_000, max_reps: 2, skills: [SkillType.Ascension, SkillType.Fortitude], xp_mult: 0 }),
            new TaskDefinition({ id: 203, name: "Transcend Humanity", type: TaskType.Prestige, max_reps: 3, cost_multiplier: 0.5, skills: [SkillType.Ascension], xp_mult: 0.25, prestige_layer: PrestigeLayer.TranscendHumanity }),
            new TaskDefinition({ id: 204, name: "Imbue Magical Vessel", max_reps: 9, cost_multiplier: 100_000, skills: [SkillType.Magic], xp_mult: 0.1, item: ItemType.MagicalVessel }),
            new TaskDefinition({ id: 205, name: "Invent a New Spell", cost_multiplier: 300_000_000, max_reps: 3, skills: [SkillType.Magic], xp_mult: 0.01, perk: PerkType.UnifiedTheoryOfMagic }),
            new TaskDefinition({ id: 206, name: "Reflect on Past Obstacles", cost_multiplier: 300_000, max_reps: 5, xp_mult: 1, skills: [SkillType.Subterfuge, SkillType.Study] }),
            new TaskDefinition({ id: 207, name: "Prepare for a Greater Journey", cost_multiplier: 1000, max_reps: 3, xp_mult: 3, skills: [SkillType.Travel, SkillType.Fortitude] }),
        ],
    },
]

ZONES.forEach((zone, index) => {
    for (const task of zone.tasks) {
        task.zone_id = index;
    }
});

export const TASK_LOOKUP: Map<number, TaskDefinition> = new Map();
export const PERKS_BY_ZONE: PerkType[] = [];
export const ITEMS_BY_ZONE: ItemType[] = [];

ZONES.forEach((zone) => {
    for (const task of zone.tasks) {
        TASK_LOOKUP.set(task.id, task);
        if (task.perk != PerkType.Count && !PERKS_BY_ZONE.includes(task.perk)) {
            PERKS_BY_ZONE.push(task.perk);
        }
        if (task.item != ItemType.Count && !ITEMS_BY_ZONE.includes(task.item)) {
            ITEMS_BY_ZONE.push(task.item);
        }
    }
});
