import { getSkillString, joinWithCommasAndAnd } from "./rendering.js";
import { getSkill } from "./simulation.js";
import { SkillType } from "./skills.js";

export class SkillModifier {
    skill: SkillType = SkillType.Count;
    effect: number = 0;

    constructor(skill: SkillType, effect: number) {
        this.skill = skill;
        this.effect = effect;
    }
}

export class SkillModifierList {
    modifiers: SkillModifier[] = [];

    constructor(modifiers: [skill: SkillType, effect:number][]) {
        for (const [skill, effect] of modifiers) {
            this.modifiers.push(new SkillModifier(skill, effect));
        }
    }

    public getStacked(stacks: number): SkillModifierList {
        const newList = new SkillModifierList([]);
        for (const modifier of this.modifiers) {
            newList.modifiers.push(new SkillModifier(modifier.skill, modifier.effect * stacks));
        }

        return newList;
    }

    private buildSkillMap() {
        const map: Map<number, SkillType[]> = new Map();

        for (const modifier of this.modifiers) {
            const existing_value = map.get(modifier.effect) ?? [];
            existing_value.push(modifier.skill);
            map.set(modifier.effect, existing_value);
        }

        const string_map: Map<number, string> = new Map();

        for (const [effect, skills] of map) {
            const skill_strings: string[] = [];
            for (const skill of skills) {
                skill_strings.push(getSkillString(skill));
            }

            string_map.set(effect, joinWithCommasAndAnd(skill_strings));
        }

        return string_map;
    }

    public getDescription(): string {
        const map: Map<number, string> = this.buildSkillMap();
        let desc = "";

        for (const [effect, skill_string] of map) {
            if (desc.length != 0) {
                desc += "<br>";
            }

            desc += `Improves ${skill_string} Task speed by ${(effect * 100).toFixed(0)}% each`;
        }

        return desc;
    }

    public getAppliedDescription(): string {
        const map: Map<number, string> = this.buildSkillMap();
        let desc = "";

        for (const [effect, skill_string] of map) {
            if (desc.length != 0) {
                desc += "<br>";
            }

            desc += `${skill_string} Task speed increased ${(effect * 100).toFixed(0)}%`;
        }

        return desc;
    }

    public applyEffect() {
        for (const modifier of this.modifiers) {
            getSkill(modifier.skill).speed_modifier += modifier.effect;
        }
    }
}
