import { Task, TaskDefinition, ZONES, TaskType } from "./zones.js";
import { clickTask, Skill, calcSkillXpNeeded, calcSkillXpNeededAtLevel, calcTaskProgressMultiplier, calcSkillXp, calcEnergyDrainPerTick, clickItem, calcTaskCost, calcSkillTaskProgressMultiplier, getSkill, hasPerk, doEnergyReset, calcSkillTaskProgressMultiplierFromLevel, saveGame, SAVE_LOCATION, toggleRepeatTasks, calcAttunementGain, calcPowerGain, toggleAutomation, AutomationMode, calcPowerSpeedBonusAtLevel, calcAttunementSpeedBonusAtLevel, calcSkillTaskProgressWithoutLevel, setAutomationMode } from "./simulation.js";
import { GAMESTATE, RENDERING } from "./game.js";
import { ItemType, ItemDefinition, ITEMS, HASTE_MULT, ITEMS_TO_NOT_AUTO_USE } from "./items.js";
import { PerkDefinition, PerkType, PERKS, ENERGETIC_MEMORY_MULT } from "./perks.js";
import { EventContext, EventType, GainedPerkContext, RenderEvent, SkillUpContext, UnlockedSkillContext, UnlockedTaskContext, UsedItemContext } from "./events.js";
import { SKILL_DEFINITIONS, SkillDefinition, SkillType } from "./skills.js";
import { ENERGY_TEXT, XP_TEXT } from "./rendering_constants.js";

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

    setupTooltip(skill_div, function() { return `${skill_definition.icon}${skill_definition.name} - Level ${skill.level}`; }, function () {
        var tooltip = `Speed multiplier: x${formatNumber(calcSkillTaskProgressMultiplier(skill.type))}`;
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
    var skills_div = document.getElementById("skills");
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

        var element = RENDERING.skill_elements.get(skill.type) as HTMLElement;
        var fill = element.querySelector<HTMLDivElement>(".progress-fill");
        if (fill) {
            fill.style.width = `${skill.progress * 100 / calcSkillXpNeeded(skill)}%`;
        }

        var name = element.querySelector<HTMLDivElement>(".sidebar-item-text");
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

let TASK_TYPE_NAMES = ["Normal", "Travel", "Mandatory", "Prestige", "Boss"];

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
    var skillText = "Skills: ";
    var skillStrings: string[] = [];
    for (const skill of task.task_definition.skills) {
        const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;
        skillStrings.push(`${skill_definition.icon}${skill_definition.name}`);
    }
    skillText += skillStrings.join(", ");
    skillsUsed.textContent = skillText;

    if (task.task_definition.item != ItemType.Count) {
        var item_indicator = document.createElement("div");
        item_indicator.className = "task-item-indicator";
        item_indicator.classList.add("indicator");
        item_indicator.textContent = ITEMS[task.task_definition.item]?.icon as string;
        task_button.appendChild(item_indicator);
    }

    if (task.task_definition.perk != PerkType.Count && !hasPerk(task.task_definition.perk)) {
        var perk_indicator = document.createElement("div");
        perk_indicator.className = "task-perk-indicator";
        perk_indicator.classList.add("indicator");
        perk_indicator.textContent = PERKS[task.task_definition.perk]?.icon as string;
        task_button.appendChild(perk_indicator);
        task_button.classList.add("perk-unlock");
    }

    const task_reps_div = document.createElement("div");
    task_reps_div.className = "task-reps";

    if (task.task_definition.type != TaskType.Travel) {
        for (var i = 0; i < task.task_definition.max_reps; ++i) {
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

    setupTooltip(task_div, function() {return `${task.task_definition.name}`;}, function () {
        const task_type = TASK_TYPE_NAMES[task.task_definition.type];
        var tooltip = `<p class="subheader ${task_type}">${task_type} Task</p>`;
        
        if (!task.enabled) {
            if (task.task_definition.type == TaskType.Travel) {
                tooltip += `<p class="disable-reason">Disabled until you complete the <span class="Mandatory">Mandatory</span> tasks</p>`;
            }
            else if (task.reps >= task.task_definition.max_reps) {
                tooltip += `<p class="disable-reason">Disabled due to being fully completed</p>`;
            }
            else {
                console.error("Task disabled for unknown reason");
            }
        }

        var task_table = document.createElement("table");
        task_table.className = "table simple-table";

        var asterisk_count = 0;
        var perk_asterisk_index = -1;
        var level_asterisks = "";
        const remaining_completions = (task.reps == task.task_definition.max_reps) ? task.task_definition.max_reps : (task.task_definition.max_reps - task.reps);
        const completions = GAMESTATE.repeat_tasks ? remaining_completions : 1;

        function createTwoElementRow(x: string, y: string) {
            var row = document.createElement("tr");
            row.innerHTML = `<td>${y}</td><td>${x}</td>`;
            return row;
        }

        function createTableSection(name: string) {
            var row = document.createElement("tr");
            var header = document.createElement("td");
            header.innerHTML = name;
            row.appendChild(header);

            var contents = document.createElement("td");
            var table = document.createElement("table");
            table.className = "table simple-table";

            contents.appendChild(table);
            row.appendChild(contents);
            task_table.appendChild(row);

            return table;
        }

        {
            var table = createTableSection("Completions");
            table.appendChild(createTwoElementRow(`${completions}`, ""));
        }

        {
            var table = createTableSection("Rewards");

            if (task.task_definition.item != ItemType.Count) {
                const item = ITEMS[task.task_definition.item] as ItemDefinition;
                table.appendChild(createTwoElementRow(`${completions}`, `${item.icon}${item.name} Item` ));
            }

            if (task.task_definition.perk != PerkType.Count && !hasPerk(task.task_definition.perk)) {
                const perk = PERKS[task.task_definition.perk] as PerkDefinition;
                const is_last_rep = (task.reps + completions) == task.task_definition.max_reps;
                if (!is_last_rep) { ++asterisk_count; perk_asterisk_index = asterisk_count; }
                table.appendChild(createTwoElementRow(is_last_rep ? `1` : `0${"*".repeat(perk_asterisk_index)}`, `${perk.icon}Mystery Perk` ));
            }
            
            asterisk_count += 1; // Levels will always produce one
            level_asterisks = "*".repeat(asterisk_count);
            for (const skill of task.task_definition.skills) {
                const skill_progress = getSkill(skill);
                const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;

                var xp_gained = completions * calcSkillXp(task, calcTaskCost(task));
                var resulting_level = skill_progress.level;
                var xp_needed = calcSkillXpNeeded(skill_progress) - skill_progress.progress;

                while (xp_gained > xp_needed) {
                    xp_gained -= xp_needed;
                    resulting_level += 1;
                    xp_needed = calcSkillXpNeededAtLevel(resulting_level, skill);
                }

                var levels = ``;

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
            var table = createTableSection("Cost Estimate");

            table.appendChild(createTwoElementRow(formatNumber(completions * estimateTotalTaskEnergyConsumption(task)), ENERGY_TEXT));

            const task_ticks = completions * estimateTotalTaskTicks(task);
            if (task_ticks != completions) {
                table.appendChild(createTwoElementRow(formatNumber(completions * estimateTaskTimeInSeconds(task)), `⏰Seconds`));
            } else {
                table.appendChild(createTwoElementRow(`${completions}`, `⏰Ticks`));
            }
        }

        {
            var table = createTableSection("Modifiers");
            table.appendChild(createTwoElementRow(`x${task.task_definition.xp_mult}`, `${XP_TEXT} Multiplier`));
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
    if (GAMESTATE.energy_reset_count != RENDERING.energy_reset_count) {
        RENDERING.energy_reset_count = GAMESTATE.energy_reset_count;
        recreateTasks();
        recreateItems();
    }

    for (const task of GAMESTATE.tasks) {
        var task_element = RENDERING.task_elements.get(task.task_definition) as HTMLElement;
        var fill = task_element.querySelector<HTMLDivElement>(".progress-fill");
        if (fill) {
            fill.style.width = `${task.progress * 100 / calcTaskCost(task)}%`;
        }
        else {
            console.error("No progress-fill");
        }

        var button = task_element.querySelector<HTMLInputElement>(".task-button");
        if (button) {
            button.disabled = !task.enabled;
        }
        else {
            console.error("No task-button");
        }

        var automation = task_element.querySelector<HTMLDivElement>(".task-automation");
        if (automation) {
            var prios = GAMESTATE.automation_prios.get(GAMESTATE.current_zone);
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
            var reps = task_element.getElementsByClassName("task-rep");
            for (var i = 0; i < task.reps; ++i) {
                (reps[i] as HTMLElement).classList.add("finished");
            }
        }
    }
}

function estimateTotalTaskTicks(task: Task): number {
    var progress_mult = calcTaskProgressMultiplier(task);
    if (!task.hasted && GAMESTATE.queued_scrolls_of_haste > 0) {
        progress_mult *= HASTE_MULT;
    }

    const num_ticks = Math.ceil(calcTaskCost(task) / progress_mult);
    return num_ticks;
}

function estimateTaskTimeInSeconds(task: Task): number {
    return estimateTotalTaskTicks(task) * GAMESTATE.tick_interval_ms / 1000;
}

// MARK: Energy
function updateEnergyRendering() {
    var fill = RENDERING.energy_element.querySelector<HTMLDivElement>(".progress-fill");
    if (fill) {
        fill.style.width = `${GAMESTATE.current_energy * 100 / GAMESTATE.max_energy}%`;
    }

    var value = RENDERING.energy_element.querySelector<HTMLDivElement>(".progress-value");
    if (value) {
        const new_html = `${GAMESTATE.current_energy.toFixed(0)}`;
        // Avoid flickering in the debugger
        if (new_html != value.innerHTML) {
            value.textContent = new_html;
        }
    }

    const energy_percentage = GAMESTATE.current_energy / GAMESTATE.max_energy;
    if (energy_percentage < 0.15) {
        RENDERING.energy_element.classList.add("low-energy");
    } else {
        RENDERING.energy_element.classList.remove("low-energy");
    }
}

function estimateTotalTaskEnergyConsumption(task: Task): number {
    const num_ticks = estimateTotalTaskTicks(task);
    return num_ticks * calcEnergyDrainPerTick(task, num_ticks == 1);
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
    element.addEventListener("pointerenter", (e) => {
        showTooltip(element);
    });
    element.addEventListener("pointerleave", (e) => {
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
        var tooltip = `Items can be used to get bonuses that last until the next Energy Reset`;
        tooltip += `<br>The bonuses stack additively; 2 +100% results in 3x speed, not 4x`;
        tooltip += `<br>Right-click to use all rather than just one`;
        return tooltip;
    });

    const perk_info = document.querySelector<HTMLElement>("#perks .section-info");

    if (!perk_info) {
        console.error("No perk info element");
        return;
    }

    setupTooltipStaticHeader(perk_info,`Perks`, function () {
        var tooltip = `Perks are permanent bonuses with a variety of effects`;
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

    var item_definition = ITEMS[item] as ItemDefinition;
    var item_count = GAMESTATE.items.get(item);
    button.textContent = `${item_definition.icon} (${item_count})`;
    button.disabled = item_count == 0;

    button.addEventListener("click", () => { clickItem(item, false); });
    button.addEventListener("contextmenu", (e) => { e.preventDefault(); clickItem(item, true); });

    setupTooltipStatic(button, `${item_definition.name}`, `${item_definition.tooltip}`);

    items_div.appendChild(button);
    RENDERING.item_elements.set(item, button);
}

function recreateItems() {
    var items_div = document.getElementById("items-list");
    if (!items_div) {
        console.error("The element with ID 'items-list' was not found.");
        return;
    }

    items_div.innerHTML = "";

    var items: [type: ItemType, amount: number][] = [];

    for (const [item, amount] of GAMESTATE.items) {
        items.push([item, amount]);
    }

    sortItems(items);

    for (const [item, amount] of items) {
        createItemDiv(item, items_div);
    }
}

function sortItems(items: [type: ItemType, amount: number][]) {
    items.sort((a, b) => {
        // Items we actually have first
        if ((a[1] == 0) != (b[1] == 0))
        {
            return (a[1] == 0) ? 1 : -1;
        }
            
        // Then special items
        if (ITEMS_TO_NOT_AUTO_USE.includes(a[0]) != ITEMS_TO_NOT_AUTO_USE.includes(b[0])) {
            return ITEMS_TO_NOT_AUTO_USE.includes(a[0]) ? -1 : 1;
        }

        // Then just definition order
        return a[0] < b[0] ? -1 : 0;
    });
}

function setupAutoUseItemsControl() {
    if (!hasPerk(PerkType.DeepTrance)) {
        return;
    }

    var item_control = document.createElement("button");
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
        var tooltip = "Toggle between items being used automatically, and only being used manually";
        tooltip += "<br>Won't use the Scroll of Haste";

        return tooltip;
    });

    RENDERING.controls_list_element.appendChild(item_control);
}

// MARK: Perks

function createPerkDiv(perk: PerkType, perks_div: HTMLElement) {
    const perk_div = document.createElement("div");
    perk_div.className = "perk";
    perk_div.classList.add("element");

    const perk_text = document.createElement("span");
    perk_text.className = "perk-text";

    var perk_definition = PERKS[perk] as PerkDefinition;

    perk_text.textContent = perk_definition.icon;

    setupTooltipStatic(perk_div, `${perk_definition.name}`, `${perk_definition.tooltip}`);

    perk_div.appendChild(perk_text);
    perks_div.appendChild(perk_div);
    RENDERING.perk_elements.set(perk, perk_div);
}

function createPerks() {
    var perks_div = document.getElementById("perks-list");
    if (!perks_div) {
        console.error("The element with ID 'perks-list' was not found.");
        return;
    }

    perks_div.innerHTML = "";

    for (const perk of GAMESTATE.perks.keys()) {
        createPerkDiv(perk, perks_div);
    }
}

function updatePerks() {
    if (GAMESTATE.perks.size != RENDERING.perk_elements.size) {
        createPerks();
    }
}

// MARK: Game over

function populateGameOver(game_over_div: HTMLElement) {
    var open_button = document.querySelector<HTMLInputElement>("#open-energy-reset");
    if (!open_button) {
        console.error("No open-energy-reset button");
        return;
    }

    open_button.disabled = false;

    game_over_div.style.display = "flex";
    game_over_div.innerHTML = "";

    if (GAMESTATE.is_in_game_over) {
        game_over_div.innerHTML = "<h2>Run Over</h2>" +
                "<p>You used up all your Energy.</p>" +
                "<p>You keep half your Items (rounded up).</p>" +
                "<p>The effects of used Items disappear.</p>" +
                "<p>You keep all your Skills and Perks.</p>";
    } else {
        game_over_div.innerHTML = "<h2>Last Run</h2>";
    }

    var button = document.createElement("button");
    button.className = "game-over-dismiss";
    button.textContent = GAMESTATE.is_in_game_over ? "Restart" : "Dismiss";

    button.addEventListener("click", () => {
        game_over_div.style.display = "none";
        if (GAMESTATE.is_in_game_over) {
            doEnergyReset();
        }
    });
    setupTooltipStatic(button, button.textContent, GAMESTATE.is_in_game_over ? "Do Energy Reset" : "Return to the game");
    game_over_div.appendChild(button);

    var skill_gain = document.createElement("div");

    skill_gain.innerHTML = "";

    const info = GAMESTATE.game_over_info;

    for (const [skill, skill_diff] of info.skill_gains) {
        var skill_gain_text = document.createElement("p");
        const skill_definition = SKILL_DEFINITIONS[skill] as SkillDefinition;
        skill_gain_text.textContent = `${skill_definition.icon}${skill_definition.name}: +${skill_diff} (x${calcSkillTaskProgressMultiplierFromLevel(skill_diff).toFixed(2)} speed)`;

        skill_gain.appendChild(skill_gain_text);
    };

    const power_gain = info.power_at_end - info.power_at_start;
    if (power_gain > 0) {
        var power_gain_text = document.createElement("p");
        const speed_bonus = calcPowerSpeedBonusAtLevel(info.power_at_end) / calcPowerSpeedBonusAtLevel(info.power_at_start);
        power_gain_text.textContent = `Power: +${power_gain} (x${speed_bonus.toFixed(2)} speed)`;

        skill_gain.appendChild(power_gain_text);
    }

    const attunement_gain = info.attunement_at_end - info.attunement_at_start;
    if (attunement_gain > 0) {
        var attunement_gain_text = document.createElement("p");
        const speed_bonus = calcAttunementSpeedBonusAtLevel(info.attunement_at_end) / calcAttunementSpeedBonusAtLevel(info.attunement_at_start);
        attunement_gain_text.textContent = `Attunement: +${attunement_gain} (x${speed_bonus.toFixed(2)} speed)`;

        skill_gain.appendChild(attunement_gain_text);
    }

    if (hasPerk(PerkType.EnergeticMemory)) {
        var energetic_memory_gain_text = document.createElement("p");
        energetic_memory_gain_text.textContent = `Max ${ENERGY_TEXT}: +${info.energetic_memory_gain} (Energetic Memory Perk)`;

        skill_gain.appendChild(energetic_memory_gain_text);
    }

    if (skill_gain.childNodes.length == 0) {
        var skill_gain_text = document.createElement("p");
        skill_gain_text.textContent = `None`;

        skill_gain.appendChild(skill_gain_text);
    }

    game_over_div.appendChild(skill_gain);

    var reset_count = document.createElement("h3");
    reset_count.textContent = GAMESTATE.is_in_game_over ? `You've now done your ${formatOrdinal(GAMESTATE.energy_reset_count + 1)} Energy Reset` : `This was your ${formatOrdinal(GAMESTATE.energy_reset_count)} Energy Reset`;
    game_over_div.appendChild(reset_count);
}

function setupGameOver(game_over_div: HTMLElement) {
    var open_button = document.querySelector<HTMLInputElement>("#open-energy-reset");

    if (!open_button) {
        console.error("No open-energy-reset button");
        return;
    }

    open_button.addEventListener("click", () => {
        populateGameOver(RENDERING.game_over_element);
        game_over_div.style.display = "flex";
    });

    open_button.disabled = GAMESTATE.energy_reset_count == 0;

    setupTooltipStaticHeader(open_button, `View Last Energy Reset Summary`, function() {
        var tooltip = `Lets you reopen the last Energy Reset Summary`;
        if (open_button?.disabled) {
            tooltip += `<p class="disable-reason">Disabled until you do your first Energy Reset</p>`
        }
        return tooltip;
    });
}

function populateEndOfContent(end_of_content_div: HTMLElement) {
    end_of_content_div.style.display = "flex";

    var reset_count = end_of_content_div.querySelector("#end-of-content-reset-count");
    if (!reset_count) {
        console.error("No reset count text");
        return;
    }

    reset_count.textContent = `You've done ${GAMESTATE.energy_reset_count} Energy Resets`;
}

function updateGameOver() {
    const showing_game_over = RENDERING.game_over_element.style.display != "none";
    if (!showing_game_over && GAMESTATE.is_in_game_over) {
        populateGameOver(RENDERING.game_over_element);
    }

    const showing_end_of_content = RENDERING.end_of_content_element.style.display != "none";
    if (!showing_end_of_content && GAMESTATE.is_at_end_of_content) {
        populateEndOfContent(RENDERING.end_of_content_element);
    }
}

// MARK: Formatting

function formatOrdinal(n: number): string {
    const suffix = ["th", "st", "nd", "rd"];
    const remainder = n % 100;
    return n + ((suffix[(remainder - 20) % 10] || suffix[remainder] || suffix[0]) as string);
}

function formatNumber(n: number, allow_decimals: boolean = true): string {
    if (n < 0) {
        console.error("Tried to format negative number");
        return n + "";
    }

    if (allow_decimals) {
        if (n < 1) {
            return n.toFixed(2);
        } else if (n < 10) {
            return n.toFixed(1);
        }
    }

    if (n < 10000) {
        return n.toFixed(0);
    }

    const postfixes = ["k", "M", "B", "T"];
    var postfix_index = -1;

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

function setupSettings(settings_div: HTMLElement) {
    var open_button = document.querySelector<HTMLElement>("#open-settings");

    if (!open_button) {
        console.error("No open settings button");
        return;
    }

    open_button.addEventListener("click", () => {
        settings_div.style.display = "flex";
    });

    setupTooltipStatic(open_button, `Open Settings Menu`, `Lets you Save and Load from disk`);

    var close_button = settings_div.querySelector<HTMLElement>("#close-settings");

    if (!close_button) {
        console.error("No close settings button");
        return;
    }


    close_button.addEventListener("click", () => {
        settings_div.style.display = "none";
    });

    setupTooltipStatic(close_button, `Close Settings Menu`, ``);

    setupPersistence(settings_div);
}

// MARK: Settings: Saves

function setupPersistence(settings_div: HTMLElement) {
    var save_button = settings_div.querySelector<HTMLElement>("#save");

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

        var file_name = `Incremental_save_Reset_${GAMESTATE.energy_reset_count}_energy_${GAMESTATE.current_energy.toFixed(0)}.json`;

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

    var load_button = settings_div.querySelector<HTMLElement>("#load");

    if (!load_button) {
        console.error("No load button");
        return;
    }

    load_button.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.addEventListener("change", (e) => {
            var element = e.target as HTMLInputElement;
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
    var events = GAMESTATE.popRenderEvents();
    var messages = RENDERING.messages_element;
    for (var event of events) {
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

        function removeMessage(message: Element) {
            messages.removeChild(message);
            RENDERING.message_contexts.delete(message);
        }

        var context = event.context;
        if (event.type == EventType.UsedItem) {
            var new_item_context = context as UsedItemContext;
            for (const [message, old_event] of RENDERING.message_contexts) {
                if (old_event.type == event.type) {
                    var old_item_context = old_event.context as UsedItemContext;
                    if (old_item_context.item == new_item_context.item) {
                        new_item_context.count += old_item_context.count;
                        removeMessage(message);
                    }
                }
            }
        } else if (event.type == EventType.SkillUp) {
            var new_skill_context = context as SkillUpContext;
            for (const [message, old_event] of RENDERING.message_contexts) {
                if (old_event.type == event.type) {
                    var old_skill_context = old_event.context as SkillUpContext;
                    if (old_skill_context.skill == new_skill_context.skill) {
                        new_skill_context.levels_gained += old_skill_context.levels_gained;
                        removeMessage(message);
                    }
                }
            }
        }

        switch (event.type) {
            case EventType.SkillUp:
                {
                    var skill_context = context as SkillUpContext;
                    const skill_definition = SKILL_DEFINITIONS[skill_context.skill] as SkillDefinition;
                    message_div.textContent = `${skill_definition.icon}${skill_definition.name} is now ${skill_context.new_level} (+${skill_context.levels_gained})`;
                    break;
                }
            case EventType.GainedPerk:
                {
                    var perk_context = context as GainedPerkContext;
                    const perk = PERKS[perk_context.perk] as PerkDefinition;
                    message_div.innerHTML = `Unlocked ${perk.icon}${perk.name}`;
                    message_div.innerHTML += `<br>${perk.tooltip}`;
                    setupControls(); // Show the automation controls
                    recreateTasks(); // Get rid of Perk indicator
                    break;
                }
            case EventType.UsedItem:
                {
                    var item_context = context as UsedItemContext;
                    const item = ITEMS[item_context.item] as ItemDefinition;
                    message_div.innerHTML = `Used ${item_context.count} ${item.icon}${item.name}`;
                    message_div.innerHTML += `<br>${item.get_effect_text(item_context.count)}`;
                    recreateItems();
                    break;
                }
            case EventType.UnlockedTask:
                {
                    var unlock_context = context as UnlockedTaskContext;
                    message_div.innerHTML = `Unlocked Task ${unlock_context.task_definition.name}`;
                    recreateTasks();
                    break;
                }
            case EventType.UnlockedSkill:
                {
                    var unlock_skill_context = context as UnlockedSkillContext;
                    const skill_definition = SKILL_DEFINITIONS[unlock_skill_context.skill] as SkillDefinition;
                    message_div.innerHTML = `Unlocked Skill ${skill_definition.icon}${skill_definition.name}`;
                    recreateSkills();
                    break;
                }
            case EventType.UnlockedPower:
                {
                    message_div.innerHTML = `Unlocked Power mechanic`;
                    message_div.innerHTML += `<br>Boosts ${getSkillString(SkillType.Combat)} and ${getSkillString(SkillType.Fortitude)}`;
                    recreateTasks();
                    break;
                }
            default:
                break;
        }

        messages.insertBefore(message_div, messages.firstChild);
        RENDERING.message_contexts.set(message_div, event);

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
    var rep_control = document.createElement("button");
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

    var automation = document.createElement("div");
    automation.className = "automation";

    var automation_text = document.createElement("div");
    automation_text.className = "automation-text";
    automation.textContent = "Automation";

    var all_control = document.createElement("button");
    var zone_control = document.createElement("button");

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
        setAutomationMode(GAMESTATE.automation_mode == AutomationMode.All ? AutomationMode.Off : AutomationMode.Zone);
        setAutomationClasses();
    });

    setupTooltip(all_control, function() { return `Automate ${all_control.textContent}`;}, function () {
        var tooltip = "Toggle between automating Ttasks in all zones, and not automating";
        tooltip += "<br>Right-click Ttasks to designate them as automated";
        tooltip += "<br>They'll be executed in the order you right-clicked them, as indicated by the number in their corner";

        return tooltip;
    });

    setupTooltip(zone_control, function() { return `Automate ${zone_control.textContent}`;}, function () {
        var tooltip = "Toggle between automating Tasks in the current zone, and not automating";
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
    if (GAMESTATE.has_unlocked_power && RENDERING.power_element.style.display == "none") {
        RENDERING.power_element.style.display = "flex";
        setupTooltip(RENDERING.power_element, function() { return `💪Power - ${formatNumber(GAMESTATE.power, false)}`;}, function () {
            var tooltip = `Increases ${getSkillString(SkillType.Combat)} and ${getSkillString(SkillType.Fortitude)} speed by ${formatNumber(GAMESTATE.power, false)}%`;
            tooltip += `<br><br>Increased by fighting Bosses`;

            return tooltip;
        });
    }

    const power_text = `<span>💪Power</span><span>${formatNumber(GAMESTATE.power, false)}</span>`;
    if (RENDERING.power_element.innerHTML != power_text) {
        RENDERING.power_element.innerHTML = power_text;
    }

    if (hasPerk(PerkType.Attunement) && RENDERING.attunement_element.style.display == "none") {
        RENDERING.attunement_element.style.display = "flex";
        setupTooltip(RENDERING.attunement_element, function() { return `🌀Attunement - ${formatNumber(GAMESTATE.attunement, false)}`;}, function () {
            var tooltip = `Increases ${getSkillString(SkillType.Study)}, ${getSkillString(SkillType.Magic)}, and ${getSkillString(SkillType.Druid)} speed by ${formatNumber(GAMESTATE.attunement / 10)}%`;
            tooltip += `<br><br>Increased by all Tasks it boosts`;

            return tooltip;
        });
    }

    const attunement_text = `<span>🌀Attunement</span><span>${formatNumber(GAMESTATE.attunement, false)}</span>`;
    if (RENDERING.attunement_element.innerHTML != attunement_text) {
        RENDERING.attunement_element.innerHTML = attunement_text;
    }
}

// MARK: Rendering

export class Rendering {
    tooltipped_element: ElementWithTooltip | null = null;
    tooltip_element: HTMLElement;
    game_over_element: HTMLElement;
    end_of_content_element: HTMLElement;
    settings_element: HTMLElement;
    energy_element: HTMLElement;
    messages_element: HTMLElement;
    message_contexts: Map<Element, RenderEvent> = new Map();
    power_element: HTMLElement;
    attunement_element: HTMLElement;
    task_elements: Map<TaskDefinition, ElementWithTooltip> = new Map();
    skill_elements: Map<SkillType, HTMLElement> = new Map();
    item_elements: Map<ItemType, HTMLElement> = new Map();
    perk_elements: Map<PerkType, HTMLElement> = new Map();
    controls_list_element: HTMLElement;

    energy_reset_count: number = 0;
    current_zone: number = 0;

    public createTasks() {
        var tasks_div = document.getElementById("tasks");
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
            var energy_div = document.getElementById(name);
            if (energy_div) {
                return energy_div;
            }
            else {
                console.error(`The element with ID '${name}' was not found.`);
                return new HTMLElement();
            }
        }

        this.energy_element = getElement("energy");

        setupTooltip(this.energy_element, function() { return `${ENERGY_TEXT} - ${GAMESTATE.current_energy.toFixed(0)}/${GAMESTATE.max_energy.toFixed(0)}`; }, function () {
            return `${ENERGY_TEXT} goes down over time while you have a Task active`;
        });

        this.tooltip_element = getElement("tooltip");
        this.game_over_element = getElement("game-over-overlay");
        this.end_of_content_element = getElement("end-of-content-overlay");
        this.settings_element = getElement("settings-overlay");
        this.messages_element = getElement("messages");
        this.controls_list_element = getElement("controls-list");
        this.power_element = getElement("power");
        this.attunement_element = getElement("attunement");
    }

    public initialize() {
        setupGameOver(this.game_over_element);
        setupSettings(this.settings_element);
        setupControls();
        setupInfoTooltips();
    }

    public start() {
        this.createTasks();
        recreateSkills();

        setupZone();
        createPerks();
        recreateItems();

        updateRendering();

        // Unhide the game now that it's ready
        (document.getElementById("game-area") as HTMLElement).style.display = "flex";
    }
}

function checkZone() {
    if (RENDERING.current_zone == GAMESTATE.current_zone) {
        return;
    }

    RENDERING.current_zone = GAMESTATE.current_zone;
    recreateTasks();
    setupControls();
    setupZone();
}

function setupZone() {
    var zone_name = document.getElementById("zone-name");
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
    RENDERING.tooltip_element.style.display = "none";
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

    var tooltip_element = RENDERING.tooltip_element;
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
    var x = (beyondHorizontalCenter ? elementRect.left : elementRect.right) + window.scrollX;
    var y = (beyondVerticalCenter ? elementRect.bottom : elementRect.top) + window.scrollY;

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

    tooltip_element.style.display = "block";
}

export function updateRendering() {
    handleEvents();
    checkZone();
    updateTaskRendering();
    updateSkillRendering();
    updateEnergyRendering();
    updatePerks();
    updateExtraStats();
    updateGameOver();
}
