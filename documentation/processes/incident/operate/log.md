---
title: Log and categorise an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_policy/0c090e93d7b30200f2d224837e61030a
    how: read Fields set to mandatory for all states
    result: Caller and Short description are mandatory in every state
    hash: bebf92599b8560570fad3a720e32d8e8ad0ee1d86a2b0c5e2a3136cc9be82a89
  E02:
    record: sys_script_client/8f0b3ee00a0a0b5700e75f4aaabe4953
    how: read Highlight VIP Caller
    result: a VIP caller shows a VIP icon and a red caller field
    hash: 1f9078853724b55b6d0ef4cede7d86e96bfafb6a29bc539355d246a2b2de295a
  E03:
    record: sys_script_client/5e524025c0a80166004d1761e85e2058
    how: read (BP) Set Location to User
    result: choosing the caller fills the location with theirs
    hash: 35812337c5b1cba4a32a76db07cd6899267391d67b1fd9aaccace40b39488a40
  E04:
    record: sys_ux_list_category/0917129ec3013010965e070e9140ddff
    how: read the workspace's Incidents lists
    result: Assigned to you, Unassigned, Open, Resolved, All
    hash: a51700f52c9f68650a14710c5596e17bf3545685eb55f0cad91d11a02d1d08e0
  E05:
    record: sys_declarative_action_assignment/5202eee7841e0a10f87780b7d46a554c
    how: read the list action New in the workspace
    result: creates an incident; roles itil or sn_incident_write
    hash: 1fc8e0434d13949ed8d0bcd10be6ab665f8c87491d47037a08a9ac96a1dda38b
  E06:
    record: sys_ui_form/fec7f438536330108b91ddeeff7b1232
    how: read the workspace's new-incident form
    result: sections Incident, Impact, Assignment, Notes, Related Records, Resolution
    hash: 06c145ac2abc87a664c6c28a614304357676ccc3b4cf388e6ddeb2be023b65d8
  E07:
    record: sys_ui_section/fac7f438536330108b91ddeeff7b1234
    children: sys_ui_element
    how: read the Incident section of the new-incident form
    result: short description, description; number, caller, location, contact type, category, subcategory; state, on hold reason, impact, urgency, priority
    hash: 0f2e96eb2188cda801d45843712425da0bf9e1808e76c0e679cac9701ed0cfaf
  E08:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    children: sys_choice
    how: read the incident's contact type and category choices
    result: contact types Chat, Email, Phone, Self-service, Virtual Agent, Walk-in (Monitoring inactive)
    hash: 438604df7c0701185679ccf5f78a95effda35ae621060096b2ab78a53ec5cac2
  E09:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic incident form, INC0010023'
    how: 'read the field labels'
    result: 'contact type is labelled Channel'
  E10:
    record: sys_declarative_action_assignment/5c3f3dc877320210c9ee78dabd5a99f7
    how: read the workspace action Copy Incident
    result: 'roles itil or sn_incident_write; Service Operations Workspace views only; shown while IncidentUtils.isCopyIncidentEnabled() is true; no record condition, so in every state'
    hash: 57d4336f6b20e0ca73682a4706b86ea574ea5cb97a239769bd4b2ac2cef9cef8
  E11:
    record: sys_ux_form_action_layout_item/bda14e3ec7213010d7e818b1c7c26031
    how: read where the action is placed
    result: overflow, so it is under More actions
    hash: a8c02c6caab76348f7d0d74af4c54a8029a482ae8d98673804aa5b09ca0cfecf
  E12:
    record: sys_properties/8c2863d6531232000600e26b88dc3411
    field: value
    how: read com.snc.incident.copy.enable
    result: "true: Copy Incident is switched on"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E13:
    record: sys_declarative_action_assignment/5c3f3dc877320210c9ee78dabd5a99f7
    field: client_script
    how: read what the action does on the screen
    result: 'a "Copy Incident" dialog: "Create a new incident by copying the current incident. Specify a caller to proceed."; Caller (required); Include attachments only when the incident has attachments, ticked by the property; Copy; the new incident then opens'
    hash: 2e41a584e553eaf68104d9a5646fb779d965ea879b108ba4e3b303f4be3e2eed
  E14:
    record: sys_script_include/0ebbe74fc7001010c24ae122c7c26009
    field: script
    how: read IncidentUtils2SNC.makeIncidentCopy
    result: 'the copy is saved at once, with the chosen caller and the work note "This Incident is copied from INC…"; attachments and the configured related lists are copied after it is saved; it fails if you may not create incidents'
    hash: faefebf8b632f587fb1dfad4fa5b1514bb7f52a9f63c0baed0d3fac3ed1fab05
  E15:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read IncidentUtilsSNC, the fields to copy
    result: 'default fields: short description, description, category, subcategory, impact, urgency, priority, configuration item, service, service offering, location, company, assignment group, caused by, parent incident, problem, change request; never copied: number, close code and notes, opened by and at, watch list, work notes list, additional assignees, knowledge, hold reason'
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
  E16:
    record: sys_properties/55e4b38c53e232000600e26b88dc3430
    field: value
    how: read com.snc.incident.copy.attach
    result: "true: Include attachments is ticked by default"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E17:
    record: sys_properties/b644e8d7539232000600e26b88dc3402
    how: read com.snc.incident.copy.related_lists
    result: 'can copy Affected CIs, Impacted Services, Service Offerings and Business Applications; the value on pdi2 is not in the mirror'
    hash: 96c625ff898ecce1be8e4b6b4bbbbb8262e841e27c14dcdf6101cdd59881756e
---
## Where you work

In the **Service Operations Workspace**, open **Incidents**. The lists are **Assigned to you**,
**Unassigned** (the queue nobody has taken yet), **Open**, **Resolved** and **All**. [E04] Press
**New** to log an incident. [E05]

The new-incident form has the sections **Incident**, **Impact**, **Assignment**, **Notes**,
**Related Records** and **Resolution**. [E06]

*Classic form:* the same lists are under **Incident** in the navigator (with *Open - Unassigned*
for the queue); **Create New** opens an empty form.

## Log an incident while you talk to the caller

{{animation:inclog}}

1. Press **New** in the workspace's incident list (classic: **Incident › Create New**).
2. In the **Incident** section [E07], **Caller**: search by name. Location fills in from the caller. [E03] If the caller is a VIP,
   a VIP icon appears and the field turns red: treat them accordingly. [E02]
3. **Channel**: how they reached you (*Phone*, *Email*, *Walk-in*, *Chat*, *Self-service*,
   *Virtual Agent*). [E08] [E09]
4. **Category** and **Subcategory**: what it's about. The subcategory list follows the category:

   | Category | Subcategories |
   |---|---|
   | Inquiry / Help | Antivirus, Email, Internal Application |
   | Software | Email, Operating System |
   | Hardware | CPU, Disk, Keyboard, Memory, Monitor, Mouse |
   | Network | DHCP, DNS, IP Address, VPN, Wireless |
   | Database | DB2, Oracle, MS SQL Server |
   | Password Reset | (none) |

5. In **Impact**, the **Configuration item**: the device, application or service affected. Choosing it can fill the
   support team for you (see [Assign an incident](see:assign) and
   [Choose the right configuration item](see:cmdb/choose-ci)).
6. **Impact** and **Urgency**: see [Set the priority](see:prioritise). The **Priority** fills in by itself.
7. **Short description**: one line a colleague understands without opening the incident, such as
   *"VPN disconnects every 5 minutes from home"*. **Caller** and **Short description** are
   required. [E01]
8. **Description**: the details: steps to reproduce, error messages, what has been tried.
9. Save (classic: **Submit**). The incident gets its INC number, and the caller receives an email.

## If you can fix it on the call

Assign it to yourself, write what you did in the resolution notes, and resolve it straight away
(see [Resolve an incident](see:resolve)). This is still worth logging: it shows how often things happen.

## Copy an incident for another caller {label=NEW}

{{animation:inccopy}}

Use **Copy Incident** when a second person reports the same kind of issue and you want a new
incident of their own without typing it all again. If it is the same outage affecting many
people, link them to one incident instead (see [Escalate and link related work](see:escalate)).

No walk has recorded the dialog yet; these steps are read from the mirror.

1. Open the incident in the workspace, open **More actions** and choose **Copy Incident**. [E11]
2. The **Copy Incident** dialog asks for the **Caller** of the new incident: it is required. [E13] [Q74]
3. If the incident has attachments, **Include attachments** is shown, ticked. Untick it if the
   new caller shouldn't get them. [E13] [E16]
4. Choose **Copy**. The new incident is saved straight away and opens. [E13] [E14] [Q74]
   Whether its caller gets the usual *incident opened* email isn't known yet. [Q75]

What the new incident gets, with the standard settings [E15]:

| Copied | Not copied |
|---|---|
| short description, description, category, subcategory, impact, urgency, priority, configuration item, service and service offering, location, company, assignment group, caused by, parent incident, problem and change request | number, state and resolution details, opened by and opened at, the assignee, the watch list, work notes and comments |

The platform team can change the list, and pdi2's isn't in the mirror. [Q53] Attachments are copied when **Include attachments** is
ticked. [E14] Some related lists (affected CIs, impacted services) can be copied too, if the
platform team has set them. [E17]

The new incident links back only through a work note, *"This Incident is copied from INC…"*. [E14]
It is not a child of the original. Check the description and the assignment group before you
work on it: they are the original's.

Who sees the action: anyone with the **itil** or **sn_incident_write** role, on an incident in
any state, including closed ones. [E10] It is switched on on pdi2. [E12]

## Tips

- Search for open incidents with the same configuration item before you log a new one; it may
  be part of something bigger (see [Escalate and link related work](see:escalate)).
- Write the short description for the next person, not for yourself.
