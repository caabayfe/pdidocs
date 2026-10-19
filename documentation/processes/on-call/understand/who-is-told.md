---
title: Who is told what
reviewed: 2026-10-19
evidence:
  E01:
    record: sysevent_email_action/9eec63600a0a0b4c00e829e2f0691f95
    how: read On-Call Reminder (cmn_rota, event rota.on_call.reminder)
    result: '"On-Call Schedule: <group>", to the member the reminder is for'
    hash: 0f7d8ae71a4f623984bdb2d7f679414bc3561b8635a46c0a5abeda625017b93c
  E02:
    record: sysevent_email_action/fac52bfcd7112200f2d224837e6103eb
    how: read On-Call Reminder Table (cmn_rota, event rota.on_call.table.reminder)
    result: '"On-Call Schedule: <group>", the same reminder as a table of shifts'
    hash: d548c357fbb9f660689b1615193fb7a8368089e9d7a81e41f5a16f74084ea94c
  E03:
    record: sys_script_include/737302d60a0a2c9648e2880d323fa067
    field: script
    how: read OnCallRemindersNG
    result: sends the reminders to roster members ahead of their on-call time, as each roster's reminder settings say
    hash: d45cf31e3757ffa13631b0c31a3cacc5f034e92a1484f47532b0285cebd767af
  E04:
    record: sysevent_email_action/9c5e9386c3302200b6dcdfdc64d3aed2
    how: read On-Call Subscription (cmn_rota, event rota.on_call.subscription)
    result: '"On-Call calendar subscription for your <roster> rotation in the <group> group"'
    hash: 842bf74e88ce73fd1fca9aab81ae4db97df43b2c6a4446de83358fc371bb77e6
  E05:
    record: sysevent_email_action/5d7cfc2273602300cbb654eb7df6a7ce
    how: read On-Call Schedule - Gaps and Conflicts (event rota.on_call.report)
    result: '"On-Call Schedule - Gaps and Conflicts"'
    hash: 8cc7348029d31eedfa468b1c2e962acc2aa10d028627d689373a9a6b745a110e
  E06:
    record: sysauto_script/7eb56a4f73e82300cbb654eb7df6a76f
    field: script
    how: read On-Call Gaps Conflicts Report (scheduled, every 7 days)
    result: sends the gaps and conflicts in on-call schedules to each group's administrators
    hash: 58ac52b97d0ab9bbee50788fd5c000372fd6c969d638c96efe0a544000bb2bcc
  E07:
    record: sysevent_email_action/08ac06964381521097aac6ecbab8f29c
    how: read On-Call Time Off Submitted (roster_schedule_span_proposal, sent by a flow)
    result: '"PTO Request <number> … has been submitted", to whoever opened it'
    hash: e4717ad03d8a15520a8dfb15a66cdebb86b7369020b84358213aad195eba2bbc
  E08:
    record: sysevent_email_action/c26b488673331300d406168d4ef6a7f3
    how: read OC send time off approval notification (sysapproval_approver, on insert, requested, for a time off request)
    result: '"Time off approval request for <member>", to the approver'
    hash: 9cce721b633d307cdb56e96cd3c380f1439aa410f01f4033526c0cd65c6816a4
  E09:
    record: sysevent_email_action/ce90dada4381521097aac6ecbab8f20c
    how: read On-Call Time Off Approved
    result: '"PTO Request <number> … has been approved", to whoever opened it'
    hash: 0a2e76644692079725e5eab5af6d9470c00f533eb5822392f4ff6e4bb4fd5ab0
  E10:
    record: sysevent_email_action/57e4d65243c1521097aac6ecbab8f272
    how: read On-Call Time Off Rejected
    result: '"PTO Request <number> … has been rejected", to whoever opened it'
    hash: 132c47e3f0beae19122c75397192c17435fbcd7a62ed38ecfa7e10a99e4b4b91
  E11:
    record: sysevent_email_action/93bbd95d73331300d406168d4ef6a7ed
    how: read OC PTO Coverage replacement notification (time off approved or approval not required)
    result: '"You are requested to provide coverage for <member>''s time-off", to the proposed cover'
    hash: 64af4f1a25d0af4f638cb72a0a8efaaf9968d8aba2983145ace7c3ad53a41b47
  E12:
    record: sysevent_email_action/ce7f0dd973331300d406168d4ef6a788
    how: read OC send time off created notification (event oc.time_off.without_approval.created)
    result: '"Time off created for <member>", to the group''s shift managers (OCAddItem queues the event with them)'
    hash: 7d926090d33d73caccf7c7b571e5456b2b250f41699dd1b8f392ee6d204368ae
  E13:
    record: sys_hub_flow/9a2888e043f81a1097aac6ecbab8f236
    how: read On-Call Time off approval (on a new time off request)
    result: sends Submitted, asks for approval, then sends Approved or Rejected
    hash: b83131c91cc3c53ad07c4c911d1b8cfe1bece2fdd57476b121d8bad3ff1fdbc0
  E14:
    record: sys_hub_flow/cceeda2c53f3121002d1ddeeff7b1282
    how: read On-Call Send Notifications
    result: 'sends one escalation contact to one person; the Email, SMS and Voice subflows (On-Call: Send Notification - Email, - SMS, - Voice) do the sending'
    hash: c32f3bd97e31e4c80989f8034e1897e4f4029b7187503bce89ed0be5b17571f4
  E17:
    record: sys_db_object/4bd192cf83778310292aca75eeaad3d3
    how: read the on_call_user_contact_preference table
    result: each member's own contact preferences (which device, in which order)
    hash: 045e3fead04ba8c483ea0890771a17a489c52b24a84981dfd396b932f3a0aa3d
  E15:
    record: sys_db_object/50c1568f83778310292aca75eeaad3e3
    children: sys_choice
    how: read the escalation step choices (cmn_rota_esc_step_def)
    result: 'forced channel Email, SMS or Voice; contact the current member or all members'
    hash: b56b1ce7ac8806530bb181c9c927ccbded9175361bb923c1690f668b174d29ec
  E16:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Shifts list (cmn_rota), all records
    how: opened the list of shifts
    result: No records to display
  E18:
    record: sys_properties/110b43c9c70b00100c54885827c2605f
    field: value
    how: read com.snc.on_call_rotation.log_escalations
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E19:
    record: sys_script_include/e3e4ae19c70200102e65e122c7c26057
    field: script
    how: read OnCallEscalationUtilSNC.isEscalationLogEnabled
    result: 'when the property isn''t true, the escalation, its levels, attempts, communications and answers are not written'
    hash: 0da3e3ffbf7b530e99fb5302805102d0d0e3153badd4a515b5700f2152d51ac2
---
## Nothing reaches anyone yet {for=operator}

No group has a shift on pdi2, so none of these emails is sent today. [E16] They are what members,
managers and approvers get once shifts exist. All are active, as delivered on this instance.

## Your shifts {for=operator}

| When | Who | Email |
|---|---|---|
| Before your on-call time, as the roster sets reminders | the member | *"On-Call Schedule: …"*, as a message or a table [E01] [E02] [E03] |
| A manager sends the calendar subscription | the roster's members | *"On-Call calendar subscription for your … rotation in the … group"* [E04] |
| Every 7 days | each group's administrators | *"On-Call Schedule - Gaps and Conflicts"* [E05] [E06] |

## Time off {for=operator}

| When | Who | Email |
|---|---|---|
| A time off request is made | whoever opened it | *"PTO Request … has been submitted"* [E07] [E13] |
| It needs approving | the approver | *"Time off approval request for …"* [E08] |
| It is approved | whoever opened it | *"PTO Request … has been approved"* [E09] |
| It is rejected | whoever opened it | *"PTO Request … has been rejected"* [E10] |
| It is approved, or needs no approval | the proposed cover | *"You are requested to provide coverage for …'s time-off"* [E11] |
| It is created without approval | the group's shift managers | *"Time off created for …"* [E12] |

## When urgent work reaches a group {for=operator}

These aren't notification records: the on-call flows contact people themselves, by each person's
contact preferences (email, SMS or voice), or by the channel an escalation step forces. [E14]
[E15] [E17] On pdi2 the escalation log is switched off, so contacts and answers are not
recorded. [E18] [E19] See
[When on-call work reaches you](see:respond).

### OPEN-QUESTION: SMS and voice {for=operator}

SMS and voice need a telephony provider. Whether one is set up on pdi2 is not visible in the
mirror; until it is, only email reaches people.
