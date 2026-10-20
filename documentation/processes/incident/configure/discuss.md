---
title: Sidebar discussions - configuration
reviewed: 2026-10-18
evidence:
  E01:
    record: sys_properties/f5f72077c31101109a481f820c40ddd9
    field: value
    how: read com.glide.cs.collab.enabled (sn_oe_sfs)
    result: "true: collaborative chat (Sidebar) is on"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E02:
    record: sys_cs_collab_settings/3e998441c35f01103f4fcd7b7940dd8e
    how: read Global Settings
    result: enabled true; emojis and expert finder on; enable_teams false, enable_slack false; legacy support on
    hash: dda946f3faafbe2b72b2334a891623a14255f01656ac230d391904236b19848b
  E03:
    record: sys_script_include/917e3fb753822110ad0fddeeff7b1279
    field: script
    how: read SOWSidebarChatUtilsSNC (isSidebarSupportedOnSOW, hasPermission, getChatsForRecord)
    result: 'Sidebar on SOW needs glide.ui.polaris.experience true, sn_oe_sfs.prepopulate_users_on_sidebar_modal_is_supported true and itsm_family_release_version_check >= 24; from release 26 also Sidebar enabled in the session domain and for the record, and SidebarAccessCheckUtils.canWrite; hasPermission refuses roleless users on incident when enable_requester_in_sidebar_discussion is false; getChatsForRecord lists sys_cs_collab_record rows of the record, skipping private chats the user is not in'
    hash: bf288c929ace6f72a2c6dcee306803f6ac5094ab3b7983d7369a44f77e6d641f
  E04:
    record: sys_properties/3618dafdc7e02010099a308dc7c2603d
    field: value
    how: read glide.ui.polaris.experience
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E05:
    record: sys_properties/0568de5353462110ad0fddeeff7b1259
    field: value
    how: read itsm_family_release_version_check
    result: "26: the per-record check applies"
    hash: 5f9c4ab08cac7457e9111a30e4664920607ea2c115a1433d7be98e97e64244ca
  E06:
    record: sys_properties/f338b47f53862110ad0fddeeff7b12a0
    field: value
    how: read sn_oe_sfs.prepopulate_users_on_sidebar_modal_is_supported
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E07:
    record: sys_script_include/7bc9342dc30221100f24c87af040ddc4
    field: script
    how: read SidebarAccessCheckUtils
    result: 'hasAccessToCreateSidebar = enabled in domain, enabled for the record and com.glide.cs.collab.enabled, and canWrite; canWrite/canRead consult the extension point sn_oe_sfs.SidebarAdditionalAccessCheck when sn_oe_sfs.u_com.glide.cs.collab_additional_access_check_enabled is true; canRead always lets members in'
    hash: eeea91ab1d9254a1cf8498c024aa0c297fd8694e0c16fc24528aa9c9deaa763e
  E08:
    record: sys_properties/1dc311e1c30221100f24c87af040dd9a
    field: value
    how: read sn_oe_sfs.u_com.glide.cs.collab_additional_access_check_enabled
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E09:
    record: sys_extension_point/d89a9029c3c221100f24c87af040dd1a
    how: read sn_oe_sfs.SidebarAdditionalAccessCheck and searched the mirror for implementations
    result: no sys_extension_instance implements it on pdi2, so the additional checks allow everything
    hash: 2740f2055a1a5185f552b9f643ce611740c8a275b8702a5bf66bde48539b25de
  E10:
    record: sys_script_include/1a9b636e53322110ad0fddeeff7b12b0
    field: script
    how: read CollaborateDropdownChatOptionsSNC
    result: 'Collaborate "+" menu: "Start Sidebar discussion" when Sidebar is supported on SOW, MS Teams chat when com.snc.ms_teams.it is active'
    hash: da5340c7ebd1a2c3208285a55976f17820d6ad9081e0530e4381c837c9a88420
  E11:
    record: sys_script_include/ba79c9dd53500110b569ddeeff7b128a
    field: script
    how: read SOWContextualPanelIncidentChangeVisibility (extension of sn_sow_collab.SOWContextualPanelVisibility)
    result: the Collaborate chat appears on incident and change_request when Sidebar is supported, or when MS Teams IT is active (roles itil, sn_incident_write)
    hash: 9cdfb41e6f28902063354665b96c3ff0202bc1ab95816eb4f51c043fe8c6bfd9
  E12:
    record: sys_security_acl/8be75c9b971ead90a4d89804a253af75
    how: read the execute ACL on the data broker Fetch all collaboration chats, and its sys_security_acl_role records (sn_sow_collab)
    result: roles itil, sn_incident_write, interaction_agent, sn_change_write
    hash: 7f043ad676b5b5f7ec0603e07651137ec5d50ce3d6057729e12f65e0c8fa913b
  E13:
    record: sys_security_acl/f22356a153023010a487ddeeff7b12fb
    how: read the execute ACL on the data broker Fetch Collaboration Section Data, and its sys_security_acl_role records (sn_sow_collab)
    result: roles itil, sn_incident_write, interaction_agent, sn_change_write, sn_sow_collab.sn_collab_sow_admin
    hash: 642868733a8e870ae5dd45c31f622222f769aa56223df62271c477b9c0b2d9c6
  E14:
    record: sys_user_role/c6f410a5ff7162106667ffffffffffa9
    how: read sn_uib_collab.user
    result: access to the Collaborate side panel in UIB workspaces; contained in itil, sn_incident_write, sn_change_write and interaction_agent (sn_sow_collab role contains records)
    hash: f7fc6ac30a3191878dc6afca22328582b70e285a45cc409bbe650f5b98a96b6a
  E15:
    record: sys_user_role/25f927c7ff73621045b3ffffffffff53
    how: read sn_sow_collab.sn_collab_sow_admin
    result: admin of Collaboration Services for SOW; reads and writes the sn_sow_collab properties; contained in sn_sow_admin
    hash: 606845cc4f780f4e186d2fc5ed2a75d41c498c90736f01f5039d42cc80dfbcbd
  E16:
    record: sys_declarative_action_assignment/040b41b5c31130100f24c87af040dd66
    how: read Open create collab chat modal (table task)
    result: 'form action bar button, tooltip "Open Sidebar discussion", not on new records; condition hasAccessToCreateSidebar and Next Experience on for the instance and the user; no required roles'
    hash: 2097dd1e8daaf9fca89f75698f885012e04b3ab79c07f0995fc63432efc083ea
  E17:
    record: sys_properties/21c68f57c3020110fe394f877840dd88
    field: value
    how: read glide.collab.check_candidate_permission
    result: "true: the participant list checks access to the record"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E18:
    record: sys_properties/6eb04d6f83e3ed10f80a54c8beaad316
    field: value
    how: read sn_sow_collab.enable_requester_in_sidebar_discussion
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E19:
    record: sys_cs_collab_user_query/ef3970e783e3ed10f80a54c8beaad30d
    field: condition_script
    how: read Exclude requester from sidebar discussion (type search, active)
    result: 'applies to incident, sc_request, sc_req_item, change_request and interaction only when enable_requester_in_sidebar_discussion is false; then keeps only users with a role other than snc_internal'
    hash: bc9410ffbdb2d91b9d7d505f44191ae22d5003e71d61ef58f62753bea0acef93
  E20:
    record: sys_cs_collab_user_query/f58d78dcc3263010f6481f820c40dde8
    how: read prefill with assignment group members (type prefill)
    result: inactive, and its condition script returns false
    hash: ffed7b66186cd767db87f1b1af902fe7c5eaea04826e2b487f2a24a23d4e8cfc
  E21:
    record: sys_script_include/c6b38f44775a421084ef1aceca5a99e5
    field: script
    how: read ITSMParticipantSuggestionsExtPoint
    result: 'incident: caller_id and assigned_to, plus the first on-call user of the assignment group if com.snc.on_call_rotation is active; used only while com.glide.sn_participant_suggestions is inactive'
    hash: 01f885ad845fc5197b01e7407945b20ecb66f176ad258f7ffbca1246a880e950
  E22:
    record: sys_script_include/d9c7a32b7706021084ef1aceca5a99f2
    field: script
    how: read OnCallSidebarGroupMemberResolver
    result: for incident, problem and change_request, a group with a cmn_rota resolves to its on-call users, one per roster
    hash: f21c54bcfe5ffd7d23458c52205ea72a6b2c14d88822505f9377dcc00226a019
  E23:
    record: sys_properties/c15cb3167fbe42106b71bff03d86659e
    field: value
    how: read sn_oe_sfs.com.glide.cs.collab.chat.candidate.limit
    result: "8"
    hash: 2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3
  E24:
    record: sys_security_acl/c65e7dbec3713010fe394f877840dd36
    field: script
    how: read sys_cs_collab_record read ACL
    result: gr.get(document) && gr.canRead() && SidebarAccessCheckUtils.canRead
    hash: 3385de317bd6f9e48a120ad3d2046560e5c26b3157cd5122a4a1d4edfda38f1a
  E25:
    record: sys_script_include/8b914851c3b13010fe394f877840dd30
    field: script
    how: read CollabChatUtils (canReadBaseRecord, sendEmails, sendEmailToRequesterWhenAddedToDiscussion)
    result: 'canReadBaseRecord: the user must read the sys_cs_collab_record, and be an active member if the chat is private; a chat without a record is readable only by members; sendEmails queues sn_oe_sfs.notify_unread_messages per requester with unread messages on open chats active in the last day; the new-member mail goes only to the requester, not when the requester added themself, not on inactive records, not when an external Teams/Slack chat exists'
    hash: 71a028931efb695dd2d1bd87d3fa7ab29d8ab73b000abed3536c78920b1daede
  E26:
    record: sys_security_acl/88ad7872c3713010fe394f877840dd8c
    field: script
    how: read sys_cs_collab_chat read ACL
    result: canReadBaseRecord && SidebarAccessCheckUtils.canRead
    hash: 444f9bddd489224a294258bc88a7ab0841103462ae6ab30e3a1b03b30e4106e7
  E27:
    record: sys_security_acl/c053c891c3b13010fe394f877840dd59
    field: script
    how: read sys_cs_collab_message read ACL
    result: the sender, or audience and canReadBaseRecord and canRead
    hash: ed675b5dffcb8850a822c3e561c7dad18393c5821bd0b4689fb7505fbb5c587c
  E28:
    record: sys_security_acl/303b88d5c3b13010fe394f877840dd77
    field: script
    how: read sys_cs_collab_message create ACL
    result: members only
    hash: 88b738dc8c95ddf4d85a2a888a0378c78d593f0d83bfa49ef3b0e22872863683
  E29:
    record: sys_security_acl/ea7d928ab7210110ffe5ef54ce11a9ab
    field: script
    how: read sys_cs_collab_chat write ACL
    result: members only
    hash: 72e61f242393fec9322df4be24b5e8100d4d3c7f36ccede949e589f17140ac1a
  E30:
    record: sys_script/98b362e67fa112107629a6470d8665b8
    how: read Requester added to Collab Chat
    result: active, after insert and update on sys_cs_collab_member, filter active=true and member_type!=creator
    hash: 01ba661930dffe09718db5c5be4ff444879e2f434f57954aa92fff641680ee98
  E31:
    record: sys_cs_collab_chat_requester/d33ede987f2512107629a6470d86651a
    how: read the requester mapping
    result: incident → caller_id, active
    hash: 13d35d8222967ef0868e5a8fa62d08e626533ede95df088b81f54fb82b167ce2
  E32:
    record: sysevent_email_action/65daeaee7fa112107629a6470d866586
    how: read Collab Chat - Notify Unread New Member
    result: 'event sn_oe_sfs.notify_unread_new_member, on sys_user, subject "You have new message(s) on Sidebar Discussion", mail script sn_oe_sfs.collab_chat_new_member, active'
    hash: f563554dc4a65683d1b302f93c870ea83acf81550b6ae7569544aa7dfb90ea90
  E33:
    record: sysauto_script/cf9916537f7012107629a6470d866529
    how: read Collab Chat - Notify Unread Messages
    result: active, daily 08:00 GMT
    hash: b0d6f96b542993a448c585cc6713a9cd8094bfe6579329a3e2742cda124d38e4
  E34:
    record: sysevent_email_action/0a7bb6817fb012107629a6470d86656c
    how: read Collab Chat - Notify Unread Messages
    result: 'event sn_oe_sfs.notify_unread_messages, on sys_user, subject "You have new message(s) on Sidebar Discussion", active'
    hash: 9090113c37b82684863e625778a5e0a86039bdb7d835e9035ab212f15dd48c44
  E35:
    record: sysevent_email_action/bb26b1ea43d4421029582a618ab8f2b8
    how: read Mobile Sidebar Mention Push Notification
    result: event sn_oe_sfs.sidebar.mobile.push.mention on ui_notification_inbox, push only, active
    hash: 58d25ea4e1093c6c037e7e803776b1c0b9372fc88f1de13ada299d2370681e94
  E36:
    record: sys_notification/47cafbd277420110e6330ea24b5a99d5
    how: read Collab Chat Collaborator Added
    result: inactive
    hash: 5adc709f761e310e5cd5c3f662d95f9325c7eee94bd87310546b4a3388b8f6b9
  E37:
    record: sysevent_script_action/fd63645a7f6a121045b34f658c866514
    field: script
    how: read Deactivate SOW sidebar notification (on plugin.upgraded of sn_oe_sfs)
    result: deactivates the sn_sow_collab job Sidebar Discussion Reminder and the business rules New sidebar discussion created and Requestor added to sidebar discussion, and sets sn_sow_collab.uptake_sfs_notifications
    hash: 51cbbe1d32dae01f90b5394f8d054edcd5480891e252d55a4ab4832af7f94748
  E38:
    record: sys_script/70f2408a477e61503fbe9e25126d4385
    how: read Requestor added to sidebar discussion (sn_sow_collab)
    result: inactive
    hash: d5103cc4646d7580cc015e9d30632f28792f2150f49b63d75acd39fa92ef46e6
  E39:
    record: sys_script/980f295247b2e1503fbe9e25126d432f
    how: read New sidebar discussion created (sn_sow_collab)
    result: inactive; would have run the subflow Sidebar discussion creation
    hash: 0d806cdb7fe8c8b5507edf8f8d4438e3c82ab110f9446930704854a85c258b94
  E40:
    record: sysauto_script/10bf5c71477261503fbe9e25126d43fa
    how: read Sidebar Discussion Reminder (sn_sow_collab)
    result: inactive
    hash: c21cfb87fe5b0e2762113f99a1233a09ef7582655573607eac2a1476ab6ce0fb
  E41:
    record: sysevent_email_action/857640c093fe2d105f5effbd1dba1031
    how: read Sidebar Discussion Started (sn_sow_collab)
    result: active, on incident, event sn_sow_collab.sidebar.discussion.created, condition active and caller set
    hash: 9fafea57ab4b4797d554526d8189278e8c5a9471f4335842fe906ac9eb239f10
  E42:
    record: sys_auto_flush/83db3333c30511109a481f820c40ddbb
    how: read the table cleaner for sys_cs_collab_chat
    result: 'inactive (age 31536000 s, one year, on sys_updated_on): discussions are not deleted'
    hash: 0509c6d8176836419fa5d9ae88ec89b29c98e0fd2cf402dd14cb3e567da091c0
  E43:
    record: sys_properties/1e9fdea3c35761508526ce3599013159
    field: value
    how: read sn_sow_collab.max_chats_in_collaboration_tab
    result: "500"
    hash: 0604cd3138feed202ef293e062da2f4720f77a05d25ee036a7a01c9cfcdd1f0a
  E44:
    record: sys_properties/7d77626cb7212110ffe5ef54ce11a926
    field: value
    how: read com.glide.cs.collab.notify_all_members
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E45:
    record: sys_properties/1ee578a743412110d1064006fbb8f2cb
    field: value
    how: read com.glide.cs.collab.enable_multi_chats
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E46:
    record: sys_properties/dc6eb97197ef8110712f3da71153af58
    field: value
    how: read sn_sow_collab.user_presence_refresh_duration
    result: "180"
    hash: 7b69759630f869f2723875f873935fed29d2d12b10ef763c1c33b8e0004cb405
  E47:
    record: sys_properties/83340f3f8c9543100a22deb6dd2b4e1f
    how: read sn_sow_collab.uptake_sfs_notifications
    result: no value in the mirror
    hash: 7112d73ebe38829a32c7aaa121ad41f8f684381e50b6c7a247bb80f236b4d0eb
  E48:
    record: sys_user_role/031ce348c3a121100f24c87af040ddc4
    how: read sn_oe_sfs.sidebar_report_viewer
    result: grants access to sidebar reports
    hash: a4fb6a0b7fe2dff327797313bd773ad5d1d3bbc8c7d656767b2d44f520c29b07
---
## The applications {label=NEW}

| Scope | What it gives incident management |
|---|---|
| `sn_oe_sfs` | Sidebar itself: discussions (`sys_cs_collab_chat`, members, messages, the link to a record in `sys_cs_collab_record`), the header panel, ACLs, notifications, settings |
| `sn_sow_collab` | the Service Operations Workspace **Collaborate** side panel and its Chat tab, participant suggestions, on-call resolution, older notifications (now off) |
| `sn_uib_collab` | the base Collaborate panel for configurable workspaces, which `sn_sow_collab` extends |

The Collaborate **Chat** tab is not a second chat product: it reads the same Sidebar
discussions linked to the record. [E03] [E10]

## 1. Is Sidebar on {label=NEW}

Collaborative chat is on [E01] and the global settings are enabled, with Microsoft Teams and Slack
off. [E02] For the workspace, Sidebar is supported when [E03]:

| Condition | pdi2 |
|---|---|
| `glide.ui.polaris.experience` | true [E04] |
| `sn_oe_sfs.prepopulate_users_on_sidebar_modal_is_supported` | true [E06] |
| `itsm_family_release_version_check` ≥ 24 | 26, so the per-record check below also applies [E05] |
| Sidebar enabled in the user's session domain and for the record | a platform check (`sn_collab.CollabChatScriptObject`) the mirror can't show; seen working on INC0010023 [Q63] |
| `SidebarAccessCheckUtils.canWrite` | true for everyone: the additional access check is on [E08] but no extension implements it [E07] [E09] |

## 2. Who can start a discussion {label=NEW}

- **Workspace, Collaborate panel:** shown on incident and change when Sidebar is supported [E11];
  the **+** offers *Start Sidebar discussion* [E10]. The data brokers behind the panel run only for
  `itil`, `sn_incident_write`, `interaction_agent` and `sn_change_write` [E12], plus
  `sn_sow_collab.sn_collab_sow_admin` for the section data [E13]. These roles contain
  `sn_uib_collab.user`, the role for the Collaborate panel. [E14]
- **Header Sidebar panel:** no role in the mirror restricts it beyond `hasAccessToCreateSidebar`. [E07]
- **Next Experience form (classic UI in the unified navigation):** the declarative action *Open
  create collab chat modal* on `task` puts an *Open Sidebar discussion* button in the action bar
  of saved records, for any user, when `hasAccessToCreateSidebar` passes and Next Experience is
  on. [E16]

`sn_sow_collab.sn_collab_sow_admin` administers the SOW collaboration properties. [E15]
`sn_oe_sfs.sidebar_report_viewer` opens the Sidebar reports. [E48]

## 3. Who can be invited {label=NEW}

1. The candidate list checks access to the record. [E17]
2. Requesters may be added: `sn_sow_collab.enable_requester_in_sidebar_discussion` is true [E18],
   so the user query *Exclude requester from sidebar discussion* does nothing (it applies only
   when the property is false, and then removes users with no role but `snc_internal`). [E19]
   `hasPermission` follows the same property. [E03]
3. Suggestions: the caller and the assignee, and the first on-call user of the assignment group
   if on-call scheduling is active; only while the Participant Suggestions plugin is inactive.
   [E21] [Q64] [Q65] The prefill with assignment group members is off. [E20]
4. Groups: a group with on-call shifts resolves to its on-call users for incident, problem and
   change. [E22]
5. Limits: `sn_oe_sfs.com.glide.cs.collab.chat.candidate.limit` 8 [E23]; the search and prefill
   limits (`glide.collab.candidate_search_limit`, `glide.collab.group_search_limit`,
   `glide.collab.candidate_prefill_limit`) have no value in the mirror.

## 4. Who can read and write {label=NEW}

| Table | Read | Write |
|---|---|---|
| `sys_cs_collab_record` (discussion ↔ incident) | whoever can read the incident [E24] | |
| `sys_cs_collab_chat` | can read the record link, and is an active member when private; a chat without a record: members only [E25] [E26] | members [E29] |
| `sys_cs_collab_message` | the sender, or the audience who can read the chat [E27] | create: members [E28] |

So a participant who loses access to the incident loses the discussion too, and anyone who can
read the incident can read its non-private discussions without being a member. [E24] [E25]

## 5. Notifications {label=NEW}

Active (sn_oe_sfs):

| What | Trigger | To | Record |
|---|---|---|---|
| *Collab Chat - Notify Unread New Member* | business rule *Requester added to Collab Chat* on `sys_cs_collab_member` [E30] → event `sn_oe_sfs.notify_unread_new_member` | the record's requester, for incident the caller [E31]; skipped if inactive, self-added or mirrored to Teams/Slack [E25] | [E32] |
| *Collab Chat - Notify Unread Messages* | job daily 08:00 GMT [E33] [Q29] → event `sn_oe_sfs.notify_unread_messages` | requesters with unread messages in open discussions active in the last day [E25] | [E34] |
| *Mobile Sidebar Mention Push Notification* | a mention | the mentioned user, push only | [E35] |

*Collab Chat Collaborator Added* is inactive [E36], so colleagues get no email.

Superseded (sn_sow_collab): when `sn_oe_sfs` is upgraded, a script action deactivates the SOW
reminder job and the two business rules that fired the SOW notifications [E37]; all three are
inactive on pdi2. [E38] [E39] [E40] *Sidebar Discussion Started* and *Sidebar Discussion
Reminder* remain active, but only those inactive records (and `SOWSidebarNotificationsUtilsSNC`,
which they call) fire their events. [E41] [Q49]
`sn_sow_collab.uptake_sfs_notifications` has no value in the mirror. [E47]

## 6. Retention {label=NEW}

The table cleaner for `sys_cs_collab_chat` (one year after the last update) is inactive, so
discussions are kept. [E42] [Q28]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `com.glide.cs.collab.enabled` | true | Sidebar on [E01] |
| `sn_sow_collab.enable_requester_in_sidebar_discussion` | true | callers can be added [E18] |
| `sn_sow_collab.max_chats_in_collaboration_tab` | 500 | chats fetched for the Collaborate tab [E43] |
| `com.glide.cs.collab.notify_all_members` | true | no description in the mirror [E44] |
| `com.glide.cs.collab.enable_multi_chats` | true | no description in the mirror [E45] |
| `glide.collab.check_candidate_permission` | true | candidates must be able to read the record [E17] |
| `sn_oe_sfs.u_com.glide.cs.collab_additional_access_check_enabled` | true | extension checks, none implemented [E08] [E09] |
| `sn_sow_collab.user_presence_refresh_duration` | 180 s | presence refresh [E46] |
