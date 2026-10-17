---
title: Review, close or cancel
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/d82737b3cb100200d71cb9c0c24c9cb4
    how: read Review
    result: when Review is available
    hash: faa842b52488456ad45dbaeb04f1d94a226b1614588910062af5de9d92729454
  E02:
    record: sys_ui_action/1218f7b3cb100200d71cb9c0c24c9cdf
    how: read Close
    result: when Closed is available
    hash: 3b55de67bdc5c49d0f1c164efb3921f7cc67ec1a80782691b24cff64bc5c084f
  E03:
    record: sys_ui_policy/e7dc75a3cb900200d71cb9c0c24c9ca3
    how: read Mandatory - Close notes and code when in Closed state
    result: close code and close notes required
    hash: ef0206b5c1815980031c2f589f24aa84035cf105d7de1480ff1e461f86a1079c
  E04:
    record: sys_db_object/ade43a3b8c5503100a22deb6dd2b4ed2
    children: sys_choice
    how: read the close codes
    result: Successful, Successful with issues, Unsuccessful
    hash: 7771030b7d0ed757de55f879efd9b81cd25ca246538f46d71ae53138709e748a
  E05:
    record: sys_script/464252f7c34332001488b731c1d3aeed
    field: script
    how: read Check open change_tasks
    result: '"Unable to close the Change request as there are open Change tasks"'
    hash: 96ab884cb2cbb6d08edf3b811a75aaabee7a5476a1e14386b4a388688505f23a
  E06:
    record: sys_ui_action/4f2777b3cb100200d71cb9c0c24c9c91
    how: read Cancel Change
    result: form menu
    hash: 367b78fec939f927377ae54b9d4903b3490ad2d3c8772526abad04ae13c09cd9
  E07:
    record: sys_script_client/aa78ab09c313101035ae3f52c1d3ae20
    field: script
    how: read Show Cancel Reason modal
    result: canceling asks for a reason in the dialog Cancel Change Request
    hash: 62dac7fe01a364f467cfe32a17445d9dbcb43913fca2a9a630670bb51a8f2836
  E08:
    record: sys_script/16bd8e77c34332001488b731c1d3aeeb
    how: read Cancel change_tasks
    result: canceling the change cancels its tasks
    hash: ac7601f74eb9812baa56958344bbf9fff997814d0c5cbd58878da278917fb1fd
  E09:
    record: sys_ui_action/ff915528675b32006e6eadab9485ef3a
    how: read Revert to New
    result: a Normal change in Assess, or an Emergency change in Authorize
    hash: 3795a50ebd18ee763fc84f3e59bf006a8a76ec391de9ae3b409902e46dd5c234
  E10:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic change form, CHG0000036, context menu'
    how: 'opened the form menu'
    result: 'Copy Change, Cancel Change, Create Outage, Propose a Standard Change Template, Refresh Impacted Services'
---
## Review and close

When the work is done, press **Review** and check the result. [E01] Then **Close** it with the
**Close code** (*Successful*, *Successful with issues* or *Unsuccessful*) and **Close notes**.
[E02] [E03] [E04] A change with open tasks can't be closed. [E05]

## Cancel

Choose **Cancel Change** in the form menu and give the reason. [E06] [E07] [E10] Its tasks are
canceled too. [E08]

## Start again

**Revert to New** (form menu) sends a normal change back from *Assess*, or an emergency change from
*Authorize*, to fix the plan. [E09] **Copy Change** starts a new change from this one. [E10]
