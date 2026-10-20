---
title: Promoting and rejecting - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/d40103f13b10030050bec9bb34efc4d5
    how: read Promote to Major Incident
    result: sysverb_mim_accept; role major_incident_manager; condition canPromoteMIC
    hash: 14eec9407c051830a0511c05d1da1232c8329e97289303b17016aa70b4429086
  E02:
    record: sys_script_include/58ab10353b333200fe02c9bb34efc421
    field: script
    how: read canApproveMIC, canPromoteMIC, canCreateNewMajorIncident, canRejectMIC
    result: major_incident_manager; not inactive; no parent; promote when the mode is promote, create when create_new; reject only a proposed one
    hash: d88ba8b95a56f4824f7514af503b25a188d0ae191a42a0a8f985f904d4a25536
  E03:
    record: sys_properties/3f2f9db80b2003005775aabcb4673a52
    field: value
    how: read the creation mode
    result: promote
    hash: 363256bd153813bc7b3e4e1cb8a7e65b4a9c269ed27b1823925bd408833d6883
  E04:
    record: sys_ui_action/5ff62e840b2003005775aabcb4673a67
    how: read Create Major Incident
    result: creates a new parent and links the candidate; only in mode create_new
    hash: 2748371ed37c4f273b5e0b7dc4cd981d3f2760ec4b34e9e0d8b837ab8d0b53c1
  E05:
    record: sys_ui_action/629afe040b2003005775aabcb4673a34
    how: read Reject Major Incident Candidate (form)
    result: context menu only; condition canRejectMIC
    hash: 300f492e1ae5ee5a84c38bd9faddcb362d6a8649b332e6f1f91bd4b4c0d8ec76
  E06:
    record: sys_script_include/e2d75876537203006725ddeeff7b1260
    field: script
    how: read MIMListActionsUtil.rejectMIC (list reject)
    result: checks only itil or sn_incident_write on the server
    hash: 82cf344926ec4bf182e6ea6a0eebd6d9cda9b8efd4ac765d55ef0f980d9a644b
  E07:
    record: sys_script/b8b68e5453701300d6fdddeeff7b1292
    field: script
    how: read Major incident assignment (before insert and update, order 1050)
    result: 'when the state changes to Proposed (no group yet) or Accepted, sets the group in sn_major_inc_mgmt.major_incident_management_group if it has a value; on Accepted, makes the current user the assignee if they belong to the incident''s group; clears an assignee who isn''t a member'
    hash: d5c97f31b69c19de14bbb35a114d91b23b69e8f7c2c426e58df4597051a54741
  E08:
    record: sys_properties/1cc8b29853b01300d6fdddeeff7b127f
    how: read sn_major_inc_mgmt.major_incident_management_group
    result: 'string property, "The sys_id of the group for Major Incident assignment at the time of proposal and promotion"; read and write role sn_mim_admin; value redacted in the mirror'
    hash: 42a9818dd7819f314ba1c579c48985afb071427a65ee0f70e5ce2a67754c0792
  E09:
    record: sys_security_acl/9b7bf6f70ba70300ed45478d83673a59
    how: read the MIM workbench api ACL
    result: execute for itil or sn_incident_read; the REST REJECT branch has no role check of its own
    hash: 400e665887ece6212aace53cc30ba159c7776531255bfd056f278a17f9e3bae5
  E10:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'System Properties, filtered to sn_major_inc_mgmt'
    how: 'read the property values'
    result: 'major_incident_management_group has no value; create.copy.attributes starts short_description,impact,urgency,categor…'
  E11:
    record: sys_script/38615e59b7720010cfb8c556ee11a90d
    field: script
    how: read Major Incident assignment changed (after insert and update, order 100, when major_incident_state changes)
    result: with the group property set and the state Accepted, queues sn_major_inc_mgmt.assignmentGroup.change and sn_major_inc_mgmt.assignedTo.change for the previous group and assignee
    hash: 9950972f9c9202a0ac567065d752891c8105a8f13cecb1b781ae20944f292d42
  E12:
    record: sysevent_email_action/3de6765853b01300d6fdddeeff7b1268
    how: read Notify Assigned To
    result: 'event sn_major_inc_mgmt.assignedTo.change, to the previous assignee (parm1); subject "Reassigning Major incident …"'
    hash: e9d6f0920e684d5582305fa21855a064e3eefd9ccbd79c59493bc0b0edd9ed99
  E13:
    record: sysevent_email_action/3d9a3ecac3c103009f93dfdc64d3aed8
    how: read Major Incident Candidate Rejected
    result: 'engine notification on insert and update, condition major_incident_state changes to rejected; recipients assigned_to and proposed_by; subject "Major Incident Candidate … has been rejected"'
    hash: 0e8597aae8396f1c3a853d887d7443b5db7eeae4aba3c82413d5324d936fe00e
  E14:
    record: sys_script/545340d6872203003582af1e36cb0b1b
    field: script
    how: read Update Major Incident State on Cancel (before insert and update, order 100)
    result: 'condition state changes to Canceled and major incident state Proposed or Accepted; template sets it to canceled; message "… is no longer a major incident" or "… is no longer a major incident candidate"'
    hash: 2f0e405078ef4f8dca90ba6485f6108ea64814d50a3b0e75e3b33dc47245eb9e
  E15:
    record: sys_ui_action/af862b3353b81300fc91ddeeff7b12ee
    how: read Reject Major  Incident Candidate (list action)
    result: condition canRejectMIC hides it from non-managers; the server call goes to MIMListActionsUtil.rejectMIC
    hash: 04008665b3fbb94b55949cc3f07c6b8860dc354825fa1df88d0f4555bc41d88c
  E16:
    record: sys_ws_operation/f67e498173001300cab854eb7df6a72c
    field: operation_script
    how: read the workbench REST operation Actions (POST /api/sn_major_inc_mgmt/mim/actions/{incidentSysId})
    result: PROMOTE goes through approveMIC, which checks major_incident_manager; REJECT sets the state to rejected directly, with no role or state check
    hash: ef85e3fe9a5b2b9e0e9197235ea1551a7a7cd651440db1979865b509dd352cb5
---
## Promote, or create

The creation mode is **promote** [E03]: **Promote to Major Incident** [E01] accepts the candidate
itself; **Create Major Incident** [E04] (new parent, candidate as child) never shows. Both need
`major_incident_manager` through `canApproveMIC()` [E02].

## Order of execution on incident

| When | Order | Rule | Condition | Effect |
|---|---|---|---|---|
| before | 100 | Update Major Incident State on Cancel [E14] | state changes to Canceled, major incident state Proposed or Accepted | major incident state set to canceled; *"… is no longer a major incident"* (or *candidate*) |
| before | 1050 | Major incident assignment [E07] | major incident state changes to Proposed or Accepted | group from the property (Proposed only when there is no group); on Accepted, the promoter becomes assignee if a member |
| after | 100 | Major Incident assignment changed [E11] | major incident state changes | with the property set and Accepted, queues the reassignment events |

| Notification | Trigger | Recipients | Subject |
|---|---|---|---|
| Major Incident Candidate Rejected [E13] | major incident state changes to rejected | assignee, proposed by | *"Major Incident Candidate … has been rejected"* |
| Notify Assigned To [E12] | sn_major_inc_mgmt.assignedTo.change | previous assignee | *"Reassigning Major incident …"* |

## Assignment on promotion {label=CORRECTED}

The group comes from the property `sn_major_inc_mgmt.major_incident_management_group`, which only
`sn_mim_admin` can read or write. [E07] [E08] Its value is private to that role, so the record
doesn't show it, but on screen it is **empty** [E10]: the group never changes on proposal or promotion, and the reassignment
emails are never queued. [E11] Promotion still makes the promoter the assignee when they belong to
the incident's current group. [E07] Set the property to the major incident team's sys_id if
promotion should hand the incident over.

## Rejection has no server-side role check

Security observation: only the UI conditions require a major incident manager. The form action
checks `canRejectMIC()` [E02] [E05], and so does the list action's visibility [E15], but the
client-callable function it calls, `MIMListActionsUtil.rejectMIC`, checks only `itil` or
`sn_incident_write` [E06]. The workbench REST operation is open to anyone with workbench access
[E09], and its REJECT branch sets the state with no role or state check, while its PROMOTE branch
does check the role. [E16] So any service desk user who calls these endpoints directly can reject
a candidate. Whether to add a `major_incident_manager` check on the server, or accept the risk,
is not decided yet. [Q08]
