---
title: Shifts, rosters and members - configuration
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Shifts list (cmn_rota_list.do), all records and active=true
    how: opened the list of shifts
    result: No records to display
  E02:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Scheduling › Group Preferences (on_call_group_preference list)
    how: opened the list
    result: No records to display
  E03:
    record: sys_user_role/40496e710a0a2c965a8eca13b7e1dcd3
    how: read rota_admin
    result: 'Create, edit and delete Shifts. Manage all aspects of a Shift: rosters, roster members, coverage and time-off.'
    hash: 91e7ba99d649d176312fa3288f544a34479201fe533cdcbbaeb6e6277a8d549c
  E04:
    record: sys_user_role_contains/41cad22cfff3ee50ca9bffffffffff3c
    how: read the role containment
    result: sn_on_call_admin contains rota_admin
    hash: c4710783a7ee8fbf8e0fe5e1236704958d074fd4a140a1d617ecda227f2cd354
  E05:
    record: sys_user_role/4049ed920a0a2c96278c788f392121aa
    how: read rota_manager
    result: "Manage a group's Shifts. Manage associated data if delegated for a particular group"
    hash: f93cea65dff59895dc39c75fa2a213f0e7f8daa2e09b493497f3a7f75e7a455c
  E06:
    record: sys_script_include/3f8d56170a0a2c9660fe6df53700fe08
    field: script
    how: read OnCallSecurityNG (canCreateSchedule, rotaMgrAccess, _isAccessAllowed, isManagerOfAnyGroup, isRotaManagerOfGroup)
    result: 'create: rota_admin or the manager of any group (directly, by a delegated rota_manager, or as a shift manager in preferences); manage a group''s shifts: rota_admin, the group''s manager, a user holding rota_manager granted by that group, a WFO manager, or a user in the group preference''s Shift managers'
    hash: 8b556eef44d2928f5dc070e31977cbcb4bd17d4c9f33ecf2e50cf755d58a9de7
  E07:
    record: sys_security_acl/793452b20a0a0b5800f9c9ee74523f04
    field: script
    how: read the write ACL on cmn_rota
    result: OnCallSecurityNG.rotaMgrAccess(current.group); the create ACL allows a new record and then the same check
    hash: bed42b6a561a5e98b1fcc3fa978e9b28137b20b537acf88d8aef7947f7410fa1
  E08:
    record: sys_app_module/3cc088bdeb121100eac006a2f206fe62
    how: read Create / Edit Schedule
    result: $oc_creation_wizard.do, for rota_admin
    hash: 3f80ced38a78ea59877fd45920d06f23e1ffb327fe23b5e02b38051151117e9c
  E09:
    record: sys_ui_action/f1d5b258c0a8016500289032e7c172ed
    field: script
    how: read New (cmn_rota list banner button)
    result: redirects to $oc_creation_wizard.do when OnCallSecurityNG.canCreateSchedule passes
    hash: 49afe0e659b7a130a49c07beaee7a594ef1802fa1c795c826ecad152bc4c159b
  E10:
    record: sys_script_include/f75ee0ab73362300cbb654eb7df6a7e0
    field: script
    how: read OnCallCreationWizardUtilsSNC
    result: 'group filter active=true and, for non-admins, the groups managed directly, by delegation or by preference; shifts from a schedule template or simple times (cmn_other_schedule include for a holiday schedule); rosters and members created per roster; catch-all saved on the shift; group preferences (overlap) saved from the wizard; defaults: reminders on, lead time 2, weekly every 1, coverage weekly × 12'
    hash: a451762eaac71193ef5d69300851a0f3aa679210486656ceeeb250441a71e846
  E11:
    record: sys_script_include/1d53492757930300532c3da73d94f93a
    field: script
    how: read OnCallRotationSNC.createNewRota, _createNewRota and isShiftOnOldEngine
    result: 'new shifts: state draft, inactive, schedule_engine 2024_schedule_engine, the group''s domain; a draft overlapping another shift''s span is deleted with an error; a shift is on the old engine when schedule_engine is empty or old_schedule_engine, unless com.snc.on_call_rotation.force_use_schedule_engine says otherwise'
    hash: 7c29b1bede2924e64c33e63a2c45617e72c208b5d7c25fdb5a6c4ffaa468fbfc
  E12:
    record: sys_script/17f9c5bd876323005087af1e36cb0bb4
    how: read Draft Shift - Make Inactive (cmn_rota, before insert and update, state is Draft)
    result: a draft shift is always inactive
    hash: cb24f04d13f288df87019efc346abea32218b8db62891846e2fe95042c062042
  E13:
    record: sys_ui_action/f62795b187a323005087af1e36cb0b0e
    field: script
    how: read Publish
    result: condition state draft and canWrite; clears state, sets active, "This Shift is now live."
    hash: 41ccb59653fc462813f1b298c818abd464a2af6a076d71d1058e59554772d6f0
  E14:
    record: sys_ui_action/25fa117587a323005087af1e36cb0b14
    field: script
    how: read Move to Draft
    result: condition state not draft and canWrite; state draft, active false
    hash: a8dfde54c1933cfc875ee80af1efc397055a5e0b7803387165f2a9f8fee83264
  E15:
    record: sys_script/bc26f350bf3211003f07e2c1ac073944
    field: script
    how: read Validate Rota (before update, active changes to true)
    result: each cmn_schedule_span of the shift's schedule must pass RotaScheduleEntryValidation.isValid, or the update is aborted
    hash: e95fc6e2e05f85d28abc22bdc308a5d7f9b3542a54d91e6a794896f7f8b6db97
  E16:
    record: sys_script/35053c7d73b113008ef62d2b04f6a7d7
    field: script
    how: read Maximum Subscription Coverage Interval (cmn_rota, before)
    result: aborts when OCRotaICalendar.coverageLimitExceeded
    hash: d93bfd7cd6f57bde78491ebc955c3dcebd5a17c06284865d60263e32e6481538
  E17:
    record: sys_properties/c4ab78fd73b113008ef62d2b04f6a72d
    field: value
    how: read com.snc.on_call_rotation.max_subscription_interval
    result: '364: Coverage interval × Get coverage for may not exceed 364 days'
    hash: b3dfdc6efe322a6feccb0d081e88ffac20b0f28e8495efa76188c8dc3ada6181
  E18:
    record: sys_script/78c3ade90a0a0b58009f71321c3b5b93
    field: script
    how: read Rota Updated (cmn_rota, after)
    result: upgrades the shift to the new engine when it can; otherwise recalculates the rosters (old engine) or their rotation payload (new engine, when the engine changes)
    hash: 3b359adddb6e28bc88b1844f61f75c2eb24f1ea2434b68ebd6d8dc0f7554e9a1
  E19:
    record: sys_script/6895ad42c0a8646e01936f92fc2a8b42
    field: script
    how: read Update Rotation Schedules (Roster) (after)
    result: recalculates the roster's schedule (old engine) or rotation payload (new engine) when a roster changes
    hash: d115beb5e2337da9e5692561beec551adbda10f09d78d40850b37e8e8b73d725
  E20:
    record: sys_script/764f4c6e57320300b6dc79a18d94f970
    field: script
    how: read Validate Rotation Interval Count (cmn_rota_roster, before)
    result: '"Rotate every" must be above zero and within the repeat limit; a shift on the old engine cannot rotate monthly'
    hash: 6b7b94feb2dca4a6d124120d9bdb0b3552923705b32e476cf0aed2521ff9c115
  E21:
    record: sys_properties/9a951468c3320300b6dcdfdc64d3ae7b
    field: value
    how: read com.snc.on_call_rotation.max_rotation_repeat_count
    result: '182000'
    hash: e2b69143e120e697abd416987de1b8dc9657ee7b2fb1ed4cd1afa16f13c9d2fe
  E22:
    record: sys_script/a153293ffff72210ed76ffffffffff7b
    field: script
    how: read Limit reminders count of Roster Rotation
    result: '"Number of reminders should not be greater than {0}", from com.snc.on_call_rotation.max_rotation_reminder_count'
    hash: a6eca2ba0f22e18acb58ebf9402f9f3d5bd1387c2734c5e759e6fba9c097bc82
  E23:
    record: sys_properties/341569bffff72210ed76ffffffffff63
    field: value
    how: read com.snc.on_call_rotation.max_rotation_reminder_count
    result: '50'
    hash: 1a6562590ef19d1045d06c4055742d38288e9e6dcd71ccde5cee80f1d5a774eb
  E24:
    record: sys_properties/947c7a8e539320109d03ddeeff7b1256
    field: value
    how: read com.snc.on_call_rotation.allow_manage_members
    result: 'true: Add, Remove and Move replace Edit… on the roster''s member list'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E25:
    record: sys_ui_action/643e37dd53f220109d03ddeeff7b12a4
    field: script
    how: read Add, Remove and Move (cmn_rota_member list banner buttons)
    result: 'shown when allow_manage_members is true, on the roster''s related list, to those who can create on the roster; open on_call_add_member.do, on_call_remove_member.do or on_call_swap_member.do with the roster and the similar rosters of the shift (OnCallMemberUtils.getSimilarRosters)'
    hash: c36cd81d4850f14118bcd84be5f21bbcf55eae25b35f395f6a8a85a479b6df34
  E26:
    record: sys_ui_action/3beaee370a0a2c967f7f52ca1a11b801
    field: script
    how: read Edit... (cmn_rota_member)
    result: the slush-bucket edit, shown only when allow_manage_members is false
    hash: 5257890bd9d7418315ba8267d61489d7a261d6b49102b30193b4a83713bdf9ea
  E27:
    record: sys_script/3d620c61533620109d03ddeeff7b1280
    field: script
    how: read Add member, Remove member and Move member (after insert on on_call_add_member, on_call_remove_member, on_call_swap_member)
    result: 'new engine: OnCallMemberUtils handleAddMember, handleRemoveUser, handleMoveMember; old engine: the event on_call_manage_members'
    hash: 37ff20f17152987fe88ce50c2f46fb065ce54fce438d97cad10da3f28f1f7a4f
  E28:
    record: sys_script_include/ebcefbdd53f220109d03ddeeff7b1287
    field: script
    how: read OnCallMemberUtilsSNC
    result: 'add: inserts cmn_rota_member records from the date, after the chosen member or the last, in each roster, renumbering the order; remove: sets the member''s end date and the rest of the rotation; move: swap or move after, from the date'
    hash: c313065ad06dab3425068761821d7d230bbf88310c22ab3e87bb530ac4e97b34
  E29:
    record: sys_script/22953571774202107c6a1aceca5a99e8
    field: script
    how: read Member check
    result: '"Member and Target member should not be same."'
    hash: b3f5a1e35388487d8723a701d602be82cfc9c8e62489f1c2600d0d2205f082ee
  E30:
    record: sys_script/44c0e2719f0312000391b89a442e7037
    how: read Validate from and to dates (cmn_rota_member, before)
    result: active; checks a member's From and To dates
    hash: ff30bcf88d3a5d9c76a825341b7567fd720cf4a397a9432bba6a7eb4288e86cb
  E31:
    record: sys_app_module/fe894c2c676b130099e0775617415acd
    how: read Group Preferences
    result: on_call_group_preference list, for rota_admin and rota_manager
    hash: d751b9ccf2d9a8b19103a551c53b262cf7d54eddcbb8f337aad944fbfd200836
  E32:
    record: sys_security_acl/2c0e3ba067eb130099e0775617415a20
    field: script
    how: read the write ACL on on_call_group_preference
    result: OnCallSecurityNG.rotaMgrAccess(current.group)
    hash: bed42b6a561a5e98b1fcc3fa978e9b28137b20b537acf88d8aef7947f7410fa1
  E33:
    record: sys_script/2865ed6867ab130099e0775617415aad
    field: script
    how: read Avoid duplicate group preferences and Validation of Rota Managers from Group
    result: 'one preference per group ("Duplicate Group Preferences can not be defined"); every shift manager must be active and a member of the group'
    hash: a52373b9b77f4b6b8d5f02d7e5da1f2c734d9a1383b68de5d3fd2681eaa12240
  E34:
    record: sys_script_include/9e1176a457811300532c3da73d94f971
    field: script
    how: read OnCallCommonSNC.isOverlapAllowed and getEscalationSettings
    result: Yes or No on the group preference wins; Default, or no preference, falls back to the properties
    hash: 384dead57fe1b2cdf26f9dee74e5416e9db0b37d8c95b68294e4ce07e092f3fa
  E35:
    record: sys_properties/419103b80b9b1300d93f478d83673ae1
    field: value
    how: read com.snc.on_call_rotation.allow_rota_overlap
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E36:
    record: sys_properties/eb3407f80b9b1300d93f478d83673a48
    field: value
    how: read com.snc.on_call_rotation.escalation_rule_rota_overlap
    result: 'all: Escalate to all Shifts'
    hash: 5ef5ef0364b6939c4ca61f34b393f7b368d1be8619647aaf83d5b395919ab629
  E37:
    record: sys_properties/7d7f3d85736b1300d406168d4ef6a76b
    field: value
    how: read com.snc.on_call_rotation.pto.configuration
    result: not_allowed
    hash: 1bcf6334dfea83c3b95f169aee577809eb91c7c0d1ca54679617be0fd8d0e6a9
  E38:
    record: sys_ui_action/500b092d73412300cbb654eb7df6a706
    field: script
    how: read View Global Settings (on_call_group_preference form button)
    result: opens the On-Call Properties page in a new window
    hash: e92f0dce5548ea3c9b5dfbf761e9f34e5ab3b965fa4321cc42c1c1da43f39954
  E39:
    record: sys_app_module/ac97c155875323003eebaf1e36cb0b6a
    how: read Group Templates and Schedule Templates
    result: 'Group Templates (sys_on_call_group_template) for rota_admin and rota_manager; Schedule Templates (cmn_schedule) for rota_admin'
    hash: 7559b9c7e434a9139d385375881961a41c28ce35969671ea29e9808ba53c10eb
  E40:
    record: sys_security_acl/b72f1c15871323003eebaf1e36cb0b63
    field: script
    how: read the create ACL on sys_on_call_group_template
    result: OnCallSecurityNG.rotaAdminAccess; only on-call administrators create group templates
    hash: 847621b48d6030a84157daa74056323c66a15e515185b475eea5d047c70049cf
  E41:
    record: sys_ui_action/51f767009f321100d8f8700c267fcf18
    field: script
    how: read Resend Reminders
    result: 'condition active, send_reminders, and rota_admin or roster_admin; calls OnCallRemindersNG.sendReminders for this shift'
    hash: aeb57ed28490b0781fe2cb52ad32d2c0007f5016c27ec24eb684eb861c390e5a
  E42:
    record: sys_script_include/737302d60a0a2c9648e2880d323fa067
    field: script
    how: read OnCallRemindersNG.sendReminders and sendEmails
    result: 'per roster, sends when the days to the next rotation match the reminder lead time (roster''s, else the shift''s, else 2); queues rota.on_call.reminder or rota.on_call.table.reminder to each member with an HTML schedule; a resend does not update the last reminder time'
    hash: d45cf31e3757ffa13631b0c31a3cacc5f034e92a1484f47532b0285cebd767af
  E43:
    record: sysevent_email_action/9eec63600a0a0b4c00e829e2f0691f95
    how: read On-Call Reminder and On-Call Reminder Table
    result: 'subject "On-Call Schedule: ${group.name}", to event parm 1; both active'
    hash: 0f7d8ae71a4f623984bdb2d7f679414bc3561b8635a46c0a5abeda625017b93c
  E44:
    record: sys_ui_action/d2a01b06c3302200b6dcdfdc64d3aef3
    field: script
    how: read Send Subscriptions
    result: condition active and rotaMgrAccess(group); OCRotaICalendar.sendCalendarURL queues rota.on_call.subscription per member
    hash: 7e8a102c6acd0703563d3cabc080abfe32936fa1a3ae0346df2e18251ba2f821
  E45:
    record: sysevent_email_action/9c5e9386c3302200b6dcdfdc64d3aed2
    how: read On-Call Subscription
    result: active; a Subscription Page link to download or subscribe to the member's rotation calendar
    hash: 842bf74e88ce73fd1fca9aab81ae4db97df43b2c6a4446de83358fc371bb77e6
  E46:
    record: sys_ui_action/ca47914b77ad82107aa345cfbd5a99e4
    field: script
    how: read Migrate Now
    result: on a shift on the old engine, for its managers; OnCallShiftAjax.upgradeShiftToNewScheduleEngine after confirmation
    hash: f4aed61db0d462228686fa1dd53bb772349999bca6cf5e2f0564d51f4aeb8e38
  E47:
    record: sys_ui_policy/67f0a5cb7761c2107aa345cfbd5a9941
    field: script_true
    how: read Old Engine - Display Message
    result: '"The all-new schedule engine is here! Click ''Migrate Now'' to effortlessly transition …"'
    hash: c0f6e66417c7fc17827510a88ae4146a1ccca5a3e4c4d2c4921b249bbcf62eef
  E48:
    record: sysauto_script/3cd22bae77a902107aa345cfbd5a99ca
    field: script
    how: read On-Call Upgrade shifts to 2024 schedule engine
    result: on demand; upgrades every active shift still on the old engine
    hash: aed2d7db5d17c52db78a7a384bcd19b02d089f0a516bfc4863b7e1020eae7273
  E49:
    record: sysauto_script/7eb56a4f73e82300cbb654eb7df6a76f
    field: script
    how: read On-Call Gaps Conflicts Report
    result: active, every 7 days; OnCallGapsConflictsReport.sendReports
    hash: 58ac52b97d0ab9bbee50788fd5c000372fd6c969d638c96efe0a544000bb2bcc
  E50:
    record: sys_script_include/a913e4db731c2300cbb654eb7df6a7be
    field: script
    how: read OnCallGapsConflictsReportSNC.sendReports
    result: groups with an active shift; the on-call administrators get all groups, each direct group manager their own
    hash: 85381cefba1b978d056f3749259a43863cbd14758d990d729fcba85b91e30e4b
  E51:
    record: sysevent_email_action/5d7cfc2273602300cbb654eb7df6a7ce
    how: read On-Call Schedule - Gaps and Conflicts
    result: active; event rota.on_call.report
    hash: 8cc7348029d31eedfa468b1c2e962acc2aa10d028627d689373a9a6b745a110e
  E52:
    record: sysauto_script/d3dd7946772102107aa345cfbd5a9962
    field: script
    how: read On-Call Build Rosters Cache
    result: monthly; builds the roster cache for every roster
    hash: bf1b404ab9f83e76a4659c427b24138d44892927fea8441c5dd3815b99edbe56
  E53:
    record: sysauto_script/2ca0e7d2c3302200b6dcdfdc64d3aee8
    field: script
    how: read Clean Rota Response Cache
    result: daily; cleans the expired calendar cache
    hash: c54dd07f2ce333b87e022c74fd2f15e9dc9e92b97d9ae4e9c5155c56056bdb0b
  E54:
    record: sys_ui_action/ee878f24d7b12200fca223c7ce6103d3
    field: script
    how: read Export Shift and Export Shift Extra
    result: form links shown only to maint; export the shift with export_cmn_rota.do
    hash: b6f7a8443e28a82f514aecd2b9abf77d22db445fb6a02c4a0b5752ccc4c2f369
  E55:
    record: sys_ui_policy/cf83061b73c23300cbb654eb7df6a7fa
    field: script_true
    how: read Draft Shift - Display Message
    result: '"This Shift is in Draft State. Click on Publish to make it live."'
    hash: dd967d8c61fedcd24716295e099932b326334505838801c92cf7b5aac87aee1a
---
## The application {label=NEW}

Shifts, rosters and members are the core of the **On-Call Scheduling** plugin
(`com.snc.on_call_rotation`, scope `global`): the shift (`cmn_rota`), its rosters
(`cmn_rota_roster`), their members (`cmn_rota_member`), and the helper tables behind the Add, Remove
and Move forms (`on_call_add_member`, `on_call_remove_member`, `on_call_swap_member`). On pdi2 no
shift and no group preference exists. [E01] [E02]

## 1. Roles and access {label=NEW}

| Role | Gives |
|---|---|
| `rota_admin` | every group's shifts, rosters, members, coverage and time off [E03]; the wizard module [E08]; group templates [E40] |
| `sn_on_call_admin` | contains `rota_admin` [E04] |
| `rota_manager` | a group's shifts, when granted for that group [E05] [E06] |
| (none) | the group's **manager**, and the users in the group preference's **Shift managers** [E06] |

Every write on a shift goes through `OnCallSecurityNG.rotaMgrAccess(group)`, in the ACLs [E07] and
in the buttons. [E13] [E14] The wizard filters its group picker with the same rules. [E10]

## 2. Creating a shift {label=NEW}

1. **Create / Edit Schedule** (`rota_admin`) [E08], or **New** on the shift list, which redirects
   to the same `$oc_creation_wizard.do` for anyone who passes `canCreateSchedule`. [E09] [E06]
2. The wizard calls `OnCallCreationWizardUtilsSNC` [E10] and `OnCallRotationSNC.createNewRota`
   [E11]: the shift is inserted as a **draft**, inactive, on the **2024 schedule engine**, in the
   group's domain; an overlapping draft is deleted with an error. [E11]
3. Rosters and members are created per roster; the catch-all and the group's overlap preferences
   are saved from the wizard. [E10]

The page itself (`$oc_creation_wizard.do`) is a platform page the mirror doesn't hold.

## 3. The shift form {label=NEW}

| Record | When | Does |
|---|---|---|
| *Draft Shift - Display Message* (UI policy) | state Draft | "This Shift is in Draft State. Click on Publish to make it live." [E55] |
| *Draft Shift - Make Inactive* (business rule) | before, state Draft | keeps drafts inactive [E12] |
| **Publish** (button) | draft, can write | live and active [E13] |
| **Move to Draft** (button) | live, can write | draft and inactive [E14] |
| *Validate Rota* (business rule) | before update, becoming active | refuses invalid schedule entries [E15] |
| *Maximum Subscription Coverage Interval* | before | coverage × interval ≤ 364 days [E16] [E17] |
| *Rota Updated* | after | upgrades the engine or recalculates rosters [E18] |
| *Old Engine - Display Message*, **Migrate Now** | old engine only | invites and performs the upgrade [E46] [E47] |
| **Export Shift**, **Export Shift Extra** | `maint` only | export the shift [E54] |

## 4. Rosters {label=NEW}

*Update Rotation Schedules (Roster)* recalculates the rotation after each change. [E19] The checks:
**Rotate every** above zero and within `max_rotation_repeat_count` (182000) [E20] [E21]; no monthly
rotation on the old engine [E20]; **Number of reminders** at most
`max_rotation_reminder_count` (50). [E22] [E23]

## 5. Members {label=NEW}

`com.snc.on_call_rotation.allow_manage_members` is true [E24], so the roster's member list offers
**Add**, **Remove** and **Move** [E25] and hides **Edit…**. [E26] Each opens a helper form; its
after-insert business rule does the work through `OnCallMemberUtilsSNC` on the new engine, or the
`on_call_manage_members` event on the old one. [E27] [E28] *Member check* stops a move onto oneself
[E29]; *Validate from and to dates* checks a member's dates. [E30]

## 6. Group preferences {label=NEW}

`on_call_group_preference` (**Group Preferences**, `rota_admin` and `rota_manager`) [E31], written by
whoever manages the group. [E32] One record per group; shift managers must be active members.
[E33] *View Global Settings* opens the on-call properties. [E38]

| Field | pdi2 when *Default* |
|---|---|
| Allow Shift Schedule overlap | `allow_rota_overlap` false: no overlap [E34] [E35] |
| Escalation rule on Shift overlap | `escalation_rule_rota_overlap` all: escalate to all shifts [E34] [E36] |
| PTO approval preferences | `pto.configuration` not_allowed: members can't create time off [E37] |

## 7. Templates {label=NEW}

**Group Templates** (`sys_on_call_group_template`, with its shift templates) feed the wizard's
shifts; only `rota_admin` creates them. **Schedule Templates** (`cmn_schedule`) is for
`rota_admin`. [E39] [E40] [E10] None is mirrored, so whether any exist is unknown.

## 8. Reminders and subscriptions {label=NEW}

| What | Trigger | To | Record |
|---|---|---|---|
| *On-Call Reminder* / *On-Call Reminder Table* | `OnCallRemindersNG.sendReminders`, on schedule or by **Resend Reminders** (`rota_admin`, `roster_admin`) | each member, with their schedule | [E41] [E42] [E43] |
| *On-Call Subscription* | **Send Subscriptions** (the shift's managers) | each member, a calendar link | [E44] [E45] |

The scheduled job that sends reminders on schedule is a platform job the mirror doesn't list.

## 9. Jobs {label=NEW}

| Job | Runs | Does |
|---|---|---|
| *On-Call Gaps Conflicts Report* | every 7 days, active | the report *On-Call Schedule - Gaps and Conflicts* to administrators (all groups) and group managers (theirs) [E49] [E50] [E51] |
| *On-Call Upgrade shifts to 2024 schedule engine* | on demand | upgrades shifts left on the old engine [E48] |
| *On-Call Build Rosters Cache* | monthly | builds the roster cache [E52] |
| *Clean Rota Response Cache* | daily | cleans the calendar cache [E53] |

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `com.snc.on_call_rotation.allow_manage_members` | true | Add, Remove, Move on rosters [E24] |
| `com.snc.on_call_rotation.allow_rota_overlap` | false | no overlapping shifts [E35] |
| `com.snc.on_call_rotation.escalation_rule_rota_overlap` | all | on overlap, all shifts [E36] |
| `com.snc.on_call_rotation.pto.configuration` | not_allowed | no self-service time off [E37] |
| `com.snc.on_call_rotation.max_subscription_interval` | 364 | coverage limit, days [E17] |
| `com.snc.on_call_rotation.max_rotation_repeat_count` | 182000 | rotation limit [E21] |
| `com.snc.on_call_rotation.max_rotation_reminder_count` | 50 | reminders per roster [E23] |

## Open questions {label=OPEN-QUESTION}

1. Which groups need a shift, who manages each, and should shift managers be named in group
   preferences rather than given `rota_manager`?
2. Are any group or schedule templates set up? The mirror doesn't hold them. [E39]
3. Is `com.snc.on_call_rotation.force_use_schedule_engine` set? It isn't in the mirror; without it,
   new shifts use the 2024 engine. [E11]
4. Should any group allow self-service time off, or overlapping shifts? [E34]
