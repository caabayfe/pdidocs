---
title: Child incidents - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/8b3f9b22532743006725ddeeff7b1295
    how: read Link to Major Incident
    result: list action; roles itil, sn_incident_write; condition canLinkToMajorincident
    hash: aa342e24c8e23080d6d12819e96cb57d2352e3221bcdf37f5c921f6d631184ce
  E02:
    record: sys_script_include/e2d75876537203006725ddeeff7b1260
    field: script
    how: read MIMListActionsUtil.addManyRelated
    result: sets parent_incident on each selected incident that may be linked
    hash: 82cf344926ec4bf182e6ea6a0eebd6d9cda9b8efd4ac765d55ef0f980d9a644b
  E03:
    record: sys_script/c778e740b7713300f9519c75de11a99f
    field: script
    how: read Derive State value from Parent Incident (before, order 90)
    result: a new child takes the parent's state and hold reason, and its resolution if resolved
    hash: af6a1cf8e8a24f58a32f4e4244c35e4ba89db1909211a2a14a68c96bcd60e211
  E04:
    record: sys_script/eb8fa5b00b3332001604628393673a96
    field: script
    how: read Sync Child Incident State (after, order 1000)
    result: pushes state and hold reason to active children, except terminal states and Awaiting Caller
    hash: c5efc34efd4512661810ff0ec6a03d92497dc35659d9911c1e78149a14cb2c42
  E05:
    record: sys_script/8f61f1b00a0a3c7401aac471d27a2718
    field: script
    how: read Update Child Incidents (before, order 1000)
    result: resolves children with the parent; copies comments and work notes through the flow action update_child_incidents
    hash: 917e3d1c68b281ba6c81a50742086ef60a396d924b925e0c51b7051932a9e261
  E06:
    record: sys_hub_action_type_definition/b27b955053132010bf68ddeeff7b126b
    how: read Update child incidents worknotes/comments
    result: published, active false
    hash: 243c063a1cf30825bbd67e02a1cca5cce03e2bcca8f3e089a5501d2cb01c34c8
  E07:
    record: sys_properties/e3e66157430121106afeff53e9b8f28d
    field: value
    how: read com.snc.incident.copy_comments_to_non_resolved_childInc
    result: 'true: only children not yet resolved get the copies'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E08:
    record: sys_script/a83197ca3b10030050bec9bb34efc4a8
    how: read Child incident cannot be major incident
    result: aborts for an accepted major incident; clears a candidate state
    hash: 8677f05697797e9abf18c50da46b6b22ab90cce797f3446428c47d8da60f6ea1
  E09:
    record: ticket_configuration/33ad80e787f10010e0ef0cf888cb0b87
    how: read the Employee Center incident ticket configuration
    result: no parent incident among the info fields
    hash: 7881cdd31f9224ee69f625337c149b1ee29ced966ed47a57c97e19818f0ea831
---
## Linking

**Link to Major Incident** [E01] sets `parent_incident` on the selected incidents [E02]. A major
incident can't become a child, and a candidate stops being one when linked. [E08]

## What children inherit, in order

1. **Derive State value from Parent Incident** (before, 90): the new child takes the parent's
   state and hold reason, and its resolution if already resolved. [E03]
2. **Update Child Incidents** (before, 1000): on resolution, resolves active children with the
   parent's code and notes; on comments or work notes, copies them through a flow action. [E05]
3. **Sync Child Incident State** (after, 1000): later state changes reach active children. [E04]

## Comment copies {label=OPEN-QUESTION}

The copy runs the flow action *Update child incidents worknotes/comments*, which is published but
marked inactive [E06]; copies reach only children not yet resolved [E07]. Whether copies happen
needs a test (see the open questions).

The Employee Center ticket page doesn't show the parent to the caller. [E09]
