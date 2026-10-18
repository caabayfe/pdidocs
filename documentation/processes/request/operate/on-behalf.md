---
title: Order on someone's behalf
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_declarative_action_assignment/650cc0dc77620210c9ee78dabd5a99b7
    how: read Create request (workspace incident)
    result: roles itil and sn_request_write; not on closed incidents
    hash: 657785015f3cfe7dc12e3d37b1dc917b5389bf8b1e208b5aed8a3b9e56ffd48b
  E05:
    record: sys_declarative_action_assignment/650cc0dc77620210c9ee78dabd5a99b7
    field: client_script
    how: read the client script of Create request (incident)
    result: saves the incident, then opens the catalog with the incident as parent (sysparm_parent_table incident, sysparm_parent_sys_id); passes no Requested for
    hash: c86bf554da2e1e0d899ceba5148b7ff4bf6c894486ea11e53b2ab8c63cb3ae5e
  E06:
    record: sys_declarative_action_assignment/7dfcdba7b57a4210f87774aeaa46dcde
    field: client_script
    how: read the client script of Create request (interaction)
    result: saves the interaction, then opens the catalog with the interaction as parent; passes no Requested for
    hash: cfa76eb508a3dc30c7897e63663e533a69ae184db7d5a529e09ae1cda8467cac
  E07:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    children: sys_choice
    how: read the incident's resolution codes
    result: includes Resolved by request
    hash: 438604df7c0701185679ccf5f78a95effda35ae621060096b2ab78a53ec5cac2
  E02:
    record: sys_declarative_action_assignment/7dfcdba7b57a4210f87774aeaa46dcde
    how: read Create request (workspace interaction)
    result: roles itil and sn_request_write
    hash: 194f9475bc4be663bdb2969d82641a5d41dd76c099b623bd50ab0e8c026e579d
  E03:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'System Properties, glide.sc.req_for'
    how: 'read the values'
    result: 'glide.sc.req_for.roles is empty and glide.sc.req_for.roles.default is deny'
  E04:
    record: sys_script/2f53c20a87011300e0ef0cf888cb0bd8
    how: read Link interaction m2m
    result: links the request back to the interaction
    hash: 0f7cc98e413fd9cef041265ea36f2c1d63f30a3e248bc2bdb2fbdf042d2896ba
---
When a caller needs something new rather than a fix, you order it for them from their incident
or call in the Service Operations Workspace.

## From an incident or a call

{{animation:reqbehalf}}

1. Open the caller's **incident** or **interaction** in the workspace.
2. Press **Create request** (roles *itil* or *sn_request_write*; not on a closed incident). [E01]
   [E02] The incident or interaction is saved first. [E05] [E06]
3. The catalog opens with the record as the request's parent. [E05] [E06] Choose the item.
4. Check who it's for: *Create request* doesn't pass the caller [E05] [E06], and nobody can change
   *Requested for* at checkout on pdi2. [E03] Prefer items that ask **Requested for** as a question
   and set the caller there.
5. Order it. The request links back to the interaction it came from. [E04]

## What happens next

The request follows the usual approvals and fulfilment (see [Who approves](see:approvals)). If
the incident only asked for something new, resolve it with **Resolved by request** [E07] once the
request is raised (see [Escalate and link related
work](see:incident/escalate)).

## Tips

- Is it really new? If something that worked is broken, keep it an incident (see [Escalate and link
  related work](see:incident/escalate)).
- Tell the caller the REQ number, so they can follow it in **My Requests**.

## Who it's for {label=OPEN-QUESTION}

*Create request* passes only the parent record, not the caller [E05] [E06], and *Requested for*
can't be changed at checkout [E03]. Whether the workspace catalog fills *Requested for* from the
parent's caller isn't in the mirror: order a test item from an incident and check who the request
is for.
