---
title: Logging an incident - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_app_module/14641d70c611228501114133b3cc88a1
    how: read module Create New
    result: incident.do?sys_id=-1, roles sn_incident_write, itil
    hash: c3e88dae61cc8f24383c46e8315723f228ad6cbfc23d43633031d41220ba46ad
  E02:
    record: sys_app_module/bf2c0383c0a801640128cbe631d11c4b
    how: read module Open - Unassigned
    result: active=true^assigned_toISEMPTY
    hash: 651dbd0fb3b54028697d4efe0caed276cb816235a7578f454ea6a023181d7d79
  E03:
    record: sys_ui_form/991f87290a0006414b6521d3fa9b4176
    how: read the Default form's section order
    result: main, Notes, Related Records, Resolution Information, Major Incident, Post Incident Report
    hash: 6e459230582558324c361f11fe521ca86e599c10a6f0168afd0fefa071fd77fe
  E04:
    record: sys_ui_section/bf1d96e3c0a801640190725e63f8ac80
    how: read the main section's elements
    result: number, company, caller, location, category, subcategory, CI, impact, urgency, priority | opened, opened by, contact type, state, hold reason, group, assigned to | short description, description
    hash: 8b3bac58a9e1524fabb7ea9918fd19953e09124d65f890ca2812d5a8005180c6
  E05:
    record: sys_ui_policy/0c090e93d7b30200f2d224837e61030a
    how: read the UI policy and its two actions
    result: no condition, on load; caller_id and short_description mandatory
    hash: bebf92599b8560570fad3a720e32d8e8ad0ee1d86a2b0c5e2a3136cc9be82a89
  E06:
    record: sys_ui_policy/1605631253f270108b91ddeeff7b120e
    how: read Set Caller field mandatory state for new records
    result: caller and company not mandatory when caused by or origin is an alert, change or incident
    hash: fb1a20300552614878f84dbf4e7845fe8402475ca9e78a55bf81e39983c4b24b
  E07:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    how: read incident choices for category, subcategory and contact_type
    result: 6 categories with dependent subcategories; contact type Monitoring inactive
    hash: bb73c1002bb30dd75f1fff3a219ddd7c08ebc3d39bd65efdb8f63595ed73f743
  E08:
    record: sys_script/d5e2b86cc0a80009011d75b9190527b6
    how: read insert_incident
    result: before insert, numbers the incident and shows "Created Incident {0}"
    hash: 8b2f32321d6eb5e4dffd60861b0a7049a0adb4a8b0d4aae42fbd11bf6f796449
  E09:
    record: sys_script_client/ed5392f3c3122200b6dcdfdc64d3ae96
    how: read Worknotes mandatory onChange of priority
    result: on an existing incident, a priority change makes work notes mandatory
    hash: 85e1e0ad4eb9c3abd45d92b342ccb970bc5edae319c7179f8ac28b106d849498
  E10:
    record: sys_ui_policy/66f94c730a0a0b0900aaaf5b88527230
    how: read Make fields read-only on close
    result: when state 7 or 8, caller, category, CI, group, assignee, comments, work notes and others are read-only
    hash: a9139005c8e4553f7d4f8e96a76365317b33fb2ff79b68088115f68e9fe98197
  E11:
    record: sys_script/205f4e07531101108d07ddeeff7b12c9
    field: script
    how: read the display rule VIP scratchpad
    result: g_scratchpad.is_vip = current.assigned_to.vip (the assignee, not the caller)
    hash: e830e8bcdd378726f78d684494e1d09fbea84e4f482e92b8d52c19300cd65276
  E12:
    record: sys_declarative_action_assignment/5c3f3dc877320210c9ee78dabd5a99f7
    how: read the workspace action Copy Incident (sn_sow_inc)
    result: 'client script action on incident; required roles itil, sn_incident_write; script condition global.IncidentUtils.isCopyIncidentEnabled(); client condition view sow or aitsm; no record condition'
    hash: 57d4336f6b20e0ca73682a4706b86ea574ea5cb97a239769bd4b2ac2cef9cef8
  E13:
    record: sys_ux_form_action_layout_item/bda14e3ec7213010d7e818b1c7c26031
    how: read the form action layout item
    result: order 300, overflow true (More actions)
    hash: a8c02c6caab76348f7d0d74af4c54a8029a482ae8d98673804aa5b09ca0cfecf
  E14:
    record: sys_declarative_action_assignment/5c3f3dc877320210c9ee78dabd5a99f7
    field: client_script
    how: read the client script
    result: 'IncidentUtils2.getIncidentCopyAttachDetails decides whether to show Include attachments (and its default); g_modal.showFields with Caller (mandatory sys_user reference); IncidentUtils2.makeIncidentCopy with the dialog values; g_aw.openRecord on the new sys_id, else "Failed to copy Incident."'
    hash: 2e41a584e553eaf68104d9a5646fb779d965ea879b108ba4e3b303f4be3e2eed
  E15:
    record: sys_script_include/0ebbe74fc7001010c24ae122c7c26009
    field: script
    how: read IncidentUtils2SNC (client callable)
    result: 'makeIncidentCopy: copies the attribute list, sets the dialog fields, work note "This Incident is copied from {0}", inserts if canCreate(), then copyIncidentAttachments and copyIncidentRelatedLists; getIncidentCopyAttachDetails returns only when canCopyIncident'
    hash: faefebf8b632f587fb1dfad4fa5b1514bb7f52a9f63c0baed0d3fac3ed1fab05
  E16:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read IncidentUtilsSNC
    result: 'default attribute list (17 fields); ALWAYS_IGNORE_ATTRS removed from any list; COPY_IF_ACTIVE_ATTRS (parent_incident, problem_id, rfc) checked only on the classic path; related lists limited to task_ci, task_cmdb_ci_service, task_service_offering, task_cmdb_ci_business_app; canCopyIncident: itil, sn_incident_write with granular roles, or the caller'
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
  E17:
    record: sys_properties/8c2863d6531232000600e26b88dc3411
    field: value
    how: read com.snc.incident.copy.enable
    result: 'true; read and write role incident_manager'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E18:
    record: sys_properties/110d231a531232000600e26b88dc3474
    how: read com.snc.incident.copy.attributes
    result: string; value redacted in the mirror
    hash: 83dd8ee494d2e4c8faba3fe8baa0c2ec0d4c0dff14e4bec8ea7f088bc7e40638
  E19:
    record: sys_properties/55e4b38c53e232000600e26b88dc3430
    field: value
    how: read com.snc.incident.copy.attach
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E20:
    record: sys_properties/b644e8d7539232000600e26b88dc3402
    how: read com.snc.incident.copy.related_lists
    result: string, default empty in the script; value redacted in the mirror
    hash: 96c625ff898ecce1be8e4b6b4bbbbb8262e841e27c14dcdf6101cdd59881756e
  E21:
    record: sys_ui_action/7678d7d2531232000600e26b88dc3401
    how: read the classic UI action Copy Incident
    result: 'form context menu only; condition copy enabled and (itil, or sn_incident_write with granular roles, or the caller); opens an unsaved form prefilled through getIncidentQueryParams, then CopyIncidentRelatedLists.do'
    hash: 258977a99e7638e0afcf94f9883caae0b251380d0a50d4ddca0593e3ddc40d79
  E22:
    record: sys_atf_test/3ebfef54735423002728660c4cf6a78e
    how: read INCIDENT MGMT Copy Incident (and the closed-incident test e55e71e073d423002728660c4cf6a774)
    result: both ATF tests inactive
    hash: 12a3d10062abe32903286d1f103d44e36f115492a3d14cdd89da40de0a82fd33
---
## Navigation and form

Create New [E01] and the unassigned queue [E02]. Form sections [E03] and main section fields
[E04].

## Rules on the form

| Rule | Effect | Record |
|---|---|---|
| Mandatory in every state | Caller, Short description | [E05] |
| From an alert, change or incident | Caller and company not mandatory | [E06] |
| Choices | categories, subcategories, contact types | [E07] |
| Numbering | INC number on insert | [E08] |
| Priority change | work notes mandatory | [E09] |
| Closed or Canceled | most fields read-only | [E10] |

Dictionary defaults: category *inquiry*, impact 3, urgency 3, priority 4. Only `task.company` is
mandatory in the dictionary, so company may be required on save even when the form doesn't show
it. [Q73] The display rule *VIP scratchpad* reads the **assignee's** VIP flag, not the caller's.
[E11] [Q46]

## Copy Incident {label=NEW}

The records in the order they run in the Service Operations Workspace:

| Step | Record | What it does |
|---|---|---|
| 1. Shown | action assignment *Copy Incident* (sn_sow_inc) | roles itil or sn_incident_write, views `sow` and `aitsm`, `IncidentUtils.isCopyIncidentEnabled()`; no record condition, so closed incidents too [E12] |
| 2. Placed | form action layout item | More actions (overflow), order 300 [E13] |
| 3. Dialog | the action's client script | asks for a caller; offers *Include attachments* when the incident has any [E14] |
| 4. Copy | `IncidentUtils2SNC.makeIncidentCopy` | builds the record from the attribute list, sets the caller, adds the work note, inserts it if the user may create incidents [E15] |
| 5. After insert | `IncidentUtilsSNC.copyIncidentAttachments`, `copyIncidentRelatedLists` | copies attachments (the dialog's choice) and the configured related lists [E15] [E16] |

Properties (read and written by incident_manager [E17]):

| Property | pdi2 | Effect |
|---|---|---|
| `com.snc.incident.copy.enable` | true | shows the action [E17] |
| `com.snc.incident.copy.attributes` | not in the mirror | fields to copy; script default below [E18] [Q53] |
| `com.snc.incident.copy.attach` | true | *Include attachments* ticked by default [E19] |
| `com.snc.incident.copy.related_lists` | not in the mirror | related lists to copy; none by default [E20] [Q53] |

Script default fields: `assignment_group, business_service, category, caused_by, cmdb_ci,
company, description, impact, location, parent_incident, problem_id, rfc, short_description,
subcategory, urgency, priority, service_offering`. Fields such as number, watch list, close code
and notes, opened by and at and domain are removed from any list. [E16]

The classic form has its own UI action, in the form's context menu only: it opens an unsaved,
prefilled form, and copies parent incident, problem and change only when they are active, with the
work note *"Created from a similar incident"*. [E21] [E16] The workspace path doesn't make that
active check, so a copy can point at a closed problem or change. [E15] [E16] [Q23]

The two ATF tests for Copy Incident are inactive. [E22] [Q47]
