import { Task, ZONES, TaskType, TASK_LOOKUP, TaskDefinition } from "./zones.js";
import { GAMESTATE } from "./game.js";
import { HASTE_MULT, ItemDefinition, ITEMS, ITEMS_TO_NOT_AUTO_USE, ItemType } from "./items.js";
import { PerkType } from "./perks.js";
import { SkillUpContext, EventType, RenderEvent, GainedPerkContext, UsedItemContext, UnlockedTaskContext, UnlockedSkillContext, EventContext } from "./events.js";
import { SKILL_DEFINITIONS, SkillDefinition, SkillType } from "./skills.js";
import { PRESTIGE_UNLOCKABLES, PRESTIGE_REPEATABLES, PrestigeRepeatableType, PrestigeUnlock, PrestigeUnlockType, PrestigeRepeatable, DIVINE_KNOWLEDGE_MULT, DIVINE_APPETITE_ENERGY_ITEM_BOOST_MULT, GOTTA_GO_FAST_BASE, PrestigeLayer, DIVINE_LIGHTNING_EXPONENT_INCREASE, TRANSCENDANT_APTITUDE_MULT } from "./prestige_upgrades.js";
import { AWAKENING_DIVINE_SPARK_MULT, ENERGETIC_MEMORY_MULT, MAJOR_TIME_COMPRESSION_EFFECT, REFLECTIONS_ON_THE_JOURNEY_BASE, REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE } from "./simulation_constants.js";

// MARK: Constants
let task_progress_mult = 1;
const ZONE_SPEEDUP_BASE = 1.05;

// MARK: Skills


export class Skill {
    type: SkillType;
    level: number = 0;
    progress: number = 0;
    speed_modifier: number = 1;

    constructor(type: SkillType, level: number) {
        this.type = type;
        this.level = level;
    }
}

export function calcSkillXp(task: Task, task_progress: number): number {
    const xp_mult = 8;
    let xp = task_progress * xp_mult * task.task_definition.xp_mult;

    if (hasPerk(PerkType.Writing)) {
        xp *= 1.5;
    }

    if (hasPrestigeUnlock(PrestigeUnlockType.DivineInspiration)) {
        xp *= 1.5;
    }

    xp *= 1 + getPrestigeRepeatableLevel(PrestigeRepeatableType.DivineKnowledge) * DIVINE_KNOWLEDGE_MULT;

    xp *= Math.pow(1.25, task.task_definition.zone_id);

    return xp;
}

export function calcSkillXpNeeded(skill: Skill): number {
    return calcSkillXpNeededAtLevel(skill.level, skill.type);
}

export function calcSkillXpNeededAtLevel(level: number, skill_type: SkillType): number {
    const exponent_base = 1.02;
    const base_amount = 10;
    const skill_modifier = (SKILL_DEFINITIONS[skill_type] as SkillDefinition).xp_needed_mult;

    return Math.pow(exponent_base, level) * base_amount * skill_modifier;
}

function addSkillXp(skill: SkillType, xp: number) {
    const skill_entry = getSkill(skill);

    skill_entry.progress += xp;
    let xp_to_level_up = calcSkillXpNeeded(skill_entry);

    const old_level = skill_entry.level;
    while (skill_entry.progress >= xp_to_level_up) {
        skill_entry.progress -= xp_to_level_up;
        skill_entry.level += 1;
        xp_to_level_up = calcSkillXpNeeded(skill_entry);
    }

    if (skill_entry.level > old_level) {
        const context: SkillUpContext = { skill: skill_entry.type, new_level: skill_entry.level, levels_gained: skill_entry.level - old_level };
        const event = new RenderEvent(EventType.SkillUp, context);
        GAMESTATE.queueRenderEvent(event);
    }
}

function removeTemporarySkillBonuses() {
    for (const skill of GAMESTATE.skills.values()) {
        skill.speed_modifier = 1;
    }
}

export function calcSkillTaskProgressMultiplierFromLevel(level: number): number {
    const exponent = 1.01;
    return Math.pow(exponent, level);
}

export function calcSkillTaskProgressWithoutLevel(skill_type: SkillType): number {
    let mult = 1;

    const skill = getSkill(skill_type);
    mult *= skill.speed_modifier;

    switch (skill_type) {
        case SkillType.Study:
            if (hasPerk(PerkType.Reading)) {
                mult *= 1.5;
            }
            break;
        case SkillType.Charisma:
            if (hasPerk(PerkType.VillagerGratitude)) {
                mult *= 1.5;
            }
            if (hasPerk(PerkType.VillageHero)) {
                mult *= 1.2;
            }
            if (hasPerk(PerkType.UndergroundConnection)) {
                mult *= 1.2;
            }
            if (hasPerk(PerkType.PurgedBureaucracy)) {
                mult *= 1.3;
            }
            if (hasPerk(PerkType.TheWorm)) {
                mult *= 1.5;
            }
            break;
        case SkillType.Magic:
            if (hasPerk(PerkType.Amulet)) {
                mult *= 1.5;
            }
            break;
        case SkillType.Subterfuge:
            if (hasPerk(PerkType.UndergroundConnection)) {
                mult *= 1.4;
            }
            if (hasPerk(PerkType.WalkWithoutRhythm)) {
                mult *= 1.4;
            }
            if (hasPerk(PerkType.HideInPlainSight)) {
                mult *= 1.5;
            }
            break;
        case SkillType.Combat:
            if (hasPerk(PerkType.VillageHero)) {
                mult *= 1.2;
            }
            if (hasPerk(PerkType.GoblinScourge)) {
                mult *= 1.3;
            }
            break;
        case SkillType.Survival:
            if (hasPerk(PerkType.SunkenTreasure)) {
                mult *= 1.3;
            }
            break;
        case SkillType.Fortitude:
            if (hasPerk(PerkType.GoblinScourge)) {
                mult *= 1.3;
            }
            if (hasPerk(PerkType.SunkenTreasure)) {
                mult *= 1.3;
            }
            break;
        case SkillType.Druid:
            if (hasPerk(PerkType.LostTemple)) {
                mult *= 1.5;
            }
            break;
        case SkillType.Travel:
            if (hasPerk(PerkType.ExperiencedTraveler)) {
                mult *= 1.5;
            }
            if (hasPerk(PerkType.WalkWithoutRhythm)) {
                mult *= 1.2;
            }
            break;
        case SkillType.Crafting:
            if (hasPerk(PerkType.PurgedBureaucracy)) {
                mult *= 1.3;
            }
            break;
    }

    switch (skill_type) {
        case SkillType.Combat:
        case SkillType.Fortitude:
            mult *= calcPowerSpeedBonusAtLevel(GAMESTATE.power);
            break;
    }

    if (calcAttunementSkills().includes(skill_type)) {
        mult *= calcAttunementSpeedBonusAtLevel(GAMESTATE.attunement);
    }

    return mult;
}

export function calcSkillTaskProgressMultiplier(skill_type: SkillType): number {
    const skill = getSkill(skill_type);
    let mult = calcSkillTaskProgressWithoutLevel(skill_type);
    mult *= calcSkillTaskProgressMultiplierFromLevel(skill.level);
    return mult;
}

export function getSkill(skill: SkillType): Skill {
    const ret = GAMESTATE.skills[skill];
    if (!ret) {
        console.error("Couldn't find skill");
        return new Skill(skill, 0);
    }
    return ret;
}

function initializeSkills() {
    GAMESTATE.skills = [];
    GAMESTATE.skills_at_start_of_reset = [];
    const global_target_level = getPrestigeRepeatableLevel(PrestigeRepeatableType.TranscendantAptitude) * TRANSCENDANT_APTITUDE_MULT;

    for (let i = 0; i < SkillType.Count; i++) {
        const target_level = i == SkillType.Ascension ? global_target_level / 2 : global_target_level;
        GAMESTATE.skills.push(new Skill(i, target_level));
        GAMESTATE.skills_at_start_of_reset.push(target_level);
    }
}

function storeLoopStartNumbersForNextGameOver() {
    for (let i = 0; i < SkillType.Count; i++) {
        GAMESTATE.skills_at_start_of_reset[i] = getSkill(i).level;
    }

    GAMESTATE.attunement_at_start_of_reset = GAMESTATE.attunement;
    GAMESTATE.power_at_start_of_reset = GAMESTATE.power;
}


// MARK: Tasks

export function calcTaskCost(task: Task): number {
    const base_cost = 10;
    const zone_exponent = 2.2;
    const zone_mult = Math.pow(zone_exponent, task.task_definition.zone_id);

    return base_cost * task.task_definition.cost_multiplier * zone_mult;
}

export function calcTaskProgressMultiplier(task: Task, ignore_haste = false): number {
    let mult = 1;

    let skill_level_mult = 1;
    for (const skill_type of task.task_definition.skills) {
        skill_level_mult *= calcSkillTaskProgressMultiplierFromLevel(getSkill(skill_type).level);
    }

    // Avoid multi-skill tasks scaling much faster than all other tasks
    mult *= Math.pow(skill_level_mult, 1 / task.task_definition.skills.length);

    let has_attunement_skill = false;
    for (const skill_type of task.task_definition.skills) {
        mult *= calcSkillTaskProgressWithoutLevel(skill_type);
        const is_attunement_skill = calcAttunementSkills().includes(skill_type);
        if (is_attunement_skill) {
            has_attunement_skill = true;
            mult /= calcAttunementSpeedBonusAtLevel(GAMESTATE.attunement);
        }
    }

    // The bonus gets truly ridiculous if we let it stack, so let's not
    if (has_attunement_skill) {
        mult *= calcAttunementSpeedBonusAtLevel(GAMESTATE.attunement);
    }

    mult *= Math.pow(GOTTA_GO_FAST_BASE, getPrestigeRepeatableLevel(PrestigeRepeatableType.GottaGoFast));

    if (!ignore_haste && task.hasted) {
        mult *= HASTE_MULT;
    }

    mult *= Math.pow(ZONE_SPEEDUP_BASE, task.task_definition.zone_id);

    if (hasPerk(PerkType.MajorTimeCompression)) {
        mult *= MAJOR_TIME_COMPRESSION_EFFECT;
    }

    if (hasPerk(PerkType.UnifiedTheoryOfMagic)) {
        mult *= Math.pow(1.02, GAMESTATE.highest_zone_fully_completed + 1);
    }

    return mult * task_progress_mult;
}

function calcTaskProgressPerTick(task: Task): number {
    return calcTaskProgressMultiplier(task);
}

function updateActiveTask() {
    let active_task = GAMESTATE.active_task;
    if (!active_task) {
        GAMESTATE.active_task = pickNextTaskInAutomationQueue();
        active_task = GAMESTATE.active_task;
    }
    if (!active_task) {
        return;
    }

    let progress = calcTaskProgressPerTick(active_task);
    const cost = calcTaskCost(active_task);
    progress = Math.min(progress, cost - active_task.progress);
    active_task.progress += progress;

    const is_single_tick = progress >= cost;
    modifyEnergy(-calcEnergyDrainPerTick(active_task, is_single_tick));

    for (const skill of active_task.task_definition.skills) {
        addSkillXp(skill, calcSkillXp(active_task, progress));
    }

    const finished_rep = active_task.progress >= cost;
    if (finished_rep) {
        applyFinishTaskRepEffects(active_task);
    } else {
        return;
    }

    if (is_single_tick && hasPerk(PerkType.MajorTimeCompression)) {
        while (active_task.reps < active_task.task_definition.max_reps) {
            applyFinishTaskRepEffects(active_task);
        }
    }

    const fully_finished = active_task.reps == active_task.task_definition.max_reps;
    if (fully_finished) {
        fullyFinishTask(active_task);
    }

    updateEnabledTasks();
    saveGame();

    if (!GAMESTATE.repeat_tasks || fully_finished) {
        GAMESTATE.active_task = null;
    } else if (!fully_finished && GAMESTATE.queued_scrolls_of_haste > 0) {
        active_task.hasted = true;
        GAMESTATE.queued_scrolls_of_haste--;
    }
}

export function clickTask(task: Task) {
    if (GAMESTATE.active_task == task) {
        GAMESTATE.active_task = null;
    }
    else {
        GAMESTATE.active_task = task;
        if (!task.hasted && GAMESTATE.queued_scrolls_of_haste > 0) {
            task.hasted = true;
            GAMESTATE.queued_scrolls_of_haste--;
        }
    }
}

function fullyFinishTask(task: Task) {
    if (task.task_definition.perk != PerkType.Count) {
        tryAddPerk(task.task_definition.perk);
    }

    if (task.task_definition.unlocks_task >= 0) {
        unlockTask(task.task_definition.unlocks_task);
    }

    if (task.task_definition.type == TaskType.Travel) {
        advanceZone();
    }

    if (task.task_definition.type == TaskType.Prestige && !GAMESTATE.prestige_available) {
        GAMESTATE.prestige_available = true;
        const event = new RenderEvent(EventType.PrestigeAvailable, {});
        GAMESTATE.queueRenderEvent(event);
    }

    if (task.task_definition.type == TaskType.Prestige && !GAMESTATE.prestige_layers_unlocked.includes(task.task_definition.prestige_layer))
    {
        GAMESTATE.prestige_layers_unlocked.push(task.task_definition.prestige_layer);
    }
}

function applyFinishTaskRepEffects(task: Task) {
    if (task.task_definition.item != ItemType.Count) {
        addItem(task.task_definition.item, 1);
    }

    task.reps += 1;
    if (task.reps < task.task_definition.max_reps) {
        task.progress = 0;
    }

    task.hasted = false;

    addPower(calcPowerGain(task));
    addAttunement(calcAttunementGain(task));

    const event = new RenderEvent(EventType.TaskCompleted, {});
    GAMESTATE.queueRenderEvent(event);
}

function updateEnabledTasks() {
    let has_unfinished_mandatory_task = false;

    for (const task of GAMESTATE.tasks) {
        const finished = task.reps >= task.task_definition.max_reps;
        task.enabled = !finished;
        has_unfinished_mandatory_task = has_unfinished_mandatory_task
            || (task.task_definition.type == TaskType.Mandatory && !finished)
            || (task.task_definition.type == TaskType.Prestige && !finished);
    }

    if (has_unfinished_mandatory_task) {
        for (const task of GAMESTATE.tasks) {
            if (task.task_definition.type == TaskType.Travel) {
                task.enabled = false;
            }
        }
    }
}

export function resetTasks() {
    initializeTasks();
    updateEnabledTasks();
    GAMESTATE.is_at_end_of_content = false;
}

function initializeTasks() {
    GAMESTATE.active_task = null;
    GAMESTATE.tasks = [];

    const zone = ZONES[GAMESTATE.current_zone];
    if (zone) {
        for (const task of zone.tasks) {
            if (task.hidden_by_default && !GAMESTATE.unlocked_tasks.includes(task.id)) {
                continue;
            }

            GAMESTATE.tasks.push(new Task(task));
            for (const skill of task.skills) {
                if (!GAMESTATE.unlocked_skills.includes(skill)) {
                    GAMESTATE.unlocked_skills.push(skill);
                    // Don't cause notifications when literally just starting the game
                    if (GAMESTATE.current_zone != 0) {
                        const context: UnlockedSkillContext = { skill: skill };
                        const event = new RenderEvent(EventType.UnlockedSkill, context);
                        GAMESTATE.queueRenderEvent(event);
                    }
                }
            }
        }
    }

    updateEnabledTasks();
}

export function toggleRepeatTasks() {
    GAMESTATE.repeat_tasks = !GAMESTATE.repeat_tasks;
}

function unlockTask(task_id: number) {
    if (GAMESTATE.unlocked_tasks.includes(task_id)) {
        return;
    }

    const task = TASK_LOOKUP.get(task_id) as TaskDefinition;
    GAMESTATE.unlocked_tasks.push(task_id);
    GAMESTATE.tasks.push(new Task(task));

    const context: UnlockedTaskContext = { task_definition: task };
    const event = new RenderEvent(EventType.UnlockedTask, context);
    GAMESTATE.queueRenderEvent(event);
}

function isTaskFullyCompleted(task: Task): boolean {
    return task.reps >= task.task_definition.max_reps;
}

// MARK: Energy

function modifyEnergy(delta: number) {
    GAMESTATE.current_energy += delta;
}

export function calcEnergyDrainPerTick(task: Task, is_single_tick: boolean): number {
    let drain = 1;

    if (is_single_tick && hasPerk(PerkType.MinorTimeCompression)) {
        drain *= 0.2;
    }

    if (hasPerk(PerkType.HighAltitudeClimbing)) {
        drain *= 0.8;
    }

    if (hasPerk(PerkType.ReflectionsOnTheJourney)) {
        const zone_diff = GAMESTATE.highest_zone - task.task_definition.zone_id;
        const base = hasPrestigeUnlock(PrestigeUnlockType.LookInTheMirror) ? REFLECTIONS_ON_THE_JOURNEY_BOOSTED_BASE : REFLECTIONS_ON_THE_JOURNEY_BASE;
        drain *= Math.pow(base, zone_diff);
    }

    drain *= Math.pow(ZONE_SPEEDUP_BASE, task.task_definition.zone_id);

    if (!is_single_tick && hasPerk(PerkType.MajorTimeCompression)) {
        drain *= MAJOR_TIME_COMPRESSION_EFFECT;
    }

    return drain;
}

function doAnyReset() {
    GAMESTATE.current_zone = 0;
    resetTasks();
    GAMESTATE.current_energy = GAMESTATE.max_energy;
    GAMESTATE.is_in_energy_reset = false;
    GAMESTATE.automation_mode = AutomationMode.Off;
    GAMESTATE.queued_scrolls_of_haste = 0;
    GAMESTATE.items_found_this_energy_reset = [];
    removeTemporarySkillBonuses();

}

function calcEnergeticMemoryGain() {
    if (!hasPerk(PerkType.EnergeticMemory)) {
        return 0;
    }
    let energy_gain = (GAMESTATE.current_zone + 1) * ENERGETIC_MEMORY_MULT;
    if (energy_gain > 1 && hasPrestigeUnlock(PrestigeUnlockType.TranscendantMemory)) {
        energy_gain *= energy_gain;
    }
    return energy_gain;
}

export function doEnergyReset() {
    GAMESTATE.max_energy += calcEnergeticMemoryGain();

    doAnyReset(); // Gotta be after the current_zone check
    GAMESTATE.energy_reset_count += 1;
    halveItemCounts();
    storeLoopStartNumbersForNextGameOver();

    saveGame();
}

export function calcItemEnergyGain(base_energy: number) {
    return base_energy * (1 + getPrestigeRepeatableLevel(PrestigeRepeatableType.DivineAppetite) * DIVINE_APPETITE_ENERGY_ITEM_BOOST_MULT);
}

// MARK: Items

export function addItem(item: ItemType, count: number) {
    const oldValue = GAMESTATE.items.get(item) ?? 0;
    GAMESTATE.items.set(item, oldValue + count);

    if (!GAMESTATE.items_found_this_energy_reset.includes(item)) {
        GAMESTATE.items_found_this_energy_reset.push(item);
    }

    const event = new RenderEvent(EventType.GainedItem, {});
    GAMESTATE.queueRenderEvent(event);
}

export function clickItem(item: ItemType, use_all: boolean) {
    const definition = ITEMS[item] as ItemDefinition;
    const old_value = GAMESTATE.items.get(item) ?? 0;

    if (old_value <= 0) {
        console.error("Not held item?");
        return;
    }

    const num_used = use_all ? old_value : 1;
    definition.on_consume(num_used);
    GAMESTATE.items.set(item, old_value - num_used);

    const context: UsedItemContext = { item: item, count: num_used };
    const event = new RenderEvent(EventType.UsedItem, context);
    GAMESTATE.queueRenderEvent(event);
}

function halveItemCounts() {
    for (const [key, value] of GAMESTATE.items) {
        GAMESTATE.items.set(key, Math.ceil(value / 2));
    }
}

function autoUseItems() {
    if (!GAMESTATE.auto_use_items) {
        return;
    }

    for (const [key, value] of GAMESTATE.items) {
        if (ITEMS_TO_NOT_AUTO_USE.includes(key)) {
            continue;
        }

        if (value > 0) {
            clickItem(key, true);
        }
    }
}

// MARK: Perks
function tryAddPerk(perk: PerkType, show_notification = true) {
    if (hasPerk(perk)) {
        return;
    }

    if (perk == PerkType.EnergySpell) {
        GAMESTATE.max_energy += 50;
    }

    GAMESTATE.perks.set(perk, true);
    console.log(show_notification);

    if (show_notification) {
        const context: GainedPerkContext = { perk: perk };
        const event = new RenderEvent(EventType.GainedPerk, context);
        GAMESTATE.queueRenderEvent(event);
    }
}

export function hasPerk(perk: PerkType): boolean {
    return GAMESTATE.perks.get(perk) == true;
}

export function knowsPerk(perk: PerkType): boolean {
    return GAMESTATE.perks.get(perk) != null;
}

// MARK: Extra stats

function addPower(amount: number) {
    if (amount <= 0) {
        return;
    }

    if (!GAMESTATE.has_unlocked_power) {
        const event = new RenderEvent(EventType.UnlockedPower, new EventContext());
        GAMESTATE.queueRenderEvent(event);
        GAMESTATE.has_unlocked_power = true;
    }
    GAMESTATE.power += amount;
}

export function calcPowerGain(task: Task) {
    if (task.task_definition.type != TaskType.Boss) {
        return 0;
    }

    const mult = task.task_definition.zone_id - 1; // First boss is zone 3, which is internally 2
    let powerAmount = 5 * mult;
    powerAmount *= Math.pow(2, getPrestigeRepeatableLevel(PrestigeRepeatableType.UnlimitedPower));
    return powerAmount;
}

export function calcPowerSpeedBonusAtLevel(level: number): number {
    return 1 + level / 100;
}

export function calcAttunementSpeedBonusAtLevel(level: number): number {
    return 1 + level / 1000;
}

function addAttunement(amount: number) {
    GAMESTATE.attunement += amount;
}

export function calcAttunementGain(task: Task): number {
    if (!hasPerk(PerkType.Attunement)) {
        return 0;
    }

    const attunement_skills = calcAttunementSkills();
    if (!attunement_skills.some(skill => task.task_definition.skills.includes(skill))) {
        return 0;
    }

    let value = task.task_definition.zone_id + 1;
    if (hasPrestigeUnlock(PrestigeUnlockType.DivineInspiration)) {
        value *= 2;
    }

    if (hasPrestigeUnlock(PrestigeUnlockType.FullyAttuned)) {
        value *= 1 + getPrestigeRepeatableLevel(PrestigeRepeatableType.DivineKnowledge) * DIVINE_KNOWLEDGE_MULT;
    }

    return value;
}

export function calcAttunementSkills() {
    const attunement_skills = [SkillType.Druid, SkillType.Magic, SkillType.Study];
    if (hasPrestigeUnlock(PrestigeUnlockType.FullyAttuned)) {
        attunement_skills.push(SkillType.Search);
    }

    return attunement_skills;
}

// MARK: Automation

export enum AutomationMode {
    All,
    Zone,
    Off,
}

export function toggleAutomation(task: Task) {
    if (!hasPerk(PerkType.DeepTrance)) {
        return;
    }

    if (!GAMESTATE.automation_prios.has(task.task_definition.zone_id)) {
        GAMESTATE.automation_prios.set(task.task_definition.zone_id, []);
    }

    const prios = GAMESTATE.automation_prios.get(task.task_definition.zone_id) as number[];
    if (prios.includes(task.task_definition.id)) {
        prios.splice(prios.indexOf(task.task_definition.id), 1);
    }
    else {
        prios.push(task.task_definition.id);
        // Ensure travel always happens last
        prios.sort((a, b) => {
            const task_a = TASK_LOOKUP.get(a) as TaskDefinition;
            const task_b = TASK_LOOKUP.get(b) as TaskDefinition;
            if (task_a.type == TaskType.Travel || task_b.type == TaskType.Travel) {
                return task_a.type == TaskType.Travel ? 1 : -1;
            }
            return 0;
        });
    }
}

function pickNextTaskInAutomationQueue(): Task | null {
    if (GAMESTATE.automation_mode == AutomationMode.Off) {
        return null;
    }

    const prios = GAMESTATE.automation_prios.get(GAMESTATE.current_zone);
    if (!prios) {
        return null;
    }

    for (const task_id of prios) {
        for (const task of GAMESTATE.tasks) {
            if (task.task_definition.id != task_id) {
                continue;
            }

            if (!task.enabled) {
                break
            }

            return task;
        }
    }

    return null;
}

export function setAutomationMode(mode: AutomationMode) {
    // If the player turns off automation they probably want to stop the ongoing task
    if (GAMESTATE.automation_mode != AutomationMode.Off && mode == AutomationMode.Off) {
        GAMESTATE.active_task = null;
    }

    GAMESTATE.automation_mode = mode;
}

// MARK: Energy Reset

export class EnergyResetInfo {
    skill_gains: [SkillType, number][] = [];
    power_at_start = 0;
    power_at_end = 0;
    attunement_at_start = 0;
    attunement_at_end = 0;
    energetic_memory_gain = 0;
}

function checkEnergyReset() {
    if (GAMESTATE.current_energy > 0) {
        return;
    }

    GAMESTATE.is_in_energy_reset = true;
    GAMESTATE.current_energy = 0;

    populateEnergyResetInfo();
}

function populateEnergyResetInfo() {
    const info = new EnergyResetInfo();

    for (let i = 0; i < SkillType.Count; i++) {
        const current_level = getSkill(i).level;
        const starting_level = GAMESTATE.skills_at_start_of_reset[i] as number;
        const skill_diff = current_level - starting_level;

        if (skill_diff > 0) {
            info.skill_gains.push([i, skill_diff]);
        }
    }

    // Biggest gain first
    info.skill_gains.sort((a, b) => b[1] - a[1]);

    info.power_at_end = GAMESTATE.power;
    info.power_at_start = GAMESTATE.power_at_start_of_reset;
    info.attunement_at_end = GAMESTATE.attunement;
    info.attunement_at_start = GAMESTATE.attunement_at_start_of_reset;
    info.energetic_memory_gain = calcEnergeticMemoryGain();

    GAMESTATE.energy_reset_info = info;
}

// MARK: Prestige

export function hasUnlockedPrestige() {
    return GAMESTATE.prestige_available || GAMESTATE.prestige_count > 0;
}

export const PRESTIGE_GAIN_EXPONENT = 3;
export const PRESTIGE_FULLY_COMPLETED_MULT = 3;
export const PRESTIGE_GAIN_DIVISOR = 100;

export function getPrestigeGainExponent() {
    return 3 + DIVINE_LIGHTNING_EXPONENT_INCREASE * getPrestigeRepeatableLevel(PrestigeRepeatableType.DivineLightning);
}

export function calcDivineSparkDivisor() {
    let divisor = PRESTIGE_GAIN_DIVISOR;
    if (hasPerk(PerkType.Awakening)) {
        divisor /= 1 + AWAKENING_DIVINE_SPARK_MULT;
    }

    return divisor;
}

export function calcDivineSparkGainFromHighestZone(zone: number) {
    return Math.pow(zone + 1, getPrestigeGainExponent()) / calcDivineSparkDivisor();
}

export function calcDivineSparkGainFromHighestZoneFullyCompleted(zone: number) {
    return Math.pow(zone + 1, getPrestigeGainExponent()) * PRESTIGE_FULLY_COMPLETED_MULT / calcDivineSparkDivisor();
}

export function calcDivineSparkGain() {
    let gain = 0;

    gain += calcDivineSparkGainFromHighestZone(GAMESTATE.highest_zone);
    gain += calcDivineSparkGainFromHighestZoneFullyCompleted(GAMESTATE.highest_zone_fully_completed);

    return Math.ceil(gain);
}

export function hasPrestigeUnlock(unlock: PrestigeUnlockType) {
    return GAMESTATE.prestige_unlocks.includes(unlock);
}

export function getPrestigeRepeatableLevel(repeatable: PrestigeRepeatableType) {
    return GAMESTATE.prestige_repeatables.get(repeatable) ?? 0;
}

export function addPrestigeUnlock(unlock: PrestigeUnlockType) {
    if (hasPrestigeUnlock(unlock)) {
        console.error("Already has prestige unlock");
        return;
    }

    const definition = PRESTIGE_UNLOCKABLES[unlock] as PrestigeUnlock;

    if (GAMESTATE.divine_spark < definition.cost) {
        console.error("Not enough prestige currency");
        return;
    }

    GAMESTATE.divine_spark -= definition.cost;
    GAMESTATE.prestige_unlocks.push(unlock);

    if (unlock == PrestigeUnlockType.PermanentAutomation) {
        tryAddPerk(PerkType.DeepTrance);
    } else if (unlock == PrestigeUnlockType.LookInTheMirror) {
        tryAddPerk(PerkType.ReflectionsOnTheJourney);
    } else if (unlock == PrestigeUnlockType.FullyAttuned) {
        tryAddPerk(PerkType.Attunement);
    } else if (unlock == PrestigeUnlockType.TranscendantMemory) {
        tryAddPerk(PerkType.EnergeticMemory);
    }
}

export function calcPrestigeRepeatableCost(repeatable: PrestigeRepeatableType) {
    const definition = PRESTIGE_REPEATABLES[repeatable] as PrestigeRepeatable;
    const current_level = getPrestigeRepeatableLevel(repeatable);
    const base_cost = definition.initial_cost;

    return Math.floor(base_cost * Math.pow(definition.scaling_exponent, current_level));
}

export function increasePrestigeRepeatableLevel(repeatable: PrestigeRepeatableType) {
    const cost = calcPrestigeRepeatableCost(repeatable);

    if (GAMESTATE.divine_spark < cost) {
        console.error("Not enough prestige currency");
        return;
    }

    const current_level = getPrestigeRepeatableLevel(repeatable);
    GAMESTATE.prestige_repeatables.set(repeatable, current_level + 1);
    GAMESTATE.divine_spark -= cost;

    if (repeatable == PrestigeRepeatableType.TranscendantAptitude) {
        const global_target_level = (current_level + 1) * TRANSCENDANT_APTITUDE_MULT;
        for (const skill of GAMESTATE.skills) {
            const target_level = skill.type == SkillType.Ascension ? global_target_level / 2 : global_target_level;
            skill.level = Math.max(target_level, skill.level);
        }
    }
}

function applyGameStartPrestigeEffects() {
    const show_notification = false;

    if (hasPrestigeUnlock(PrestigeUnlockType.PermanentAutomation)) {
        tryAddPerk(PerkType.DeepTrance, show_notification);
    }
    if (hasPrestigeUnlock(PrestigeUnlockType.LookInTheMirror)) {
        tryAddPerk(PerkType.ReflectionsOnTheJourney, show_notification);
    }
    if (hasPrestigeUnlock(PrestigeUnlockType.FullyAttuned)) {
        tryAddPerk(PerkType.Attunement, show_notification);
    }
    if (hasPrestigeUnlock(PrestigeUnlockType.TranscendantMemory)) {
        tryAddPerk(PerkType.EnergeticMemory, show_notification);
    }
}

export function doPrestige() {
    doAnyReset();
    GAMESTATE.prestige_count++;
    GAMESTATE.divine_spark += calcDivineSparkGain();

    // Reset most game state
    GAMESTATE.unlocked_tasks = [];
    GAMESTATE.highest_zone = 0;
    GAMESTATE.highest_zone_fully_completed = 0;
    initializeSkills();

    // We set these to false/zero rather than clearing it, so the player can still see everything they've unlocked in the past
    for (const perk of GAMESTATE.perks.keys()) {
        GAMESTATE.perks.set(perk, false);
    }
    for (const item of GAMESTATE.items.keys()) {
        GAMESTATE.items.set(item, 0);
    }

    GAMESTATE.energy_reset_info = new EnergyResetInfo();
    GAMESTATE.energy_reset_count = 0;
    GAMESTATE.max_energy = STARTING_ENERGY;
    GAMESTATE.current_energy = STARTING_ENERGY;
    GAMESTATE.power = 0;
    GAMESTATE.attunement = 0;
    GAMESTATE.prestige_available = false;
    GAMESTATE.auto_use_items = false;

    // Things not reset:
    // has_unlocked_power - No reason to hide that from the UI
    // unlocked_skills - No reason to hide that either
    // Any prestige variable, duh. Except prestige_available

    resetTasks();
    applyGameStartPrestigeEffects();
    storeLoopStartNumbersForNextGameOver();
    saveGame();
}

// MARK: Persistence

export const SAVE_LOCATION = "incrementalGameSave";

export function saveGame() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saveData: any = {};

    for (const key in GAMESTATE) {
        if (key == "active_task") {
            continue; // This would feel weird for the player if was persisted
        }
        if (key == "automation_mode") {
            continue;
        }

        if (Object.prototype.hasOwnProperty.call(GAMESTATE, key)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = (GAMESTATE as any)[key];
            // Check if the value is a Map and convert it to an array
            if (value instanceof Map) {
                saveData[key] = Array.from(value.entries());
            } else {
                saveData[key] = value;
            }
        }
    }

    // Save to localStorage
    const json = JSON.stringify(saveData, (key, value) => {
        if (typeof value === 'object' && value !== null && 'id' in value) {
            return value.id; // Replace object with its ID
        }
        return value;
    });

    localStorage.setItem(SAVE_LOCATION, json);
}

function parseSave(save: string): unknown {
    const data = JSON.parse(save, function (key, value) {
        if (key == "task_definition") {
            return TASK_LOOKUP.get(value); // Replace ID with the actual object
        }
        return value;
    });

    return data;
}

function loadGame(): boolean {
    const saved_game = localStorage.getItem(SAVE_LOCATION);
    if (!saved_game) {
        return false;
    }

    try {
        const data = parseSave(saved_game);
        loadGameFromData(data);
    } catch (e) {
        console.log(e);
        return false;
    }

    return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadGameFromData(data: any) {
    Object.keys(data).forEach(key => {
        const value = data[key];

        // Convert it back to a Map if that's what we want
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (GAMESTATE as any)[key] = (GAMESTATE as any)[key] instanceof Map ? new Map(value) : value;
    });
}

// MARK: Gamestate

const STARTING_ENERGY = 100;

export class Gamestate {
    tick_interval_ms = 100;

    tasks: Task[] = [];
    active_task: Task | null = null;
    unlocked_tasks: number[] = [];
    current_zone: number = 0;
    highest_zone: number = 0;
    highest_zone_fully_completed: number = -1;

    repeat_tasks = true;
    automation_mode = AutomationMode.Off;
    automation_prios: Map<number, number[]> = new Map();
    auto_use_items = false;

    skills_at_start_of_reset: number[] = [];
    power_at_start_of_reset = 0;
    attunement_at_start_of_reset = 0;

    skills: Skill[] = [];
    unlocked_skills: SkillType[] = [];
    perks: Map<PerkType, boolean> = new Map();
    items: Map<ItemType, number> = new Map();
    items_found_this_energy_reset: ItemType[] = [];
    queued_scrolls_of_haste = 0;

    is_in_energy_reset = false;
    is_at_end_of_content = false;
    energy_reset_info = new EnergyResetInfo();

    current_energy = STARTING_ENERGY;
    max_energy = STARTING_ENERGY;
    energy_reset_count = 0;

    power = 0;
    has_unlocked_power = false;

    attunement = 0;

    prestige_available = false;
    prestige_count = 0;
    divine_spark = 0;
    prestige_unlocks: PrestigeUnlockType[] = [];
    prestige_repeatables: Map<PrestigeRepeatableType, number> = new Map();
    prestige_layers_unlocked: PrestigeLayer[] = [];

    pending_render_events: RenderEvent[] = [];

    public start() {
        if (!loadGame()) {
            this.initialize();
        }
    }

    public initialize() {
        resetTasks();
        initializeSkills();
    }

    public popRenderEvents(): RenderEvent[] {
        const events = this.pending_render_events;
        this.pending_render_events = [];
        return events;
    }

    public queueRenderEvent(event: RenderEvent) {
        this.pending_render_events.push(event);
    }
}

function advanceZone() {
    if ((GAMESTATE.current_zone + 1) >= ZONES.length) {
        GAMESTATE.is_at_end_of_content = true;
        return;
    }

    if (GAMESTATE.tasks.every((task: Task) => { return isTaskFullyCompleted(task); })) {
        GAMESTATE.highest_zone_fully_completed = Math.max(GAMESTATE.highest_zone_fully_completed, GAMESTATE.current_zone);
    }


    GAMESTATE.current_zone += 1;
    GAMESTATE.highest_zone = Math.max(GAMESTATE.highest_zone, GAMESTATE.current_zone);
    if (GAMESTATE.automation_mode == AutomationMode.Zone) {
        GAMESTATE.automation_mode = AutomationMode.Off;
    }

    resetTasks();
}

export function updateGamestate() {
    if (GAMESTATE.is_in_energy_reset) {
        return;
    }

    updateActiveTask();
    autoUseItems();
    checkEnergyReset();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).setProgressMult = (new_mult: number) => task_progress_mult = new_mult;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).saveGame = () => saveGame();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).doEnergyReset = () => doEnergyReset();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).advanceZone = () => advanceZone();
