---
title: Working an incident - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_policy/d8e02184c3b30200b6dcdfdc64d3ae30
    how: read the policy (condition state=3)
    result: hold_reason visible and mandatory
    hash: b8f1c64dc520d3681d801aafa742de23113ce6d8a0158d2ec3c12f7e85321a48
  E02:
    record: sys_ui_policy/31aa2d560b001300ed45478d83673a41
    how: read the policy (condition hold_reason=1^state=3)
    result: comments mandatory
    hash: b9986e88868b554c8a2a505339713ecd235f556c743d287b0bdb30d19eec2aab
  E03:
    record: sys_script/ac79b245c31b220035ae3f52c1d3ae77
    how: read Clear On Hold Reason
    result: state not 3 and hold reason set → hold_reason cleared
    hash: 05bc25fd736b7f0fe3cef91e841f18031074ba38eb5caf397e0bb910bce78fd6
  E04:
    record: sys_script/162581e087133200b4ae6c5837cb0b1a
    how: read Incident State Change to In Progress
    result: caller comment while Awaiting Caller → state 2
    hash: f4a62fc198d894d826c0208e5e0e606e78139e16118c59d6c52e02bd8be29828
  E05:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    field: script
    how: read the script action on problem.state_change
    result: 'incidents with this problem_id, On Hold, hold reason 3 (Awaiting Problem): fix_applied resolves them (close code Resolved by problem, work note with the fix notes, event incident.resolved_by_problem); risk_accepted only adds a work note and queues incident.updated_by_problem'
    hash: 05ad6dee5b208584f1f5ea888e7cb64d0efa10da0a9cb80903a7db107fb633dd
  E06:
    record: sysevent_email_action/0d51edbac0a80164006963b000ff644e
    how: read Incident commented for ITIL
    result: comments change → assignee and watch list
    hash: ecec6a1dd01c138dea1edebef3ec94633b3cec7d96633ce71e68d1d70de5ed25
  E07:
    record: sysevent_email_action/e3d6fce487d73200b4ae6c5837cb0b21
    how: read Incident commented and state changed
    result: caller comment that moves 3 → 2 → assignee and watch list
    hash: 0d32e7b45891a29ca9f2a1509bd8dd25662672d8642c5fdb4203493a68230628
  E08:
    record: sys_script/8f61f1b00a0a3c7401aac471d27a2718
    field: script
    how: read Update Child Incidents
    result: copies comments and work notes to child incidents, resolves children with the parent
    hash: 917e3d1c68b281ba6c81a50742086ef60a396d924b925e0c51b7051932a9e261
  E09:
    record: contract_sla/752bcf74c3143200b6dcdfdc64d3aeeb
    how: read Priority 2 response (1 hour)
    result: 1 h on 8-5 weekdays; stop incident_state!=1 and assignee set
    hash: 933e26eadf78b9aaa6a9718a5a23074e1153ed3c6d5700f0baf7a75bbbad59ef
  E10:
    record: contract_sla/35c213b4c3143200b6dcdfdc64d3ae21
    how: read Priority 3 response (4 hours)
    result: 4 h on 8-5 weekdays
    hash: a3e9b15c038ac67ffee3181c3e8c946f7d102d0556a4fab0fe686ebe3ed930c5
  E11:
    record: contract_sla/375397f4c3143200b6dcdfdc64d3ae60
    how: read Priority 4 response (8 hours)
    result: 8 h on 8-5 weekdays
    hash: 87115b6ddc06347258591c4ab6544a72a2a84edcfcd5222ef4daf5ff5784bc74
  E12:
    record: contract_sla/af420982d732220035ae23c7ce6103f3
    how: read Priority 2 resolution (8 hour)
    result: 8 h on 8-5 weekdays; stop at 7; pause awaiting caller or resolved
    hash: ba3b71bf3cc64e7874c3ae915948ff14401c75daebc5b851f0907cb26fd6c07f
  E13:
    record: contract_sla/d1524982d732220035ae23c7ce61035d
    how: read Priority 3 resolution (1 day)
    result: duration 24 h counted on the 8-5 weekdays schedule (24 business hours, about 3 working days); time zone from the caller
    hash: e9682237f5365dd36c949d758a2fa0f6040699b162d339f23814bc2e34f2b710
  E14:
    record: contract_sla/b12a37e0d7322200f2d224837e6103ea
    how: read Priority 4 resolution (2 day)
    result: duration 48 h counted on the 8-5 weekdays schedule (48 business hours, about 5 to 6 working days); time zone from the caller
    hash: d4c1db0aa4ada94efcaf85a61c26499799f2468f7f34828c6ebd44f0981435db
  E15:
    record: contract_sla/ba320982d732220035ae23c7ce610347
    how: read Network group resolution (OLA)
    result: 4 h, no schedule, for one network group; retroactive false
    hash: 6849c0eec1ffe5b482cf495acc8d91437f2cda28ec7b8ab78dbc770b0f0f59bc
  E16:
    record: contract_sla/b222c582d732220035ae23c7ce6103a7
    how: read Database group resolution (P1 only, OLA)
    result: 1 h, no schedule; retroactive false
    hash: 5cb4335dc3b645c084d6c989f13f40a3f7cd8bc37f8b5e8585d73b9abb5a1635
  E17:
    record: contract_sla/3b524982d732220035ae23c7ce6103e4
    how: read SAN 001 contract resolution (underpinning contract)
    result: 3.5 h, for one CI; retroactive false
    hash: 2bdb2fd131cf6b8b6f5cc3ba0352a27192fac949838c7114c1e2a01eddb161b6
  E18:
    record: contract_sla/2ca94b74c3143200b6dcdfdc64d3ae93
    how: read Priority 1 response (15 minutes)
    result: 15 min, 24x7
    hash: 432d40f389fdbc967319820583344ed835a7d679dfdf051283a5642e5940c691
  E19:
    record: contract_sla/35420982d732220035ae23c7ce610393
    how: read Priority 1 resolution (1 hour)
    result: 1 h, 24x7
    hash: 6157ef1df804d16a5907062d37e4c485a8acec29cf19eaeb923f59159f793aa9
---
## On hold

Reason mandatory [E01]; comments mandatory for Awaiting Caller [E02]; reason cleared when leaving
On Hold [E03]; caller reply resumes [E04]. When a linked problem changes state [E05]:

- resolution code `fix_applied`: incidents On Hold - Awaiting Problem are resolved (*Resolved by
  problem*, the problem's fix notes as a work note);
- resolution code `risk_accepted`: they only get a work note and the event
  `incident.updated_by_problem`; they stay on hold.

No business rule or script action found acts on Awaiting Change or Awaiting Vendor.

Hold reasons: 1 Awaiting Caller, 5 Awaiting Change, 3 Awaiting Problem, 4 Awaiting Vendor.

## Notifications while working

Comments to the caller (see [Who is told what](see:who-is-told)), to the assignee and watch list [E06], and the
"state changed" notice when a caller's reply resumes the incident [E07]. Parent and child
incidents share comments and work notes. [E08]

## SLA definitions (all on incident, all active)

| SLA | Type | Duration | Schedule | Record |
|---|---|---|---|---|
| Priority 1 response | SLA | 15 min | 24x7 | [E18] |
| Priority 2 response | SLA | 1 h | 8-5 weekdays | [E09] |
| Priority 3 response | SLA | 4 h | 8-5 weekdays | [E10] |
| Priority 4 response | SLA | 8 h | 8-5 weekdays | [E11] |
| Priority 1 resolution | SLA | 1 h | 24x7 | [E19] |
| Priority 2 resolution | SLA | 8 h | 8-5 weekdays | [E12] |
| Priority 3 resolution | SLA | 24 h (about 3 working days) | 8-5 weekdays | [E13] |
| Priority 4 resolution | SLA | 48 h (about 5 to 6 working days) | 8-5 weekdays | [E14] |
| Network group resolution | OLA | 4 h | 24x7 | [E15] |
| Database group resolution (P1) | OLA | 1 h | 24x7 | [E16] |
| SAN 001 contract resolution | UC | 3.5 h | 24x7 | [E17] |

Response SLAs start once a group is assigned and stop when the incident has an assignee and has
left New; they never pause. Resolution SLAs stop only at Closed and pause on Awaiting Caller and
Resolved. The eight priority SLAs are retroactive;
the two OLAs and the underpinning contract aren't. [E15] [E16] [E17] Every definition takes its
time zone from the caller's time zone. [E13] [E14]

The durations count only schedule time: *Priority 3 resolution (1 day)* is 24 hours of the 8-5
weekdays schedule, not one working day; the names understate the deadlines.

## Open questions {label=OPEN-QUESTION}

1. Resolution SLAs stop at **Closed**, so the time an incident waits as Resolved is paused but
   still part of the SLA record until auto close. Is that the intended measure?
2. The OLA and UC names point at groups and a CI the mirror can't name. Are they demo data?
3. Legacy escalation rules (`sysrule_escalate`, priority 1 to 4) exist; whether the escalation
   engine runs isn't visible.
