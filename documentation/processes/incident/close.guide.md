---
title: Close or reopen an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/bbddb6bbc0a8016400c56236de22441a
    how: read the Close button
    result: available only for Resolved incidents, to the caller and to team leads
    hash: 764e91a4fe4697cbf9b08461496e666ed89e9a80d39708e642b250c47ad63314
  E02:
    record: sys_ui_action/d2d9d8110a0a3c7401bbadabed9b91db
    how: read the Reopen button
    result: available only for Resolved incidents; a comment is required
    hash: cb3c25612802b851af11edff99ef8db3de7fee5a38dfe691684cc940724eb571
  E03:
    record: sys_script/d67b8d9ec0a80118008cd8f0f7f92fae
    how: read incident autoclose
    result: Resolved incidents not updated for a set number of days are closed automatically
    hash: 60153d464b676eb654bc1347776d9c4ca6b7347e57954cb7d8a0dfbf4eaea129
---
## Closing

An incident is **Closed** when everyone agrees it's done. After that it can't be changed or
reopened.

- **Caller**: press **Close** on a resolved incident (on the portal or the form) when the fix
  works. [E01]
- **Team lead**: you can close any resolved incident, and you're the only ones who can choose
  *Closed* in the state list. [E01]
- **Resolvers**: you can't close another person's incident. Resolve it and let the caller confirm.
- **Automatically**: a resolved incident nobody touches is closed after a set number of days. [E03]

When it is closed, the caller gets an email and may receive a short survey.

## Reopening

If the fix didn't work, a **resolved** incident can be reopened:

1. Open the incident and press **Reopen**. [E02]
2. Write in *Additional comments* what is still wrong (required).
3. It goes back to **In Progress** for the same team. The resolution fields are cleared.

The caller can also reopen from the portal, or by replying to the resolution email with
*please reopen* in the subject.

A **closed** incident can't be reopened. If the issue comes back, log a new incident and
mention the old number. (Replying *please reopen* to a closed incident's email does exactly that:
it creates a new incident.)

## Canceling

If an incident was logged by mistake (a duplicate, a test), resolve it with the code
*Duplicate*, or set it to *Canceled* if your role allows it.
