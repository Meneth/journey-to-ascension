import { Task, TaskDefinition, ZONES, TaskType, PERKS_BY_ZONE, ITEMS_BY_ZONE } from "./zones.js";
import { clickTask, Skill, calcSkillXpNeeded, calcSkillXpNeededAtLevel, calcTaskProgressMultiplier, calcSkillXp, calcEnergyDrainPerTick, clickItem, calcTaskCost, calcSkillTaskProgressMultiplier, getSkill, hasPerk, doEnergyReset, calcSkillTaskProgressMultiplierFromLevel, saveGame, SAVE_LOCATION, toggleRepeatTasks, calcAttunementGain, calcPowerGain, toggleAutomation, AutomationMode, calcPowerSpeedBonusAtLevel, calcAttunementSpeedBonusAtLevel, calcSkillTaskProgressWithoutLevel, setAutomationMode, hasUnlockedPrestige, calcDivineSparkGain, getPrestigeRepeatableLevel, hasPrestigeUnlock, calcPrestigeRepeatableCost, addPrestigeUnlock, increasePrestigeRepeatableLevel, doPrestige, knowsPerk, calcAttunementSkills, getPrestigeGainExponent, calcTickRate, willCompleteAllRepsInOneTick, isTaskDisabledDueToTooStrongBoss, BOSS_MAX_ENERGY_DISPARITY, undoItemUse, gatherItemBonuses, gatherPerkBonuses, getPowerSkills, SAVE_VERSION, setHasGottenPrepRunHint, calcDivineSparkGainFromHighestZone, knowsItem, setHasGottenBossHint } from "./simulation.js";
import { GAMESTATE, RENDERING, resetSave } from "./game.js";
import { ItemType, ItemDefinition, ITEMS, HASTE_MULT, ARTIFACTS, MAGIC_RING_MULT } from "./items.js";
import { PerkDefinition, PerkType, PERKS, getPerkNameWithEmoji } from "./perks.js";
import { EventType, GainedPerkContext, HighestZoneContext, RenderEvent, SkillUpContext, UnlockedSkillContext, UnlockedTaskContext, UsedItemContext } from "./events.js";
import { SKILL_DEFINITIONS, SkillDefinition, SkillType } from "./skills.js";
import { ATTUNEMENT_TEXT, DIVINE_SPARK_TEXT, ENERGY_TEXT, HASTE_TEXT, POWER_TEXT, TRAVEL_EMOJI, XP_TEXT } from "./rendering_constants.js";
import { PRESTIGE_UNLOCKABLES, PRESTIGE_REPEATABLES, PrestigeRepeatableType, DIVINE_KNOWLEDGE_MULT, DIVINE_APPETITE_ENERGY_ITEM_BOOST_MULT, GOTTA_GO_FAST_BASE, DIVINE_LIGHTNING_EXPONENT_INCREASE, TRANSCENDANT_APTITUDE_MULT, ENERGIZED_INCREASE } from "./prestige_upgrades.js";
import { CHANGELOG } from "./changelog.js";
import { CREDITS } from "./credits.js";
import { AWAKENING_DIVINE_SPARK_MULT } from "./simulation_constants.js";

// MARK: Helpers

function createChildElement(parent: Element, child_type: string): HTMLElement {
    const child = document.createElement(child_type);
    parent.appendChild(child);
    return child;
}

interface NumericInputOptions {
    min?: number;
    max?: number;
    step?: number;
    largeStep?: number;
    initialValue: number;
    onChange: (value: number) => void;
    onCommit?: (value: number) => void;
}

function createNumericInput(parent: Element, options: NumericInputOptions): HTMLInputElement {
    const { min = 1, max = 99, step = 1, largeStep = 10, initialValue, onChange, onCommit } = options;

    const wrapper = createChildElement(parent, "div");
    wrapper.className = "numeric-input-wrapper";

    const input = createChildElement(wrapper, "input") as HTMLInputElement;
    input.className = "numeric-input";
    input.type = "number";
    input.value = `${initialValue}`;
    input.min = `${min}`;
    input.max = `${max}`;

    const buttonsContainer = createChildElement(wrapper, "div");
    buttonsContainer.className = "numeric-input-buttons";

    const incrementBtn = createChildElement(buttonsContainer, "button") as HTMLButtonElement;
    incrementBtn.className = "numeric-input-button numeric-input-increment";
    incrementBtn.type = "button";

    const decrementBtn = createChildElement(buttonsContainer, "button") as HTMLButtonElement;
    decrementBtn.className = "numeric-input-button numeric-input-decrement";
    decrementBtn.type = "button";

    function clampValue(value: number): number {
        if (isNaN(value)) return min;
        return Math.max(min, Math.min(max, value));
    }

    function updateButtonStates() {
        const current = getCurrentValue();
        decrementBtn.classList.toggle("disabled", current <= min);
        incrementBtn.classList.toggle("disabled", current >= max);
    }

    function updateValue(newValue: number) {
        const clamped = clampValue(newValue);
        input.value = `${clamped}`;
        updateButtonStates();
        onChange(clamped);
    }

    function commitValue() {
        if (onCommit) {
            onCommit(getCurrentValue());
        }
    }

    function getCurrentValue(): number {
        return parseInt(input.value) || min;
    }

    updateButtonStates();

    decrementBtn.addEventListener("click", () => {
        updateValue(getCurrentValue() - step);
    });

    incrementBtn.addEventListener("click", () => {
        updateValue(getCurrentValue() + step);
    });

    let holdTimeout: number | null = null;
    let holdInterval: number | null = null;
    const HOLD_DELAY = 400;
    const HOLD_REPEAT = 80;

    function startHold(delta: number) {
        stopHold();
        holdTimeout = window.setTimeout(() => {
            holdInterval = window.setInterval(() => {
                updateValue(getCurrentValue() + delta);
            }, HOLD_REPEAT);
        }, HOLD_DELAY);
    }

    function stopHold() {
        if (holdTimeout) {
            clearTimeout(holdTimeout);
            holdTimeout = null;
        }
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    }

    // Click events, but also respond to holding down the mouse
    decrementBtn.addEventListener("mousedown", () => startHold(-step));
    incrementBtn.addEventListener("mousedown", () => startHold(step));

    document.addEventListener("mouseup", stopHold);

    // Keyboard events! Up/down increment/decrement by a small step (1), Page up, Page down by a large step (10)
    input.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
            event.preventDefault();
            updateValue(getCurrentValue() + step);
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            updateValue(getCurrentValue() - step);
        } else if (event.key === "PageUp") {
            event.preventDefault();
            updateValue(getCurrentValue() + largeStep);
        } else if (event.key === "PageDown") {
            event.preventDefault();
            updateValue(getCurrentValue() - largeStep);
        } else if (event.key === "Enter") {
            updateValue(getCurrentValue());
            input.blur();
        }
    });

    // Wheel handler for when focused (works anywhere on page)
    function handleWheelFocused(event: WheelEvent) {
        if (document.activeElement !== input) return;
        event.preventDefault();
        const delta = event.deltaY < 0 ? step : -step;
        updateValue(getCurrentValue() + delta);
    }

    // Wheel handler for when hovering (works on the wrapper)
    function handleWheelHover(event: WheelEvent) {
        // Don't double-handle if already focused
        if (document.activeElement === input) return;
        event.preventDefault();
        const delta = event.deltaY < 0 ? step : -step;
        updateValue(getCurrentValue() + delta);
    }

    // Hover-to-scroll: works when hovering over the input
    wrapper.addEventListener("wheel", handleWheelHover, { passive: false });

    // Focus-to-scroll: works anywhere when input is focused
    input.addEventListener("focus", () => {
        input.select();
        document.addEventListener("wheel", handleWheelFocused, { passive: false });
    });

    // Remove Focus-to-scroll listener when focus is lost
    input.addEventListener("focusout", () => {
        updateValue(getCurrentValue());
        document.removeEventListener("wheel", handleWheelFocused);
        commitValue();
    });

    return input;
}

export function joinWithCommasAndAnd(strings: string[]): string {
    if (strings.length === 0) return "";
    if (strings.length === 1) return strings[0] as string;
    if (strings.length === 2) return `${strings[0]} and ${strings[1]}`;

    const allButLast = strings.slice(0, -1).join(", ");
    const last = strings[strings.length - 1];
    return `${allButLast}, and ${last}`;
}

function createConfirmationOverlay(header_text: string, description_text: string, on_confirm: () => void) {
    const overlay = RENDERING.confirmation_overlay_element;
    overlay.innerHTML = "";

    const div = createChildElement(overlay, "div");
    div.className = "overlay-box confirmation";

    createChildElement(div, "h1").innerHTML = header_text;
    createChildElement(div, "p").innerHTML = description_text;

    const confirmation_buttons_div = createChildElement(div, "div");
    confirmation_buttons_div.className = "confirmation-buttons";

    const confirm_button = createChildElement(confirmation_buttons_div, "button");
    confirm_button.textContent = "Confirm";
    confirm_button.addEventListener("click", on_confirm);
    confirm_button.addEventListener("click", () => {overlay.classList.add("hidden");});
    setupTooltipStatic(confirm_button, header_text, "");

    const cancel_button = createChildElement(confirmation_buttons_div, "button");
    cancel_button.textContent = "Cancel";
    cancel_button.addEventListener("click", () => {overlay.classList.add("hidden");});
    setupTooltipStatic(cancel_button, "Cancel", "");

    overlay.classList.remove("hidden");
}

function areArraysEqual(array1: Array<unknown>, array2: Array<unknown>) {
    return array1.length === array2.length &&
        array1.every((value, index) => value === array2[index]);
}

function createTableSection(table: HTMLElement, name: string) {
    const row = createChildElement(table, "tr");
    createChildElement(row, "td").innerHTML = name;

    const contents = createChildElement(row, "td");
    const section = createChildElement(contents, "table");
    section.className = "table simple-table";

    return section;
}

function createTwoElementRow(table: HTMLElement, x: string, y: string) {
    const row = createChildElement(table, "tr");
    row.innerHTML = `<td>${x}</td><td>${y}</td>`;
}

function createThreeElementRow(table: HTMLElement, x: string, y: string, z: string) {
    const row = createChildElement(table, "tr");
    row.innerHTML = `<td>${x}</td><td>${y}</td><td>${z}</td>`;
}

// MARK: Skills

function createSkillDiv(skill: Skill, skills_div: HTMLElement) {
    const skill_div = document.createElement("div");
    skill_div.className = "skill";
    skill_div.classList.add("sidebar-item");

    const skill_definition = SKILL_DEFINITIONS[skill.type] as SkillDefinition;
    const name = document.createElement("div");
    name.className = "sidebar-item-text";
    name.textContent = `${skill_definition.icon}${skill_definition.name}`;

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = "0%";
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.appendChild(progressFill);

    skill_div.appendChild(name);
    skill_div.appendChild(progressBar);

    setupTooltip(skill_div, function () { return `${skill_definition.icon}${skill_definition.name} - Level ${skill.level}`; }, function () {
        let tooltip = `Speed multiplier: x${formatNumber(calcSkillTaskProgressMultiplier(skill.type))}`;
        const other_sources_mult = calcSkillTaskProgressWithoutLevel(skill.type);
        if (other_sources_mult != 1) {
            tooltip += `<br>From level: x${formatNumber(calcSkillTaskProgressMultiplierFromLevel(skill.level))}`;
            tooltip += `<br>From other sources: x${formatNumber(other_sources_mult)}`;
        }

        tooltip += `<br><br>${XP_TEXT}: ${formatNumber(skill.progress)}/${formatNumber(calcSkillXpNeeded(skill))}`;
        tooltip += `<br><br>Skill speed increases 1% per level, while ${XP_TEXT} needed to level up increases 2%`;
        tooltip += `<br>The speed of Tasks with multiple skills scale by the square or cube root of the skill level bonuses`;
        tooltip += `<br>Bonuses not from levels (E.G., from Items and Perks) are not scaled down this way`;
        return tooltip;
    });

    skills_div.appendChild(skill_div);
    RENDERING.skill_elements.set(skill.type, skill_div);
}

function recreateSkills() {
    const skills_div = document.getElementById("skills");
    if (!skills_div) {
        console.error("The element with ID 'skills' was not found.");
        return;
    }
    skills_div.innerHTML = "";

    for (const skill of GAMESTATE.skills) {
        if (GAMESTATE.unlocked_skills.includes(skill.type)) {
            createSkillDiv(skill, skills_div);
        }
    }
}

function updateSkillRendering() {
    for (const skill of GAMESTATE.skills) {
        if (!GAMESTATE.unlocked_skills.includes(skill.type)) {
            continue;
        }

        const element = RENDERING.skill_elements.get(skill.type) as HTMLElement;
        const fill = element.querySelector<HTMLDivElement>(".progress-fill");
        if (fill) {
            fill.style.width = `${skill.progress * 100 / calcSkillXpNeeded(skill)}%`;
        }

        const name = element.querySelector<HTMLDivElement>(".sidebar-item-text");
        if (name) {
            const skill_definition = SKILL_DEFINITIONS[skill.type] as SkillDefinition;
            const new_html = `<span>${skill_definition.icon}${skill_definition.name}</span><span>${skill.level}</span>`;
            // Avoid flickering in the debugger
            if (new_html != name.innerHTML) {
                name.innerHTML = new_html;
            }
        }
    }
}

export function getSkillString(type: SkillType) {
    const skill = SKILL_DEFINITIONS[type] as SkillDefinition;
    return `${skill.icon}${skill.name}`;
}

function calcTotalSkillXp(task: Task, completions: number) {
    let xp_boost_stacks = GAMESTATE.queued_magic_rings;
    if (task.xp_boosted) {
        xp_boost_stacks += 1;
    }

    const boost_completions = Math.min(completions, xp_boost_stacks);
    const non_boost_completion = completions - boost_completions;

    let xp = 0;
    let xp_per_completion = calcSkillXp(task, calcTaskCost(task), true);

    xp += xp_per_completion * non_boost_completion;
    xp_per_completion *= MAGIC_RING_MULT;
    xp += xp_per_completion * boost_completions;

    return xp;
}

function calcLevelsGained(type: SkillType, xp_gained: number ) {
    const skill_progress = getSkill(type);

    let resulting_level = skill_progress.level;
    let xp_needed = calcSkillXpNeeded(skill_progress) - skill_progress.progress;

    while (xp_gained > xp_needed) {
        xp_gained -= xp_needed;
        resulting_level += 1;
        xp_needed = calcSkillXpNeededAtLevel(resulting_level, type);
    }

    return resulting_level - skill_progress.level;
}

// MARK: Tasks

const TASK_TYPE_NAMES = ["Normal", "Travel", "Mandatory", "Prestige", "Boss"];

function createTaskDiv(task: Task, tasks_div: HTMLElement, rendering: Rendering) {
    const task_div = document.createElement("div");
    task_div.className = "task";
    task_div.classList.add(Object.values(TaskType)[task.task_definition.type] as string);

    const task_upper_div = document.createElement("div");
    task_upper_div.className = "task-upper";

    const task_button = document.createElement("button");
    task_button.className = "task-button";
    task_button.textContent = `${task.task_definition.name}`;
    task_button.addEventListener("click", () => {
        // We do this just via classes rather than the disabled propery
        // As Firefox would also disable right-clicking otherwise
        if (!task_button.classList.contains("disabled")) {
            clickTask(task); 
        }
    });
    task_button.addEventListener("contextmenu", (e) => { e.preventDefault(); toggleAutomation(task.task_definition); });

    if (task.task_definition.type == TaskType.Prestige && !GAMESTATE.prestige_available) {
        task_button.classList.add("prestige-glow");
    }

    const task_automation = document.createElement("div");
    task_automation.className = "task-automation";
    task_button.appendChild(task_automation);

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";
    progressFill.style.width = "0%";
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.appendChild(progressFill);

    const skillsUsed = document.createElement("p");
    skillsUsed.className = "skills-used-text";
    let skillText = "Skills: ";
    const skillStrings: string[] = [];
    for (const skill of task.task_definition.skills) {
        const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;
        skillStrings.push(`${skill_definition.icon}${skill_definition.name}`);
    }
    skillText += skillStrings.join(", ");
    skillsUsed.textContent = skillText;

    if (task.task_definition.item != ItemType.Count) {
        const item_indicator = document.createElement("div");
        item_indicator.className = "task-item-indicator";
        item_indicator.classList.add("indicator");
        item_indicator.textContent = (ITEMS[task.task_definition.item] as ItemDefinition).icon;
        task_button.appendChild(item_indicator);
    }

    if (task.task_definition.perk != PerkType.Count && !hasPerk(task.task_definition.perk)) {
        const perk_indicator = document.createElement("div");
        perk_indicator.className = "task-perk-indicator";
        perk_indicator.classList.add("indicator");
        perk_indicator.textContent = (PERKS[task.task_definition.perk] as PerkDefinition).icon;
        task_button.appendChild(perk_indicator);
        task_button.classList.add("unlock");
    }

    if (ARTIFACTS.includes(task.task_definition.item)) {
        if (!knowsItem(task.task_definition.item)) {
            task_button.classList.add("unlock");
        }
    }

    const task_reps_div = document.createElement("div");
    task_reps_div.className = "task-reps";

    if (task.task_definition.type != TaskType.Travel) {
        for (let i = 0; i < task.task_definition.max_reps; ++i) {
            const task_rep_div = document.createElement("div");
            task_rep_div.className = "task-rep";
            task_reps_div.appendChild(task_rep_div);
        }
    }

    task_upper_div.appendChild(task_button);
    task_upper_div.appendChild(task_reps_div);

    task_div.appendChild(skillsUsed);
    task_div.appendChild(progressBar);
    task_div.appendChild(task_upper_div);

    setupTooltip(task_div, function () { return `${task.task_definition.name}`; }, function () {
        const task_type = TASK_TYPE_NAMES[task.task_definition.type];
        let tooltip = `<p class="subheader ${task_type}">${task_type} Task</p>`;

        if (!task.enabled) {
            if (task.task_definition.type == TaskType.Travel) {
                const has_prestige_task = GAMESTATE.tasks.find((task) => { return task.task_definition.type == TaskType.Prestige; });

                tooltip += `<p class="disable-reason">Disabled until you complete the <span class="Mandatory">Mandatory</span>${has_prestige_task ? ` and <span class="Prestige">Prestige</span>` : ``} tasks</p>`;
            }
            else if (task.reps >= task.task_definition.max_reps) {
                tooltip += `<p class="disable-reason">Disabled due to being fully completed</p>`;
            }
            else if (isTaskDisabledDueToTooStrongBoss(task)) {
                tooltip += `<p class="disable-reason">Disabled due to this Boss requiring more than ${BOSS_MAX_ENERGY_DISPARITY}x your current ${ENERGY_TEXT}</p>`;
            }
            else {
                console.error("Task disabled for unknown reason");
            }
        }

        const task_table = document.createElement("table");
        task_table.className = "table simple-table";

        let asterisk_count = 0;
        let perk_asterisk_index = -1;
        let partial_skill_gain_asterisk_index = -1;
        let haste_asterisk_index = -1;
        let magic_ring_asterisk_index = -1;

        const remaining_completions = (task.reps == task.task_definition.max_reps) ? task.task_definition.max_reps : (task.task_definition.max_reps - task.reps);
        const single_rep_for_all_ticks = willCompleteAllRepsInOneTick(task);
        const completions = (GAMESTATE.repeat_tasks || single_rep_for_all_ticks) ? remaining_completions : 1;
        const expected_completions = calcExpectedCompletions(task, completions);
        const haste_stacks = task.hasted ? GAMESTATE.queued_scrolls_of_haste + 1 : GAMESTATE.queued_scrolls_of_haste;
        const magic_ring_stacks = task.xp_boosted ? GAMESTATE.queued_magic_rings + 1 : GAMESTATE.queued_magic_rings;

        if (task.task_definition.max_reps > 1) {
            const table = createTableSection(task_table, "Completions");
            createTwoElementRow(table, "", `${completions}`);
        }

        {
            let table: HTMLElement | null = null;
            function getOrCreateTable() {
                if (!table) {
                    table = createTableSection(task_table, "Rewards");
                }

                return table;
            }

            if (task.task_definition.type == TaskType.Travel) {
                createTwoElementRow(getOrCreateTable(), `${TRAVEL_EMOJI}Move to Zone`, `${task.task_definition.zone_id + 2}`);
            }

            if (task.task_definition.item != ItemType.Count) {
                const item = ITEMS[task.task_definition.item] as ItemDefinition;
                const plural = completions > 1;
                createTwoElementRow(getOrCreateTable(), `${item.icon}${item.name} ${plural ? "Items" : "Items"}`, `${completions}`);
            }

            if (task.task_definition.perk != PerkType.Count && !hasPerk(task.task_definition.perk)) {
                const perk = PERKS[task.task_definition.perk] as PerkDefinition;
                const is_last_rep = (task.reps + completions) == task.task_definition.max_reps;
                if (!is_last_rep) { perk_asterisk_index = ++asterisk_count; }
                createTwoElementRow(getOrCreateTable(), `${perk.icon}${knowsPerk(perk.enum) ? perk.name : "Mystery"} Perk`, is_last_rep ? `1` : `0${"*".repeat(perk_asterisk_index)}`);
            }

            const attunement_gain = completions * calcAttunementGain(task);
            if (attunement_gain > 0) {
                createTwoElementRow(getOrCreateTable(), `🌀Attunement`, `${attunement_gain}`);
            }

            const power_gain = completions * calcPowerGain(task);
            if (power_gain > 0 && GAMESTATE.has_unlocked_power) {
                createTwoElementRow(getOrCreateTable(), `💪Power`, `${power_gain}`);
            }
        }

        {
            let skill_gain_text = "Skill Gains";
            if (completions != expected_completions) {
                partial_skill_gain_asterisk_index = ++asterisk_count;
                skill_gain_text += "*".repeat(partial_skill_gain_asterisk_index);
            }
            const table = createTableSection(task_table, skill_gain_text);
            const xp_gained = calcTotalSkillXp(task, completions);
            const xp_gained_before_energy_runs_out = calcTotalSkillXp(task, expected_completions);

            for (const skill of task.task_definition.skills) {
                const skill_progress = getSkill(skill);
                const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;

                let levels = ``;

                const levels_diff = calcLevelsGained(skill, xp_gained);
                const expected_levels_diff = calcLevelsGained(skill, xp_gained_before_energy_runs_out);
                if (levels_diff == expected_levels_diff) {
                    if (levels_diff > 0) {
                        levels = `${levels_diff}`;
                    } else {
                        const level_percentage = xp_gained / calcSkillXpNeeded(skill_progress);
                        if (level_percentage < 0.01) {
                            levels = `<0.01`;
                        } else if (completions == expected_completions) {
                            levels = `${formatNumber(level_percentage)}`;
                        } else {
                            const expected_level_percentage = xp_gained_before_energy_runs_out / calcSkillXpNeeded(skill_progress);
                            levels = `${formatNumber(expected_level_percentage)}-${formatNumber(level_percentage)}`;
                        }
                    }
                } else {
                    levels = `${expected_levels_diff}-${levels_diff}`;
                }

                createTwoElementRow(table, `${skill_definition.icon}${skill_definition.name}`, levels);
            }
        }

        {
            const table = createTableSection(task_table,"Cost Estimate");

            const energy_cost = estimateTotalTaskEnergyConsumption(task, completions);
            const energy_cost_ratio = energy_cost / GAMESTATE.current_energy;
            let energy_cost_class = "";
            if (energy_cost_ratio < 0.05) {
                energy_cost_class = "very-low";
            } else if (energy_cost_ratio < 0.5) {
                energy_cost_class = "low";
            } else if (energy_cost_ratio < 0.75) {
                energy_cost_class = "normal";
            } else if (energy_cost_ratio < 1.0) {
                energy_cost_class = "high";
            } else if (energy_cost_ratio < 1.25) {
                energy_cost_class = "very-high";
            } else {
                energy_cost_class = "extreme";
            }

            const energy_cost_text = `<span class="${energy_cost_class}">${formatNumber(energy_cost)}</span>`;
            createTwoElementRow(table, ENERGY_TEXT, `${energy_cost_text}`);

            const task_ticks = estimateTotalTaskTicks(task, completions);
            if (task_ticks > completions) {
                createTwoElementRow(table, `⏰Seconds`, formatNumber(estimateTaskTimeInSeconds(task, completions)));
            } else {
                createTwoElementRow(table, `⏰Ticks`, `${task_ticks}`);
            }
        }

        {
            let table: HTMLElement | null = null;
            function getOrCreateTable() {
                if (!table) {
                    table = createTableSection(task_table, "Modifiers");
                }

                return table;
            }

            if (haste_stacks > 0) {
                const needs_asterisk = haste_stacks < completions && !single_rep_for_all_ticks;
                if (needs_asterisk) {
                    haste_asterisk_index = ++asterisk_count;
                }
                createTwoElementRow(getOrCreateTable(), `${HASTE_TEXT}${needs_asterisk ? "*".repeat(haste_asterisk_index) : ""}`, `<span class="good">x${HASTE_MULT}</span>`);
            }

            if (magic_ring_stacks > 0) {
                const needs_asterisk = magic_ring_stacks < completions && !single_rep_for_all_ticks;
                if (needs_asterisk) {
                    magic_ring_asterisk_index = ++asterisk_count;
                }
                createTwoElementRow(getOrCreateTable(), `${XP_TEXT} (Magic Ring)${needs_asterisk ? "*".repeat(magic_ring_asterisk_index) : ""}`, `<span class="good">x${MAGIC_RING_MULT}</span>`);
            }
        }

        tooltip += task_table.outerHTML;

        if (perk_asterisk_index >= 0) {
            tooltip += `<p class="tooltip-asterisk">${"*".repeat(perk_asterisk_index)} Perk is only gained on completing all Reps of the Task</p>`;
        }
        if (partial_skill_gain_asterisk_index >= 0) {
            tooltip += `<p class="tooltip-asterisk">${"*".repeat(partial_skill_gain_asterisk_index)} Skill gain as range since you're expected to run out of ${ENERGY_TEXT} before fully completing this Task</p>`;
        }
        if (haste_asterisk_index >= 0) {
            tooltip += `<p class="tooltip-asterisk">${"*".repeat(haste_asterisk_index)} Haste will only apply to the first ${haste_stacks} reps</p>`;
        }
        if (magic_ring_asterisk_index >= 0) {
            tooltip += `<p class="tooltip-asterisk">${"*".repeat(magic_ring_asterisk_index)} Magic Ring will only apply to the first ${magic_ring_stacks} reps</p>`;
        }

        return tooltip;
    });

    tasks_div.appendChild(task_div);
    rendering.task_elements.set(task.task_definition, task_div);
}

function recreateTasks() {
    RENDERING.createTasks();
}

function updateTaskRendering() {
    for (const task of GAMESTATE.tasks) {
        const task_element = RENDERING.task_elements.get(task.task_definition) as HTMLElement;
        const fill = task_element.querySelector<HTMLDivElement>(".progress-fill");
        if (fill) {
            fill.style.width = `${task.progress * 100 / calcTaskCost(task)}%`;
        }
        else {
            console.error("No progress-fill");
        }

        const button = task_element.querySelector<HTMLInputElement>(".task-button");
        if (button) {
            button.classList.toggle("disabled", !task.enabled);
        }
        else {
            console.error("No task-button");
        }

        const automation = task_element.querySelector<HTMLDivElement>(".task-automation");
        if (automation) {
            let prios = GAMESTATE.automation_prios.get(GAMESTATE.current_zone) ?? [];
            prios = prios.filter((task_id) => {
                return GAMESTATE.tasks.find((task) => { return task.task_definition.id == task_id; }) != undefined;
            });
            const index = prios.indexOf(task.task_definition.id);
            const index_str = index >= 0 ? `${index + 1}` : "";
            if (automation.textContent != index_str) {
                automation.textContent = index_str;
            }
        }
        else {
            console.error("No task-automation");
        }

        if (task.task_definition.type != TaskType.Travel) {
            const reps = task_element.getElementsByClassName("task-rep");
            for (let i = 0; i < task.reps; ++i) {
                (reps[i] as HTMLElement).classList.add("finished");
            }
        }
    }
}

function calcExpectedCompletions(task: Task, desired_completions: number) {
    const {normal, haste, haste_completions} = calcSplitTotalTaskTicks(task, desired_completions);

    const cost_per_tick = calcEnergyDrainPerTick(task, (normal + haste) <= desired_completions);
    let remaining_energy = GAMESTATE.current_energy;

    const haste_cost = haste * cost_per_tick;
    const normal_cost = normal * cost_per_tick;

    if (haste_cost + normal_cost <= remaining_energy) {
        return desired_completions;
    }

    const actual_haste_completions = Math.min(remaining_energy / haste_cost, 1) * haste_completions;
    if (actual_haste_completions < haste_completions) {
        return actual_haste_completions;
    }

    remaining_energy -= haste_cost;
    return haste_completions + Math.min(remaining_energy / normal_cost, 1) * (desired_completions - haste_completions);
}

function calcSplitTotalTaskTicks(task: Task, completions: number) {
    if (willCompleteAllRepsInOneTick(task)) {
        return {normal: 1, haste: 0, haste_completions: 0}; // Major Time Compression combines all single-tick reps
    }

    let progress_mult = calcTaskProgressMultiplier(task, false);
    let haste_stacks = GAMESTATE.queued_scrolls_of_haste;
    if (task.hasted) {
        haste_stacks += 1;
    }
    const haste_completions = Math.min(completions, haste_stacks);
    const non_haste_completions = completions - haste_completions;
    const normal_ticks = Math.ceil(calcTaskCost(task) / progress_mult) * non_haste_completions;
    progress_mult *= HASTE_MULT;
    const haste_ticks = Math.ceil(calcTaskCost(task) / progress_mult) * haste_completions;

    return {normal: normal_ticks, haste: haste_ticks, haste_completions: haste_completions};
}

function estimateTotalTaskTicks(task: Task, completions: number): number {
    const {normal, haste} = calcSplitTotalTaskTicks(task, completions);
    return normal + haste;
}

function estimateTaskTimeInSeconds(task: Task, completions: number): number {
    return estimateTotalTaskTicks(task, completions) * calcTickRate() / 1000;
}

// MARK: Energy
function updateEnergyRendering() {
    const fill = RENDERING.energy_element.querySelector<HTMLDivElement>(".progress-fill");
    if (fill) {
        fill.style.width = `${GAMESTATE.current_energy * 100 / GAMESTATE.max_energy}%`;
    }

    const value = RENDERING.energy_element.querySelector<HTMLDivElement>(".progress-value");
    if (value) {
        const new_html = `${GAMESTATE.current_energy.toFixed(0)}`;
        // Avoid flickering in the debugger
        if (new_html != value.innerHTML) {
            value.textContent = new_html;
        }
    }

    const energy_percentage = GAMESTATE.current_energy / GAMESTATE.max_energy;
    RENDERING.energy_element.classList.toggle("low-energy", energy_percentage < 0.15);
}

function estimateTotalTaskEnergyConsumption(task: Task, completions: number): number {
    const num_ticks = estimateTotalTaskTicks(task, completions);
    // Note that this will be an overestimate if you use haste to get stuff down to 1 tick
    // Not fixing atm because why would you ever do that? And pessimism isn't too bad
    return num_ticks * calcEnergyDrainPerTick(task, num_ticks <= completions);
}

// MARK: Tooltips
type tooltipLambda = () => string;
interface ElementWithTooltip extends HTMLElement {
    generateTooltipHeader?: tooltipLambda;
    generateTooltipBody?: tooltipLambda;
}

function setupTooltip(element: ElementWithTooltip, header_callback: tooltipLambda, body_callback: tooltipLambda) {
    element.generateTooltipHeader = header_callback;
    element.generateTooltipBody = body_callback;
    element.addEventListener("pointerenter", (event) => {
        RENDERING.potential_tooltipped_element = element;
        if (!GAMESTATE.manual_tooltips || event.ctrlKey) {
            showTooltip(element);
        }
    });
    element.addEventListener("pointerleave", () => {
        hideTooltip();
        RENDERING.potential_tooltipped_element = null;
    });
}

function setupTooltipStaticHeader(element: ElementWithTooltip, header: string, body_callback: tooltipLambda) {
    setupTooltip(element, () => { return header; }, body_callback);
}

function setupTooltipStatic(element: ElementWithTooltip, header: string, body: string) {
    setupTooltip(element, () => { return header; }, () => { return body; });
}

function setupInfoTooltips() {
    const item_info = document.querySelector<HTMLElement>("#items .section-info");

    if (!item_info) {
        console.error("No item info element");
        return;
    }

    setupTooltipStaticHeader(item_info, `Items`, function () {
        let tooltip = `Items can be used to get bonuses that last until the next Energy Reset`;
        tooltip += `<br>The bonuses stack additively; 2 +100% results in 3x speed, not 4x`;
        tooltip += `<br>Bonuses to different Task types stack multiplicatively with one another`;
        tooltip += `<br><br>Right-click to use all rather than just one`;
        
        tooltip += `<br><br>Current Skill bonuses:`;

        const table = document.createElement("table");
        table.className = "table simple-table";

        createThreeElementRow(table, "<h3>Skill</h3>", "<h3>Item(s)</h3>", "<h3>Bonus</h3>");

        for (const skill_type of GAMESTATE.unlocked_skills) {
            const skill = getSkill(skill_type);
            if (skill.speed_modifier <= 1) {
                continue;
            }

            let items_string = "";
            const item_bonuses = gatherItemBonuses(skill_type);
            for (const [item_type,] of item_bonuses) {
                items_string += ITEMS[item_type]?.icon;
            }

            createThreeElementRow(table, getSkillString(skill_type), items_string, `+${formatNumber((skill.speed_modifier - 1) * 100, false)}%`);
        }

        if (table.children.length == 1) {
            tooltip += "<br>None";
        } else {
            tooltip += table.outerHTML;
        }
        
        return tooltip;
    });

    const artifact_info = document.querySelector<HTMLElement>("#artifacts .section-info");

    if (!artifact_info) {
        console.error("No artifact info element");
        return;
    }

    setupTooltipStaticHeader(artifact_info, `Artifacts`, function () {
        let tooltip = `Artifacts are special Items with powerful single-use effects`;
        tooltip += `<br>The effects apply to just a single rep of the next Task started`;
        tooltip += `<br>They otherwise behave identically to other Items`;
        tooltip += `<br>That includes keeping half after ${ENERGY_TEXT} resets`;
        return tooltip;
    });

    const perk_info = document.querySelector<HTMLElement>("#perks .section-info");

    if (!perk_info) {
        console.error("No perk info element");
        return;
    }

    setupTooltipStaticHeader(perk_info, `Perks`, function () {
        let tooltip = `Perks are permanent bonuses with a variety of effects`;
        tooltip += `<br>The bonuses stack multiplicatively; 2 +100% results in 4x speed, not 3x`;

        tooltip += `<br><br>Current Skill bonuses:`;

        const table = document.createElement("table");
        table.className = "table simple-table";

        createThreeElementRow(table, "<h3>Skill</h3>", "<h3>Perk(s)</h3>", "<h3>Bonus</h3>");

        for (const skill_type of GAMESTATE.unlocked_skills) {
            const perk_bonuses = gatherPerkBonuses(skill_type);
            if (perk_bonuses.length <= 0) {
                continue;
            }

            let total_effect = 1;
            let perks_string = "";
            for (const perk_type of perk_bonuses) {
                const perk = PERKS[perk_type] as PerkDefinition;
                perks_string += perk.icon;
                total_effect *= 1 + perk.skill_modifiers.getSkillEffect(skill_type);
            }

            createThreeElementRow(table, getSkillString(skill_type), perks_string, `x${formatNumber(total_effect)}`);
        }

        if (table.children.length == 1) {
            tooltip += "<br>None";
        } else {
            tooltip += table.outerHTML;
        }

        return tooltip;
    });
}

function queueUpdateTooltip() {
    if (RENDERING.tooltipped_element) {
        RENDERING.queued_update_tooltip = true;
    }
}

// MARK: Items

function createItemDiv(item: ItemType, items_div: HTMLElement) {
    const button = createChildElement(items_div, "button") as HTMLButtonElement;
    button.className = "item-button";
    button.classList.add("element");

    const item_definition = ITEMS[item] as ItemDefinition;
    button.innerHTML = `<span class="text">${item_definition.icon}</span>`;

    const count_text = createChildElement(button, "p");
    count_text.className = "item-count";

    button.addEventListener("click", () => { clickItem(item, false); });
    button.addEventListener("contextmenu", (e) => { e.preventDefault(); clickItem(item, true); });

    setupTooltipStatic(button, `${item_definition.name}`, `${item_definition.getTooltip()}`);

    RENDERING.item_elements.set(item, button);
}

function setupItemUndoForButton(button: HTMLInputElement) {
    button.addEventListener("click", () => { undoItemUse(); });

    setupTooltip(button, () => {
        const [item_type, amount] = GAMESTATE.undo_item;
        if (item_type == ItemType.Count) {
            return "Undo Last Item Use";
        }
        
        const item = ITEMS[item_type] as ItemDefinition;
        return `Undo Use of ${amount} ${amount == 1 ? `${item.name}` : `${item.name_plural}`}`;
    }, () => {
        const [item_type,] = GAMESTATE.undo_item;
        const conditions = "Item undo is available until you start your next Task<br>Using an Item while already having a Task active will prevent undoing<br>Automatically used Items also cannot be undone";

        if (item_type == ItemType.Count) {
            return `<span class="disable-reason">No Item to undo</span><br><br>` + conditions;
        }

        return conditions;
    });
}

function setupItemUndo() {
    setupItemUndoForButton(RENDERING.item_undo_element);
    setupItemUndoForButton(RENDERING.artifact_undo_element);
}

function recreateItemsIfNeeded() {
    const items_div = document.getElementById("items-list");
    if (!items_div) {
        console.error("The element with ID 'items-list' was not found.");
        return;
    }

    const artifacts_div = document.getElementById("artifacts-list");
    if (!artifacts_div) {
        console.error("The element with ID 'artifacts-list' was not found.");
        return;
    }

    const items: [type: ItemType, amount: number][] = [];
    const artifacts: [type: ItemType, amount: number][] = [];

    for (const item of ITEMS_BY_ZONE) {
        const amount = GAMESTATE.items.get(item);
        if (amount !== undefined) {
            const list = ARTIFACTS.includes(item) ? artifacts : items;
            list.push([item, amount]);
        }
    }

    sortItems(items);
    sortItems(artifacts);

    const item_order: ItemType[] = [];
    const artifact_order: ItemType[] = [];

    for (const [item,] of items) {
        item_order.push(item);
    }
    for (const [item,] of artifacts) {
        artifact_order.push(item);
    }

    if (!areArraysEqual(item_order, RENDERING.item_order)) {
        RENDERING.item_order = item_order;
        items_div.innerHTML = "";

        for (const item of item_order) {
            createItemDiv(item, items_div);
        }
    }

    if (!areArraysEqual(artifact_order, RENDERING.artifact_order)) {
        RENDERING.artifact_order = item_order;
        artifacts_div.innerHTML = "";

        for (const item of artifact_order) {
            createItemDiv(item, artifacts_div);
        }

        const artifacts_container = document.getElementById("artifacts");
        if (!artifacts_container) {
            console.error("The element with ID 'artifacts' was not found.");
            return;
        }

        artifacts_container.classList.remove("hidden");
    }
}

function sortItems(items: [type: ItemType, amount: number][]) {
    items.sort((a, b) => {
        // Items we actually have first
        if ((a[1] == 0) != (b[1] == 0)) {
            return (a[1] == 0) ? 1 : -1;
        }

        // Then just stick with the order provided
        return 0;
    });
}

function setupAutoUseItemsControl() {
    if (!hasPerk(PerkType.Amulet)) {
        return;
    }

    const item_control = document.createElement("button");
    item_control.className = "element";

    function setItemControlName() {
        item_control.textContent = GAMESTATE.auto_use_items ? "Auto Use Items" : "Manual Use Items";
        queueUpdateTooltip();
    }
    setItemControlName();

    item_control.addEventListener("click", () => {
        GAMESTATE.auto_use_items = !GAMESTATE.auto_use_items;
        setItemControlName();
    });

    setupTooltip(item_control, () => { return `${item_control.textContent}` }, function () {
        let tooltip = "Toggle between items being used automatically, and only being used manually";
        tooltip += "<br>Won't use Artifacts";
        tooltip += "<br><br>Hotkey: I";

        return tooltip;
    });

    RENDERING.controls_list_element.appendChild(item_control);
}

function updateItems() {
    RENDERING.item_undo_element.disabled = GAMESTATE.undo_item[0] == ItemType.Count;
    RENDERING.artifact_undo_element.disabled = GAMESTATE.undo_item[0] == ItemType.Count;

    for (const [item, button] of RENDERING.item_elements) {
        const item_count = GAMESTATE.items.get(item);
        button.disabled = item_count == 0;
        button.classList.toggle("disabled", button.disabled);
        
        const count_text = button.querySelector<HTMLElement>(".item-count") as HTMLElement;
        count_text.textContent = `${item_count}`;
    }
}

// MARK: Perks

function createPerkDiv(perk: PerkType, perks_div: HTMLElement, enabled: boolean) {
    const perk_div = document.createElement("div");
    perk_div.className = "perk";
    perk_div.classList.add("element");
    perk_div.classList.toggle("disabled", !enabled);

    const perk_text = document.createElement("span");
    perk_text.className = "text";

    const perk_definition = PERKS[perk] as PerkDefinition;

    perk_text.textContent = perk_definition.icon;

    const zone = ZONES.findIndex(
        (zone) => {
            return zone.tasks.find((task) => { return task.perk == perk; }) !== undefined;
        });

    setupTooltip(perk_div, () => `${perk_definition.name}`, () => `${perk_definition.getTooltip()}<br><br>Unlocked in Zone ${zone + 1}`);

    perk_div.appendChild(perk_text);
    perks_div.appendChild(perk_div);
    RENDERING.perk_elements.set(perk, perk_div);
}

function recreatePerks() {
    const perks_div = document.getElementById("perks-list");
    if (!perks_div) {
        console.error("The element with ID 'perks-list' was not found.");
        return;
    }

    perks_div.innerHTML = "";

    const perks: PerkType[] = [];

    for (const perk of PERKS_BY_ZONE) {
        if (knowsPerk(perk)) {
            perks.push(perk);
        }
    }

    // Show enabled perks first
    perks.sort((a, b) => {
        return Number(hasPerk(b)) - Number(hasPerk(a));
    });

    for (const perk of perks) {
        createPerkDiv(perk, perks_div, hasPerk(perk));
    }
}

// MARK: Energy reset

function populateEnergyReset(energy_reset_div: HTMLElement) {
    const open_button = RENDERING.open_energy_reset_element;

    open_button.disabled = false;

    energy_reset_div.classList.remove("hidden");
    energy_reset_div.innerHTML = "";
    RENDERING.viewing_last_reset = !GAMESTATE.is_in_energy_reset;

    if (GAMESTATE.is_in_energy_reset) {
        energy_reset_div.innerHTML = "<h2>Out of Energy</h2>" +
            "<p>You used up all your Energy, but this is not the end.</p>" +
            (hasPerk(PerkType.UnderstandingTheReset) ? "<p>You keep half your Items (rounded up).</p>" : "<p>You lose your unused Items.</p>") +
            "<p>The effects of used Items disappear.</p>" +
            "<p>You keep all your Skills and Perks.</p>";
    } else {
        energy_reset_div.innerHTML = "<h2>Last Run</h2>";
    }

    const hasHadItemInheritance = hasPerk(PerkType.UnderstandingTheReset) || GAMESTATE.prestige_count > 0;

    function handleReset() {
        energy_reset_div.classList.add("hidden");
        doEnergyReset();
        if (shouldShowBossHint()) {
            showHint("You've gotten to Zone 10 now without beating any Bosses.<br>Consider that it might be time to beat one up");
            setHasGottenBossHint();
        } else if (shouldShowPrepRunHint()) {
            showHint("You've used Items for the past several runs.<br>Have you considered doing a run without using any Items, so you'll have more items for the next run?");
            setHasGottenPrepRunHint();
        }
    }

    if (!GAMESTATE.is_in_energy_reset || !hasHadItemInheritance) {
        const button = createChildElement(energy_reset_div, "button");
        button.className = "dismiss";
        button.textContent = GAMESTATE.is_in_energy_reset ? "Start the Journey Over, Wiser" : "Dismiss";
    
        button.addEventListener("click", () => {
            energy_reset_div.classList.add("hidden");
            if (GAMESTATE.is_in_energy_reset) {
                handleReset();
            }

            RENDERING.viewing_last_reset = false;
        });
        setupTooltipStatic(button, button.textContent, GAMESTATE.is_in_energy_reset ? "Do Energy Reset" : "Return to the game");
    } else {
        const auto_button = createChildElement(energy_reset_div, "button");
        const no_auto_button = createChildElement(energy_reset_div, "button");

        auto_button.className = "dismiss";
        no_auto_button.className = "dismiss";

        auto_button.textContent = "Reset, With Auto Use Items";
        no_auto_button.textContent = "Reset, Without Auto Use Items";

        auto_button.addEventListener("click", () => {
            GAMESTATE.auto_use_items = true;
            handleReset();
        });
        no_auto_button.addEventListener("click", () => {
            GAMESTATE.auto_use_items = false;
            handleReset();
        });
    }


    const skill_gain = document.createElement("div");

    skill_gain.innerHTML = "";

    createChildElement(skill_gain, "h3").textContent = "Skills gained:";

    const info = GAMESTATE.energy_reset_info;

    for (const [skill, skill_diff] of info.skill_gains) {
        const skill_gain_text = document.createElement("p");
        const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;
        skill_gain_text.textContent = `${skill_definition.icon}${skill_definition.name}: +${skill_diff} (x${calcSkillTaskProgressMultiplierFromLevel(skill_diff).toFixed(2)} speed)`;

        skill_gain.appendChild(skill_gain_text);
    };

    const power_gain = info.power_at_end - info.power_at_start;
    if (power_gain > 0) {
        const power_gain_text = document.createElement("p");
        const speed_bonus = calcPowerSpeedBonusAtLevel(info.power_at_end) / calcPowerSpeedBonusAtLevel(info.power_at_start);
        power_gain_text.textContent = `${POWER_TEXT}: +${formatNumber(power_gain, false)} (x${speed_bonus.toFixed(2)} speed)`;

        skill_gain.appendChild(power_gain_text);
    }

    const attunement_gain = info.attunement_at_end - info.attunement_at_start;
    if (attunement_gain > 0) {
        const attunement_gain_text = document.createElement("p");
        const speed_bonus = calcAttunementSpeedBonusAtLevel(info.attunement_at_end) / calcAttunementSpeedBonusAtLevel(info.attunement_at_start);
        attunement_gain_text.textContent = `${ATTUNEMENT_TEXT}: +${formatNumber(attunement_gain, false)} (x${speed_bonus.toFixed(2)} speed)`;

        skill_gain.appendChild(attunement_gain_text);
    }

    if (hasPerk(PerkType.EnergeticMemory)) {
        const energetic_memory_gain_text = document.createElement("p");
        energetic_memory_gain_text.textContent = `Max ${ENERGY_TEXT}: +${info.energetic_memory_gain.toFixed(1)} (Energetic Memory Perk)`;

        skill_gain.appendChild(energetic_memory_gain_text);
    }

    if (skill_gain.childNodes.length == 0) {
        const skill_gain_text = document.createElement("p");
        skill_gain_text.textContent = `None`;

        skill_gain.appendChild(skill_gain_text);
    }

    energy_reset_div.appendChild(skill_gain);

    const reset_count = document.createElement("h3");
    reset_count.textContent = GAMESTATE.is_in_energy_reset ? `You've now done your ${formatOrdinal(GAMESTATE.energy_reset_count + 1)} Energy Reset` : `This was your ${formatOrdinal(GAMESTATE.energy_reset_count)} Energy Reset`;
    energy_reset_div.appendChild(reset_count);
}

function setupEnergyReset(energy_reset_div: HTMLElement) {
    const open_button = RENDERING.open_energy_reset_element;

    open_button.addEventListener("click", () => {
        populateEnergyReset(RENDERING.energy_reset_element);
        energy_reset_div.classList.remove("hidden");
    });

    open_button.disabled = GAMESTATE.energy_reset_count == 0;

    setupTooltipStaticHeader(open_button, `View Last Energy Reset Summary`, function () {
        let tooltip = `Lets you reopen the last Energy Reset Summary`;
        if (open_button.disabled) {
            tooltip += `<p class="disable-reason">Disabled until you do your first Energy Reset</p>`
        }
        return tooltip;
    });
}

function populateEndOfContent(end_of_content_div: HTMLElement) {
    end_of_content_div.classList.remove("hidden");

    const reset_count = end_of_content_div.querySelector("#end-of-content-reset-count");
    if (!reset_count) {
        console.error("No reset count text");
        return;
    }

    reset_count.innerHTML = `You've done ${GAMESTATE.energy_reset_count} Energy Resets this Prestige`;
    reset_count.innerHTML += `<br>You've done ${GAMESTATE.prestige_count} Prestiges`;

    const reset_button = end_of_content_div.querySelector<HTMLElement>("#end-of-content-reset");
    if (!reset_button) {
        console.error("No reset button");
        return;
    }

    reset_button.innerHTML = "";
    reset_button.textContent = "Do Energy Reset";
    setupTooltipStatic(reset_button, "Do Energy Reset", "Do a regular Energy Reset to keep on playing");
    reset_button.addEventListener("click", () => {
        end_of_content_div.classList.add("hidden");
        doEnergyReset();
    });
}

function updateGameOver() {
    const showing_energy_reset = !RENDERING.energy_reset_element.classList.contains("hidden") && !RENDERING.viewing_last_reset;
    if (!showing_energy_reset && GAMESTATE.is_in_energy_reset) {
        populateEnergyReset(RENDERING.energy_reset_element);
    }

    const showing_end_of_content = !RENDERING.end_of_content_element.classList.contains("hidden");
    if (!showing_end_of_content && GAMESTATE.is_at_end_of_content) {
        populateEndOfContent(RENDERING.end_of_content_element);
    }
}

// MARK: Prestige

function populatePrestigeView() {
    const prestige_overlay = RENDERING.prestige_overlay_element;
    const prestige_div = prestige_overlay.querySelector("#prestige-box");
    if (!prestige_div) {
        console.error("No prestige-box");
        return;
    }

    let scrollTop = 0;
    const existing_scroll_area = prestige_overlay.querySelector(".scroll-area");
    if (existing_scroll_area) {
        scrollTop = existing_scroll_area.scrollTop;
    }

    prestige_div.innerHTML = "";

    const scroll_area = createChildElement(prestige_div, "div");
    scroll_area.className = "scroll-area";

    {
        const close_button = createChildElement(prestige_div, "button");
        close_button.className = "close close-scroll";
        close_button.textContent = "X";

        close_button.addEventListener("click", () => {
            prestige_overlay.classList.add("hidden");
        });

        setupTooltipStatic(close_button, `Close Prestige Menu`, ``);
    }


    {
        const summary_div = createChildElement(scroll_area, "div");
        const header = createChildElement(summary_div, "h1");
        header.textContent = "Divinity";

        const prestige_button = createChildElement(summary_div, "button");
        prestige_button.textContent = "Prestige";
        prestige_button.className = "do-prestige";
        (prestige_button as HTMLInputElement).disabled = !GAMESTATE.prestige_available;

        setupTooltipStaticHeader(prestige_button, "Do Prestige Reset", () => {
            let desc = "";
            if (!GAMESTATE.prestige_available) {
                desc += `<p class="disable-reason">Disabled until you complete the <span class="Prestige">Prestige</span> task in Zone 15</p>`;
            }

            desc += `Will reset <b><i>everything</i></b> except that which is granted by Divinity purchases, but gives ${DIVINE_SPARK_TEXT} in return`;

            return desc;
        });

        prestige_button.addEventListener("click", () => {
            createConfirmationOverlay("Do Prestige", `Will give ${formatNumber(calcDivineSparkGain(), false)} ${DIVINE_SPARK_TEXT}, but reset everything except that which is granted by Divinity purchases<br>Will also remove all Boss Tasks from automation`, () => {
                doPrestige();
            populatePrestigeView();
            });
        });

        prestige_button.classList.toggle("prestige-glow", GAMESTATE.unlocked_new_prestige_this_prestige);

        const divine_spark = createChildElement(summary_div, "p");
        divine_spark.innerHTML = `${DIVINE_SPARK_TEXT}: ${formatNumber(GAMESTATE.divine_spark, false)} (+${formatNumber(calcDivineSparkGain(), false)})<span class="divine-spark-info">ℹ</span>`;
        divine_spark.className = "divine-spark-text";

        setupTooltipStaticHeader(divine_spark, `${DIVINE_SPARK_TEXT} Gain`, () => {
            const dummy_div = document.createElement("div");

            const divine_spark = createChildElement(dummy_div, "p");
            divine_spark.innerHTML = `${DIVINE_SPARK_TEXT} gain if you Prestige now: +${formatNumber(calcDivineSparkGain(), false)}`;

            const divine_spark_gain = createChildElement(dummy_div, "p");
            divine_spark_gain.innerHTML = `${DIVINE_SPARK_TEXT} gain formula:<br>100, multiplied by ${getPrestigeGainExponent()} for each Zone past 15`;
            if (hasPerk(PerkType.Awakening)) {
                divine_spark_gain.innerHTML += `<br>Multiplier from ${getPerkNameWithEmoji(PerkType.Awakening)}: ${formatNumber(1 + AWAKENING_DIVINE_SPARK_MULT)}`;
            }


            const divine_spark_gain_stats = createChildElement(dummy_div, "p");
            divine_spark_gain_stats.innerHTML = `Highest Zone reached: ${GAMESTATE.highest_zone + 1}`;

            const potentialReachGain = calcDivineSparkGainFromHighestZone(GAMESTATE.highest_zone + 1) - calcDivineSparkGainFromHighestZone(GAMESTATE.highest_zone);
            divine_spark_gain_stats.innerHTML += `<br><br>Additional ${DIVINE_SPARK_TEXT} for reaching Zone ${GAMESTATE.highest_zone + 2}: ${formatNumber(potentialReachGain, false)}`;

            return dummy_div.innerHTML;
        });

        const prestiges_done_text = createChildElement(summary_div, "p");
        prestiges_done_text.textContent = `Prestiges done: ${GAMESTATE.prestige_count}`;
    }

    const PRESTIGE_LAYER_NAMES = ["Touch the Divine", "Transcend Humanity", "Embrace Divinity", "Ascend to Godhood"];

    for (const prestige_layer of GAMESTATE.prestige_layers_unlocked) {
        const touch_the_divine_div = createChildElement(scroll_area, "div");
        touch_the_divine_div.className = "prestige-section";

        const header = createChildElement(touch_the_divine_div, "h2");
        header.textContent = PRESTIGE_LAYER_NAMES[prestige_layer] as string;

        const unlockables_div = createChildElement(touch_the_divine_div, "div");
        const unlockables_header = createChildElement(unlockables_div, "h3");
        unlockables_header.textContent = "Unlockables";
        const unlockables_purchases = createChildElement(unlockables_div, "div");
        unlockables_purchases.className = "prestige-purchases";

        for (const unlock of PRESTIGE_UNLOCKABLES.filter((unlock) => { return unlock.layer == prestige_layer; })) {
            const is_unlocked = hasPrestigeUnlock(unlock.type);
            const unlock_button = createChildElement(unlockables_purchases, is_unlocked ? "div" : "button");
            unlock_button.className = "prestige-purchase";
            if (is_unlocked) {
                unlock_button.classList.add("prestige-upgrade-unlocked");
            }

            unlock_button.innerHTML = `${unlock.name}`;
            if (!is_unlocked) {
                unlock_button.innerHTML += `<br>Cost: ${unlock.cost}`;
            }

            if (!is_unlocked) {
                (unlock_button as HTMLInputElement).disabled = unlock.cost > GAMESTATE.divine_spark;
            }

            setupTooltipStatic(unlock_button, unlock.name, unlock.get_description());

            if (!is_unlocked) {
                unlock_button.addEventListener("click", () => {
                    addPrestigeUnlock(unlock.type);
                    populatePrestigeView();
                });
            }
        }

        const upgrades_div = createChildElement(touch_the_divine_div, "div");
        const upgrades_header = createChildElement(upgrades_div, "h3");
        upgrades_header.textContent = "Repeatable Upgrades";
        const repeatables_purchases = createChildElement(upgrades_div, "div");
        repeatables_purchases.className = "prestige-purchases";

        for (const upgrade of PRESTIGE_REPEATABLES.filter((unlock) => { return unlock.layer == prestige_layer; })) {
            const unlock_button = createChildElement(repeatables_purchases, "button");
            unlock_button.className = "prestige-purchase prestige-purchase-repeatable";
            const cost = calcPrestigeRepeatableCost(upgrade.type);
            const level = getPrestigeRepeatableLevel(upgrade.type);
            unlock_button.innerHTML = `${upgrade.name}<br>Cost: ${cost}<br>Level: ${level}`;

            (unlock_button as HTMLInputElement).disabled = cost > GAMESTATE.divine_spark;

            setupTooltipStaticHeader(unlock_button, upgrade.name, () => {
                let desc = upgrade.get_description();
                desc += "<br><br>Current Effect: ";

                switch (upgrade.type) {
                    case PrestigeRepeatableType.DivineKnowledge:
                        desc += `+${formatNumber(DIVINE_KNOWLEDGE_MULT * level * 100, false)}%`;
                        break;
                    case PrestigeRepeatableType.UnlimitedPower:
                        desc += `x${formatNumber(Math.pow(2, level), false)}`;
                        break;
                    case PrestigeRepeatableType.DivineAppetite:
                        desc += `+${formatNumber(DIVINE_APPETITE_ENERGY_ITEM_BOOST_MULT * level * 100, false)}%`;
                        break;
                    case PrestigeRepeatableType.GottaGoFast:
                        desc += `x${formatNumber(Math.pow(GOTTA_GO_FAST_BASE, level))}`;
                        break;
                    case PrestigeRepeatableType.DivineLightning:
                        desc += `+${(level * DIVINE_LIGHTNING_EXPONENT_INCREASE).toFixed(1)}`;
                        break;
                    case PrestigeRepeatableType.TranscendantAptitude:
                        desc += `+${level * TRANSCENDANT_APTITUDE_MULT}`;
                        break;
                    case PrestigeRepeatableType.Energized:
                        desc += `+${level * ENERGIZED_INCREASE}`;
                        break;
                    default:
                        console.error("Unhandled upgrade");
                        break;
                }

                return desc;
            });

            unlock_button.addEventListener("click", () => {
                increasePrestigeRepeatableLevel(upgrade.type);
                populatePrestigeView();
            });
        }
    }

    scroll_area.scrollTop = scrollTop;
}

function setupOpenPrestige() {
    const prestige_overlay = RENDERING.prestige_overlay_element;
    const open_button = RENDERING.open_prestige_element;

    open_button.addEventListener("click", () => {
        populatePrestigeView();
        prestige_overlay.classList.remove("hidden");
    });

    prestige_overlay.addEventListener("click", (e) => {
        if (e.target == prestige_overlay) { // Clicking outside the window
            prestige_overlay.classList.add("hidden");
        }
    });

    setupTooltip(open_button, function () { return `${DIVINE_SPARK_TEXT} - ${formatNumber(GAMESTATE.divine_spark, false)}`; }, function () {
        const tooltip = `Within this menu you can Prestige to gain ${DIVINE_SPARK_TEXT}, and buy powerful upgrades`;

        return tooltip;
    });
}

// MARK: Formatting

function formatOrdinal(n: number): string {
    const suffix = ["th", "st", "nd", "rd"];
    const remainder = n % 100;
    return n + ((suffix[(remainder - 20) % 10] || suffix[remainder] || suffix[0]) as string);
}

export function formatNumber(n: number, allow_decimals: boolean = true): string {
    if (n < 0) {
        console.error("Tried to format negative number");
        return n + "";
    }

    if (allow_decimals && n < 10) {
        if (n < 10) {
            return n.toFixed(2);
        } else if (n < 100) {
            return n.toFixed(1);
        }
    }

    if (n < 10000) {
        return n.toFixed(0);
    }

    const postfixes = ["k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    let postfix_index = -1;

    while (n > 1000 && (postfix_index + 1) < postfixes.length) {
        n = n / 1000;
        postfix_index++;
    }

    if (n < 10) {
        return n.toFixed(2) + postfixes[postfix_index];
    } else if (n < 100) {
        return n.toFixed(1) + postfixes[postfix_index];
    } else {
        return n.toFixed(0) + postfixes[postfix_index];
    }
}

// MARK: Settings

function setupSettings() {
    const settings_div = RENDERING.settings_element;
    const open_button = document.querySelector<HTMLElement>("#open-settings");

    if (!open_button) {
        console.error("No open settings button");
        return;
    }

    open_button.addEventListener("click", () => {
        settings_div.classList.remove("hidden");
    });

    setupTooltipStatic(open_button, `Open Settings Menu`, `Lets you Save and Load from disk`);

    const close_button = settings_div.querySelector<HTMLElement>(".close");

    if (!close_button) {
        console.error("No close button");
        return;
    }


    close_button.addEventListener("click", () => {
        settings_div.classList.add("hidden");
    });

    settings_div.addEventListener("click", (e) => {
        if (e.target == settings_div) {
            settings_div.classList.add("hidden");
        }
    });

    setupTooltipStatic(close_button, `Close Settings Menu`, ``);

    setupPersistence(settings_div);

    const changelog_button = settings_div.querySelector<HTMLElement>("#changelog");
    if (!changelog_button) {
        console.error("No changelog button");
        return;
    }

    setupTooltipStatic(changelog_button, "Open Changelog", "View the full Changelog of Journey to Ascension");

    changelog_button.addEventListener("click", () => {
        showChangelog();
    });

    const changelog_overlay = RENDERING.changelog_overlay_element;
    changelog_overlay.addEventListener("click", (e) => {
        if (e.target == changelog_overlay) { // Clicking outside the window
            changelog_overlay.classList.add("hidden");
        }
    });

    const credits_button = settings_div.querySelector<HTMLElement>("#credits");
    if (!credits_button) {
        console.error("No credits button");
        return;
    }

    setupTooltipStatic(credits_button, "Open Credits", "View the game credits");

    credits_button.addEventListener("click", () => {
        showCredits();
    });

    const credits_overlay = RENDERING.credits_overlay_element;
    credits_overlay.addEventListener("click", (e) => {
        if (e.target == credits_overlay) { // Clicking outside the window
            credits_overlay.classList.add("hidden");
        }
    });

    const manual_tooltips_button = settings_div.querySelector<HTMLElement>("#manual-tooltips");
    if (!manual_tooltips_button) {
        console.error("No manual-tooltips button");
        return;
    }

    manual_tooltips_button.addEventListener("click", () => {
        GAMESTATE.manual_tooltips = !GAMESTATE.manual_tooltips;
        updateSettingsDisplay();
        queueUpdateTooltip();
    });

    setupTooltip(manual_tooltips_button, function () { return GAMESTATE.manual_tooltips ? "Switch to Manual Tooltips" : "Switch to Automatic Tooltips"; }, function () {
        return "With Manual Tooltips enabled, tooltips only show up while CTRL is held";
    });

    updateSettingsDisplay();
}

function updateSettingsDisplay() {
    const settings_div = RENDERING.settings_element;

    const manual_tooltips_button = settings_div.querySelector<HTMLElement>("#manual-tooltips");
    if (!manual_tooltips_button) {
        console.error("No manual-tooltips button");
        return;
    }

    manual_tooltips_button.textContent = GAMESTATE.manual_tooltips ? "Manual Tooltips" : "Auto Tooltips";
}

// MARK: Settings: Saves

function setupPersistence(settings_div: HTMLElement) {
    const save_button = settings_div.querySelector<HTMLElement>("#save");

    if (!save_button) {
        console.error("No save button");
        return;
    }

    save_button.addEventListener("click", () => {
        saveGame();
        const save_data = localStorage.getItem(SAVE_LOCATION);
        if (!save_data) {
            console.error("No save data");
            return;
        }

        let file_name = "JourneyToAscension";
        if (GAMESTATE.prestige_count > 0) {
            file_name += "_Prestige" + GAMESTATE.prestige_count;
        }
        file_name += `_Reset_${GAMESTATE.energy_reset_count}_energy_${GAMESTATE.current_energy.toFixed(0)}`;

        const blob = new Blob([save_data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    setupTooltipStatic(save_button, `Export Save`, `Save the game's progress to disk`);

    const load_button = settings_div.querySelector<HTMLElement>("#load");

    if (!load_button) {
        console.error("No load button");
        return;
    }

    load_button.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.addEventListener("change", (e) => {
            const element = e.target as HTMLInputElement;
            const file = (element.files as FileList)[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                if (!event.target) {
                    return;
                }
                const fileText = event.target.result as string;
                localStorage.setItem(SAVE_LOCATION, fileText as string);
                location.reload();
            };
            reader.readAsText(file);
        });

        input.click();
    });

    setupTooltipStatic(load_button, `Import Save`, `Load the game's progress from disk`);

    const reset_button = settings_div.querySelector<HTMLElement>("#reset-save");

    if (!reset_button) {
        console.error("No reset-save button");
        return;
    }

    reset_button.addEventListener("click", () => {
        createConfirmationOverlay("Reset Save", `Will reset absolutely all progress. It's highly recommendex you export a Save first`, () => {
            resetSave();
        });
    });

    setupTooltipStatic(reset_button, `Reset Save`, `Resets *everything*`);
}

// MARK: Events

function handleEvents() {
    const events = GAMESTATE.popRenderEvents();
    const messages = RENDERING.messages_element;
    for (const event of events) {
        if (event.type == EventType.TaskCompleted) {
            queueUpdateTooltip();
            continue; // No message, just forces tooltips to update
        }

        if (event.type == EventType.GainedItem) {
            if (RENDERING.item_elements.size != GAMESTATE.items.size) {
                recreateTasks(); // Get rid of potential glow
            }
            recreateItemsIfNeeded();
            continue; // No message, just forces item list to update
        }

        const message_div = document.createElement("div");
        message_div.className = "message";
        let message_to_replace: Element | null = null;

        function removeMessage(message: Element) {
            messages.removeChild(message);
            RENDERING.message_contexts.delete(message);
        }

        const context = event.context;
        if (event.type == EventType.UsedItem) {
            const new_item_context = context as UsedItemContext;
            for (const [message, old_event] of RENDERING.message_contexts) {
                if (old_event.type == event.type) {
                    const old_item_context = old_event.context as UsedItemContext;
                    if (old_item_context.item == new_item_context.item) {
                        new_item_context.count += old_item_context.count;
                        message_to_replace = message;
                    }
                }
            }
        } else if (event.type == EventType.SkillUp) {
            const new_skill_context = context as SkillUpContext;
            for (const [message, old_event] of RENDERING.message_contexts) {
                if (old_event.type == event.type) {
                    const old_skill_context = old_event.context as SkillUpContext;
                    if (old_skill_context.skill == new_skill_context.skill) {
                        new_skill_context.levels_gained += old_skill_context.levels_gained;
                        message_to_replace = message;
                    }
                }
            }
        }

        switch (event.type) {
            case EventType.SkillUp:
                {
                    const skill_context = context as SkillUpContext;
                    const skill_definition = SKILL_DEFINITIONS[skill_context.skill] as SkillDefinition;
                    message_div.textContent = `${skill_definition.icon}${skill_definition.name} is now ${skill_context.new_level} (+${skill_context.levels_gained})`;
                    break;
                }
            case EventType.GainedPerk:
                {
                    const perk_context = context as GainedPerkContext;
                    const perk = PERKS[perk_context.perk] as PerkDefinition;
                    message_div.innerHTML = `Unlocked ${perk.icon}${perk.name}`;
                    message_div.innerHTML += `<br>${perk.getTooltip()}`;
                    setupControls(); // Show the automation controls
                    recreateTasks(); // Get rid of Perk indicator
                    recreatePerks();
                    break;
                }
            case EventType.UsedItem:
                {
                    const item_context = context as UsedItemContext;
                    const item = ITEMS[item_context.item] as ItemDefinition;
                    const plural = item_context.count > 1;
                    message_div.innerHTML = `Used ${item_context.count} ${item.icon}${plural ? item.name_plural : item.name}`;
                    message_div.innerHTML += `<br>${item.getEffectText(item_context.count)}`;
                    recreateItemsIfNeeded();
                    break;
                }
            case EventType.UndidItem:
                {
                    const item_context = context as UsedItemContext;
                    const item = ITEMS[item_context.item] as ItemDefinition;
                    const plural = item_context.count > 1;
                    message_div.innerHTML = `Undid use of ${item_context.count} ${item.icon}${plural ? item.name_plural : item.name}`;
                    recreateItemsIfNeeded();
                    break;
                }
            case EventType.UnlockedTask:
                {
                    const unlock_context = context as UnlockedTaskContext;
                    message_div.innerHTML = `Unlocked Task ${unlock_context.task_definition.name}`;
                    recreateTasks();
                    break;
                }
            case EventType.UnlockedSkill:
                {
                    const unlock_skill_context = context as UnlockedSkillContext;
                    const skill_definition = SKILL_DEFINITIONS[unlock_skill_context.skill] as SkillDefinition;
                    message_div.innerHTML = `Unlocked Skill ${skill_definition.icon}${skill_definition.name}`;
                    recreateSkills();
                    break;
                }
            case EventType.UnlockedPower:
                {
                    message_div.innerHTML = `Unlocked 💪Power mechanic`;
                    message_div.innerHTML += `<br>Boosts ${getSkillString(SkillType.Combat)} and ${getSkillString(SkillType.Fortitude)}`;
                    recreateTasks();
                    break;
                }
            case EventType.PrestigeAvailable:
                {
                    message_div.innerHTML = `Prestige now availble`;
                    message_div.innerHTML += `<br>Lets you reset most everything to gain the ${DIVINE_SPARK_TEXT} currency`;
                    recreateTasks();
                    break;
                }
            case EventType.NewPrestigeLayer:
                {
                    message_div.innerHTML = `Unlocked more Prestige upgrades`;
                    break;
                }
            case EventType.NewHighestZone:
            case EventType.NewHighestZoneFullyCompleted:
                {
                    const highest_zone_context = context as HighestZoneContext;
                    message_div.innerHTML = `New highest Zone${event.type == EventType.NewHighestZoneFullyCompleted ? " fully completed" : ""}: ${highest_zone_context.zone + 1}`;
                    break;
                }
            case EventType.SkippedZones:
                {
                    message_div.innerHTML = `Skipped to Zone ${GAMESTATE.current_zone + 1} thanks to ${getPerkNameWithEmoji(PerkType.MinorTimeCompression)}`;
                    break;
                }
            default:
                break;
        }

        messages.insertBefore(message_div, message_to_replace ? message_to_replace : messages.firstChild);
        RENDERING.message_contexts.set(message_div, event);

        if (message_to_replace) {
            removeMessage(message_to_replace);
        }

        while (messages.children.length > 5) {
            removeMessage(messages.lastElementChild as Element);
        }

        setTimeout(() => {
            if (message_div.parentNode) {
                removeMessage(message_div);
            }
        }, 5000);
    }
}

// MARK: Controls

function setupControls() {
    RENDERING.controls_list_element.innerHTML = "";

    setupRepeatTasksControl();
    setupAutomationControls();
    setupAutoUseItemsControl();
}

function setupRepeatTasksControl() {
    const rep_control = document.createElement("button");
    rep_control.className = "element";

    function setRepControlName() {
        rep_control.textContent = GAMESTATE.repeat_tasks ? "Repeat Tasks" : "Don't Repeat Tasks";
        queueUpdateTooltip();
    }
    setRepControlName();

    rep_control.addEventListener("click", () => {
        toggleRepeatTasks();
        setRepControlName();
    });

    setupTooltip(rep_control, function () { return rep_control.textContent; }, function () {
        return "Toggle between repeating Tasks if they have multiple reps, or only doing a single rep<br>When repeating, the Task tooltip will show the numbers for doing all remaining reps rather than just one<br><br>Hotkey: R";
    });

    RENDERING.controls_list_element.appendChild(rep_control);
}

// MARK: Controls - Automation

function toggleAutomationMode(mode: AutomationMode) {
    if (mode == GAMESTATE.automation_mode) {
        setAutomationMode(AutomationMode.Off);
    } else {
        setAutomationMode(mode);
    }

    setupControls();
}

function setupAutomationControls() {
    if (!hasPerk(PerkType.Amulet)) {
        return;
    }

    const automation_div = createChildElement(RENDERING.controls_list_element, "div");
    automation_div.className = "automation";

    const automation_text = createChildElement(automation_div, "div");
    automation_text.className = "automation-text";
    automation_text.textContent = "Task Automation";

    const automation_controls_div = createChildElement(automation_div, "div");
    automation_controls_div.className = "automation-controls";

    const all_control = document.createElement("button");

    function updateZoneButtonText() {
        all_control.innerHTML = `To<br>Zone ${GAMESTATE.automation_end}`;
    }
    updateZoneButtonText();

    const until_zone_input = createNumericInput(automation_controls_div, {
        min: 1,
        max: 99,
        initialValue: GAMESTATE.automation_end,
        onChange: (value) => {
            GAMESTATE.automation_end = value;
            updateZoneButtonText();
        }
    });

    automation_controls_div.appendChild(all_control);
    const zone_control = createChildElement(automation_controls_div, "button");
    zone_control.textContent = "Current Zone";

    all_control.className = GAMESTATE.automation_mode == AutomationMode.All ? "on" : "off";
    zone_control.className = GAMESTATE.automation_mode == AutomationMode.Zone ? "on" : "off";

    all_control.addEventListener("click", () => {
        toggleAutomationMode(AutomationMode.All);
    });
    zone_control.addEventListener("click", () => {
        toggleAutomationMode(AutomationMode.Zone);
    });

    setupTooltip(all_control, function () { return `Automate To Zone ${GAMESTATE.automation_end}`; }, function () {
        let tooltip = `Toggle between no automation, and automating Tasks until the specified Zone (${GAMESTATE.automation_end}) is reached`;
        tooltip += "<br>Right-click Tasks to designate them as automated";
        tooltip += "<br>They'll be executed in the order you right-clicked them, as indicated by the number in their corner";
        tooltip += "<br><br>Hotkey: A";

        return tooltip;
    });

    setupTooltip(zone_control, function () { return `Automate ${zone_control.textContent}`; }, function () {
        let tooltip = "Toggle between no automation, automating Tasks in the current zone";
        tooltip += "<br>Right-click Tasks to designate them as automated";
        tooltip += "<br>They'll be executed in the order you right-clicked them, as indicated by the number in their corner";
        tooltip += "<br><br>Hotkey: Z";

        return tooltip;
    });

    setupTooltip(until_zone_input, function () { return `Specify Target Zone`; }, function () {
        const tooltip = "The Zone you specify here will be used by the 'To Zone' automation";

        return tooltip;
    });
}

// MARK: Extra stats

function updateExtraStats() {
    if (GAMESTATE.has_unlocked_power && RENDERING.power_element.classList.contains("hidden")) {
        RENDERING.power_element.classList.remove("hidden");
        setupTooltip(RENDERING.power_element, function () { return `💪Power - ${formatNumber(GAMESTATE.power, false)}`; }, function () {
            let tooltip = `Increases ${getSkillString(SkillType.Combat)} and ${getSkillString(SkillType.Fortitude)} speed by ${formatNumber(GAMESTATE.power, false)}%`;
            tooltip += `<br><br>Increased by fighting Bosses`;

            return tooltip;
        });
    }

    const power_text = `<span>💪Power</span><span>${formatNumber(GAMESTATE.power, false)}</span>`;
    if (RENDERING.power_element.innerHTML != power_text) {
        RENDERING.power_element.innerHTML = power_text;
    }

    if (hasPerk(PerkType.Attunement) && RENDERING.attunement_element.classList.contains("hidden")) {
        RENDERING.attunement_element.classList.remove("hidden");
        setupTooltip(RENDERING.attunement_element, function () { return `🌀Attunement - ${formatNumber(GAMESTATE.attunement, false)}`; }, function () {
            const attunement_skill_strings: string[] = [];
            calcAttunementSkills().forEach((value: SkillType) => { attunement_skill_strings.push(getSkillString(value)); });

            let tooltip = `Increases ${joinWithCommasAndAnd(attunement_skill_strings)} speed by ${formatNumber(GAMESTATE.attunement / 10)}%`;
            tooltip += `<br>Note that the bonus does not stack if a Task uses more than one of these Skills`;
            tooltip += `<br><br>Increased by all Tasks it boosts`;

            return tooltip;
        });
    }

    const attunement_text = `<span>🌀Attunement</span><span>${formatNumber(GAMESTATE.attunement, false)}</span>`;
    if (RENDERING.attunement_element.innerHTML != attunement_text) {
        RENDERING.attunement_element.innerHTML = attunement_text;
    }

    if (hasUnlockedPrestige() && RENDERING.open_prestige_element.classList.contains("hidden")) {
        RENDERING.open_prestige_element.classList.remove("hidden");
    }

    const prestige_text = `<h2>${DIVINE_SPARK_TEXT}<br>${formatNumber(GAMESTATE.divine_spark, false)} (+${formatNumber(calcDivineSparkGain(), false)})</h2>`;
    if (RENDERING.open_prestige_element.innerHTML != prestige_text) {
        RENDERING.open_prestige_element.innerHTML = prestige_text;
    }

    RENDERING.open_prestige_element.classList.toggle("prestige-glow", GAMESTATE.unlocked_new_prestige_this_prestige);
}

// MARK: Stats

function setupOpenStats() {
    const stats_overlay = RENDERING.stats_overlay_element;
    const open_button = RENDERING.open_stats_element;

    open_button.addEventListener("click", () => {
        populateStatsView();
        stats_overlay.classList.remove("hidden");
    });

    stats_overlay.addEventListener("click", (e) => {
        if (e.target == stats_overlay) { // Clicking outside the window
            stats_overlay.classList.add("hidden");
        }
    });

    setupTooltipStaticHeader(open_button, "Stats", function () {
        const tooltip = `Within this menu you can see the effects of your Items on your Skills`;

        return tooltip;
    });
}

function populateStatsView() {
    const stats_overlay = RENDERING.stats_overlay_element;
    const stats_div = stats_overlay.querySelector("#stats-box");
    if (!stats_div) {
        console.error("No prestige-box");
        return;
    }

    stats_div.innerHTML = "";

    const scroll_area = createChildElement(stats_div, "div");
    scroll_area.className = "scroll-area";

    {
        const close_button = createChildElement(stats_div, "button");
        close_button.className = "close close-scroll";
        close_button.textContent = "X";

        close_button.addEventListener("click", () => {
            stats_overlay.classList.add("hidden");
        });

        setupTooltipStatic(close_button, `Close Stats Menu`, ``);
    }

    createChildElement(scroll_area, "h1").textContent = "Stats";
    const attunement_skills = calcAttunementSkills();
    const power_skills = getPowerSkills();

    for (const skill_type of GAMESTATE.unlocked_skills) {
        const skill = getSkill(skill_type);
        const div = createChildElement(scroll_area, "div");
        div.className = "stat-section";
        createChildElement(div, "h2").textContent = getSkillString(skill_type);

        const table = createChildElement(div, "table");
        table.className = "table simple-table";

        {
            const skill_table = createTableSection(table, "Basic");
            createTwoElementRow(skill_table, `Level`, `x${formatNumber(calcSkillTaskProgressMultiplierFromLevel(skill.level))}`);

            if (GAMESTATE.attunement > 0 && attunement_skills.includes(skill_type)) {
                createTwoElementRow(skill_table, ATTUNEMENT_TEXT, `x${formatNumber(calcAttunementSpeedBonusAtLevel(GAMESTATE.attunement))}`);
            }

            if (GAMESTATE.power > 0 && power_skills.includes(skill_type)) {
                createTwoElementRow(skill_table, POWER_TEXT, `x${formatNumber(calcPowerSpeedBonusAtLevel(GAMESTATE.attunement))}`);
            }
        }

        const item_bonuses = gatherItemBonuses(skill_type);
        if (item_bonuses.length > 0) {
            const item_table = createTableSection(table, "Items");

            for (const [item_type, amount] of item_bonuses) {
                const item = ITEMS[item_type] as ItemDefinition;
                const modifier = item.skill_modifiers.getStacked(amount);
                const effect = modifier.getSkillEffect(skill_type);
    
                createTwoElementRow(item_table, `${amount} ${item.getNameWithEmoji(amount)}`, `+${formatNumber(effect * 100)}%`);
            }
    
            createTwoElementRow(item_table, "Total Item bonus", `x${formatNumber(skill.speed_modifier)}`);
        }

        const perk_bonuses = gatherPerkBonuses(skill_type);
        if (perk_bonuses.length > 0) {
            const perk_table = createTableSection(table, "Perks");

            let total_effect = 1;
            for (const perk_type of perk_bonuses) {
                const perk = PERKS[perk_type] as PerkDefinition;
                const effect = 1 + perk.skill_modifiers.getSkillEffect(skill_type);
    
                createTwoElementRow(perk_table, `${getPerkNameWithEmoji(perk_type)}`, `x${effect}`);
                total_effect *= effect;
            }
    
            createTwoElementRow(perk_table, "Total Perk bonus", `x${formatNumber(total_effect)}`);
        }

        {
            const total_table = createTableSection(table, "Total Speed");
            createTwoElementRow(total_table, "", `x${formatNumber(calcSkillTaskProgressMultiplier(skill_type))}`);
        }
    }

}

// MARK: Changelog

function showChangelog(since_version = "") {
    RENDERING.changelog_overlay_element.classList.remove("hidden");

    const changelog_overlay = RENDERING.changelog_overlay_element;
    const changelog_div = changelog_overlay.querySelector("#changelog-box");
    if (!changelog_div) {
        console.error("No changelog-box");
        return;
    }

    changelog_div.innerHTML = "";

    const scroll_area = createChildElement(changelog_div, "div");
    scroll_area.className = "scroll-area";

    {
        const close_button = createChildElement(changelog_div, "button");
        close_button.className = "close close-scroll";
        close_button.textContent = "X";

        close_button.addEventListener("click", () => {
            changelog_overlay.classList.add("hidden");
        });

        setupTooltipStatic(close_button, `Close Changelog`, ``);
    }

    createChildElement(scroll_area, "h1").textContent = "Changelog";

    if (SAVE_VERSION != CHANGELOG[0]?.version) {
        const error = createChildElement(scroll_area, "h2");
        error.textContent = "Save version and changelog doesn't match";
        error.className = "error";
    }

    const end_index = since_version.length == 0
        ? CHANGELOG.length
        : CHANGELOG.findIndex((entry) => { return entry.version == since_version });

    if (since_version.length != 0) {
        createChildElement(scroll_area, "p").textContent = `Changes since you last played (${since_version})`;
    }

    for (const entry of CHANGELOG.slice(0, end_index)) {
        const entry_div = createChildElement(scroll_area, "div");
        entry_div.className = "changelog-entry";
        createChildElement(entry_div, "h2").textContent = `${entry.version} (${entry.date})`;
        createChildElement(entry_div, "p").innerHTML = entry.changes;
    }
}

// MARK: Credits

function showCredits() {
    RENDERING.credits_overlay_element.classList.remove("hidden");

    const credits_overlay = RENDERING.credits_overlay_element;
    const credits_div = credits_overlay.querySelector("#credits-box");
    if (!credits_div) {
        console.error("No credits-box");
        return;
    }

    credits_div.innerHTML = "";

    const scroll_area = createChildElement(credits_div, "div");
    scroll_area.className = "scroll-area";

    {
        const close_button = createChildElement(credits_div, "button");
        close_button.className = "close";
        close_button.textContent = "X";

        close_button.addEventListener("click", () => {
            credits_overlay.classList.add("hidden");
        });

        setupTooltipStatic(close_button, `Close Credits`, ``);
    }

    createChildElement(scroll_area, "h1").textContent = "Credits";
    createChildElement(scroll_area, "p").innerHTML = CREDITS;
}

// MARK: Hints

function shouldShowPrepRunHint() {
    if (GAMESTATE.hint_has_gotten_prep_run_hint) {
        return false;
    }

    // Pretty arbitrary numbers for when the player needs to be told if they've not figured it out themselves
    const prep_run_count_to_ignore_hint = 3; // Not 1, since the player might accidentally do it once. Thrice though is clearly deliberate
    const non_prep_run_count_to_trigger_hint = 15;

    return GAMESTATE.hint_prep_runs_done < prep_run_count_to_ignore_hint && GAMESTATE.hint_non_prep_runs_done >= non_prep_run_count_to_trigger_hint;
}

function shouldShowBossHint() {
    if (GAMESTATE.hint_has_gotten_boss_hint) {
        return false;
    }

    const zone_for_hint = 10 - 1; // 0-indexing
    return GAMESTATE.highest_zone >= zone_for_hint && GAMESTATE.power == 0 && GAMESTATE.prestige_count == 0;
}

function showHint(text: string) {
    const overlay = RENDERING.hints_overlay_element;
    overlay.classList.remove("hidden");

    createChildElement(overlay, "h1").textContent = "Hint";
    createChildElement(overlay, "p").innerHTML = text;

    {
        const close_button = createChildElement(overlay, "button");
        close_button.className = "dismiss";
        close_button.textContent = "Dismiss";

        close_button.addEventListener("click", () => {
            overlay.classList.add("hidden");
        });

        setupTooltipStatic(close_button, `Dismiss Hint`, ``);
    }
}

// MARK: Rendering

export class Rendering {
    tooltipped_element: ElementWithTooltip | null = null;
    potential_tooltipped_element: ElementWithTooltip | null = null;
    queued_update_tooltip = false;
    tooltip_element: HTMLElement;
    energy_reset_element: HTMLElement;
    open_energy_reset_element: HTMLInputElement;
    end_of_content_element: HTMLElement;
    settings_element: HTMLElement;
    energy_element: HTMLElement;
    messages_element: HTMLElement;
    message_contexts: Map<Element, RenderEvent> = new Map();
    power_element: HTMLElement;
    attunement_element: HTMLElement;
    open_prestige_element: HTMLElement;
    prestige_overlay_element: HTMLElement;
    confirmation_overlay_element: HTMLElement;
    item_undo_element: HTMLInputElement;
    artifact_undo_element: HTMLInputElement;
    task_elements: Map<TaskDefinition, ElementWithTooltip> = new Map();
    skill_elements: Map<SkillType, HTMLElement> = new Map();
    item_elements: Map<ItemType, HTMLButtonElement> = new Map();
    perk_elements: Map<PerkType, HTMLElement> = new Map();
    controls_list_element: HTMLElement;
    open_stats_element: HTMLElement;
    stats_overlay_element: HTMLElement;
    changelog_overlay_element: HTMLElement;
    credits_overlay_element: HTMLElement;
    hints_overlay_element: HTMLElement;

    energy_reset_count: number = 0;
    current_zone: number = 0;
    item_order: ItemType[] = [];
    artifact_order: ItemType[] = [];
    viewing_last_reset: boolean = false;

    public createTasks() {
        const tasks_div = document.getElementById("tasks");
        if (!tasks_div) {
            console.error("The element with ID 'tasks' was not found.");
            return;
        }
        tasks_div.innerHTML = "";

        for (const task of GAMESTATE.tasks) {
            createTaskDiv(task, tasks_div, this);
        }
    }

    constructor() {
        function getElement(name: string): HTMLElement {
            const energy_div = document.getElementById(name);
            if (energy_div) {
                return energy_div;
            }
            else {
                console.error(`The element with ID '${name}' was not found.`);
                return new HTMLElement();
            }
        }

        this.energy_element = getElement("energy");

        setupTooltip(this.energy_element, function () { return `${ENERGY_TEXT} - ${GAMESTATE.current_energy.toFixed(0)}/${GAMESTATE.max_energy.toFixed(0)}`; }, function () {
            return `${ENERGY_TEXT} goes down over time while you have a Task active`;
        });

        this.tooltip_element = getElement("tooltip");
        this.energy_reset_element = getElement("game-over-overlay");
        this.open_energy_reset_element = getElement("open-energy-reset") as HTMLInputElement;
        this.end_of_content_element = getElement("end-of-content-overlay");
        this.settings_element = getElement("settings-overlay");
        this.messages_element = getElement("messages");
        this.controls_list_element = getElement("controls-list");
        this.power_element = getElement("power");
        this.attunement_element = getElement("attunement");
        this.open_prestige_element = getElement("open-prestige");
        this.prestige_overlay_element = getElement("prestige-overlay");
        this.confirmation_overlay_element = getElement("confirmation-overlay");
        this.item_undo_element = getElement("item-undo") as HTMLInputElement;
        this.artifact_undo_element = getElement("artifact-undo") as HTMLInputElement;
        this.open_stats_element = getElement("open-stats");
        this.stats_overlay_element = getElement("stats-overlay");
        this.changelog_overlay_element = getElement("changelog-overlay");
        this.credits_overlay_element = getElement("credits-overlay");
        this.hints_overlay_element = getElement("hints-overlay");
    }

    public initialize() {
        setupEnergyReset(this.energy_reset_element);
        setupSettings();
        setupControls();
        setupInfoTooltips();
        setupOpenPrestige();
        setupOpenStats();
        setupItemUndo();
    }

    public start() {
        this.createTasks();
        recreateSkills();

        setupZone();
        recreatePerks();
        recreateItemsIfNeeded();

        updateRendering();

        // Unhide the game now that it's ready
        (document.getElementById("game-area") as HTMLElement).classList.remove("hidden");

        if (GAMESTATE.save_version != SAVE_VERSION || SAVE_VERSION != CHANGELOG[0]?.version) {
            showChangelog(GAMESTATE.save_version);
        }
    }
}

function checkForZoneAndReset() {
    if (RENDERING.current_zone == GAMESTATE.current_zone && RENDERING.energy_reset_count == GAMESTATE.energy_reset_count) {
        return;
    }

    const was_reset = GAMESTATE.current_zone == 0;

    RENDERING.current_zone = GAMESTATE.current_zone;
    RENDERING.energy_reset_count = GAMESTATE.energy_reset_count;
    recreateTasks();
    if (was_reset) {
        recreateItemsIfNeeded();
        recreatePerks();
    }
    setupControls();
    setupZone();
    RENDERING.open_energy_reset_element.disabled = GAMESTATE.energy_reset_count == 0;
}

function setupZone() {
    const zone_name = document.getElementById("zone-name");
    if (!zone_name) {
        console.error("The element with ID 'zone-name' was not found.");
        return;
    }

    const zone = ZONES[GAMESTATE.current_zone];
    if (zone) {
        zone_name.innerHTML = `Zone ${GAMESTATE.current_zone + 1} - ${zone.name}`;
    }
}

function hideTooltip() {
    RENDERING.tooltip_element.classList.add("hidden");
    RENDERING.tooltipped_element = null;
}

function showTooltip(element: ElementWithTooltip) {
    if (!element.generateTooltipBody || !element.generateTooltipHeader) {
        console.error("No generateTooltip callback");
        return;
    }

    if (!element.parentNode) {
        hideTooltip();
        return;
    }

    const tooltip_element = RENDERING.tooltip_element;
    // Hide first so it doesn't affect the layout while we're calculating things
    tooltip_element.classList.add("hidden");
    tooltip_element.innerHTML = "";
    RENDERING.tooltipped_element = element;
    
    tooltip_element.innerHTML = `<h3>${element.generateTooltipHeader()}</h3>`;
    const body_text = element.generateTooltipBody();
    if (body_text != ``) {
        tooltip_element.innerHTML += `<hr />`;
        tooltip_element.innerHTML += body_text;
    }
    
    tooltip_element.style.top = "";
    tooltip_element.style.bottom = "";
    tooltip_element.style.left = "";
    tooltip_element.style.right = "";
    
    const elementRect = element.getBoundingClientRect();
    const beyondVerticalCenter = elementRect.top > (window.innerHeight / 2);
    const beyondHorizontalCenter = elementRect.left > (window.innerWidth / 2);
    let x = (beyondHorizontalCenter ? elementRect.left : elementRect.right) + window.scrollX;
    let y = (beyondVerticalCenter ? elementRect.bottom : elementRect.top) + window.scrollY;

    // Energy element covers basically full width so needs its own logic to look good
    if (element.id == "energy") {
        x = elementRect.left + window.scrollX;
        tooltip_element.style.left = x + "px";
        y = elementRect.bottom + scrollY + 5;
        tooltip_element.style.top = y + "px";
    } else {
        if (beyondHorizontalCenter) {
            x = document.documentElement.clientWidth - x;
            tooltip_element.style.right = x + "px";
        } else {
            tooltip_element.style.left = x + "px";
        }
        if (beyondVerticalCenter) {
            y = document.documentElement.clientHeight - y;
            tooltip_element.style.bottom = y + "px";
        } else {
            tooltip_element.style.top = y + "px";
        }
    }

    tooltip_element.classList.remove("hidden");
}

export function updateRendering() {
    handleEvents();
    checkForZoneAndReset();
    updateTaskRendering();
    updateSkillRendering();
    updateEnergyRendering();
    updateExtraStats();
    updateItems();
    updateGameOver();

    if (RENDERING.queued_update_tooltip) {
        RENDERING.queued_update_tooltip = false;
        if (RENDERING.tooltipped_element) {
            showTooltip(RENDERING.tooltipped_element);
        }
    }
}

function inputIsBeingHandled() {
    const activeElement = document.activeElement;
    if (!activeElement) {
        return false;
    }

    const isInputField = activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.getAttribute("contenteditable") === "true";
    return isInputField;
}

export function handleHotkeyReleased(event: KeyboardEvent) {
    // Checked before input handling, since you might be looking at tooltips still
    if (GAMESTATE.manual_tooltips && event.key == "Control") {
        hideTooltip();
    }
    
    if (inputIsBeingHandled()) {
        return;
    }

    if (hasPerk(PerkType.Amulet)) {
        if (event.key == "a") {
            toggleAutomationMode(AutomationMode.All);
        } else if (event.key == "z") {
            toggleAutomationMode(AutomationMode.Zone);
        }
    }

    if (event.key == "i") {
        GAMESTATE.auto_use_items = !GAMESTATE.auto_use_items;
        setupControls();
    } else if (event.key == "r") {
        GAMESTATE.repeat_tasks = !GAMESTATE.repeat_tasks;
        setupControls();
    }
}

export function handleHotkeyPressed(event: KeyboardEvent) {
    if (GAMESTATE.manual_tooltips && event.key == "Control") {
        if (RENDERING.potential_tooltipped_element) {
            showTooltip(RENDERING.potential_tooltipped_element);
        }
    }
}
