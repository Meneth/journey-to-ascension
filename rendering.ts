import { Task, TaskDefinition, ZONES, TaskType, PERKS_BY_ZONE, ITEMS_BY_ZONE } from "./zones.js";
import { clickTask, Skill, calcSkillXpNeeded, calcSkillXpNeededAtLevel, calcTaskProgressMultiplier, calcSkillXp, calcEnergyDrainPerTick, clickItem, calcTaskCost, calcSkillTaskProgressMultiplier, getSkill, hasPerk, doEnergyReset, calcSkillTaskProgressMultiplierFromLevel, saveGame, SAVE_LOCATION, toggleRepeatTasks, calcAttunementGain, calcPowerGain, toggleAutomation, AutomationMode, calcPowerSpeedBonusAtLevel, calcAttunementSpeedBonusAtLevel, calcSkillTaskProgressWithoutLevel, setAutomationMode, hasUnlockedPrestige, PRESTIGE_GAIN_EXPONENT, PRESTIGE_FULLY_COMPLETED_MULT, calcDivineSparkGain, calcDivineSparkGainFromHighestZoneFullyCompleted, calcDivineSparkGainFromHighestZone, getPrestigeRepeatableLevel, hasPrestigeUnlock, calcPrestigeRepeatableCost, addPrestigeUnlock, increasePrestigeRepeatableLevel, doPrestige, knowsPerk, calcDivineSparkDivisor, calcAttunementSkills } from "./simulation.js";
import { GAMESTATE, RENDERING } from "./game.js";
import { ItemType, ItemDefinition, ITEMS, HASTE_MULT, ITEMS_TO_NOT_AUTO_USE } from "./items.js";
import { PerkDefinition, PerkType, PERKS } from "./perks.js";
import { EventType, GainedPerkContext, RenderEvent, SkillUpContext, UnlockedSkillContext, UnlockedTaskContext, UsedItemContext } from "./events.js";
import { SKILL_DEFINITIONS, SkillDefinition, SkillType } from "./skills.js";
import { DIVINE_SPARK_TEXT, ENERGY_TEXT, XP_TEXT } from "./rendering_constants.js";
import { PRESTIGE_UNLOCKABLES, PRESTIGE_REPEATABLES, PrestigeRepeatableType, PRESTIGE_XP_BOOSTER_MULT, GOURMET_ENERGY_ITEM_BOOST_MULT, GOTTA_GO_FAST_BASE } from "./prestige_upgrades.js";

// MARK: Helpers

function createChildElement(parent: Element, child_type: string): HTMLElement {
    const child = document.createElement(child_type);
    parent.appendChild(child);
    return child;
}

function joinWithCommasAndAnd(strings: string[]): string {
    if (strings.length === 0) return "";
    if (strings.length === 1) return strings[0] as string;
    if (strings.length === 2) return `${strings[0]} and ${strings[1]}`;

    const allButLast = strings.slice(0, -1).join(", ");
    const last = strings[strings.length - 1];
    return `${allButLast}, and ${last}`;
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
    task_button.addEventListener("click", () => { clickTask(task); });
    task_button.addEventListener("contextmenu", (e) => { e.preventDefault(); toggleAutomation(task); });

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
        item_indicator.textContent = ITEMS[task.task_definition.item]?.icon as string;
        task_button.appendChild(item_indicator);
    }

    if (task.task_definition.perk != PerkType.Count && !hasPerk(task.task_definition.perk)) {
        const perk_indicator = document.createElement("div");
        perk_indicator.className = "task-perk-indicator";
        perk_indicator.classList.add("indicator");
        perk_indicator.textContent = PERKS[task.task_definition.perk]?.icon as string;
        task_button.appendChild(perk_indicator);
        task_button.classList.add("perk-unlock");
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
            else {
                console.error("Task disabled for unknown reason");
            }
        }

        const task_table = document.createElement("table");
        task_table.className = "table simple-table";

        let asterisk_count = 0;
        let perk_asterisk_index = -1;
        let level_asterisks = "";
        const remaining_completions = (task.reps == task.task_definition.max_reps) ? task.task_definition.max_reps : (task.task_definition.max_reps - task.reps);
        const completions = GAMESTATE.repeat_tasks ? remaining_completions : 1;

        function createTwoElementRow(x: string, y: string) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${y}</td><td>${x}</td>`;
            return row;
        }

        function createTableSection(name: string) {
            const row = document.createElement("tr");
            const header = document.createElement("td");
            header.innerHTML = name;
            row.appendChild(header);

            const contents = document.createElement("td");
            const table = document.createElement("table");
            table.className = "table simple-table";

            contents.appendChild(table);
            row.appendChild(contents);
            task_table.appendChild(row);

            return table;
        }

        {
            const table = createTableSection("Completions");
            table.appendChild(createTwoElementRow(`${completions}`, ""));
        }

        {
            const table = createTableSection("Rewards");

            if (task.task_definition.item != ItemType.Count) {
                const item = ITEMS[task.task_definition.item] as ItemDefinition;
                table.appendChild(createTwoElementRow(`${completions}`, `${item.icon}${item.name} Item`));
            }

            if (task.task_definition.perk != PerkType.Count && !hasPerk(task.task_definition.perk)) {
                const perk = PERKS[task.task_definition.perk] as PerkDefinition;
                const is_last_rep = (task.reps + completions) == task.task_definition.max_reps;
                if (!is_last_rep) { ++asterisk_count; perk_asterisk_index = asterisk_count; }
                table.appendChild(createTwoElementRow(is_last_rep ? `1` : `0${"*".repeat(perk_asterisk_index)}`, `${perk.icon}${knowsPerk(perk.enum) ? perk.name : "Mystery" } Perk`));
            }

            asterisk_count += 1; // Levels will always produce one
            level_asterisks = "*".repeat(asterisk_count);
            for (const skill of task.task_definition.skills) {
                const skill_progress = getSkill(skill);
                const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;

                let xp_gained = completions * calcSkillXp(task, calcTaskCost(task));
                let resulting_level = skill_progress.level;
                let xp_needed = calcSkillXpNeeded(skill_progress) - skill_progress.progress;

                while (xp_gained > xp_needed) {
                    xp_gained -= xp_needed;
                    resulting_level += 1;
                    xp_needed = calcSkillXpNeededAtLevel(resulting_level, skill);
                }

                let levels = ``;

                const levels_diff = resulting_level - skill_progress.level;
                if (levels_diff > 0) {
                    levels = `${resulting_level - skill_progress.level}${level_asterisks}`;
                } else {
                    const level_percentage = xp_gained / calcSkillXpNeeded(skill_progress);
                    if (level_percentage < 0.01) {
                        levels = `<0.01${level_asterisks}`;
                    } else {
                        levels = `${formatNumber(level_percentage)}${level_asterisks}`;
                    }
                }


                table.appendChild(createTwoElementRow(levels, `${skill_definition.icon}${skill_definition.name}`));
            }

            const attunement_gain = completions * calcAttunementGain(task);
            if (attunement_gain > 0) {
                table.appendChild(createTwoElementRow(`${attunement_gain}`, `🌀Attunement`));
            }

            const power_gain = completions * calcPowerGain(task);
            if (power_gain > 0 && GAMESTATE.has_unlocked_power) {
                table.appendChild(createTwoElementRow(`${power_gain}`, `💪Power`));
            }
        }

        {
            const table = createTableSection("Cost Estimate");

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
            table.appendChild(createTwoElementRow(`${energy_cost_text}`, ENERGY_TEXT));

            const task_ticks = estimateTotalTaskTicks(task, completions);
            if (task_ticks != completions) {
                table.appendChild(createTwoElementRow(formatNumber(estimateTaskTimeInSeconds(task, completions)), `⏰Seconds`));
            } else {
                table.appendChild(createTwoElementRow(`${completions}`, `⏰Ticks`));
            }
        }

        {
            const table = createTableSection("Modifiers");
            const mult = task.task_definition.xp_mult;
            let mult_class = "";
            if (mult != 1) { mult_class = mult > 1 ? "good" : "bad"; }
            table.appendChild(createTwoElementRow(`<span class="${mult_class}">x${mult}</span>`, `${XP_TEXT} Multiplier`));
        }

        tooltip += task_table.outerHTML;

        if (perk_asterisk_index >= 0) {
            tooltip += `<p class="tooltip-asterisk">${"*".repeat(perk_asterisk_index)} Perk is only gained on completing all Reps of the Task</p>`;
        }
        tooltip += `<p class="tooltip-asterisk">${level_asterisks} Task does not need to be completed, ${XP_TEXT} is given proportionally to the progress made</p>`;

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
            button.disabled = !task.enabled;
            button.classList.toggle("disabled", button.disabled);
        }
        else {
            console.error("No task-button");
        }

        const automation = task_element.querySelector<HTMLDivElement>(".task-automation");
        if (automation) {
            const prios = GAMESTATE.automation_prios.get(GAMESTATE.current_zone);
            if (prios) {
                const index = prios.indexOf(task.task_definition.id);
                const index_str = index >= 0 ? `${index + 1}` : "";
                if (automation.textContent != index_str) {
                    automation.textContent = index_str;
                }
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

function estimateTotalTaskTicks(task: Task, completions: number): number {
    let haste_stacks = GAMESTATE.queued_scrolls_of_haste;
    if (task.hasted) {
        haste_stacks += 1;
    }
    const haste_completions = Math.min(completions, haste_stacks);
    const non_haste_completion = completions - haste_completions;

    let num_ticks = 0;
    let progress_mult = calcTaskProgressMultiplier(task, true);

    num_ticks += Math.ceil(calcTaskCost(task) / progress_mult) * non_haste_completion;
    progress_mult *= HASTE_MULT;
    num_ticks += Math.ceil(calcTaskCost(task) / progress_mult) * haste_completions;

    return num_ticks;
}

function estimateTaskTimeInSeconds(task: Task, completions: number): number {
    return estimateTotalTaskTicks(task, completions) * GAMESTATE.tick_interval_ms / 1000;
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
    return num_ticks * calcEnergyDrainPerTick(task, num_ticks == completions);
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
    element.addEventListener("pointerenter", () => {
        showTooltip(element);
    });
    element.addEventListener("pointerleave", () => {
        hideTooltip();
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
        tooltip += `<br>Right-click to use all rather than just one`;
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
        return tooltip;
    });
}

function updateTooltip() {
    if (RENDERING.tooltipped_element) {
        showTooltip(RENDERING.tooltipped_element);
    }
}

// MARK: Items

function createItemDiv(item: ItemType, items_div: HTMLElement) {
    const button = document.createElement("button");
    button.className = "item-button";
    button.classList.add("element");

    const item_definition = ITEMS[item] as ItemDefinition;
    const item_count = GAMESTATE.items.get(item);
    button.innerHTML = `<span class="text">${item_definition.icon}<br>(${item_count})</span>`;
    button.disabled = item_count == 0;
    button.classList.toggle("disabled", button.disabled);

    button.addEventListener("click", () => { clickItem(item, false); });
    button.addEventListener("contextmenu", (e) => { e.preventDefault(); clickItem(item, true); });

    setupTooltipStatic(button, `${item_definition.name}`, `${item_definition.get_tooltip()}`);

    items_div.appendChild(button);
    RENDERING.item_elements.set(item, button);
}

function recreateItems() {
    const items_div = document.getElementById("items-list");
    if (!items_div) {
        console.error("The element with ID 'items-list' was not found.");
        return;
    }

    items_div.innerHTML = "";

    const items: [type: ItemType, amount: number][] = [];

    for (const item of ITEMS_BY_ZONE) {
        const amount = GAMESTATE.items.get(item);
        if (amount !== undefined) {
            items.push([item, amount]);
        }
    }

    sortItems(items);

    for (const [item,] of items) {
        createItemDiv(item, items_div);
    }
}

function sortItems(items: [type: ItemType, amount: number][]) {
    items.sort((a, b) => {
        // Items we actually have first
        if ((a[1] == 0) != (b[1] == 0)) {
            return (a[1] == 0) ? 1 : -1;
        }

        // Then special items
        if (ITEMS_TO_NOT_AUTO_USE.includes(a[0]) != ITEMS_TO_NOT_AUTO_USE.includes(b[0])) {
            return ITEMS_TO_NOT_AUTO_USE.includes(a[0]) ? -1 : 1;
        }

        // Then just stick with the order provided
        return 0;
    });
}

function setupAutoUseItemsControl() {
    if (!hasPerk(PerkType.DeepTrance)) {
        return;
    }

    const item_control = document.createElement("button");
    item_control.className = "element";

    function setItemControlName() {
        item_control.textContent = GAMESTATE.auto_use_items ? "Auto Use Items" : "Manual Use Items";
    }
    setItemControlName();

    item_control.addEventListener("click", () => {
        GAMESTATE.auto_use_items = !GAMESTATE.auto_use_items;
        setItemControlName();
    });

    setupTooltipStaticHeader(item_control, `${item_control.textContent}`, function () {
        let tooltip = "Toggle between items being used automatically, and only being used manually";
        tooltip += "<br>Won't use the Scroll of Haste";

        return tooltip;
    });

    RENDERING.controls_list_element.appendChild(item_control);
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

    setupTooltipStatic(perk_div, `${perk_definition.name}`, `${perk_definition.get_tooltip()}<br><br>Unlocked in Zone ${zone + 1}`);

    perk_div.appendChild(perk_text);
    perks_div.appendChild(perk_div);
    RENDERING.perk_elements.set(perk, perk_div);
}

function createPerks() {
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

    if (GAMESTATE.is_in_energy_reset) {
        energy_reset_div.innerHTML = "<h2>Run Over</h2>" +
            "<p>You used up all your Energy.</p>" +
            "<p>You keep half your Items (rounded up).</p>" +
            "<p>The effects of used Items disappear.</p>" +
            "<p>You keep all your Skills and Perks.</p>";
    } else {
        energy_reset_div.innerHTML = "<h2>Last Run</h2>";
    }

    const button = document.createElement("button");
    button.className = "game-over-dismiss";
    button.textContent = GAMESTATE.is_in_energy_reset ? "Restart" : "Dismiss";

    button.addEventListener("click", () => {
        energy_reset_div.classList.add("hidden");
        if (GAMESTATE.is_in_energy_reset) {
            doEnergyReset();
        }
    });
    setupTooltipStatic(button, button.textContent, GAMESTATE.is_in_energy_reset ? "Do Energy Reset" : "Return to the game");
    energy_reset_div.appendChild(button);

    const skill_gain = document.createElement("div");

    skill_gain.innerHTML = "";

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
        power_gain_text.textContent = `Power: +${power_gain} (x${speed_bonus.toFixed(2)} speed)`;

        skill_gain.appendChild(power_gain_text);
    }

    const attunement_gain = info.attunement_at_end - info.attunement_at_start;
    if (attunement_gain > 0) {
        const attunement_gain_text = document.createElement("p");
        const speed_bonus = calcAttunementSpeedBonusAtLevel(info.attunement_at_end) / calcAttunementSpeedBonusAtLevel(info.attunement_at_start);
        attunement_gain_text.textContent = `Attunement: +${attunement_gain} (x${speed_bonus.toFixed(2)} speed)`;

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
        if (open_button?.disabled) {
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

    reset_count.textContent = `You've done ${GAMESTATE.energy_reset_count} Energy Resets`;
}

function updateGameOver() {
    const showing_energy_reset = !RENDERING.energy_reset_element.classList.contains("hidden");
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

    prestige_div.innerHTML = "";

    const scroll_area = createChildElement(prestige_div, "div");
    scroll_area.className = "scroll-area";

    {
        const close_button = createChildElement(prestige_div, "button");
        close_button.className = "close";
        close_button.textContent = "X";

        close_button.addEventListener("click", () => {
            prestige_overlay.classList.add("hidden");
        });

        setupTooltipStatic(close_button, `Close Prestige Menu`, ``);
    }


    {
        const summary_div = createChildElement(scroll_area, "div");
        const header = createChildElement(summary_div, "h1");
        header.textContent = "Prestige";

        const divine_spark = createChildElement(summary_div, "p");
        divine_spark.textContent = `${DIVINE_SPARK_TEXT}: ${formatNumber(GAMESTATE.divine_spark, false)} (+${formatNumber(calcDivineSparkGain(), false)})`;

        const divine_spark_gain = createChildElement(summary_div, "p");
        divine_spark_gain.innerHTML = `${DIVINE_SPARK_TEXT} gain:<br>Highest Zone ^ ${PRESTIGE_GAIN_EXPONENT} + ${PRESTIGE_FULLY_COMPLETED_MULT} * (Highest Zone fully completed ^ ${PRESTIGE_GAIN_EXPONENT})`;
        divine_spark_gain.innerHTML += `<br>Gain divisor: ${formatNumber( calcDivineSparkDivisor(), false)}`;

        const divine_spark_gain_stats = createChildElement(summary_div, "p");
        divine_spark_gain_stats.innerHTML = `Highest Zone reached: ${GAMESTATE.highest_zone + 1}`;
        divine_spark_gain_stats.innerHTML += `<br>Highest Zone fully completed: ${GAMESTATE.highest_zone_fully_completed + 1}`;

        const potentialReachGain = calcDivineSparkGainFromHighestZone(GAMESTATE.highest_zone + 1) - calcDivineSparkGainFromHighestZone(GAMESTATE.highest_zone);
        divine_spark_gain_stats.innerHTML += `<br>Additional ${DIVINE_SPARK_TEXT} for reaching Zone ${GAMESTATE.highest_zone + 2}: ${formatNumber(potentialReachGain, false)}`;

        const potentialFullCompletionGain = calcDivineSparkGainFromHighestZoneFullyCompleted(GAMESTATE.highest_zone_fully_completed + 1) - calcDivineSparkGainFromHighestZoneFullyCompleted(GAMESTATE.highest_zone_fully_completed);
        divine_spark_gain_stats.innerHTML += `<br>Additional ${DIVINE_SPARK_TEXT} for fully completing Zone ${GAMESTATE.highest_zone_fully_completed + 2}: ${formatNumber(potentialFullCompletionGain, false)}`;

        const prestige_button = createChildElement(summary_div, "button");
        prestige_button.textContent = "Prestige";
        prestige_button.className = "do-prestige";
        (prestige_button as HTMLInputElement).disabled = !GAMESTATE.prestige_available;

        setupTooltipStaticHeader(prestige_button, "Do Prestige Reset", () => {
            let desc = "";
            if (!GAMESTATE.prestige_available) {
                desc += `<p class="disable-reason">Disabled until you complete the <span class="Prestige">Prestige</span> task in Zone 15</p>`;
            }

            desc += `Will reset <b><i>everything</i></b> except that which is granted by Prestige itself, but gives ${DIVINE_SPARK_TEXT} in return`;

            return desc;
        });

        prestige_button.addEventListener("click", () => {
            doPrestige();
            populatePrestigeView();
        });

        prestige_button.classList.toggle("prestige-glow", GAMESTATE.prestige_count == 0);
    }

    {
        const touch_the_divine_div = createChildElement(scroll_area, "div");
        touch_the_divine_div.className = "prestige-section";

        const header = createChildElement(touch_the_divine_div, "h2");
        header.textContent = "Touch the Divine";

        const unlockables_div = createChildElement(touch_the_divine_div, "div");
        const unlockables_header = createChildElement(unlockables_div, "h3");
        unlockables_header.textContent = "Unlockables";
        const unlockables_purchases = createChildElement(unlockables_div, "div");
        unlockables_purchases.className = "prestige-purchases";

        for (const unlock of PRESTIGE_UNLOCKABLES) {
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

        for (const upgrade of PRESTIGE_REPEATABLES) {
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
                    case PrestigeRepeatableType.KnowledgeBoost:
                        desc += `+${formatNumber(PRESTIGE_XP_BOOSTER_MULT * level * 100, false)}%`
                        break;
                    case PrestigeRepeatableType.UnlimitedPower:
                        desc += `x${formatNumber(Math.pow(2, level), false)}`
                        break;
                    case PrestigeRepeatableType.Gourmet:
                        desc += `+${formatNumber(GOURMET_ENERGY_ITEM_BOOST_MULT * level * 100, false)}%`
                        break;
                    case PrestigeRepeatableType.GottaGoFast:
                        desc += `x${formatNumber(Math.pow(GOTTA_GO_FAST_BASE, level))}`
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
}

function setupOpenPrestige() {
    const prestige_overlay = RENDERING.prestige_overlay_element;
    const open_button = RENDERING.open_prestige_element;

    open_button.addEventListener("click", () => {
        populatePrestigeView();
        prestige_overlay.classList.remove("hidden");
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

    const postfixes = ["k", "M", "B", "T"];
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

    setupTooltipStatic(close_button, `Close Settings Menu`, ``);

    setupPersistence(settings_div);
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

        const file_name = `Incremental_save_Reset_${GAMESTATE.energy_reset_count}_energy_${GAMESTATE.current_energy.toFixed(0)}.json`;

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
                const fileText = event.target?.result as string;
                localStorage.setItem(SAVE_LOCATION, fileText as string);
                location.reload();
            };
            reader.readAsText(file);
        });

        input.click();
    });

    setupTooltipStatic(load_button, `Import Save`, `Load the game's progress from disk`);
}

// MARK: Events

function handleEvents() {
    const events = GAMESTATE.popRenderEvents();
    const messages = RENDERING.messages_element;
    for (const event of events) {
        if (event.type == EventType.TaskCompleted) {
            updateTooltip();
            continue; // No message, just forces tooltips to update
        }

        if (event.type == EventType.GainedItem) {
            recreateItems();
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
                    message_div.innerHTML += `<br>${perk.get_tooltip()}`;
                    setupControls(); // Show the automation controls
                    recreateTasks(); // Get rid of Perk indicator
                    createPerks();
                    break;
                }
            case EventType.UsedItem:
                {
                    const item_context = context as UsedItemContext;
                    const item = ITEMS[item_context.item] as ItemDefinition;
                    message_div.innerHTML = `Used ${item_context.count} ${item.icon}${item.name}`;
                    message_div.innerHTML += `<br>${item.get_effect_text(item_context.count)}`;
                    recreateItems();
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
    }
    setRepControlName();

    rep_control.addEventListener("click", () => {
        toggleRepeatTasks();
        setRepControlName();
    });

    setupTooltip(rep_control, function () { return rep_control.textContent; }, function () {
        return "Toggle between repeating Tasks if they have multiple reps, or only doing a single rep<br>When repeating, the Task tooltip will show the numbers for doing all remaining reps rather than just one";
    });

    RENDERING.controls_list_element.appendChild(rep_control);
}

// MARK: Controls - Automation

function setupAutomationControls() {
    if (!hasPerk(PerkType.DeepTrance)) {
        return;
    }

    const automation = document.createElement("div");
    automation.className = "automation";

    const automation_text = document.createElement("div");
    automation_text.className = "automation-text";
    automation.textContent = "Automation";

    const all_control = document.createElement("button");
    const zone_control = document.createElement("button");

    all_control.textContent = "All";
    zone_control.textContent = "Zone";

    function setAutomationClasses() {
        all_control.className = GAMESTATE.automation_mode == AutomationMode.All ? "on" : "off";
        zone_control.className = GAMESTATE.automation_mode == AutomationMode.Zone ? "on" : "off";
    }

    setAutomationClasses();

    all_control.addEventListener("click", () => {
        setAutomationMode(GAMESTATE.automation_mode == AutomationMode.All ? AutomationMode.Off : AutomationMode.All);
        setAutomationClasses();
    });
    zone_control.addEventListener("click", () => {
        setAutomationMode(GAMESTATE.automation_mode == AutomationMode.Zone ? AutomationMode.Off : AutomationMode.Zone);
        setAutomationClasses();
    });

    setupTooltip(all_control, function () { return `Automate ${all_control.textContent}`; }, function () {
        let tooltip = "Toggle between automating Ttasks in all zones, and not automating";
        tooltip += "<br>Right-click Ttasks to designate them as automated";
        tooltip += "<br>They'll be executed in the order you right-clicked them, as indicated by the number in their corner";

        return tooltip;
    });

    setupTooltip(zone_control, function () { return `Automate ${zone_control.textContent}`; }, function () {
        let tooltip = "Toggle between automating Tasks in the current zone, and not automating";
        tooltip += "<br>Right-click Tasks to designate them as automated";
        tooltip += "<br>They'll be executed in the order you right-clicked them, as indicated by the number in their corner";

        return tooltip;
    });

    automation.appendChild(automation_text);
    automation.appendChild(all_control);
    automation.appendChild(zone_control);
    RENDERING.controls_list_element.appendChild(automation);
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

    RENDERING.open_prestige_element.classList.toggle("prestige-glow", GAMESTATE.prestige_count == 0);
}

// MARK: Rendering

export class Rendering {
    tooltipped_element: ElementWithTooltip | null = null;
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
    task_elements: Map<TaskDefinition, ElementWithTooltip> = new Map();
    skill_elements: Map<SkillType, HTMLElement> = new Map();
    item_elements: Map<ItemType, HTMLElement> = new Map();
    perk_elements: Map<PerkType, HTMLElement> = new Map();
    controls_list_element: HTMLElement;

    energy_reset_count: number = 0;
    current_zone: number = 0;

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
    }

    public initialize() {
        setupEnergyReset(this.energy_reset_element);
        setupSettings();
        setupControls();
        setupInfoTooltips();
        setupOpenPrestige();
    }

    public start() {
        this.createTasks();
        recreateSkills();

        setupZone();
        createPerks();
        recreateItems();

        updateRendering();

        // Unhide the game now that it's ready
        (document.getElementById("game-area") as HTMLElement).classList.remove("hidden");
    }
}

function checkForZoneAndReset() {
    if (RENDERING.current_zone == GAMESTATE.current_zone && RENDERING.energy_reset_count == GAMESTATE.energy_reset_count) {
        return;
    }

    RENDERING.current_zone = GAMESTATE.current_zone;
    RENDERING.energy_reset_count = GAMESTATE.energy_reset_count;
    recreateTasks();
    recreateItems();
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
        zone_name.innerHTML = `Zone ${GAMESTATE.current_zone + 1}<br>${zone.name}`;
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

    RENDERING.tooltipped_element = element;

    const tooltip_element = RENDERING.tooltip_element;
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
    updateGameOver();
}
