---
title: Who is told what
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_email_action/6969cd0b4a36231200ca9e4bbf405a0b
    how: read Problem assigned to me
    result: to the assignee
    hash: 458529a0cdfb8c6a9226070e3854d1ba0bd8e24e7c0377161b3d8e179f6856a2
  E02:
    record: sysevent_email_action/696ad0f24a36231200dcf0baf81eaf93
    how: read Problem assigned to my group
    result: to the group when nobody is assigned
    hash: c5431f24584a9d49e49f23a1c4264bc512f1c7f93dddee4b6322bc1782d65ddb
  E03:
    record: sysevent_email_action/1e8daa5f9f2202008f97b89a442e70a4
    how: read Problem Closed
    result: '"Your problem … has been closed", to whoever opened it'
    hash: f6879a0478f7750f11e6a89c4335c1c82b838d1b17f041b8a5f7f5d6c5841894
  E04:
    record: sysevent_email_action/c02410c8532c23004247ddeeff7b1284
    how: read Problem Tasks closed
    result: to the assignee when the last task is done
    hash: 8ba83cc1e3fb0608e4784ae23fc1d9600dd1a6930177a937d6221722324bd23d
  E05:
    record: sysevent_email_action/1884091c534123004247ddeeff7b1226
    how: read Incident resolved by Problem (ITIL)
    result: to each resolved incident's assignee
    hash: 11658b5b65ea6295f5d6645f4589ea46915be473d785522872f3e67997d4fc43
  E06:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: to the incident's caller
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E07:
    record: sysevent_script_action/acfd001b536270108b91ddeeff7b12e3
    field: script
    how: read Copy Prb workaround to Inc work notes
    result: the workaround goes to linked incidents as a work note
    hash: 06bec9756037b072de4bd8987e71bfc15a76adbbd70b04eb5fc1f6f4c35e737d
---
## Emails at each step

| When | The support team | Affected employees |
|---|---|---|
| A problem is assigned | the assignee, or the group [E01] [E02] | |
| The last problem task is done | the assignee [E04] | |
| A workaround or fix is communicated | a work note on each linked incident [E07] | |
| The problem closes with its fix | each resolved incident's assignee [E05] | the caller's usual *"… was resolved"* [E06] |
| The problem is closed | whoever opened it [E03] | |

### What reaches you {for=user}

Only your incident's own emails: nothing about the problem itself. Workarounds go to the support
teams as internal notes, so ask the service desk if one would help you meanwhile.

### What you send {for=operator}

Workarounds and fixes reach linked incidents as **work notes**, not as comments to callers. [E07]
Tell callers yourself on their incident when a workaround applies to them.
