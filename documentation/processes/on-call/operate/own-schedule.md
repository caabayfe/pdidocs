---
title: Your shifts, preferences and time off
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Shifts list (cmn_rota), all records
    how: opened the list of shifts
    result: No records to display
  E02:
    record: sys_app_module/05486473bf1011003f07e2c1ac073995
    how: read the My Schedule Report module
    result: opens user_on_call_schedule.do; no role on the module
    hash: e64cb24aa01ab5d7ee2843eb2b715c0ec96d55a27590b4fcd2b74d332c267529
  E03:
    record: sys_ui_page/a4ce24b3bf1011003f07e2c1ac0739ae
    field: processing_script
    how: read user_on_call_schedule
    result: 'for each of your groups, collects your on-call periods in the range you chose (today, tomorrow, this or next week, month or quarter, or a date range), adds the catch-all periods where you are the named catch-all, and lists them by start time'
    hash: 794a1cfffb318888c359612c05597f7180d908c1f01554ffada11881fab4686d
  E04:
    record: sys_app_module/2f12356a5f9323006ae6a184ff46663f
    how: read the My Preferences module
    result: opens $oc_user_preferences.do; no role on the module
    hash: fabec1d7d506c5148924b3022930632ab7069c2a209f98fbbc06fee158b954c6
  E05:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: My On-Call Contact Preferences ($oc_user_preferences.do)
    how: opened On-Call Scheduling › My Preferences
    result: 'tabs Contact Attempts and Contact Overrides; Availability with Select and +; "Please create an availability."'
  E06:
    record: sys_db_object/07f1920383b78310292aca75eeaad389
    children: sys_choice
    how: read the on_call_user_preference schedule types
    result: Existing Schedule, Custom Schedule
    hash: 532f9878a9739b81266d7b4474a734345471a6d8ee54ed0680a6bb44fd74bcad
  E07:
    record: sys_on_call_contact_source/bf31406c57a363006ae6ac27cf94f91a
    how: read the contact source User's email
    result: active, read from the user record (sys_user)
    hash: 66f207dba1211883f268a43d02329ec8e9af13c96b4e76328b8dbb35cd7c7c97
  E08:
    record: sys_on_call_contact_source/c151406c57a363006ae6ac27cf94f95b
    how: read the contact source User's mobile phone
    result: active, read from the user record (sys_user)
    hash: 4a5a5b4608bdde62d20ef26129c0df03f48038d8f3372ade178f89c0a3257133
  E09:
    record: sys_on_call_contact_source/4a41006c57a363006ae6ac27cf94f95d
    how: read the contact source User's business phone
    result: active, read from the user record (sys_user)
    hash: 36fa1b49aec7ff3aa9eca064054627b26445729140f023e156b431efd989f1ca
  E10:
    record: sysevent_email_action/9eec63600a0a0b4c00e829e2f0691f95
    how: read On-Call Reminder
    result: '"On-Call Schedule: <group>", to the member the reminder is for'
    hash: 0f7d8ae71a4f623984bdb2d7f679414bc3561b8635a46c0a5abeda625017b93c
  E11:
    record: sysevent_email_action/9c5e9386c3302200b6dcdfdc64d3aed2
    how: read On-Call Subscription
    result: '"On-Call calendar subscription for your <roster> rotation in the <group> group"'
    hash: 842bf74e88ce73fd1fca9aab81ae4db97df43b2c6a4446de83358fc371bb77e6
  E12:
    record: sys_script_include/cbf1a0c2c3011200b6dcdfdc64d3ae6a
    field: script
    how: read OCCalendarUtils.getSubscriptionURL
    result: 'gives a reader of the calendar a short link with a personal API key, "<user> on-call subscription api key", for a calendar app to subscribe to'
    hash: a15ef7e7216a26fa2ee84cd1344de8fd4d60ae316e4d1b9b730c01b0c19997aa
  E13:
    record: sys_properties/7d7f3d85736b1300d406168d4ef6a76b
    field: value
    how: read com.snc.on_call_rotation.pto.configuration
    result: not_allowed
    hash: 1bcf6334dfea83c3b95f169aee577809eb91c7c0d1ca54679617be0fd8d0e6a9
  E14:
    record: sys_script_include/856ab1aa9fa022008780bde8132e7037
    field: script
    how: read OCRosterSpanApprovalUtil
    result: 'a group''s preference (Default, Not allowed, With approval, Without approval) overrides the property; Default uses the property; Not allowed hides time off from members; Without approval makes a proposed cover mandatory'
    hash: dae1a941b5c894b0aa29e301744f4e0c74c8c5f110a9e01bfa44e06a0046bdbd
  E15:
    record: sys_script_include/d3f6c461c3301200b6dcdfdc64d3ae66
    field: script
    how: read OCAddItem.timeOff
    result: 'a member may record their own time off only where time off is allowed; otherwise only someone who manages the group can, and others get "User does not have write access for this group"; without approval it is granted at once (Approval not required) and the shift managers are told'
    hash: 5871bade71827ef2f7330a8e3c66239ccf320b511adc7aaf801430c308100c8c
  E16:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Group Preferences list
    how: opened the list of group preferences
    result: No records to display
  E17:
    record: sys_hub_flow/9a2888e043f81a1097aac6ecbab8f236
    how: read On-Call Time off approval
    result: sends On-Call Time Off Submitted, asks for an approval, then updates the roster and sends Approved or Rejected
    hash: b83131c91cc3c53ad07c4c911d1b8cfe1bece2fdd57476b121d8bad3ff1fdbc0
  E18:
    record: sysevent_email_action/93bbd95d73331300d406168d4ef6a7ed
    how: read OC PTO Coverage replacement notification
    result: '"You are requested to provide coverage for <member>''s time-off", to the proposed cover'
    hash: 64af4f1a25d0af4f638cb72a0a8efaaf9968d8aba2983145ace7c3ad53a41b47
  E19:
    record: sys_db_object/4bd192cf83778310292aca75eeaad3d3
    how: read the on_call_user_contact_preference table
    result: each member's own contact preferences (which device, in which order)
    hash: 045e3fead04ba8c483ea0890771a17a489c52b24a84981dfd396b932f3a0aa3d
  E20:
    record: on_call_communication_type/8478457a5f322300fe7ca184ff466622
    how: read the on-call communication types (with sms 283a41ba5f322300fe7ca184ff46666d and voice b23a01ba5f322300fe7ca184ff4666e8)
    result: email, sms, voice
    hash: 9f767fccc9a5aa13519873e7c45f0d6e09dc490cd07ed6f185b139d5fd9ad89a
---
## On pdi2 today {label=NEW}

No group has a shift on pdi2 [E01], so nobody has on-call time yet: **My Schedule Report** comes
back empty, and no reminders are sent. You can already set your contact preferences, ready for
when your group gets a shift.

## See when you are on call {label=NEW}

1. Open **On-Call Scheduling › My Schedule Report**. [E02]
2. Choose a period: today, tomorrow, this or next week, month or quarter, or your own dates. [E03]
3. The list shows each period you are on call, in every group you belong to, by start time. If
   you are a shift's named catch-all, those periods are listed too. [E03]

For who else is on call, see [See who is on call](see:see-on-call).

## Set how you are contacted {label=NEW}

{{animation:ocmine}}

1. Open **On-Call Scheduling › My Preferences**. [E04]
2. **Contact Attempts**: the order in which the on-call flows try to reach you, and by what:
   email, SMS or a call. [E05] [E19] [E20] The numbers and address come from your user profile: your email,
   mobile phone or business phone. [E07] [E08] [E09]
3. **Contact Overrides**: a different way to reach you for a while. [E05]
4. **Availability**: when the preferences apply, from an existing schedule or one you define.
   Until you create one, the page says *Please create an availability.* [E05] [E06]

Keep the mobile number on your profile up to date: it is what an SMS or a call goes to. [E08]

## Reminders and your calendar {label=NEW}

- Before your on-call time you get *"On-Call Schedule: …"*, as the roster's reminder settings say.
  [E10]
- Your shift manager can send you a calendar subscription, *"On-Call calendar subscription for
  your … rotation in the … group"*. [E11] It is a link with a personal key that your calendar app
  can subscribe to; don't forward it. [E12]

All on-call emails are listed in [Who is told what](see:on-call/who-is-told).

## Time off and cover {label=NEW}

On pdi2 **members can't record their own time off**: time off is set to *Not allowed* [E13], and
no group overrides it, because no group has on-call preferences. [E14] [E16] If you try, you get
*User does not have write access for this group*. [E15] Ask your shift manager to record it.

Once a group allows it, you add time off on the group's on-call calendar:

| The group's setting | What happens |
|---|---|
| **With approval** | the request waits for approval; you are emailed when it is submitted, approved or rejected [E14] [E17] |
| **Without approval** | you must propose a cover; it is granted at once, and the shift managers are told [E14] [E15] |

When time off is granted, the proposed cover is asked to take your shift. [E18] The states of a
request are in [The life of a shift and an escalation](see:on-call/lifecycle).

## Tips

- Set your contact attempts as soon as you join a group with a shift, so that the flows reach you
  the way you prefer. [E05] [E19]
- Check **My Schedule Report** for next week before you plan time away. [E03]

## Not yet seen {label=OPEN-QUESTION}

1. **My Schedule Report** and the on-call calendar were not opened on the walk; the period picker
   is read from the page's script. [E03]
2. On **My Preferences**, which channels does *Contact Attempts* offer, and can a member add a
   device that is not on their profile? [E05]
3. Should members be allowed to ask for time off on pdi2, with or without approval? [E13]
