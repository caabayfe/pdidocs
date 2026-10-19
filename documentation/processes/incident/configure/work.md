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
  E20:
    record: sys_ux_app_route/0bd6c17843b47110cc25ff53e9b8f288
    how: read the SOW side panel route Attachments
    result: route type attachments, icon paperclip-outline, order 700
    hash: 34f0b43a600c8c1672bc3c7557b19f51d799cc06b01ce2693017fc76f717b2e8
  E21:
    record: sys_ux_screen/4bd685bc43b47110cc25ff53e9b8f27c
    how: read the screen Attachment SNC
    result: 'macroponent Attachment (sn_record_page), bound to the record''s table and sys_id; not shown for sys_template, two sn_occ tables and asmt_assessment_instance'
    hash: 21f4751d1266912f76f077c183ef18303ef876f6bc2851956b8f739116ab4bcb
  E22:
    record: sys_ux_lib_component/3b442b0a49981f104f75325e7baf6ef6
    field: required_sys_props
    how: read the attachments component (sn_now_record_side)
    result: 'reads glide.attachment.extensions, com.glide.attachment.max_size, sn_now_record_form.u_SupportedFileTypesForAttachmentPreview, glide.ui.presence.disabled and the seismic attachment properties'
    hash: 835f004ff6ae3b264728f8f71e13575855d81d53e91d432d77034b9570db093b
  E23:
    record: sys_declarative_action_assignment/a7253f6eb3a033002bf182c136a8dca2
    how: read Attachments (sn_itsm_workspace)
    result: 'contextual side panel action on incident for the Agent Workspace, component now-record-common-attachments-connected (deprecated version); overrides the global one'
    hash: 919a5a66f94e95330cd0ed12069dd950a557f6502618f3118294bd15ccc06814
  E24:
    record: sys_security_acl/0bcf23740a6a38d400c7e02590038464
    how: read the read ACL on sys_attachment
    result: AttachmentSecurity.canRead, which checks read on the parent record
    hash: a489c80cd796613c9f31477929bca9fe1f2cbcebe4deadf5b6614f8cc8ea7911
  E25:
    record: sys_security_acl/0bcff9740a0006d400ae1a384168533a
    field: script
    how: read the create ACL on sys_attachment
    result: parent record canWrite()
    hash: 308f8c88bd1b89c1928419596e4c11488c6e83cd5b90b4d13dfaefa2b69ee94f
  E26:
    record: sys_security_acl/0c66472a0a0a0b82017c1f3df66a3fe7
    field: script
    how: read the delete ACL on sys_attachment
    result: parent record canWrite(); own attachment when there is no parent
    hash: 69184e554410c8bb52afdf5cf5b46ec236c0187be5aecd70af2c5a873cd5beec
  E27:
    record: sys_properties/2e89e7edc0a80027000beaeebb29707a
    field: value
    how: read com.glide.attachment.max_size
    result: '1024 (MB)'
    hash: e39eef82f61b21e2e7f762fcc4307358f165757f2e77ec855d6992f7e0191932
  E28:
    record: sys_properties/650b07dbc0a80006004f95f2c929335d
    how: read glide.attachment.extensions
    result: allowed extensions, blank allows all; value redacted in the mirror
    hash: 95470553a82f87453342bba33d62d101e6a102b6b08441fbd94c4d3bedd4cd91
  E29:
    record: sys_properties/71641a2ec0a8006400bed4c8622b269e
    how: read glide.attachment.role
    result: roles that can create attachments; value redacted in the mirror
    hash: 537550ce5d3ab2dd4f004e1ff33b6f5ee7b6edd0c9121058ccaf02f3ad0ed440
  E30:
    record: sys_properties/167afa3b8cd903100a22deb6dd2b4e2a
    field: value
    how: read glide.security.file.mime_type.validation
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E31:
    record: sys_properties/7dfb0124435251104881eca4eab8f2c2
    field: value
    how: read glide.security.attachment_type.use_blacklist
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E32:
    record: sys_properties/da7afa3b8cd903100a22deb6dd2b4e27
    field: value
    how: read glide.ui.attachment.force_download_all_mime_types
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E33:
    record: sys_properties/4db639b577e60110c4501238bd5a9976
    field: value
    how: read glide.activity.attachment_preview
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E34:
    record: sys_properties/588868a3eb712100469a20425206feaf
    field: value
    how: read glide.email.inbound.max_total_attachment_size_bytes
    result: '18874368 (18 MB)'
    hash: 55ab81f67fa6ab5c5744c825e0fde97fe6332a4a512589e4a3dfba33fe86a529
  E35:
    record: sp_instance/47af3d50d7000200a9ad1e173e24d4f6
    how: read the Attachments instance on the portal page ticket
    result: Ticket Attachments widget, active, no roles
    hash: 62925ca9ea67737c3a4bfc6decb0485e4d147b5bc2140fe2b2010a6a2880f654
  E36:
    record: sp_widget/9ee37281d7033100a9ad1e173e24d457
    field: script
    how: read Ticket Attachments
    result: 'canRead and canWrite of the record; canAttach needs glide.attachment.role and no no_attachment attribute; a portal delete writes the comment "deleted an attachment"'
    hash: 9a49985d9470b4fd4ab991b244cbcc7952bfd45707f9c70029411e6b93352913
  E37:
    record: sys_dictionary/b8e4363b8c5503100a22deb6dd2b4e99
    field: attributes
    how: read the incident table's attributes
    result: email_client, hasWorkflow, live_feed, query_hints; no no_attachment
    hash: 2a8be79e4a31b650b18d1f3e50151858bd707ff1c7eaf456518f859c3f25f91a
  E38:
    record: sysevent_email_action/fc78e05653a6301001b2ddeeff7b128d
    field: include_attachments
    how: read Comment left on incident
    result: 'false; none of the 28 incident notifications in the mirror includes attachments'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E39:
    record: sys_script_client/5601ea5f0a0a0b4b0055644e71c28968
    field: script
    how: read (BP) Hide Attachment Link when Closed (onLoad, all UI types, active)
    result: g_form.disableAttachments() when state or incident_state is 7
    hash: d47ca8f7d3244524dedce3aa7b8c82ca5e050a4ff78130ea6337f05b0817a0f7
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

## Attachments {label=NEW}

Service Operations Workspace: the side panel route *Attachments* [E20] opens the screen
*Attachment SNC* for the record [E21], which uses the attachments component [E22]. The census
finds the older Agent Workspace action `sn_itsm_workspace:Attachments`, a contextual side panel
action on incident with the same component tag. [E23]

Access is the platform's `sys_attachment` ACLs, which follow the incident:

| Operation | Rule | Record |
|---|---|---|
| read | can read the incident | [E24] |
| create | can write to the incident | [E25] |
| delete | can write to the incident | [E26] |

The incident table has no `no_attachment` attribute, so attachments are allowed. [E37]
The client script *(BP) Hide Attachment Link when Closed* disables attachments on load of a
Closed incident. [E39] It is a form control, not an access rule: the create ACL only asks for
write access to the incident. [E25]

| Property | pdi2 | Effect |
|---|---|---|
| `com.glide.attachment.max_size` | 1024 MB | largest file [E27] |
| `glide.attachment.extensions` | not in the mirror | allowed extensions; blank allows all [E28] |
| `glide.attachment.role` | not in the mirror | roles that may create attachments [E29] |
| `glide.security.file.mime_type.validation` | true | content must match the extension [E30] |
| `glide.security.attachment_type.use_blacklist` | true | exclusion lists checked [E31] |
| `glide.ui.attachment.force_download_all_mime_types` | true | files download rather than open in the browser [E32] |
| `glide.activity.attachment_preview` | true | previews in the activity stream [E33] |
| `glide.email.inbound.max_total_attachment_size_bytes` | 18 MB | attachments of an inbound email beyond this are ignored [E34] |

Portal: the *ticket* page has the *Ticket Attachments* widget, with no roles. [E35] Callers see
the attachments of incidents they can read and add files when they can write to the incident and
hold `glide.attachment.role`; a delete from the portal writes a comment. [E36] No incident
notification sends attachments. [E38]

## Open questions {label=OPEN-QUESTION}

1. Resolution SLAs stop at **Closed**, so the time an incident waits as Resolved is paused but
   still part of the SLA record until auto close. Is that the intended measure?
2. The OLA and UC names point at groups and a CI the mirror can't name. Are they demo data?
3. Legacy escalation rules (`sysrule_escalate`, priority 1 to 4) exist; whether the escalation
   engine runs isn't visible.
4. What are `glide.attachment.extensions` and `glide.attachment.role` set to? The mirror redacts
   them. [E28] [E29]
5. The portal widget writes a comment when a caller deletes an attachment [E36], which can send
   the comment emails. Is that wanted?
