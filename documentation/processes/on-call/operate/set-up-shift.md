---
title: Set up and maintain a shift
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Shifts list (cmn_rota_list.do), all records and active=true
    how: opened the list of shifts in the classic interface
    result: No records to display
  E02:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Scheduling › Create / Edit Schedule ($oc_creation_wizard.do)
    how: opened the wizard and looked at it, without saving anything
    result: 'steps Define Schedule, Members, Escalation Setup, Review And Publish; Define Schedule starts with Select group; buttons Previous Step, Next Step, Save'
  E03:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Scheduling › Group Preferences (on_call_group_preference list)
    how: opened the list
    result: 'No records to display; columns Allow Shift Schedule overlap, Escalation rule on Shift overlap, First day of the week, Group, PTO approval preferences, Shift managers, Domain'
  E04:
    record: sys_app_module/3cc088bdeb121100eac006a2f206fe62
    how: read the Create / Edit Schedule module
    result: opens $oc_creation_wizard.do; shown only to rota_admin
    hash: 3f80ced38a78ea59877fd45920d06f23e1ffb327fe23b5e02b38051151117e9c
  E05:
    record: sys_ui_action/f1d5b258c0a8016500289032e7c172ed
    field: script
    how: read New on the shift list (cmn_rota)
    result: opens the same wizard; shown when OnCallSecurityNG.canCreateSchedule passes
    hash: 49afe0e659b7a130a49c07beaee7a594ef1802fa1c795c826ecad152bc4c159b
  E06:
    record: sys_script_include/3f8d56170a0a2c9660fe6df53700fe08
    field: script
    how: read OnCallSecurityNG (canCreateSchedule, rotaMgrAccess, _isAccessAllowed, isRotaManagerOfGroup)
    result: 'a user can create shifts with rota_admin or as the manager of any group; a group''s shifts can be managed by rota_admin, the group''s manager, someone given rota_manager for that group, or a shift manager named in the group''s preferences'
    hash: 8b556eef44d2928f5dc070e31977cbcb4bd17d4c9f33ecf2e50cf755d58a9de7
  E07:
    record: sys_app_module/0148065ec0a8170100e3fce043520d86
    how: read the My Group Schedules module
    result: the shift list filtered to the groups you belong to, with no role required
    hash: 3474d65d946e2baeea37e7e34b479cb7359da1236578b2d0cb9f9286eb15e4d0
  E08:
    record: sys_script_include/f75ee0ab73362300cbb654eb7df6a7e0
    field: script
    how: read OnCallCreationWizardUtilsSNC (getDefaults, createShiftFromTemplates, createRosterAndMembers, getEscalationPanelDetails, getPreviewRotaDetails, getFilterGroupQuery)
    result: 'the group picker offers only active groups you manage (all, for rota_admin); a shift follows a schedule template or simple times with days, an optional holiday schedule; defaults: reminders on, 2 days lead time, weekly rotation every 1, coverage weekly for 12; rosters are created with their members and rotation; Escalation Setup sets the catch-all; the review shows each shift''s members and its escalation as Rotate through members, Rotate through rosters or Custom'
    hash: a451762eaac71193ef5d69300851a0f3aa679210486656ceeeb250441a71e846
  E09:
    record: sys_script_include/1d53492757930300532c3da73d94f93a
    field: script
    how: read OnCallRotationSNC.createNewRota and _createNewRota
    result: 'a shift made in the wizard is saved as a draft, inactive, on the 2024 schedule engine; one whose schedule overlaps another of the group''s shifts is refused with "Cannot create the shift, The selected schedule overlaps with the ''{0}'' rotation schedule."'
    hash: 7c29b1bede2924e64c33e63a2c45617e72c208b5d7c25fdb5a6c4ffaa468fbfc
  E10:
    record: sys_ui_policy/cf83061b73c23300cbb654eb7df6a7fa
    field: script_true
    how: read Draft Shift - Display Message (cmn_rota)
    result: '"This Shift is in Draft State. Click on Publish to make it live."'
    hash: dd967d8c61fedcd24716295e099932b326334505838801c92cf7b5aac87aee1a
  E11:
    record: sys_ui_action/f62795b187a323005087af1e36cb0b0e
    field: script
    how: read Publish (cmn_rota form button, on a draft shift you can write)
    result: 'makes the shift active and says "This Shift is now live."'
    hash: 41ccb59653fc462813f1b298c818abd464a2af6a076d71d1058e59554772d6f0
  E12:
    record: sys_ui_action/25fa117587a323005087af1e36cb0b14
    field: script
    how: read Move to Draft (cmn_rota form button, on a live shift you can write)
    result: sets the shift back to Draft and inactive
    hash: a8dfde54c1933cfc875ee80af1efc397055a5e0b7803387165f2a9f8fee83264
  E13:
    record: sys_script/bc26f350bf3211003f07e2c1ac073944
    field: script
    how: read Validate Rota (before update, when the shift becomes active)
    result: checks each entry of the shift's schedule and refuses to activate the shift if one is not valid
    hash: e95fc6e2e05f85d28abc22bdc308a5d7f9b3542a54d91e6a794896f7f8b6db97
  E14:
    record: sys_properties/947c7a8e539320109d03ddeeff7b1256
    field: value
    how: read com.snc.on_call_rotation.allow_manage_members
    result: 'true: the roster''s member list offers Add, Remove and Move, which keep the roster balanced, instead of Edit…'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E15:
    record: sys_ui_action/643e37dd53f220109d03ddeeff7b12a4
    field: script
    how: read Add (cmn_rota_member, list banner button in the roster's members)
    result: opens the On-Call Add Member form for this roster and the shift's other rosters like it
    hash: c36cd81d4850f14118bcd84be5f21bbcf55eae25b35f395f6a8a85a479b6df34
  E16:
    record: sys_ui_action/72a308a1533620109d03ddeeff7b12d4
    field: script
    how: read Remove (cmn_rota_member list banner button)
    result: opens the On-Call Remove Member form
    hash: 1637cc5c5b7ad2d753ed99c1ef36a931b0a543f9374ab3743565ac59cdac9490
  E17:
    record: sys_ui_action/76668025533620109d03ddeeff7b128f
    field: script
    how: read Move (cmn_rota_member list banner button)
    result: opens the On-Call Move Member form
    hash: 863ab0d7e1497b522eba6d2f78164de153a8733d5df0ef12c5b67478aced1893
  E18:
    record: sys_dictionary/a5c1d68f83778310292aca75eeaad3f5
    how: read on_call_add_member.add_after
    result: 'labelled Add after member; the form also has Member, From date and Rosters (mandatory)'
    hash: 612fae5b90ac024a7fd4b0688369e4944451edc0786d43827a5dafe7f67fa82a
  E19:
    record: sys_script_include/ebcefbdd53f220109d03ddeeff7b1287
    field: script
    how: read OnCallMemberUtilsSNC (handleAddMember, handleRemoveUser, handleMoveMember)
    result: 'Add puts the member after the chosen member, or last, from the From date, in every roster chosen; Remove ends the member''s place from the date and closes the gap; Move swaps two members or moves one after another, from the date'
    hash: c313065ad06dab3425068761821d7d230bbf88310c22ab3e87bb530ac4e97b34
  E20:
    record: sys_db_object/98d15e8f83778310292aca75eeaad33f
    children: sys_choice
    how: read the On-Call Move Member choices
    result: 'Move type: Swap, Move after'
    hash: 64fb375ddb80634bff90903f3e6582fe9213f6d9a77d0ddad08d3ebf60d861a4
  E21:
    record: sys_script/22953571774202107c6a1aceca5a99e8
    field: script
    how: read Member check (on_call_swap_member, before insert)
    result: '"Member and Target member should not be same."'
    hash: b3f5a1e35388487d8723a701d602be82cfc9c8e62489f1c2600d0d2205f082ee
  E22:
    record: sys_ui_action/51f767009f321100d8f8700c267fcf18
    field: script
    how: read Resend Reminders (cmn_rota form button)
    result: on an active shift with reminders on, for rota_admin or roster_admin; sends the reminders again now
    hash: aeb57ed28490b0781fe2cb52ad32d2c0007f5016c27ec24eb684eb861c390e5a
  E23:
    record: sys_ui_action/d2a01b06c3302200b6dcdfdc64d3aef3
    field: script
    how: read Send Subscriptions (cmn_rota form button)
    result: on an active shift, for its managers; emails each member a link to subscribe to the shift in a calendar
    hash: 7e8a102c6acd0703563d3cabc080abfe32936fa1a3ae0346df2e18251ba2f821
  E24:
    record: sysevent_email_action/9c5e9386c3302200b6dcdfdc64d3aed2
    how: read On-Call Subscription
    result: 'subject "On-Call calendar subscription for your … rotation in the … group", with a Subscription Page link; active'
    hash: 842bf74e88ce73fd1fca9aab81ae4db97df43b2c6a4446de83358fc371bb77e6
  E25:
    record: sysevent_email_action/9eec63600a0a0b4c00e829e2f0691f95
    how: read On-Call Reminder
    result: 'subject "On-Call Schedule: <group>"; active'
    hash: 0f7d8ae71a4f623984bdb2d7f679414bc3561b8635a46c0a5abeda625017b93c
  E26:
    record: sys_dictionary/f9e196cf83778310292aca75eeaad3fd
    how: read cmn_rota.reminder_lead_time
    result: 'labelled Reminder lead time (days), default 2'
    hash: 2ebd9645bf013e8e2a8d17a4795bf7bf93daaace849db163c52ba5c1ac84daa2
  E27:
    record: sys_app_module/fe894c2c676b130099e0775617415acd
    how: read the Group Preferences module
    result: for rota_admin and rota_manager
    hash: d751b9ccf2d9a8b19103a551c53b262cf7d54eddcbb8f337aad944fbfd200836
  E28:
    record: sys_db_object/95d1de8f83778310292aca75eeaad311
    children: sys_choice
    how: read the On-Call Group Preference choices
    result: 'Allow Shift Schedule overlap: Default, Yes, No; Escalation rule on Shift overlap: Default, Escalate to outgoing Shift, Escalate to incoming Shift, Escalate to all Shifts; PTO approval preferences: Default, With approval, Without approval, Not allowed; First day of the week: Default or a day'
    hash: 9bd40263af9bbc3f2bbc5e837fc175954591db789eff6c0e23dc5539d62d15e7
  E29:
    record: sys_script_include/fbbe9dbc67eb130099e0775617415ae9
    field: script
    how: read OnCallGrpPreferenceUtilSNC
    result: '"Duplicate Group Preferences can not be defined"; shift managers must be active members of the group ("User(s) …: not group members")'
    hash: 1d92caa0f49d405421f9959a2ccf9f710456406a7ca01808a0537bd10c4dd54a
  E30:
    record: sys_script_include/9e1176a457811300532c3da73d94f971
    field: script
    how: read OnCallCommonSNC.isOverlapAllowed and getEscalationSettings
    result: a group preference of Default follows the instance-wide property; without preferences the property applies
    hash: 384dead57fe1b2cdf26f9dee74e5416e9db0b37d8c95b68294e4ce07e092f3fa
  E31:
    record: sys_properties/419103b80b9b1300d93f478d83673ae1
    field: value
    how: read com.snc.on_call_rotation.allow_rota_overlap
    result: "false: a group's shifts may not overlap"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E32:
    record: sys_properties/7d7f3d85736b1300d406168d4ef6a76b
    field: value
    how: read com.snc.on_call_rotation.pto.configuration
    result: 'not_allowed: members other than admin, rota_admin, rota_manager or the group manager cannot create their own time off'
    hash: 1bcf6334dfea83c3b95f169aee577809eb91c7c0d1ca54679617be0fd8d0e6a9
  E33:
    record: sys_ui_action/ca47914b77ad82107aa345cfbd5a99e4
    field: script
    how: read Migrate Now (cmn_rota form button, on a shift on the old schedule engine)
    result: '"This shift will be upgraded to new schedule engine. Do you want to continue?", then upgrades the shift'
    hash: f4aed61db0d462228686fa1dd53bb772349999bca6cf5e2f0564d51f4aeb8e38
  E34:
    record: sysauto_script/7eb56a4f73e82300cbb654eb7df6a76f
    field: script
    how: read On-Call Gaps Conflicts Report
    result: active, every 7 days; sends a report of the gaps and conflicts in the schedules
    hash: 58ac52b97d0ab9bbee50788fd5c000372fd6c969d638c96efe0a544000bb2bcc
  E35:
    record: sys_script_include/a913e4db731c2300cbb654eb7df6a7be
    field: script
    how: read OnCallGapsConflictsReportSNC.sendReports
    result: on-call administrators receive the report for every group with an active shift; a group's manager receives it for their groups
    hash: 85381cefba1b978d056f3749259a43863cbd14758d990d729fcba85b91e30e4b
  E36:
    record: sys_app_module/ac97c155875323003eebaf1e36cb0b6a
    how: read the Group Templates module
    result: 'sys_on_call_group_template, for rota_admin and rota_manager'
    hash: 7559b9c7e434a9139d385375881961a41c28ce35969671ea29e9808ba53c10eb
---
## When to use this page {label=NEW}

A group needs a **shift** before anyone in it can be on call. This page is for the people who set
one up and keep it right: the group's **shift manager** and the **on-call administrator**. Members
who only want to see their own shifts or ask for time off should read
[Your shifts, preferences and time off](see:own-schedule).

## On pdi2 today {label=NEW}

No group has a shift on pdi2: the list of shifts is empty [E01], and no group has on-call
preferences [E03]. [Q01] Everything below describes how to create the first one. Nothing is on call until
a shift is **published**.

## Who can set up a shift {label=NEW}

| You are | You can |
|---|---|
| **On-call administrator** (`rota_admin`) | create, change and delete any group's shift; open **Create / Edit Schedule** in the navigator [E04] [E06] |
| The group's **manager** | create shifts and manage your group's shifts, from **My Group Schedules › New** [E05] [E06] [E07] |
| Given `rota_manager` **for the group** | manage that group's shifts [E06] |
| Named as a **Shift manager** in the group's preferences | manage that group's shifts [E06] |

The wizard only offers the groups you manage. [E08]

## Create a shift with the wizard {label=NEW}

{{animation:ocsetup}}

Open **On-Call Scheduling › Create / Edit Schedule** (administrators) [E04], or **My Group
Schedules** and **New** (group managers) [E05] [E07]. The wizard has four steps; **Next Step** and
**Previous Step** move between them, and **Save** keeps your work. [E02] [Q24]

1. **Define Schedule.** Select the group [E02], name the shift and say when it applies: from a
   schedule template, or with a start and end time, the days it repeats and a time zone. You can add
   a holiday schedule. Reminders start switched on, two days ahead. [E08]
2. **Members.** Add one or more **rosters** (for example a primary and a backup) and their members
   in the order they take turns. Each roster rotates weekly by default; you can choose daily,
   weekly or monthly, how often, and the date the rotation starts. [E08]
3. **Escalation Setup.** Choose the **catch-all**: who is told last when nobody accepts. The
   escalation itself is explained in [Set the escalation and trigger rules](see:escalation). [E08]
4. **Review And Publish.** Check each shift's members and its escalation: *Rotate through members*
   (one roster), *Rotate through rosters* (several), or *Custom*. [E08]

The shift is saved as a **draft**, and the form says "This Shift is in Draft State. Click on
Publish to make it live." [E09] [E10] If its times overlap another of the group's shifts, the
wizard refuses it: "Cannot create the shift, The selected schedule overlaps with the '…' rotation
schedule." [E09] [E31]

## Publish, or take a shift back to draft {label=NEW}

| Button | When you see it | What happens |
|---|---|---|
| **Publish** | on a draft shift you can change | the shift goes live: "This Shift is now live." Its rosters now decide who is on call [E11] |
| **Move to Draft** | on a live shift you can change | the shift stops counting until you publish it again [E12] |

Publishing checks the shift's schedule first and refuses a shift whose times are not valid. [E13]

## Change the members of a roster {label=NEW}

Open the shift, then the roster, and use the buttons above its member list. On pdi2 these are
**Add**, **Remove** and **Move**, which keep the rotation balanced; the older **Edit…** list is not
offered. [E14]

| Button | You fill in | What happens |
|---|---|---|
| **Add** | **Member**, **From date**, **Rosters**, and optionally **Add after member** | the person joins the chosen rosters from that date, after the member you picked, or last [E15] [E18] [E19] |
| **Remove** | **Member**, **From date**, **Rosters** | the person leaves the rotation from that date, and the others close the gap [E16] [E19] |
| **Move** | **Member**, **Target member**, **Move type**, **From date** | *Swap* exchanges the two places; *Move after* puts the member after the target [E17] [E19] [E20] |

A member can't be moved onto themselves: "Member and Target member should not be same." [E21]
**Add** offers the shift's other rosters like this one, so you can add someone to the primary and
backup rosters at once. [E15]

## Reminders and calendar subscriptions {label=NEW}

| Button | Who sees it | What members receive |
|---|---|---|
| **Send Subscriptions** | the shift's managers, on a live shift | an email *On-Call calendar subscription for your … rotation in the … group* with a **Subscription Page** link, to add their shifts to their own calendar [E23] [E24] |
| **Resend Reminders** | `rota_admin` and `roster_admin`, on a live shift with reminders on | the reminder *On-Call Schedule: <group>* again, now [E22] [E25] |

Reminders go out ahead of a member's turn; **Reminder lead time (days)** sets how far ahead (two
days unless you change it). [E26]

## The group's preferences {label=NEW}

**On-Call Scheduling › Group Preferences** (administrators and `rota_manager`) holds one record per
group. [E27] [E29]

| Field | Choose |
|---|---|
| **Shift managers** | group members who may manage the group's shifts besides its manager; they must be active members [E06] [E29] |
| **Allow Shift Schedule overlap** | *Default*, *Yes* or *No* [E28] |
| **Escalation rule on Shift overlap** | when two shifts overlap: escalate to the *outgoing*, the *incoming* or *all* shifts [E28] |
| **PTO approval preferences** | whether members may ask for time off themselves, and with or without approval [E28] |
| **First day of the week** | for the group's calendar [E28] |

*Default* means the instance-wide setting. [E30] On pdi2 that is: no overlapping shifts [E31], and
members can't create their own time off [E32], so a shift manager records it for them. [Q05] To let a
group's members ask for time off, set **PTO approval preferences** for that group.

## Keep it healthy {label=NEW}

- Each week, on-call administrators and each group's manager receive a report of the **gaps and
  conflicts** in the schedules of the groups with a live shift. [E34] [E35]
- A shift made before the 2024 schedule engine shows **Migrate Now**: "This shift will be upgraded
  to new schedule engine. Do you want to continue?" New shifts already use it. [E09] [E33]
- **Group Templates** keep a set of shifts you can reuse for several groups. [E36] [Q13]

## Tips

- Build the shift as a draft, check the calendar, then publish: nothing is on call while it is a
  draft. [E09] [E11]
- Set the escalation before you publish, so that urgent work does not reach only the first person.
- When someone leaves the team, use **Remove** with the date they stop, rather than editing the
  list, so the rotation stays even. [E19]
