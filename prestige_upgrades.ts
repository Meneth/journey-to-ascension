export enum PrestigeUnlockType {
    PermanentAutomation,
    DummyUnlock2,
    DummyUnlock3,
    DummyUnlock4,
    
    Count
}

export enum PrestigeRepeatableType {
    DummyRepeatable1,
    DummyRepeatable2,
    DummyRepeatable3,
    DummyRepeatable4,

    Count
}

export class PrestigeUnlock {
    type: PrestigeUnlockType = PrestigeUnlockType.Count;
    name = "";
    description = "";
    cost = 0;
}

export class PrestigeRepeatable {
    type: PrestigeRepeatableType = PrestigeRepeatableType.Count;
    name = "";
    description = "";
    initial_cost = 0;
    scaling_base = 0;
}

export const PRESTIGE_UNLOCKABLES: PrestigeUnlock[] = [
    {
        type: PrestigeUnlockType.PermanentAutomation,
        name: "Permanent Automation",
        description: "Permanently unlocks the Deep Trance Perk",
        cost: 0.01
    },
    {
        type: PrestigeUnlockType.DummyUnlock2,
        name: "Test",
        description: "Test",
        cost: 43
    },
    {
        type: PrestigeUnlockType.DummyUnlock3,
        name: "Test",
        description: "Test",
        cost: 44
    },
    {
        type: PrestigeUnlockType.DummyUnlock4,
        name: "Test",
        description: "Test",
        cost: 45
    },
];

export const PRESTIGE_UPGRADES: PrestigeRepeatable[] = [
    {
        type: PrestigeRepeatableType.DummyRepeatable1,
        name: "XP Boost Two Lines",
        description: "Test",
        initial_cost: 42,
        scaling_base: 1.5
    },
    {
        type: PrestigeRepeatableType.DummyRepeatable2,
        name: "Test",
        description: "Test",
        initial_cost: 43,
        scaling_base: 1.5
    },
    {
        type: PrestigeRepeatableType.DummyRepeatable3,
        name: "Test",
        description: "Test",
        initial_cost: 44,
        scaling_base: 1.5
    },
    {
        type: PrestigeRepeatableType.DummyRepeatable4,
        name: "Test",
        description: "Test",
        initial_cost: 45,
        scaling_base: 1.5
    },
];
