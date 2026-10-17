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

1. Press **New** in the workspace's incident list (classic: **Incident › Create New**).
2. In the **Incident** section [E07], **Caller**: search by name. Location fills in from the caller. [E03] If the caller is a VIP,
   a VIP icon appears and the field turns red: treat them accordingly. [E02]
3. **Contact type**: how they reached you (*Phone*, *Email*, *Walk-in*, *Chat*, *Self-service*,
   *Virtual Agent*). [E08]
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
   support team for you (see *Assign an incident*).
6. **Impact** and **Urgency**: see *Set the priority*. The **Priority** fills in by itself.
7. **Short description**: one line a colleague understands without opening the incident, such as
   *"VPN disconnects every 5 minutes from home"*. **Caller** and **Short description** are
   required. [E01]
8. **Description**: the details: steps to reproduce, error messages, what has been tried.
9. Save (classic: **Submit**). The incident gets its INC number, and the caller receives an email.

## If you can fix it on the call

Assign it to yourself, write what you did in the resolution notes, and resolve it straight away
(see *Resolve an incident*). This is still worth logging: it shows how often things happen.

## Tips

- Search for open incidents with the same configuration item before you log a new one; it may
  be part of something bigger (see *Escalate and link related work*).
- Write the short description for the next person, not for yourself.
