---
title: Escalation and trigger rules - configuration
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Scheduling › Trigger Rules (trigger_rule list)
    how: opened the list
    result: 'No records to display; columns Name, Table, Group, Trigger when group assigned changes, Active, Execution Order'
  E02:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Scheduling › Escalation Log (on_call_escalation list)
    how: opened the list
    result: No records to display
  E03:
    record: sys_db_object/5ef1520383b78310292aca75eeaad30d
    how: read the trigger_rule table
    result: labelled Trigger Rule; extends sysrule_assignment (name, table, condition, group, active, order)
    hash: 84ee5c85fee574b3f4222c847c02766ecb383ba216e2e2ee005d64d27ed5fa8b
  E04:
    record: sys_app_module/cedc0480eb301100fcfb858ad106fe51
    how: read Trigger Rules
    result: for rota_admin and rota_manager; Trigger Rule Table Config is for sn_trigger_table_cfg_read
    hash: 0e3c0d10dc57290951bfa4504035ec2a827e4452fe9ab12c695de061f6d521e5
  E05:
    record: sys_security_acl/4dc83fe8c3622010f208ce72a740dd6e
    field: script
    how: read the create ACL on trigger_rule
    result: OnCallSecurityNG.isManagerOfAnyGroup; a role ACL gives rota_admin access
    hash: d7e68f40633eaa7bd55a07888488a2d6d72d87bf6fcb2146714fcd49590b571a
  E06:
    record: sys_security_acl/b2297f21c3262010f208ce72a740dda9
    field: script
    how: read the write ACL on trigger_rule
    result: OnCallSecurityNG.canWriteTriggerRule, the manager check for the rule's group
    hash: 8890b9e63615fab339338ef4421b23d93ded198b289349a626f40503235f10ec
  E07:
    record: sys_script_include/3f8d56170a0a2c9660fe6df53700fe08
    field: script
    how: read OnCallSecurityNG (canReadTriggerRule, canWriteTriggerRule, checkManagerAccessOfGroup, getTriggerActionChoices)
    result: 'read and write for the manager of the rule''s group, a rota_manager of it or a shift manager in its preferences; Trigger action choices Subflow, Workflow (only if the field exists), Script (rota_admin only)'
    hash: 8b556eef44d2928f5dc070e31977cbcb4bd17d4c9f33ecf2e50cf755d58a9de7
  E08:
    record: sys_script/5dd35489532220100999ddeeff7b1225
    field: script
    how: read Set trigger rule table cfg (before)
    result: links the rule to the trigger_rule_table_cfg of its table
    hash: c700149042f6c7f40c17c7693a3f52c2fb3bd7d081c3056bbeb22a124bae002e
  E09:
    record: sys_script/354760fb2b7e6210edd5f6c0ce91bfda
    field: script
    how: read Clear group field for Global Rules (before)
    result: when the trigger fields include the table's group field, the rule's group is cleared
    hash: e189f0ad3bf9723f5a06406557fc93b05d919529e2b56d9d2008615991b90ca2
  E10:
    record: sys_script/b632f772ffd922107aa3ffffffffff0f
    field: script
    how: read Restrict non rota admin (before, order 1000, condition !gs.hasRole('rota_admin'))
    result: '"Security constraints prevent this operation" when the trigger fields include the group field'
    hash: 777b30ffa32d552bf84df5635dbc0c2ef3f772147805513d2cde11052528e93d
  E11:
    record: sys_script/da51801c733220102eb52d2b04f6a7b7
    field: script
    how: read One default group assign rule per table
    result: on an active default rule run on field changes, TriggerRule.abortActionIfDefaultTriggerRuleExists
    hash: 2689ce24289e46708eab252479c76595d06f92da2ec0e269625e5d4229a611af
  E12:
    record: sys_script/3dfc9256ffd122107aa3ffffffffffac
    field: script
    how: read Migrate Trigger when group assigned (display)
    result: an old rule with Trigger when group assigned changes is shown as Every time trigger field changes on the group field, with no group
    hash: 0db7d212971d67df10cbd3c86dc20fce7e2e97236336042942e2a687326b1627
  E13:
    record: sys_db_object/5ef1520383b78310292aca75eeaad30d
    children: sys_choice
    how: read the trigger_rule choices
    result: 'run_trigger run_once, trigger_field_changes; trigger_when condition_matches, default; trigger_action subflow, script'
    hash: 3d81821ee04ff6dbe0c3f359cf0dd5fc15c0678cc4325a19c36d54d404ed79b2
  E14:
    record: sys_dictionary/16f1520383b78310292aca75eeaad34f
    how: read trigger_rule.trigger_subflow
    result: reference to sys_hub_flow, qualifier category = On-Call Escalation Triggers
    hash: b53f07a922e4dc4a5c84f95ced7940afe4acc973786549922717d3b19b94e32f
  E15:
    record: sys_hub_category/ee82a5e04333021033871e0e85b8f2bb
    how: read On-Call Escalation Triggers and its subflows
    result: 'oncall_assign, oncall_assign_and_notify, oncall_assign_by_ack, oncall_escalations_by_email, and Resume Conference Call Escalation'
    hash: 26cb4f3a0d0153812199d90873fb6613817220036858c927c707fbe966940a1a
  E16:
    record: sysevent_script_action/2d7a7000eb301100fcfb858ad106fe42
    field: script
    how: read Process Trigger Rule (event trigger_rule.process)
    result: runs TriggerRule.process for the record and the rule (parm2); Trigger Rule Reassignment does the same for trigger_rule.reassignment
    hash: d171dfab56d39a9771b37d8648005da6bb22e3f83cc4d8e839eda3666e33f784
  E17:
    record: sys_script_include/57891886732220102eb52d2b04f6a729
    field: script
    how: read TriggerRuleSNC (process, _startTriggerSubflow, _executeTriggerScript, cancelSubflows)
    result: 'stops if the group or user field is missing, the group is empty, or the assignee is a member of the group; for a subflow, cancels earlier on-call subflows and workflows on the record, runs the subflow in the background with source_table, source_sys_id, trigger_group_field, trigger_group_sys_id, trigger_user_field and journal_field, logs the context in trigger_rule_wf_context; for a script, evaluates it with current, rule and the field names'
    hash: d3982599543732dc6a0f87383b5db40003beedb0502c3e3b223c31155a77e45e
  E18:
    record: sys_hub_flow/1700f38353c21210adc6ddeeff7b12f9
    how: "read On-Call: New Trigger Engine Handler"
    result: 'published subflow oncall_trigger_rule_base_handler: "process the trigger rule and launch the subflow present in the trigger_subflow field if the trigger_action field is subflow"'
    hash: a9272d62a03179af2c0f79d57c5a79f07414b8fbaca6cf6ac22eceeeaba7329b
  E19:
    record: sys_properties/f8d4808b53c21210adc6ddeeff7b1279
    field: value
    how: read com.snc.on_call_rotation.new_trigger_engine
    result: true; applies only when the trigger action is Subflow
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E20:
    record: sys_properties/5bcd60b29380221067c612f984891815
    field: value
    how: read glide.oncall.only_flow_enabled_release
    result: true; only subflow-based on-call invocations are supported
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E21:
    record: sys_script_include/1d53492757930300532c3da73d94f93a
    field: script
    how: read OnCallRotationSNC._addDutyEscalations and _addRotationEscalations
    result: 'default escalation: rotate through rosters (one on-call person per roster) or, with one roster, rotate through members; reminders and delays from each roster (attempts, time between reminders), forced channel and override user preference carried into the line-up'
    hash: 7c29b1bede2924e64c33e63a2c45617e72c208b5d7c25fdb5a6c4ffaa468fbfc
  E22:
    record: sys_script_include/f75ee0ab73362300cbb654eb7df6a7e0
    field: script
    how: read OnCallCreationWizardUtilsSNC._getEscalationType and saveCatchAllDetails
    result: 'Custom when the shift uses a custom or group escalation; else Rotate through members (one roster) or Rotate through rosters; the wizard saves catch_all, catch_all_roster and catch_all_member'
    hash: a451762eaac71193ef5d69300851a0f3aa679210486656ceeeb250441a71e846
  E23:
    record: sys_ui_policy_action/73ca99b2eb021100fcfb858ad106fed0
    how: read Catch-All is Individual
    result: catch_all_member visible and mandatory when catch_all is individual and no custom escalation
    hash: 923f42eccdc4ae3f51b2a673b9aea182f5299fefca5085875c70b16ca724280b
  E24:
    record: sys_ui_policy_action/ea5b1db2eb021100fcfb858ad106fe41
    how: read Catch-All is Notify All
    result: catch_all_roster visible and mandatory
    hash: 02b4106c5a985d413f398f04236381ccd20f7587fb180657f058c1218e27a520
  E25:
    record: sys_ui_policy_action/2cead9b2eb021100fcfb858ad106fe15
    how: read Catch-All is Group Manager
    result: shows group.manager
    hash: 6fa67993d0fed23fcb575e03deeb73db397f8ecf743c7d5c08063486e4530c0a
  E26:
    record: sys_ui_policy_action/a90617225ff0230084a5a184ff466677
    how: read Custom Escalation Hide Fields
    result: hides catch_all when use_custom_escalation is true
    hash: 7627d18a2adfa672fa7dc69985c36a85602af74260d385e2a098fa7aaf8dadb1
  E27:
    record: sys_script_include/e3e4ae19c70200102e65e122c7c26057
    field: script
    how: read OnCallEscalationUtilSNC.getCatchAllWaitTime
    result: the shift's catch_all_wait_time, else the property, else 0
    hash: 0da3e3ffbf7b530e99fb5302805102d0d0e3153badd4a515b5700f2152d51ac2
  E28:
    record: sys_properties/a0f693a877801010cfb82191a9106104
    how: read com.snc.on_call_rotation.catch_all_wait_time
    result: no value
    hash: 13140030c5522b7ce8ee249850b46d7c94a5714a49d9f40ff62150aa3894118c
  E29:
    record: sys_ui_action/10b48fa25fb0230084a5a184ff466683
    field: script
    how: read Edit Escalation Policy and Edit Escalation and Contact Preferences (cmn_rota form links)
    result: 'the first when OnCallContactPreferenceUtil.canCreateContactOverrides is false, the second when it is true; both open $oc_escalation_designer.do for a custom or group escalation, else $oc_shift_escalation.do'
    hash: 85aad0d13573e17894730b9d7c842b2b083f77ef65b931950d124cb810d45e16
  E30:
    record: sys_script_include/e493a64f57322300fe7cac27cf94f974
    field: script
    how: read OnCallContactPreferenceUtilSNC.canCreateContactOverrides
    result: 'true when Notify (com.snc.notify), Slack, Teams or mobile push is active; com.snc.notify is active in the mirror''s plugin list'
    hash: e1275eb801685f32593aa00f7ed4b90345c09e8e98bd93b379949758a48cf82b
  E31:
    record: sys_ui_action/b40c9ea25f70230084a5a184ff46669a
    field: script
    how: read Override Escalation Policy
    result: 'not custom, can write, not a group escalation; the modal calls OnCallWorkbenchUtilsAjax.overrideEscalation, then opens the designer'
    hash: a7bf7d2ce46524c75041e526033067b3769faf26d89618db29731b741459bd4c
  E32:
    record: sys_ui_action/1b3383225fb0230084a5a184ff46662e
    field: script
    how: read Reset Escalation Policy
    result: custom, can write, not a group escalation; confirmation modal oc_reset_escalation_policy
    hash: 19b7d9a9a0bb848ed92d3c7a707e8069db9f75b423bcca7254bc435b56fec18e
  E33:
    record: sys_ui_policy_action/1427b8235fd323006ae6a184ff466661
    how: read Toggle override user preference
    result: override_user_contact_preference shown while use_custom_escalation is false
    hash: 07b5f7130fdd38fbc238c839dc8f31e31cf0e1cc073ea8a00ab30766156fb382
  E34:
    record: sys_script/4769aff55f18230084a5a184ff4666f9
    field: script
    how: read the cmn_rota_escalation_set rules (Validation for atleast one default set, Disallow multiple default sets, Disable delete on default escalation set)
    result: 'each shift or group escalation keeps exactly one active default set; a new default deactivates the old; "Default escalation set cannot be deleted"'
    hash: 4f56d27fd3fbdcaf279cce6787a60f24bb11fc8f706a23fc0a96ebad40f9f6bc
  E35:
    record: sys_script/5677319091930310f8777d7f6b427617
    field: script
    how: read Block JS condition on Escalation set
    result: conditions containing javascript are refused
    hash: 05b7d1400f1d875af3251f374a57ce7fb09990df73587fd946d8147ed7ec2300
  E36:
    record: sys_script/03ace3795f18230084a5a184ff4666aa
    field: script
    how: read Block steps with same escalation level
    result: one step per escalation level per set
    hash: 64c1aaa949a88a1fb729971c31e792c2f99c34359cc07b79ca1fb15bd3928791
  E37:
    record: sys_script/c84694ce5f58230084a5a184ff46664c
    field: script
    how: read Check for cyclic escalation
    result: refuses the set's own group among a step's Groups and cyclic group paths; warns on paths deeper than 2
    hash: 49605e11484077b1704bead361b71b1bf00117177b328a7df90fa61fc5e28789
  E38:
    record: sys_script/3237aa3a5fd8230084a5a184ff466602
    field: script
    how: read Make time between reminders mandatory (cmn_rota_esc_step_def)
    result: reminders above 0 need time_between_reminders
    hash: db8bc427cc96f0210207150b30b01710e30edd3979f0e9fdc61a8ad021dd2aee
  E39:
    record: sys_db_object/50c1568f83778310292aca75eeaad3e3
    children: sys_choice
    how: read the cmn_rota_esc_step_def choices
    result: 'forced channel Email, SMS, Voice; roster escalation Current member, All members'
    hash: b56b1ce7ac8806530bb181c9c927ccbded9175361bb923c1690f668b174d29ec
  E40:
    record: sys_script/1104856b53622010ff67ddeeff7b1272
    field: script
    how: read Block multiple escalations for a group and Check manager access (on_call_group_escalation)
    result: one group escalation per group; only its managers may create one
    hash: cb866f0ed4d05fd69b0dc8817395f7bf687eec934410101ac26efb9efc8aa64c
  E41:
    record: on_call_communication_channel_config/ab59e6e0438a121033871e0e85b8f22a
    how: read the Email channel config
    result: 'default, active; subflow On-Call: Send Notification Email; keywords ACC and REJ; title "{number} On-Call Assignment"; catch-all title "Task {number} needs urgent attention"'
    hash: f9ca6b2f4004272884ce4d3dbfc019b6bf20815b34a019197a6148c10dbff47d
  E42:
    record: on_call_communication_channel_config/1a726d2e438ad21033871e0e85b8f298
    how: read the SMS channel config
    result: 'default, active; subflow On-Call: Send Notification SMS; ACC and REJ after the message number'
    hash: 4aa36756e6fe1d2b684d880fa1a03653a655f70cd8d8d8de5acdaaff00ad1fe7
  E43:
    record: on_call_communication_channel_config/c0f9ac1e4342d21033871e0e85b8f24b
    how: read the Voice channel config
    result: 'default, active; subflow On-Call: Send Notification Voice; keys 1 and 2'
    hash: ccbccdf7c4ecdd8de477824ef2bd160c37620bf534e64040917c7943ad2dde31
  E44:
    record: sys_properties/5e74f2c6eb9f70106de683402a522878
    field: value
    how: read com.snc.on_call_rotation.notification.voice.use_notify_call
    result: 'false: Assign by Acknowledgement calls through a Notify conference call, not a plain Notify call'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E45:
    record: sys_properties/5e1029aa87331300b18a046787cb0bde
    how: read com.snc.on_call_rotation.notify_webrtc_number
    result: 'no value: no Notify number lets on-call users call people on rosters from the browser'
    hash: 3cc71e37bb1b658cbb012b6405b9920a47f50df7630baddac14648a72e518c38
  E46:
    record: sys_properties/110b43c9c70b00100c54885827c2605f
    field: value
    how: read com.snc.on_call_rotation.log_escalations
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E47:
    record: sys_properties/b1c4e820433431103424dc5f6ab8f24b
    field: value
    how: read com.snc.on_call_escalation_notification_delegate_user
    result: "false: escalation notifications are not sent to delegates"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E48:
    record: sys_script_client/ea532097ff3862107aa3ffffffffff79
    field: script
    how: read Clear Trigger Fields on table change, Clear Trigger fields on Run Once and Show correct trigger action (trigger_rule)
    result: the trigger fields are cleared when the table changes or Run once is chosen; the subflow field is shown and mandatory for the Subflow action, the script field for Script
    hash: 687842ad301bc3568a88e3416440ceb4bd730c8f991276a9f2af647c7b0570c0
---
## The records {label=NEW}

Two parts of the On-Call Scheduling plugin decide what happens when urgent work arrives:

| Part | Tables |
|---|---|
| **Escalation policy** | the shift (`cmn_rota`: catch-all, custom escalation, override user preference), its rosters, escalation sets (`cmn_rota_escalation_set`), steps (`cmn_rota_esc_step_def`), group escalations (`on_call_group_escalation`), shift contact preferences (`cmn_rota_contact_preference`), channel configs (`on_call_communication_channel_config`) |
| **Trigger rules** | `trigger_rule`, which extends `sysrule_assignment` [E03], and `trigger_rule_table_cfg` |

On pdi2 there are no trigger rules [E01] and no escalation has run. [E02]

## 1. Trigger rules: who can write them {label=NEW}

The **Trigger Rules** module is for `rota_admin` and `rota_manager`. [E04] Creating needs
`rota_admin` or managing any group [E05]; reading and writing a rule needs managing its group.
[E06] [E07] Only `rota_admin` gets the *Script* action. [E07]

## 2. Trigger rules: saving one {label=NEW}

In order of execution:

1. *Set trigger rule table cfg* links the table's configuration (group, user and journal fields).
   [E08]
2. *Clear group field for Global Rules*: a rule on changes to the group field applies to all
   groups. [E09]
3. *One default group assign rule per table*: only one active default rule per table. [E11]
4. *Restrict non rota admin* (order 1000): such a global rule needs `rota_admin`. [E10]

*Migrate Trigger when group assigned* shows old rules in the new form. [E12] Client scripts on the
form clear the trigger fields when the table or run mode changes, and show the field for the chosen
action. [E48]
The choices are *Run once* or *Every time trigger field changes*, *Condition matches* or *Default*,
and *Subflow* or *Script*. [E13]

## 3. Trigger rules: running {label=NEW}

1. The events `trigger_rule.process` (initial assignment) and `trigger_rule.reassignment` (group
   change) run script actions that call `TriggerRule.process`. [E16]
   With `com.snc.on_call_rotation.new_trigger_engine` true [E19], rules with a Subflow action go
   through *On-Call: New Trigger Engine Handler*. [E18] What queues the events is platform code the
   mirror doesn't hold.
2. `TriggerRuleSNC.process` stops unless the record has the group and user fields, a group, and an
   assignee outside that group. [E17]
3. It cancels earlier on-call subflows and workflows on the record, starts the subflow in the
   background with the record and field names, and logs it in `trigger_rule_wf_context`. [E17]
4. The subflow comes from the category **On-Call Escalation Triggers** [E14] [E15]; only subflows
   are supported (`glide.oncall.only_flow_enabled_release` true). [E20]

## 4. The default escalation {label=NEW}

Without a custom policy the line-up is built from the rosters: one on-call person per roster in
order, or, with a single roster, its members in turn; each roster's reminders, delays and forced
channel apply. [E21] [E22]

**Catch-all** (`catch_all`): *individual* needs `catch_all_member` [E23], *all* needs
`catch_all_roster` [E24], *group_manager* shows the group's manager [E25]; hidden on a custom
escalation. [E26] The wait is the shift's `catch_all_wait_time`, else the property, which has no
value, so 0. [E27] [E28]

## 5. Custom and group escalation {label=NEW}

| Step | Record | Does |
|---|---|---|
| Link on the shift | *Edit Escalation Policy* / *Edit Escalation and Contact Preferences* | the second on pdi2, as Notify is active [E29] [E30] |
| Override | **Override Escalation Policy** | sets the custom escalation, opens `$oc_escalation_designer.do` [E31] |
| Reset | **Reset Escalation Policy** | back to the default [E32] |
| Sets | `cmn_rota_escalation_set` | one active default per shift or group escalation; no script conditions [E34] [E35] |
| Steps | `cmn_rota_esc_step_def` | one per level; reminders need a time between; no cyclic groups [E36] [E37] [E38] [E39] |
| Group escalation | `on_call_group_escalation` | one per group, by its managers [E40] |

**Override user preference** is on the shift form only for the default escalation. [E33] The
designer pages are platform pages the mirror doesn't hold.

## 6. Channels {label=NEW}

| Channel | Subflow | Accept / reject |
|---|---|---|
| Email | On-Call: Send Notification Email | ACC / REJ [E41] |
| SMS | On-Call: Send Notification SMS | message number + ACC / REJ [E42] |
| Voice | On-Call: Send Notification Voice | 1 / 2 [E43] |

All three are the active defaults, with no table or condition. [E41] [E42] [E43] SMS and voice go
through Notify; no Notify number is set for on-call calls from the browser [E45], and
*Assign by Acknowledgement* uses a Notify conference call rather than a plain call. [E44]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `com.snc.on_call_rotation.new_trigger_engine` | true | new engine for subflow rules [E19] |
| `glide.oncall.only_flow_enabled_release` | true | subflows only [E20] |
| `com.snc.on_call_rotation.catch_all_wait_time` | (none) | catch-all wait 0 unless set on the shift [E28] |
| `com.snc.on_call_rotation.log_escalations` | false | escalation details not logged [E46] |
| `com.snc.on_call_escalation_notification_delegate_user` | false | no delegation of escalation notifications [E47] |
| `com.snc.on_call_rotation.notify_webrtc_number` | (none) | no Notify number for voice [E45] |
| `com.snc.on_call_rotation.notification.voice.use_notify_call` | false | acknowledgement by conference call [E44] |

## Open questions {label=OPEN-QUESTION}

1. Which tables should have a `trigger_rule_table_cfg` and a trigger rule? The mirror holds
   neither table's records.
2. Is a Notify telephony provider configured? Without one, SMS and voice contacts can't be sent.
   [E45]
3. Should escalation details be logged (`log_escalations`) while the first shifts are tried? [E46]
4. Should a default catch-all wait time be set? [E28]
