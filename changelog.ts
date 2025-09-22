export class ChangelogEntry {
    version: string = "";
    date: string = "";
    changes: string = "";
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: "0.1.3",
        date: "2025-09-22",
        changes: "- Added changelog<br>"
        + "- Split Items into two categories; normal Items and Artifacts<br>"
        + "- Split out Skill Gains in the Task tooltip from Rewards<br>"
        + "- Stopped showing Completions in the Task tooltip of single-rep Tasks<br>"
        + "- Stopped showing XP Mult in the Task tooltip, as it just caused confusion<br>"
        + "- Fixed two Perks starting their effect twice<br>"
        + "- Added number postfixes beyond T; all the way up To Dc (though currently higher than Qi does not occur)<br>"
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
