export class ChangelogEntry {
    version: string = "";
    date: string = "";
    changes: string = "";
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: "0.3.4",
        date: "2026-01-26",
        changes: "- Renamed the 'All' task automation mode to 'Until Zone'. You can now specify a Zone that it'll stop when you get to. If you're already in or past that Zone when enabling Until Zone, it'll just do whatever Zone you're in, like Current Zone automation<br>"
    },
    {
        version: "0.3.3",
        date: "2026-01-25",
        changes: "- Fixed the Unified Theory of Magic not always updating the Highest Zone fully completed<br>"
        + "- Made it extra clear that Minor Time Compression's Zone skipping gives all the benefits manually doing the Zone would've<br>"
    },
    {
        version: "0.3.2",
        date: "2026-01-22",
        changes: "- Added a setting that makes tooltips only show while CTRL is held (off by default)<br>"
        + "- Fixed the Repeat Tasks and Manual Use Items tooltips not updating on click<br>"
    },
    {
        version: "0.3.1",
        date: "2026-01-22",
        changes: "- Fixed the Automation mode not getting highlighted any more<br>"
        + "- Fixed the 2026 changelog entries saying 2025<br>"
    },
    {
        version: "0.3.0",
        date: "2026-01-20",
        changes: "- Buffed Magical Essence a bit<br>"
        + "- Rebalanced Divine Spark gain entirely, as well as Prestige upgrade costs<br>"
        + "- Reduced the effect of Major Time Compression on Task real-time speed<br>"
        + "- Rebalanced Tasks past Zone 15<br>"
        + "- Rebalanced Prestige rewards and upgrade costs<br>"
        + "- Fixed the Dream Prism perk stating its effect twice<br>"
        + "- Now showing highest Zone fully completed in the Unified Theory of Magic Perk<br>"
        + "- Added a Save Reset button in the Settings<br>"
        + "- Fixed running out of Energy while viewing info from the last Run not giving the Run Over screen<br>"
        + "- Boss Task automations now get removed on Prestige, since you generally only want to deal with them later in the Prestige run<br>"
        + "- Added hotkeys for Automation and Task Repetition<br>"
        + "- Tasks giving an Artifact you've never gotten before now glow<br>"
        + "- If you get far enough without beating any Bosses, the game now reminds you of their existence<br>"
    },
    {
        version: "0.2.1",
        date: "2026-01-19",
        changes: "- Clarified a couple of tooltips<br>"
        + "- Reduced the cost of some of the first Prestige upgrades<br>"
        + "- Made the Fortitude task in Z15 give a bit more XP<br>"
        + "- Made Magical Roots give twice as much Fortitude<br>"
    },
    {
        version: "0.2.0",
        date: "2026-01-19",
        changes: "- Rebalanced the game up to Zone 15<br>"
        + "- Merged the Druid skill into the Magic skill<br>"
        + "- Removed the Survival skill. Replaced with Search, Fortitude, Crafting, or nothing depending on the Task<br>"
        + "- You no longer keep half your Items on Energy reset; this is unlocked later instead<br>"
        + "- If you don't have enough Energy to fully complete a Task, it'll now show the Skill Gains as a range (from how much you'd gain using your current Energy, to fully completing)<br>"
        + "- Increased the Magic Ring boost from 3x to 5x<br>"
        + "- Rebalanced some Items<br>"
        + "- Once keeping some Items on reset is unlocked, the Energy reset lets you decide whether to auto-use Items or not<br>"
        + "- Added Credits section<br>"
        + "- Fixed the Perks Skill bonuses breakdown saying 'Item(s)' rather than 'Perk(s)<br>"
        + "- Fixed the Fully Attuned unlockable referring to the Divine Knowledge unlockable by the wrong name<br>"
        + "- Made the Changelog box wider<br>"
        + "- Fixed the Items Skill bonus breakdown showing all bonuses as 100 percentage points higher than reality<br>"
        + "- If the player doesn't figure out prep runs themselves, a hint gets shown a while after unlocking keeping some Items on death<br>"
    },
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
        + "- The Items and Perks info tooltips now show all the active Skill bonuses provided<br>"
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
