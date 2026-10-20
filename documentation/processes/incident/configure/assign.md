---
title: Assignment - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_script/27453ac6b73610102d2fbc16de11a937
    how: read the filter, condition and script (rule on task, before insert and update, order 100)
    result: incident and problem use support_group of the CI or else the service offering; change uses assignment_group; only when group and assignee are empty and CI or offering changes from empty; condition skips unauthorized change requests (sys_class_name change_request and unauthorized true)
    hash: c862798729dd0aa29d354614c6d0615e575d3b6347f2f777c060654cde079661
  E02:
    record: sys_script/6a2e9d1453e80010833addeeff7b124f
    how: read the script and its filter (before insert and update, order 100)
    result: filter assigned_toISNOTEMPTY^assignment_groupVALCHANGES^assignment_groupISNOTEMPTY; queries sys_user_grmember; aborts with "Assigned to user {0} must be member of Assignment group {1}"; a change of assigned_to alone is not checked
    hash: b41fef5642903ef5b4c95a14b9424211b8b06437bf74e7ea0508635c53128b02
  E03:
    record: sys_script/6fab2e470a0007045931f2a692878933
    how: read the rule (before insert and update, order 1100)
    result: filter incident_state=1^assigned_toISNOTEMPTY; template incident_state=2^state=2
    hash: 56d370b105abf6182b075b4936fd79acbee1bd08cfaaef3435ce7f1cd8cb0d05
  E04:
    record: sys_ui_action/3b991ad673da20103e366238edf6a7f3
    field: script
    how: read Assign to me (list context menu, roles itil and sn_incident_write)
    result: refuses inactive records, no write access, or non-members; fills the group when the user has exactly one active group
    hash: 3a7418f0f745e90d77826c815d65e388aa3f01e03d23451f99e4a60c51a191aa
  E05:
    record: sys_ui_action/e44b67f63b330300a2bac9bb34efc46a
    how: read Assign to me in the workspace (scope sn_itsm_workspace)
    result: form button, condition IncidentUtils().canAssignToMe(current)
    hash: f6c97fcfdbeae55f7c3fd118e0390d2bae704b6c1b09c24e1c7bc3042b0ed225
  E06:
    record: sys_script_client/273386d1c3a32200b6dcdfdc64d3ae85
    how: read Empty assigned_to on group change
    result: clears the assignee when not a member of the new group
    hash: 0d337efc03ec7d61c451f19afa66ca69a32a8650065e52b13918df80bef5a14f
  E07:
    record: sys_dictionary_override/55ff75ce1bba10104f32a68a234bcb5a
    how: read the incident.assigned_to override
    result: reference qualifier roles=itil^ORroles=sn_incident_write
    hash: 2adf04c41bde9f2ec777fbc96beeb54ce7f1c6b0e56d53d637174ecc5dac5280
  E08:
    record: dl_definition/95bd23372b321000de0aba36a3fd5644
    how: read Assignment Lookup
    result: active; matches category, subcategory, CI, location; sets group and assignee without replacing; one row (inquiry / email)
    hash: 1c089d7ef959a4baccda931db31eaa818508b3303b65eb1257f727aadc1df797
  E09:
    record: sysrule_assignment/d62c8c27c0a801670089269e33e4f5cc
    how: read assignment rule Service Desk
    result: inactive (as are Networking and Database or Software)
    hash: e88b5d6b4cf6678b70d9763eacca420a6eaabbb0379ea3fc6d3cb5b2da4f5f48
  E10:
    record: sysevent_email_action/56ae47dfc611227501b04310882ac2ab
    how: read Incident assigned to my group
    result: no assignee and group changes to a value; to the group
    hash: b1e4ea7171ffc1c665de4a37cf4d6f807fbd94e0bfd7e02bf342ccdda7ceb2bc
  E11:
    record: sysevent_email_action/5d078413c0a801640144dc7bc70871ce
    how: read Incident assigned to me
    result: assignee changes to a value; to the assignee
    hash: c80145f344db955bcd848fed4dc03d2167d399b643afa4478bdc735d18c44011
---
## Order of execution (before insert and update)

| Order | Rule | Effect |
|---|---|---|
| 100 | Populate Assignment Group based on CI/SO (on task) [E01] | group from the CI's or offering's support group, when group and assignee are empty and the CI or offering is first set; not for unauthorized change requests |
| 100 | Abort changes on group [E02] | when the group changes to a value and an assignee is set, the assignee must belong to the group; changing only the assignee isn't checked server-side |
| 1100 | Incident State Active on Assignment [E03] | New + assignee → In Progress |

On the form, changing the group clears a non-member assignee. [E06] Only `itil` or
`sn_incident_write` users can be assigned. [E07]

All three assignment rules are inactive [E09], so routing relies on the CI's support group. [Q16]
The Assignment Lookup has a single row, assigning *inquiry / email* to one named
person. [E08] [Q17]

## Actions and notifications

Assign to me, list [E04] and workspace [E05]. Group notified [E10]; assignee notified [E11].
