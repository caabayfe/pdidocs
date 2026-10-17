---
title: Proposing - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/13c7a3a9dbc403004d27b31be0b8f5db
    how: read Propose Major Incident
    result: sysverb_mim_propose; context menu and workspace menu flags; roles itil, sn_incident_write; excluded from the ess view
    hash: d82e618b437518fc55604f920ecf5655cc551f7ab57ab1caf1bad8ddcbd8b752
  E02:
    record: sys_script_include/58ab10353b333200fe02c9bb34efc421
    field: script
    how: read canProposeMIC
    result: itil or sn_incident_write; incident active; no parent; state empty, rejected or canceled
    hash: d88ba8b95a56f4824f7514af503b25a188d0ae191a42a0a8f985f904d4a25536
  E03:
    record: sys_ui_page/3c02c808873013000e3dd61e36cb0b71
    field: client_script
    how: read mim_propose
    result: 'work notes mandatory; writes "Proposed as major incident candidate"; business impact copied'
    hash: 05644bbd6491c3dbea3548d769b831250753c1221ade24e94316890ef98e9b80
  E04:
    record: sys_script/19bb57443b10030050bec9bb34efc40e
    field: script
    how: read Major incident state has changed
    result: sets proposed_by and proposed_on (promoted_by and promoted_on on accept); queues incident.major_incident_state_changed, which nothing listens to
    hash: c376bb3244746280efc9d3f048f6262801d7d9b0d1bed5b55d37e76d113c63af
  E05:
    record: sys_script/863f34213b18030050bec9bb34efc4ae
    field: script
    how: read Evaluate Major Incident Trigger Async
    result: async on insert and update of active non-child incidents not yet candidates; queues sn_major_inc_mgmt.evaluate_trigger_rules
    hash: 1de30e63431549dce7339ee4e4796d2189d2d6149ab1e31c71c821c1dc738a91
  E06:
    record: sysevent_script_action/b0c272b143143110377050e01fb8f22f
    field: script
    how: read Propose to MIM based on trigger rules
    result: runs the active trigger rules as the saving user; first match proposes or promotes
    hash: 8e83b95beb830657f4141a1a3ff29e79e0f1db485ea4b068c67cac5ca2243538
  E07:
    record: sys_db_object/1a55128b83f78310292aca75eeaad3f7
    how: read the major_incident_trigger_rule table
    result: extends sys_metadata; action propose or promote; conditions
    hash: 8c7808ae05ec95ea50015f99d6c6e53b31aefa4fad12d714890b5ce826b24980
  E08:
    record: sys_ux_form_action_layout/e28e161b534130108b91ddeeff7b1229
    how: read the workspace incident header layout
    result: no item for Propose or Promote
    hash: 6aaac5eb90654c413ff7e6240b5d2c0fd67d8cc7973321754589141411f3b7a0
  E09:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Major Incident Trigger Rules list'
    how: 'opened the list'
    result: 'No records to display'
---
## Manual proposal

**Propose Major Incident** [E01] shows when `canProposeMIC()` passes [E02]. The dialog requires
work notes and writes them with the prefix *"Proposed as major incident candidate"* [E03]; a
business rule stamps who proposed and when [E04]. The workspace header layout has no item for it,
so operators propose from the classic form. [E08]

## Trigger rules {label=CORRECTED}

Every save of an active, non-child incident that isn't a candidate queues an evaluation [E05]; the
script action runs the active trigger rules **as the user who saved**, in order, and the first
match proposes or promotes. [E06] The rules are records of `major_incident_trigger_rule` [E07].
pdi2 has **none** [E09], so every evaluation finds nothing: candidates are only proposed by
hand.

The event `incident.major_incident_state_changed` [E04] has no listener on pdi2.
