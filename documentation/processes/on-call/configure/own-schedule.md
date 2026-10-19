---
title: Your shifts, preferences and time off - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_app_module/05486473bf1011003f07e2c1ac073995
    how: read My Schedule Report
    result: 'user_on_call_schedule.do, order 1100, no roles'
    hash: e64cb24aa01ab5d7ee2843eb2b715c0ec96d55a27590b4fcd2b74d332c267529
  E02:
    record: sys_ui_page/a4ce24b3bf1011003f07e2c1ac0739ae
    field: processing_script
    how: read user_on_call_schedule
    result: 'deletes the user''s earlier report rows, uses OnCallRotationPersonal.onCallSpansDuringPeriod for each of the user''s groups, saves the member spans and the individual catch-all spans, then redirects to v_user_rotation_list.do for the user, by start time'
    hash: 794a1cfffb318888c359612c05597f7180d908c1f01554ffada11881fab4686d
  E03:
    record: sys_app_module/2f12356a5f9323006ae6a184ff46663f
    how: read My Preferences
    result: '$oc_user_preferences.do (on_call_user_preference), order 500, no roles'
    hash: fabec1d7d506c5148924b3022930632ab7069c2a209f98fbbc06fee158b954c6
  E04:
    record: sys_db_object/07f1920383b78310292aca75eeaad389
    children: sys_choice
    how: read on_call_user_preference
    result: 'schedule_type: schedule (Existing Schedule), simple (Custom Schedule)'
    hash: 532f9878a9739b81266d7b4474a734345471a6d8ee54ed0680a6bb44fd74bcad
  E05:
    record: sys_db_object/4bd192cf83778310292aca75eeaad3d3
    how: read on_call_user_contact_preference
    result: each member's own contact preferences
    hash: 045e3fead04ba8c483ea0890771a17a489c52b24a84981dfd396b932f3a0aa3d
  E06:
    record: sys_on_call_contact_source/bf31406c57a363006ae6ac27cf94f91a
    how: read the contact sources (also 4a41006c57a363006ae6ac27cf94f95d and c151406c57a363006ae6ac27cf94f95b)
    result: 'User''s Email, User''s business phone, User''s mobile phone; all active, on sys_user'
    hash: 66f207dba1211883f268a43d02329ec8e9af13c96b4e76328b8dbb35cd7c7c97
  E07:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: My On-Call Contact Preferences ($oc_user_preferences.do)
    how: opened My Preferences
    result: 'tabs Contact Attempts and Contact Overrides; Availability (Select, +); "Please create an availability."'
  E08:
    record: sys_script_include/737302d60a0a2c9648e2880d323fa067
    field: script
    how: read OnCallRemindersNG
    result: sends the reminders to roster members ahead of their on-call time, as each roster's reminder settings say
    hash: d45cf31e3757ffa13631b0c31a3cacc5f034e92a1484f47532b0285cebd767af
  E09:
    record: sysevent_email_action/9eec63600a0a0b4c00e829e2f0691f95
    how: read On-Call Reminder (event rota.on_call.reminder)
    result: '"On-Call Schedule: <group>"'
    hash: 0f7d8ae71a4f623984bdb2d7f679414bc3561b8635a46c0a5abeda625017b93c
  E10:
    record: sysevent_email_action/fac52bfcd7112200f2d224837e6103eb
    how: read On-Call Reminder Table (event rota.on_call.table.reminder)
    result: the same reminder as a table of shifts
    hash: d548c357fbb9f660689b1615193fb7a8368089e9d7a81e41f5a16f74084ea94c
  E11:
    record: sys_properties/6296e2b09f2310008f88ed93ee4bccd1
    field: value
    how: read com.snc.on_call_rotation.reminders.showtz
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E12:
    record: sys_properties/341569bffff72210ed76ffffffffff63
    field: value
    how: read com.snc.on_call_rotation.max_rotation_reminder_count
    result: '50'
    hash: 1a6562590ef19d1045d06c4055742d38288e9e6dcd71ccde5cee80f1d5a774eb
  E13:
    record: sys_script_include/cbf1a0c2c3011200b6dcdfdc64d3ae6a
    field: script
    how: read OCCalendarUtils.getSubscriptionURL
    result: 'for a calendar reader: generates an API key named "<user id> on-call subscription api key" and returns a 10-character tiny URL carrying it as ni.nolog.token'
    hash: a15ef7e7216a26fa2ee84cd1344de8fd4d60ae316e4d1b9b730c01b0c19997aa
  E14:
    record: sys_properties/c4ab78fd73b113008ef62d2b04f6a72d
    field: value
    how: read com.snc.on_call_rotation.max_subscription_interval
    result: '364'
    hash: b3dfdc6efe322a6feccb0d081e88ffac20b0f28e8495efa76188c8dc3ada6181
  E15:
    record: sys_properties/7d7f3d85736b1300d406168d4ef6a76b
    field: value
    how: read com.snc.on_call_rotation.pto.configuration
    result: not_allowed
    hash: 1bcf6334dfea83c3b95f169aee577809eb91c7c0d1ca54679617be0fd8d0e6a9
  E16:
    record: sys_db_object/95d1de8f83778310292aca75eeaad311
    children: sys_choice
    how: read on_call_group_preference
    result: 'pto_approval_config: Default, Not allowed, With approval, Without approval'
    hash: 9bd40263af9bbc3f2bbc5e837fc175954591db789eff6c0e23dc5539d62d15e7
  E17:
    record: sys_script_include/856ab1aa9fa022008780bde8132e7037
    field: script
    how: read OCRosterSpanApprovalUtil
    result: 'isPTOApprovalRequired: the group''s pto_approval_config, or the property when Default; not_allowed makes time off inaccessible; without_approval makes the proposed cover mandatory'
    hash: dae1a941b5c894b0aa29e301744f4e0c74c8c5f110a9e01bfa44e06a0046bdbd
  E18:
    record: sys_script_include/d3f6c461c3301200b6dcdfdc64d3ae66
    field: script
    how: read OCAddItem.timeOff and createOverride
    result: 'refuses unless the user has shift-manager access to the group, or time off is accessible and the user is the member; without approval the proposal is state 9 (Approval not required) with auto swap of coverage, and event oc.time_off.without_approval.created goes to the approvers'
    hash: 5871bade71827ef2f7330a8e3c66239ccf320b511adc7aaf801430c308100c8c
  E19:
    record: sys_hub_flow/9a2888e043f81a1097aac6ecbab8f236
    how: read On-Call Time off approval
    result: sends Submitted, asks for approval, then updates the roster and sends Approved or Rejected
    hash: b83131c91cc3c53ad07c4c911d1b8cfe1bece2fdd57476b121d8bad3ff1fdbc0
  E20:
    record: sys_hub_flow/5090939a43b89a1097aac6ecbab8f220
    how: read On-Call Time off approval - Update roster state
    result: the subflow that applies the decision to the roster
    hash: 57091002e2d8cf7b7da827fb9a2231c3bde3ae39bf030dbc21f4f4fdb59643c8
  E21:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Group Preferences list
    how: opened the list
    result: No records to display
  E22:
    record: sys_properties/8e6ba3a5b7b0230059e0b956ee11a954
    how: read com.snc.on_call_rotation.calendar_span.max_time_off_days
    result: the longest time off in days; the value is redacted in the mirror
    hash: 6116ab5388cf0921deebec58a2042d51805f89f46ab43bb9e02b132a6c955c2c
---
## The applications {label=NEW}

Everything here is in On-Call Scheduling (global). Members need no extra role: the modules have
none [E01] [E03], and the calendar pages need a calendar-read role such as `itil` (see
[See who is on call - configuration](see:see-on-call)).

## 1. My Schedule Report {label=NEW}

The module opens a UI page whose processing script builds the report and redirects to the list
`v_user_rotation`, filtered on the user. [E01] [E02]

1. It deletes the user's earlier report rows.
2. For each of the user's groups, it collects the on-call spans in the chosen period with
   `OnCallRotationPersonal`.
3. It keeps the user's spans, and adds the catch-all spans of active shifts where the user is the
   individual catch-all. [E02]

## 2. Contact preferences {label=NEW}

| Record | Holds |
|---|---|
| `on_call_user_preference` | a member's preference set, with its availability: an existing schedule or a custom one [E04] |
| `on_call_user_contact_preference` | the contact attempts: which device, in which order [E05] |
| `sys_on_call_contact_source` | where devices come from: the user's email, business phone and mobile phone [E06] |

The members' page is `$oc_user_preferences.do`, with the tabs **Contact Attempts** and **Contact
Overrides** and an **Availability** picker. [E03] [E07] The page itself is not in the mirror.

## 3. Reminders and subscriptions {label=NEW}

1. `OnCallRemindersNG` sends the reminders ahead of each member's on-call time, as the roster's
   reminder settings say. [E08]
2. It uses *On-Call Reminder* or *On-Call Reminder Table*. [E09] [E10] Time zones are not shown in
   reminders, and a roster can have at most 50 reminders. [E11] [E12]
3. A calendar subscription is a 10-character tiny URL with a personal API key, created when a
   calendar reader asks for it. [E13] Subscriptions cover at most 364 days. [E14]

## 4. Time off and cover {label=NEW}

1. `OCAddItem.timeOff` records time off on the calendar. It refuses unless the user manages the
   group, or time off is accessible and the user is the member. [E18]
2. Whether time off is accessible comes from the group's `pto_approval_config`, or from the
   property `com.snc.on_call_rotation.pto.configuration` when the group says *Default*. [E16]
   [E17]

   | Setting | Effect |
   |---|---|
   | Not allowed | members can't add their own time off [E17] |
   | With approval | the flow *On-Call Time off approval* runs [E19] [E20] |
   | Without approval | a proposed cover is mandatory; the proposal is *Approval not required*, coverage swaps automatically, and the approvers get *Time off created for …* [E17] [E18] |

3. **On pdi2:** the property is `not_allowed` [E15] and there are no group preferences [E21], so
   only shift managers and administrators record time off.

`createOverride` (cover for someone else's slot) has the same check. [E18]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `com.snc.on_call_rotation.pto.configuration` | not_allowed | members can't add time off [E15] |
| `com.snc.on_call_rotation.calendar_span.max_time_off_days` | redacted | longest time off [E22] |
| `com.snc.on_call_rotation.reminders.showtz` | false | no time zone in reminders [E11] |
| `com.snc.on_call_rotation.max_rotation_reminder_count` | 50 | reminders per roster [E12] |
| `com.snc.on_call_rotation.max_subscription_interval` | 364 | days a subscription covers [E14] |

## Open questions {label=OPEN-QUESTION}

1. Should members request their own time off? If so, set the property or each group's preference
   to *With approval*, and decide who approves. [E15] [E17]
2. The subscription link carries a personal API key: is that acceptable on pdi2, and how are keys
   revoked when someone leaves a group? [E13]
3. `$oc_user_preferences.do` isn't in the mirror; which record defines it? [E07]
