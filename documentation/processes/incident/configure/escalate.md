---
title: Escalation and related work - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/13c7a3a9dbc403004d27b31be0b8f5db
    how: read Propose Major Incident (scope sn_major_inc_mgmt; roles itil, sn_incident_write)
    result: canProposeMIC — itil or sn_incident_write, active, no parent, state empty, rejected or canceled; work note "Proposed as major incident candidate"
    hash: d82e618b437518fc55604f920ecf5655cc551f7ab57ab1caf1bad8ddcbd8b752
  E02:
    record: sys_ui_action/d40103f13b10030050bec9bb34efc4d5
    how: read Promote to Major Incident (role major_incident_manager)
    result: requires canApproveMIC and sn_major_inc_mgmt.major_incident_creation = PROMOTE
    hash: 14eec9407c051830a0511c05d1da1232c8329e97289303b17016aa70b4429086
  E03:
    record: sys_ui_action/5ff62e840b2003005775aabcb4673a67
    how: read Create Major Incident (role major_incident_manager)
    result: used only when the creation mode is create_new; the live mode is promote (E14), so this action isn't offered
    hash: 2748371ed37c4f273b5e0b7dc4cd981d3f2760ec4b34e9e0d8b837ab8d0b53c1
  E04:
    record: sys_ui_action/629afe040b2003005775aabcb4673a34
    how: read Reject Major Incident Candidate
    result: major_incident_manager, candidate proposed
    hash: 300f492e1ae5ee5a84c38bd9faddcb362d6a8649b332e6f1f91bd4b4c0d8ec76
  E05:
    record: sys_ui_action/ad2f0767871203003582af1e36cb0b14
    how: read Demote Major Incident
    result: major_incident_manager, accepted
    hash: 3de4700a2d6b8031519dee8186a0ceb31c349d39577b8dd090c960e2603c16ac
  E06:
    record: sys_ui_action/728d59a35f380300f51ca184ff4666b0
    how: read View Workbench
    result: proposed or accepted; opens $major_incident_workbench.do
    hash: e18e648e017ae65ec45475f0be88dc81367d73b1de331e8cab40e610eb6096b5
  E07:
    record: sysevent_email_action/6269c7cec3c103009f93dfdc64d3aefd
    how: read Major Incident Candidate Assigned
    result: when the state changes to proposed, to the assignment group
    hash: b2af98605566a97a63d5496aa44f7589c9e7d7c1920d015fcf3701287a4b3dde
  E08:
    record: sys_script/b8b68e5453701300d6fdddeeff7b1292
    how: read Major incident assignment
    result: sets the group from sn_major_inc_mgmt.major_incident_management_group (value redacted)
    hash: 9c08c4bcecc0acc2eb0e7c82a70269de5ea832e3925b8a32f885df7f077d4b57
  E09:
    record: sys_ui_action/d5378d81c38202003d2ae219cdba8fc5
    how: read Create Emergency Change
    result: not closed, itil or sn_change_write, no change linked yet; links through rfc
    hash: f338ab12afc22c222a893b5f6a5a9c9f57e52e8d0d897328f86c8fdca3ff06de
  E10:
    record: sys_ui_action/1d850156230123001488dc1756bf6504
    how: read Create Change Request (updated by admin 2026-06-17)
    result: workspace menu button; not closed, itil or sn_change_write, rfc empty
    hash: 1fb7d078f1048ec7b4edd446756672d75e7b8bdfc60f82d66a77dbe5be9ff883
  E11:
    record: sys_ui_action/50317d860a0a0b4b00857807b0815bb2
    how: read Create Request
    result: not closed, itil or sn_request_write; opens the catalog with the incident as parent
    hash: 735efa3fb151ce151322d70ecae8e1a81da50ef4872374c0c94f725016154294
  E12:
    record: sys_ui_action/117f90e367cb3200060071bfa2415a51
    how: read Create Child Incident (roles itil, sn_incident_write)
    result: active and IncidentUtils.isCreateChildIncidentEnabled (property com.snc.incident.create.child.enable, redacted)
    hash: 4a07e14e2ccd4b8a49bbe930c908dd040f1e50112ab736e28390d5907a6c4286
  E13:
    record: sys_ui_action/7678d7d2531232000600e26b88dc3401
    how: read Copy Incident
    result: IncidentUtils.isCopyIncidentEnabled (property com.snc.incident.copy.enable, redacted)
    hash: 258977a99e7638e0afcf94f9883caae0b251380d0a50d4ddca0593e3ddc40d79
  E14:
    record: sys_properties/3f2f9db80b2003005775aabcb4673a52
    field: value
    how: read sn_major_inc_mgmt.com.snc.incident.mim.major_incident_creation
    result: promote (choices create_new and promote)
    hash: 363256bd153813bc7b3e4e1cb8a7e65b4a9c269ed27b1823925bd408833d6883
---
## Major incident management

Propose [E01]; promote [E02] (the creation mode is *promote* [E14], so create [E03] isn't
offered); reject [E04];
demote [E05]; workbench [E06]. The group is notified of a candidate [E07]; the major incident
group is set from a property [E08]. The plugin's fields and choices were created on 2026-10-12,
which looks like its activation date.

## Related records

Emergency change [E09], change request [E10], request [E11], child incident [E12], copy [E13].

## Answered on 2026-10-17 {label=CORRECTED}

- Creation mode is **promote** (`sn_major_inc_mgmt.com.snc.incident.mim.major_incident_creation`,
  `sys_properties/3f2f9db80b2003005775aabcb4673a52`), so managers see *Promote to Major Incident*.
- Copy and child incidents are enabled (`com.snc.incident.copy.enable`,
  `com.snc.incident.create.child.enable`, both `true`).
- On screen, the workspace offers neither *Propose* nor *Promote*; both are on the classic form's
  menu only. Neither screen offers *Create problem* or *Create change request*: the actions behind
  the workspace's menu items aren't on the instance (`sys_ui_action/2f43c471c0a8006400a07440e49924c2`,
  `sys_declarative_action_assignment/20aec8ab233230101488dc1756bf6557`), so the items don't show.
  See the operator guide's evidence.

## Open questions {label=OPEN-QUESTION}

1. The major incident management group (`sn_major_inc_mgmt.major_incident_management_group`)
   is still redacted: it names a group, which the mirror doesn't hold. Which team is it?
2. Is it intended that operators can't raise a problem or a change from an incident?
