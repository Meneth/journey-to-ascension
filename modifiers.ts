import { getSkillString } from "./rendering.js";
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

    public getDescription(): string {
        let desc = "";

        for (const modifier of this.modifiers) {
            if (desc.length != 0) {
                desc += "<br>";
            }

            desc += `Improves ${getSkillString(modifier.skill)} Task speed by ${(modifier.effect * 100).toFixed(0)}% each`;
        }

        return desc;
    }

    public getAppliedDescription(): string {
        let desc = "";

        for (const modifier of this.modifiers) {
            if (desc.length != 0) {
                desc += "<br>";
            }

            desc += `${getSkillString(modifier.skill)} Task speed increased ${(modifier.effect * 100).toFixed(0)}%`;
        }

        return desc;
    }

    public applyEffect() {
        for (const modifier of this.modifiers) {
            getSkill(modifier.skill).speed_modifier += modifier.effect;
        }
    }
}
