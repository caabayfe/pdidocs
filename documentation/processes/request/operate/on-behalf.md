---
title: Order on someone's behalf
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_declarative_action_assignment/650cc0dc77620210c9ee78dabd5a99b7
    how: read Create request (workspace incident)
    result: roles itil and sn_request_write; not on closed incidents
    hash: 657785015f3cfe7dc12e3d37b1dc917b5389bf8b1e208b5aed8a3b9e56ffd48b
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
## From an incident or a call

{{animation:reqbehalf}}

When a caller actually needs something new, raise a request from their **incident** or
**interaction** in the workspace with **Create request**. [E01] [E02] The request links back to
where it came from. [E04]

## Who it's for {label=OPEN-QUESTION}

Nobody can change *Requested for* at checkout on pdi2 [E03], so a request you raise may be for you,
not the caller. Check on screen how *Create request* sets it, or use items that ask *Requested
for* as a question.
