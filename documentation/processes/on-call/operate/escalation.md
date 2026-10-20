---
title: Set the escalation and trigger rules
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
      where: On-Call Scheduling › Trigger Rules (trigger_rule list)
    how: opened the list
    result: 'No records to display; columns Name, Table, Group, Trigger when group assigned changes, Active, Execution Order'
  E03:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Scheduling › Escalation Log (on_call_escalation list)
    how: opened the list
    result: No records to display
  E04:
    record: sys_script_include/1d53492757930300532c3da73d94f93a
    field: script
    how: read OnCallRotationSNC._addDutyEscalations and _addRotationEscalations
    result: 'with several rosters, the escalation goes to the on-call person of each roster in turn (rotate through rosters); with one roster, it goes from member to member of that roster (rotate through members); each person gets the roster''s number of reminders, spaced by its time between reminders'
    hash: 7c29b1bede2924e64c33e63a2c45617e72c208b5d7c25fdb5a6c4ffaa468fbfc
  E05:
    record: sys_dictionary/d0f1dacf83778310292aca75eeaad3ed
    how: read cmn_rota_roster.attempts
    result: 'labelled Number of reminders, mandatory, default 1'
    hash: 35b4d592c8b02757120014daa276fb4233f084afb3f97a41eda053b7540cdce2
  E06:
    record: sys_dictionary/14f1dacf83778310292aca75eeaad3fd
    how: read cmn_rota_roster.time_between_reminders
    result: 'labelled Time between reminders, mandatory, default 15 minutes'
    hash: ab9739dcfdffa94fd4613395c584d59e26a2a19f21b8f81907bd58df9857f01e
  E07:
    record: sys_dictionary/9cf11ecf83778310292aca75eeaad300
    how: read cmn_rota_roster.time_before_escalation
    result: labelled Time before escalation
    hash: be4c676734f3c98aed36ffe6cdaa5930585b23045319d14163f458c8270b48ee
  E08:
    record: sys_dictionary/90f11ecf83778310292aca75eeaad308
    how: read cmn_rota_roster.forced_communication_channel
    result: 'labelled Forced communication channel; choices Email, SMS, Voice'
    hash: 0aea82f75b68134a4bd61f38c3743d67302c1c578bde732ac1cf6b3984779ac4
  E09:
    record: sys_ui_policy/5c10bd62eb221100eac006a2f206fe3a
    field: script_true
    how: read Force device to SMS warning (cmn_rota_roster)
    result: '"If the on-call member does not have an SMS device they will NOT be contacted"; Force device to Email warning says the same for email'
    hash: b8ffb68982dae17b76f32036c29582bb98fbabf4b326a66264644d51a89009d8
  E10:
    record: sys_db_object/a1e196cf83778310292aca75eeaad366
    children: sys_choice
    how: read the cmn_rota catch-all choices
    result: Notify Individual, Notify All, Notify Group Manager
    hash: 8ea60df6debbc85832664a9b4321e14a35cd1ee21c766aae7fdf5bc45fae52ce
  E11:
    record: sys_ui_policy_action/73ca99b2eb021100fcfb858ad106fed0
    how: read the action of Catch-All is Individual (cmn_rota), and the Notify All and Group Manager policies
    result: 'Notify Individual shows Catch-all member, mandatory; Notify All shows Catch-all roster, mandatory; Notify Group Manager shows the group''s manager; only while the shift has no custom escalation'
    hash: 923f42eccdc4ae3f51b2a673b9aea182f5299fefca5085875c70b16ca724280b
  E12:
    record: sys_script_include/e3e4ae19c70200102e65e122c7c26057
    field: script
    how: read OnCallEscalationUtilSNC.getCatchAllWaitTime
    result: the shift's Catch-all wait time, or else the property com.snc.on_call_rotation.catch_all_wait_time
    hash: 0da3e3ffbf7b530e99fb5302805102d0d0e3153badd4a515b5700f2152d51ac2
  E13:
    record: sys_properties/a0f693a877801010cfb82191a9106104
    how: read com.snc.on_call_rotation.catch_all_wait_time
    result: 'no value, so the wait is 0 seconds unless the shift sets its own Catch-all wait time'
    hash: 13140030c5522b7ce8ee249850b46d7c94a5714a49d9f40ff62150aa3894118c
  E14:
    record: sys_ui_action/95c0e77473253300cbb654eb7df6a724
    field: script
    how: read Edit Escalation and Contact Preferences (cmn_rota form link)
    result: 'shown, to those who can change the shift, when Notify, Slack, Teams or mobile push is active; opens the escalation page of the shift ($oc_shift_escalation.do), or the escalation designer ($oc_escalation_designer.do) for a custom escalation'
    hash: 85aad0d13573e17894730b9d7c842b2b083f77ef65b931950d124cb810d45e16
  E15:
    record: sys_script_include/9e1176a457811300532c3da73d94f971
    field: script
    how: read OnCallCommonSNC.isNotifyPluginInstalled
    result: checks com.snc.notify, which the mirror's plugin list shows active; so pdi2 shows Edit Escalation and Contact Preferences, not Edit Escalation Policy
    hash: 384dead57fe1b2cdf26f9dee74e5416e9db0b37d8c95b68294e4ce07e092f3fa
  E16:
    record: sys_ui_action/b40c9ea25f70230084a5a184ff46669a
    field: script
    how: read Override Escalation Policy (cmn_rota form button, while the shift uses the default escalation)
    result: asks for confirmation, then opens the escalation designer
    hash: a7bf7d2ce46524c75041e526033067b3769faf26d89618db29731b741459bd4c
  E17:
    record: sys_ui_page/ac6abe2a5f70230084a5a184ff466601
    field: html
    how: read oc_override_escalation_policy
    result: '"Are you sure you want to override default escalation policy with custom escalation ?", Yes'
    hash: 7f05cef4b4f4cf6d2d7a1340c6350c076e5f742a7e0d58a3d7a771db3b68b157
  E18:
    record: sys_ui_action/1b3383225fb0230084a5a184ff46662e
    field: script
    how: read Reset Escalation Policy (cmn_rota form button, on a custom escalation)
    result: asks for confirmation and goes back to the default escalation
    hash: 19b7d9a9a0bb848ed92d3c7a707e8069db9f75b423bcca7254bc435b56fec18e
  E19:
    record: sys_ui_page/04b34b225fb0230084a5a184ff4666af
    field: html
    how: read oc_reset_escalation_policy
    result: '"Are you sure you want to reset custom escalation policy with default escalation ?", Yes'
    hash: b327a24e68c814ebf0b929d18003d5994b901288cef9050790917b7844572b9b
  E20:
    record: sys_dictionary/fcc1968f83778310292aca75eeaad3a6
    how: read cmn_rota_escalation_set.table, with condition and default
    result: 'an escalation set has a Table and a Condition, an Order, and can be the Default'
    hash: 9d948a5266ce8e13aef7eefd87d58080c50220eabd579fb66b7d6ac76445ce57
  E21:
    record: sys_script/4769aff55f18230084a5a184ff4666f9
    field: script
    how: read Validation for atleast one default set
    result: '"Selected Shift … should have atleast one default escalation set"'
    hash: 4f56d27fd3fbdcaf279cce6787a60f24bb11fc8f706a23fc0a96ebad40f9f6bc
  E22:
    record: sys_script/5677319091930310f8777d7f6b427617
    field: script
    how: read Block JS condition on Escalation set
    result: '"JavaScript conditions are not supported for security reasons. Please use standard conditions"'
    hash: 05b7d1400f1d875af3251f374a57ce7fb09990df73587fd946d8147ed7ec2300
  E23:
    record: sys_dictionary/ecc1968f83778310292aca75eeaad32c
    how: read cmn_rota_esc_step_def.time_to_next_step
    result: 'labelled Time to next step, default 15 minutes; a step also has Escalation level, Rosters, Users, Groups, Group manager, Devices, Forced communication channel and Number of reminders'
    hash: fc40c4619435503343c84bad170957ec4486be0e9e20b2070d67a0fdedb0ccab
  E24:
    record: sys_script/03ace3795f18230084a5a184ff4666aa
    field: script
    how: read Block steps with same escalation level
    result: '"Step with escalation level - … already exists for escalation set …"'
    hash: 64c1aaa949a88a1fb729971c31e792c2f99c34359cc07b79ca1fb15bd3928791
  E25:
    record: sys_script/3237aa3a5fd8230084a5a184ff466602
    field: script
    how: read Make time between reminders mandatory
    result: '"Time between reminders is mandatory when number of reminders is set"'
    hash: db8bc427cc96f0210207150b30b01710e30edd3979f0e9fdc61a8ad021dd2aee
  E26:
    record: sys_script/c84694ce5f58230084a5a184ff46664c
    field: script
    how: read Check for cyclic escalation
    result: a step can't escalate to the shift's own group, nor through groups that lead back to it; long chains of groups are flagged for review
    hash: 49605e11484077b1704bead361b71b1bf00117177b328a7df90fa61fc5e28789
  E27:
    record: sys_script/1104856b53622010ff67ddeeff7b1272
    field: script
    how: read Block multiple escalations for a group (on_call_group_escalation)
    result: '"This group already has an escalation policy defined"'
    hash: cb866f0ed4d05fd69b0dc8817395f7bf687eec934410101ac26efb9efc8aa64c
  E28:
    record: sys_dictionary/2bd1d2cf83778310292aca75eeaad378
    how: read on_call_group_escalation.apply_to_all_rotas
    result: 'labelled Apply to all Shifts; otherwise the policy names its Shifts'
    hash: a6d8671bb2b706ff5c044142802567008066702df63d0bd6994c268487bd12b5
  E29:
    record: sys_dictionary/0ee1d6cf83778310292aca75eeaad32a
    how: read cmn_rota.override_user_contact_preference
    result: labelled Override user preference, default false; shown while the shift uses the default escalation
    hash: 2589a75af56967302acb51d56752f0f63dada931506a1e7c3269a411a8c3fe0c
  E30:
    record: on_call_communication_channel_config/ab59e6e0438a121033871e0e85b8f22a
    how: read the default Email channel configuration
    result: 'title "{number} On-Call Assignment"; reply with ACC to accept or REJ to reject'
    hash: f9ca6b2f4004272884ce4d3dbfc019b6bf20815b34a019197a6148c10dbff47d
  E31:
    record: on_call_communication_channel_config/1a726d2e438ad21033871e0e85b8f298
    how: read the default SMS channel configuration
    result: 'reply with the message number and ACC to accept, or REJ to reject'
    hash: 4aa36756e6fe1d2b684d880fa1a03653a655f70cd8d8d8de5acdaaff00ad1fe7
  E32:
    record: on_call_communication_channel_config/c0f9ac1e4342d21033871e0e85b8f24b
    how: read the default Voice channel configuration
    result: press 1 to accept, 2 to reject
    hash: ccbccdf7c4ecdd8de477824ef2bd160c37620bf534e64040917c7943ad2dde31
  E33:
    record: sys_app_module/cedc0480eb301100fcfb858ad106fe51
    how: read the Trigger Rules module
    result: for rota_admin and rota_manager
    hash: 0e3c0d10dc57290951bfa4504035ec2a827e4452fe9ab12c695de061f6d521e5
  E34:
    record: sys_security_acl/4dc83fe8c3622010f208ce72a740dd6e
    field: script
    how: read the create ACL on trigger_rule
    result: anyone who manages a group may create a trigger rule; rota_admin always may
    hash: d7e68f40633eaa7bd55a07888488a2d6d72d87bf6fcb2146714fcd49590b571a
  E35:
    record: sys_db_object/5ef1520383b78310292aca75eeaad30d
    children: sys_choice
    how: read the trigger_rule choices
    result: 'Run trigger: Run once, Every time trigger field changes; Trigger when: Condition matches, Default; Trigger action: Subflow, Script'
    hash: 3d81821ee04ff6dbe0c3f359cf0dd5fc15c0678cc4325a19c36d54d404ed79b2
  E36:
    record: sys_script_include/3f8d56170a0a2c9660fe6df53700fe08
    field: script
    how: read OnCallSecurityNG.getTriggerActionChoices
    result: Subflow is offered to everyone; Script only to rota_admin
    hash: 8b556eef44d2928f5dc070e31977cbcb4bd17d4c9f33ecf2e50cf755d58a9de7
  E37:
    record: sys_dictionary/16f1520383b78310292aca75eeaad34f
    how: read trigger_rule.trigger_subflow
    result: offers the subflows in the category On-Call Escalation Triggers
    hash: b53f07a922e4dc4a5c84f95ced7940afe4acc973786549922717d3b19b94e32f
  E38:
    record: sys_hub_category/ee82a5e04333021033871e0e85b8f2bb
    how: listed the subflows in On-Call Escalation Triggers
    result: 'On-Call: Assign; On-Call: Assign and Notify; On-Call: Assign By Acknowledgement; On-Call: Escalations by Email; Resume Conference Call Escalation; all published'
    hash: 26cb4f3a0d0153812199d90873fb6613817220036858c927c707fbe966940a1a
  E39:
    record: sys_script_include/57891886732220102eb52d2b04f6a729
    field: script
    how: read TriggerRuleSNC.process and _startTriggerSubflow
    result: 'acts only when the record has a group and its assignee is not a member of it; cancels on-call subflows already running on the record, then starts the rule''s subflow with the record, its group field, user field and journal field (work notes by default)'
    hash: d3982599543732dc6a0f87383b5db40003beedb0502c3e3b223c31155a77e45e
  E40:
    record: sys_script/b632f772ffd922107aa3ffffffffff0f
    field: script
    how: read Restrict non rota admin (trigger_rule, before insert and update, without rota_admin)
    result: 'a rule triggered by changes to the assignment group is refused: "Security constraints prevent this operation"'
    hash: 777b30ffa32d552bf84df5635dbc0c2ef3f772147805513d2cde11052528e93d
  E41:
    record: sys_script/354760fb2b7e6210edd5f6c0ce91bfda
    field: script
    how: read Clear group field for Global Rules
    result: a rule triggered by changes to the group field applies to every group, so its Group is cleared
    hash: e189f0ad3bf9723f5a06406557fc93b05d919529e2b56d9d2008615991b90ca2
  E42:
    record: sys_script_include/57891886732220102eb52d2b04f6a729
    field: script
    how: read TriggerRuleSNC.abortActionIfDefaultTriggerRuleExists
    result: '"Only one default trigger rule per table can be defined. Trigger rule: … is the default rule for the … table"'
    hash: d3982599543732dc6a0f87383b5db40003beedb0502c3e3b223c31155a77e45e
  E43:
    record: sys_properties/5bcd60b29380221067c612f984891815
    field: value
    how: read glide.oncall.only_flow_enabled_release
    result: true; only subflow-based on-call invocations are supported
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E44:
    record: sys_properties/f8d4808b53c21210adc6ddeeff7b1279
    field: value
    how: read com.snc.on_call_rotation.new_trigger_engine
    result: true; the new trigger engine runs rules whose action is Subflow
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## When to use this page {label=NEW}

A shift says who is on call. Two more things decide what happens when urgent work arrives:

| Part | Decides | Set by |
|---|---|---|
| The **escalation policy** of the shift | who is contacted, how, how often and in what order, and who is told last | the shift manager or the on-call administrator |
| A **trigger rule** | which records start the on-call flow, and which flow | the same, with limits for shift managers |

Members who want to know what reaches them should read
[When on-call work reaches you](see:respond).

## On pdi2 today {label=NEW}

Nothing here is in use yet: no group has a shift [E01], there are no trigger rules [E02] [Q02], and the
escalation log is empty [E03]. So no on-call flow has ever run. The steps below are what to do once
a group has a shift (see [Set up and maintain a shift](see:set-up-shift)).

## The default escalation {label=NEW}

Every shift starts with a default escalation built from its rosters [E04]:

- **One roster:** the person on call is contacted first, then the next members of the roster in
  turn (*Rotate through members*).
- **Several rosters:** the on-call person of the first roster, then of the second, and so on
  (*Rotate through rosters*), for example a primary and a backup.

Each roster sets how hard each person is tried:

| Field on the roster | Means |
|---|---|
| **Number of reminders** | how many times the person is contacted before moving on (1 unless changed) [E05] |
| **Time between reminders** | the wait between two contacts (15 minutes unless changed) [E06] |
| **Time before escalation** | the wait before the next person [E07] |
| **Forced communication channel** | always use *Email*, *SMS* or *Voice* for this roster [E08] |

Forcing a channel has a risk the form warns about: "If the on-call member does not have an SMS
device they will NOT be contacted" (and the same for email). [E09]

## The catch-all: who is told last {label=NEW}

When nobody accepts, the shift's **Catch-all** decides who hears about it [E10] [E11]:

| Catch-all | Then choose | Who is told |
|---|---|---|
| **Notify Individual** | **Catch-all member** | one named person |
| **Notify All** | **Catch-all roster** | everyone on that roster |
| **Notify Group Manager** | (shown) | the group's manager |

Set it in the wizard's **Escalation Setup** step or on the shift. **Catch-all wait time** is how long
the catch-all has to answer. On pdi2 there is no instance-wide value, so it is zero unless you set
it on the shift. [E12] [E13] [Q07]

## Change the escalation {label=NEW}

{{animation:ocsetup}}

1. Open the shift and choose **Edit Escalation and Contact Preferences**. On pdi2 this link
   replaces *Edit Escalation Policy*, because Notify is installed. [E14] [E15]
2. To go beyond the rosters, choose **Override Escalation Policy** on the shift and confirm "Are you
   sure you want to override default escalation policy with custom escalation ?". The escalation
   designer opens. [E16] [E17] [Q23]
3. In the designer, build **escalation sets**. Each has a **Table** and a **Condition** (for example
   only priority 1 incidents) and an order; one set is the **Default**, used when no condition
   matches. A shift must keep one default set. [E20] [E21] Conditions must be standard ones, not
   scripts. [E22]
4. Add **steps** to each set, one per **Escalation level**. A step can contact rosters, named
   **Users**, other **Groups** or the **Group manager**, on chosen **Devices** or a forced channel,
   with a **Number of reminders** and a **Time to next step** (15 minutes unless changed). [E23]
5. To go back to the rosters' order, choose **Reset Escalation Policy** and confirm "Are you sure
   you want to reset custom escalation policy with default escalation ?". [E18] [E19]

The designer refuses two steps at the same level ("Step with escalation level - … already exists
…") [E24], reminders without a time between them [E25], and a step that escalates back to the
shift's own group or loops through other groups. [E26]

A group can also have **one** escalation policy for several of its shifts (**Apply to all Shifts**,
or a list of shifts): "This group already has an escalation policy defined" stops a second. [E27]
[E28]

### Contact preferences {label=NEW}

Members choose how they want to be contacted in their own preferences (see
[Your shifts, preferences and time off](see:own-schedule)). On the default escalation, **Override
user preference** on the shift makes the shift's own contact attempts win instead. [E29]

## How people are asked {label=NEW}

| Channel | To accept | To reject |
|---|---|---|
| **Email**, *{number} On-Call Assignment* | reply with **ACC** | reply with **REJ** [E30] |
| **SMS** | reply with the message number and **ACC** | the message number and **REJ** [E31] |
| **Voice** | press **1** | press **2** [E32] |

SMS and voice need a telephony provider for Notify. [shared/Q01] Rejecting moves the work to the next
person in the escalation. [E30] What the member sees is on
[When on-call work reaches you](see:respond).

## Add a trigger rule {label=NEW}

Without a trigger rule, a shift is only a calendar: nothing contacts anyone. [E39]

1. Open **On-Call Scheduling › Trigger Rules** and choose **New**. Administrators and
   `rota_manager` see the module [E33]; anyone who manages a group may create a rule. [E34]
2. Choose the **Table** (for example *Incident*), a **Name** and the **Execution Order**. [E02]
3. Say when it runs [E35]:

   | Field | Choose |
   |---|---|
   | **Run trigger** | *Run once*, or *Every time trigger field changes* with the **Trigger fields** |
   | **Trigger when** | *Condition matches*, with a **Condition**, or *Default* for the table |

4. Choose the **Trigger action**: *Subflow*, and the **Trigger subflow** [E35] [E36] [E37]:

   | Subflow | In short |
   |---|---|
   | **On-Call: Assign** | assigns the person on call |
   | **On-Call: Assign and Notify** | assigns and tells them |
   | **On-Call: Assign By Acknowledgement** | contacts people in turn until one accepts |
   | **On-Call: Escalations by Email** | the escalation, by email |

   [E38] *Script* is offered to administrators only. [E36]
5. Make it **Active** and save.

When a matching record is assigned to a group with a shift and nobody in that group is assigned
yet, the rule starts the subflow, after cancelling any on-call subflow already running on the
record. The steps are written to the record's work notes. [E39] Only subflows are supported on this
release, with the new trigger engine. [E43] [E44]

### Limits {label=NEW}

- A rule that fires whenever the **assignment group changes** applies to every group, so its
  **Group** is cleared. [E41] Only an administrator can create one: others get "Security
  constraints prevent this operation". [E40]
- A table can have only one **Default** rule: "Only one default trigger rule per table can be
  defined." [E42]

## Tips

- Start with one default trigger rule on incident and the *Assign By Acknowledgement* subflow, so
  that someone confirms they have it. [E38] [E42]
- Always set a catch-all, and a catch-all wait time, so a missed call still reaches a person. [E11]
  [E13]
- Prefer the members' own contact preferences; force a channel only when the team agrees. [E09]
  [E29]
