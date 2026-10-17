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

Dictionary defaults: category *inquiry*, impact 3, urgency 3, priority 4.

## Findings {label=OPEN-QUESTION}

1. *VIP scratchpad* reads the **assignee's** VIP flag, not the caller's. [E11] It looks like a
   defect: confirm what it is used for.
2. Only `task.company` is mandatory in the dictionary; company may be required on save even
   when the form doesn't show it. Confirm with a test.
