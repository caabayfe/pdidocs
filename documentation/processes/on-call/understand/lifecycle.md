---
title: The life of a shift and an escalation
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_ui_action/f62795b187a323005087af1e36cb0b0e
    field: script
    how: read Publish (cmn_rota, form button, shown on a draft shift the user can write)
    result: 'clears the draft state, makes the shift active, and says "This Shift is now live."'
    hash: 41ccb59653fc462813f1b298c818abd464a2af6a076d71d1058e59554772d6f0
  E02:
    record: sys_ui_action/25fa117587a323005087af1e36cb0b14
    field: script
    how: read Move to Draft (cmn_rota)
    result: sets the state to Draft and makes the shift inactive
    hash: a8dfde54c1933cfc875ee80af1efc397055a5e0b7803387165f2a9f8fee83264
  E03:
    record: sys_script/17f9c5bd876323005087af1e36cb0bb4
    how: read Draft Shift - Make Inactive (before insert and update, state is Draft)
    result: a draft shift is always inactive
    hash: cb24f04d13f288df87019efc346abea32218b8db62891846e2fe95042c062042
  E04:
    record: sys_db_object/2cd19e8f83778310292aca75eeaad303
    children: sys_choice
    how: read the roster_schedule_span_proposal state choices
    result: Pending approval, Additional info requested, Rejected, Approved, Approval not required
    hash: 21f45d01ced483138d18c9368459e57c70d84f394d0cacf1a784a7a7cf1efbc6
  E05:
    record: sys_properties/7d7f3d85736b1300d406168d4ef6a76b
    field: value
    how: read com.snc.on_call_rotation.pto.configuration
    result: 'not_allowed: on-call members (other than admin, rota_admin, rota_manager or the group manager) cannot create their own time off; a group''s preferences can override it'
    hash: 1bcf6334dfea83c3b95f169aee577809eb91c7c0d1ca54679617be0fd8d0e6a9
  E06:
    record: sys_hub_flow/9a2888e043f81a1097aac6ecbab8f236
    how: read On-Call Time off approval (on a new time off request)
    result: sends On-Call Time Off Submitted, asks for an approval, then updates the roster and sends Approved or Rejected
    hash: b83131c91cc3c53ad07c4c911d1b8cfe1bece2fdd57476b121d8bad3ff1fdbc0
  E07:
    record: sys_db_object/6ce156cf83778310292aca75eeaad347
    children: sys_choice
    how: read the on_call_escalation status and category choices
    result: 'status Live, Completed, Cancelled; category Auto Assignment, Assign By Acknowledgement, Notify And Manual Assignment, Conferencing Hunt'
    hash: 029014784a80e83b2816b92bdd5c97fbc48b889dc77fd96ec3e22aba5b312c89
  E08:
    record: sys_db_object/c6d112cf83778310292aca75eeaad353
    children: sys_choice
    how: read the on_call_escalation_comm choices
    result: 'channels Email, SMS, Voice, Task, Conference escalation; responses Accepted, Rejected, Auto Assigned, Invalid Response (and from another device); status Sent, Failed'
    hash: 0765f861e1cfab657049d32cd5e8f73255f2970f507eba2f558c455fde2a6f70
  E09:
    record: sys_db_object/a1e196cf83778310292aca75eeaad366
    children: sys_choice
    how: read the cmn_rota catch-all choices
    result: Notify Individual, Notify All, Notify Group Manager
    hash: 8ea60df6debbc85832664a9b4321e14a35cd1ee21c766aae7fdf5bc45fae52ce
  E10:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Shifts list (cmn_rota), all records
    how: opened the list of shifts
    result: No records to display
  E11:
    record: sys_script_include/57891886732220102eb52d2b04f6a729
    field: script
    how: read TriggerRuleSNC.cancelSubflows
    result: 'a new on-call subflow cancels those already running on the record ("An On-Call Trigger Rule has started a new subflow, cancelling all running subflows …") and marks their escalations cancelled'
    hash: d3982599543732dc6a0f87383b5db40003beedb0502c3e3b223c31155a77e45e
  E12:
    record: sys_properties/110b43c9c70b00100c54885827c2605f
    field: value
    how: read com.snc.on_call_rotation.log_escalations
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E13:
    record: sys_script_include/e3e4ae19c70200102e65e122c7c26057
    field: script
    how: read OnCallEscalationUtilSNC.isEscalationLogEnabled
    result: 'when the property isn''t true, the escalation, its levels, attempts, communications and answers are not written'
    hash: 0da3e3ffbf7b530e99fb5302805102d0d0e3153badd4a515b5700f2152d51ac2
---
## Three things with a life of their own

On-call scheduling has no single record that moves through states. A **shift** is drafted and
published; a **time off request** is approved or not; and each time urgent work reaches a group, an
**escalation** runs until someone takes it. On pdi2 none of them exists yet, because no group has
a shift. [E10]

### A shift {for=operator}

| State | What it means |
|---|---|
| **Draft** | being prepared; always inactive, so nobody is on call from it [E03] |
| **Live** | published and active; its rosters decide who is on call [E01] |

**Publish** makes a draft live; **Move to Draft** takes it back, and it stops counting. [E01] [E02]

### A time off request {for=operator}

| State | What it means |
|---|---|
| **Pending approval** | asked for; waiting for the approver |
| **Additional info requested** | the approver wants more detail |
| **Approved** | granted; the cover takes the shift |
| **Rejected** | not granted |
| **Approval not required** | granted straight away, by the group's settings |

[E04] Each request goes through an approval and the roster is updated when it is decided. [E06]
On pdi2, members can't ask for time off themselves unless their group's preferences allow it; a
shift manager or an administrator records it for them. [E05]

### An escalation {for=operator}

| Status | What it means |
|---|---|
| **Live** | running; people are being contacted in turn |
| **Completed** | finished |
| **Cancelled** | stopped, for example because a new on-call subflow started on the same record [E11] |

[E07] An escalation can record each contact with its channel (email, SMS, voice) and the
answer: *Accepted*, *Rejected* or *Auto Assigned*. [E08] On pdi2 that log is switched off, so
nothing is recorded. [E12] [E13] When nobody accepts, the shift's **catch-all** decides who is
told last: one named person, everyone on the roster, or the group manager. [E09]
