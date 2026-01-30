import { GAMESTATE } from "./game.js";

// MARK: Constants
export const HARROW_SPARK_BONUS_PER_CARD = 0.25;
export const HARROW_UNLOCK_PRESTIGE_COUNT = 5;

// MARK: Card Types

export enum HarrowCardType {
    TheGrave,
    TheEclipse,
    TheSerpent,
    TheHourglass,
    TheBrittle,
    TheTempest,
    TheReaper,
    TheFrost,
    TheShackled,
    TheFool,

    Count
}

// MARK: Card Definitions

export class HarrowCardDefinition {
    type: HarrowCardType;
    name: string;
    emoji: string;
    effect_description: string;
    cost: number;

    constructor(type: HarrowCardType, name: string, emoji: string, effect_description: string, cost: number) {
        this.type = type;
        this.name = name;
        this.emoji = emoji;
        this.effect_description = effect_description;
        this.cost = cost;
    }
}

export const HARROW_CARDS: HarrowCardDefinition[] = [
    new HarrowCardDefinition(
        HarrowCardType.TheGrave, "The Grave", "\u{1FAA6}",
        "Items retained on Energy Reset are quartered instead of halved",
        125000
    ),
    new HarrowCardDefinition(
        HarrowCardType.TheEclipse, "The Eclipse", "\u{1F312}",
        "Lose 10% of current energy when advancing to a new zone",
        150000
    ),
    new HarrowCardDefinition(
        HarrowCardType.TheSerpent, "The Serpent", "\u{1F40D}",
        "Boss tasks cost 2x energy",
        175000
    ),
    new HarrowCardDefinition(
        HarrowCardType.TheHourglass, "The Hourglass", "\u{231B}",
        "Energy drain is tripled",
        200000
    ),
    new HarrowCardDefinition(
        HarrowCardType.TheBrittle, "The Brittle", "\u{1F9B4}",
        "Energy gained from items is halved",
        225000
    ),
    new HarrowCardDefinition(
        HarrowCardType.TheTempest, "The Tempest", "\u{26A1}",
        "Minimum energy drain per task tick is 10",
        250000
    ),
    new HarrowCardDefinition(
        HarrowCardType.TheReaper, "The Reaper", "\u{1F480}",
        "Energy drain is doubled when above max energy",
        275000
    ),
    new HarrowCardDefinition(
        HarrowCardType.TheFrost, "The Frost", "\u{2744}\u{FE0F}",
        "XP gain is reduced by 80%",
        300000
    ),
    new HarrowCardDefinition(
        HarrowCardType.TheShackled, "The Shackled", "\u{1F517}",
        "No skill can exceed 110% of the second-highest skill level",
        400000
    ),
    new HarrowCardDefinition(
        HarrowCardType.TheFool, "The Fool", "\u{1F0CF}",
        "Randomly applies the penalty of another card in addition to its own",
        500000
    ),
];

// MARK: Helpers

export function isHarrowUnlocked(): boolean {
    return GAMESTATE.prestige_count >= HARROW_UNLOCK_PRESTIGE_COUNT;
}

export function ownsHarrowCard(card: HarrowCardType): boolean {
    return GAMESTATE.harrow_owned.includes(card);
}

export function isHarrowCardActive(card: HarrowCardType): boolean {
    return GAMESTATE.harrow_active.includes(card);
}

export function isHarrowEffectActive(card: HarrowCardType): boolean {
    if (isHarrowCardActive(card)) {
        return true;
    }

    // The Fool can replicate another card's effect
    if (isHarrowCardActive(HarrowCardType.TheFool) && GAMESTATE.harrow_fool_selection === card) {
        return true;
    }

    return false;
}

export function getEffectiveActiveCards(): HarrowCardType[] {
    const active: HarrowCardType[] = [];
    for (const card of GAMESTATE.harrow_active) {
        if (!active.includes(card)) {
            active.push(card);
        }
    }

    // Add The Fool's selection if it's active and not already there
    if (isHarrowCardActive(HarrowCardType.TheFool) && GAMESTATE.harrow_fool_selection >= 0) {
        const fool_card = GAMESTATE.harrow_fool_selection as HarrowCardType;
        if (!active.includes(fool_card)) {
            active.push(fool_card);
        }
    }

    return active;
}

export function purchaseHarrowCard(card: HarrowCardType): boolean {
    if (ownsHarrowCard(card)) {
        return false;
    }

    const definition = HARROW_CARDS[card];
    if (!definition) {
        return false;
    }

    if (GAMESTATE.divine_spark < definition.cost) {
        return false;
    }

    GAMESTATE.divine_spark -= definition.cost;
    GAMESTATE.harrow_owned.push(card);
    return true;
}

export function toggleHarrowCard(card: HarrowCardType): void {
    if (!ownsHarrowCard(card)) {
        return;
    }

    const index = GAMESTATE.harrow_active.indexOf(card);
    if (index >= 0) {
        // Deactivating mid-run forfeits the card's bonus
        GAMESTATE.harrow_active.splice(index, 1);
        if (GAMESTATE.harrow_run_started && !GAMESTATE.harrow_forfeited.includes(card)) {
            GAMESTATE.harrow_forfeited.push(card);
        }
    } else {
        // Can only activate if run hasn't started yet
        if (!GAMESTATE.harrow_run_started) {
            GAMESTATE.harrow_active.push(card);
        }
    }
}

export function rollFoolCard(): void {
    if (!isHarrowCardActive(HarrowCardType.TheFool)) {
        return;
    }

    // Roll a random card from all non-Fool cards
    const possible_cards: HarrowCardType[] = [];
    for (let i = 0; i < HarrowCardType.Count; i++) {
        if (i !== HarrowCardType.TheFool) {
            possible_cards.push(i);
        }
    }

    const random_index = Math.floor(Math.random() * possible_cards.length);
    GAMESTATE.harrow_fool_selection = possible_cards[random_index] as number;
}

export function calcHarrowSparkBonusForPrestige(): number {
    let active_non_forfeited = 0;

    for (const card of GAMESTATE.harrow_active) {
        if (!GAMESTATE.harrow_forfeited.includes(card)) {
            active_non_forfeited++;
        }
    }

    return Math.pow(1 + HARROW_SPARK_BONUS_PER_CARD, active_non_forfeited) - 1;
}
