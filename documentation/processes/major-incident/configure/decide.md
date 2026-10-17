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
    how: read Major incident assignment
    result: assigns the group in sn_major_inc_mgmt.major_incident_management_group on proposal (if none) and on promotion
    hash: d5c97f31b69c19de14bbb35a114d91b23b69e8f7c2c426e58df4597051a54741
  E08:
    record: sys_properties/1cc8b29853b01300d6fdddeeff7b127f
    how: read sn_major_inc_mgmt.major_incident_management_group
    result: value redacted in the mirror
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
---
## Promote, or create

The creation mode is **promote** [E03]: **Promote to Major Incident** [E01] accepts the candidate
itself; **Create Major Incident** [E04] (new parent, candidate as child) never shows. Both need
`major_incident_manager` through `canApproveMIC()` [E02].

## Assignment on promotion {label=CORRECTED}

On proposal (when there is no group) and on promotion, the incident is assigned to the group the
property `major_incident_management_group` names. [E07] The mirror shows the value as redacted
[E08], but on screen it is **empty** [E10]: nothing is reassigned, and the reassignment emails never
fire. Set it to the major incident team's sys_id if promotion should hand over.

## Rejection {label=OPEN-QUESTION}

The form action requires a major incident manager through `canRejectMIC()`. [E02] [E05] The list
reject checks only `itil` or `sn_incident_write` on the server [E06], and the workbench REST
REJECT checks only workbench access [E09]: the role is enforced by the UI conditions alone. Worth
a look from the platform team.
