import { describe, it, expect, vi } from 'vitest';

function joinWithCommasAndAnd(strings: string[]): string {
    if (strings.length === 0) return "";
    if (strings.length === 1) return strings[0] as string;
    if (strings.length === 2) return `${strings[0]} and ${strings[1]}`;

    const allButLast = strings.slice(0, -1).join(", ");
    const last = strings[strings.length - 1];
    return `${allButLast}, and ${last}`;
}

function formatNumber(n: number, allow_decimals: boolean = true): string {
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

describe('joinWithCommasAndAnd', () => {
    it('returns empty string for empty array', () => {
        expect(joinWithCommasAndAnd([])).toBe('');
    });

    it('returns single item for array with one element', () => {
        expect(joinWithCommasAndAnd(['apple'])).toBe('apple');
    });

    it('joins two items with "and"', () => {
        expect(joinWithCommasAndAnd(['apple', 'banana'])).toBe('apple and banana');
    });

    it('joins three items with commas and "and"', () => {
        expect(joinWithCommasAndAnd(['apple', 'banana', 'cherry'])).toBe('apple, banana, and cherry');
    });

    it('joins four items with commas and "and"', () => {
        expect(joinWithCommasAndAnd(['a', 'b', 'c', 'd'])).toBe('a, b, c, and d');
    });
});

describe('formatNumber', () => {
    describe('small numbers with decimals allowed', () => {
        it('formats numbers < 10 with 2 decimal places', () => {
            expect(formatNumber(1.234)).toBe('1.23');
            expect(formatNumber(0)).toBe('0.00');
            expect(formatNumber(9.999)).toBe('10.00');
        });
    });

    describe('small numbers without decimals', () => {
        it('formats numbers < 10000 as integers', () => {
            expect(formatNumber(100, false)).toBe('100');
            expect(formatNumber(9999, false)).toBe('9999');
        });
    });

    describe('large numbers', () => {
        it('formats thousands with k suffix', () => {
            expect(formatNumber(10000)).toBe('10.0k');
            expect(formatNumber(100000)).toBe('100k');
            expect(formatNumber(999999)).toBe('1000k');
        });

        it('formats millions with M suffix', () => {
            expect(formatNumber(1000000)).toBe('1000k');
            expect(formatNumber(1000001)).toBe('1.00M');
            expect(formatNumber(1500000)).toBe('1.50M');
        });

        it('formats billions with B suffix', () => {
            expect(formatNumber(1000000001)).toBe('1.00B');
        });
    });

    describe('edge cases', () => {
        it('handles negative numbers with console error', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            expect(formatNumber(-5)).toBe('-5');
            expect(consoleSpy).toHaveBeenCalledWith('Tried to format negative number');
            consoleSpy.mockRestore();
        });
    });
});
