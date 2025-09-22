export class ChangelogEntry {
    version: string = "";
    date: string = "";
    changes: string = "";
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: "0.1.3",
        date: "2025-09-21",
        changes: "- Added changelog"
    },
    {
        version: "0.1.2",
        date: "2025-09-21",
        changes: "- Improved tooltip contrast<br>"
        + "- Added hint about right-clicking to use all items<br>"
        + "- Added vague hint about push runs<br>"
        + "- Moved the automation unlock from Z10 to Z4<br>"
        + "- Moved Attunement from Z8 to Z10<br>"
        + "- Fixed minor incorrect XP calculation after Major Time Compression Perk is unlocked"
    },
    {
        version: "0.1.1",
        date: "2025-09-19",
        changes: "- Sped up progression in Zones 2 and 7 a little<br>"
        + "- Softened the language on the Energy Reset screen<br>"
        + "- Increased size of the button to exit the Energy Reset screen"
    },
    {
        version: "0.1.0",
        date: "2025-09-19",
        changes: "First public release of the game",
    },
]
