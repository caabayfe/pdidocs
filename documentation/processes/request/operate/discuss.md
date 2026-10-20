---
title: Discuss a request with colleagues
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Service Operations Workspace › requested item (Work in Progress) › side panel
    how: listed the icons of the record's side panel
    result: Record Information, Recommendations, Collaborate, Attachments, Response Templates, Templates
  E02:
    record: sys_ux_lib_component/c9227686bf8eb52fff28afbac4ee8ed2
    field: required_translation_keys
    how: read the labels of the Sidebar component (sn-collab-chat-menu-header)
    result: 'New discussion, Subject ("We''ve filled in this record''s short description, but you can edit it."), Add participants ("You can add users that have access to this record."), Private discussion ("Making a discussion private can''t be undone."), Start discussion; filters All, Unread, This record, Mentions, My discussions, Other discussions; Join discussion'
    hash: f83bb80f0d7ee87268184b4881ebb9d4d7763962264bfcbc2108707c7cc63987
  E03:
    record: sys_script_include/624e76ed7f612210549f8fbe5d8665af
    field: script
    how: read ContextualPanelRequestVisibilitySNC (sn_sow_req), registered by sys_extension_instance 56debeed7f612210549f8fbe5d8665a7
    result: the Collaborate chat on sc_request and sc_req_item shows when Sidebar is supported for the record (or with the Microsoft Teams plugin, for itil and sn_request_write)
    hash: 30805c40d036c01536de29de79bc39fa384ca3a14a812b087c416f4776f43406
  E04:
    record: sys_script_include/4955e759ff5a2210e7caffffffffff99
    field: script
    how: read DefaultContextualPanelVisibilitySNC (sn_uib_collab)
    result: for tables no extension handles, such as sc_task, the Collaborate chat shows on saved records when Sidebar is supported
    hash: 3431ac74c789d974078eeddf67454c999a6726b76d96b72c4d850fea8b6eaf1b
  E05:
    record: sys_script_include/1a9b636e53322110ad0fddeeff7b12b0
    field: script
    how: read CollaborateDropdownChatOptionsSNC.getDropDownChoices
    result: 'the Collaborate "+" menu offers "Start Sidebar discussion"'
    hash: da5340c7ebd1a2c3208285a55976f17820d6ad9081e0530e4381c837c9a88420
  E06:
    record: sys_script_include/917e3fb753822110ad0fddeeff7b1279
    field: script
    how: read SOWSidebarChatUtilsSNC.getChatsForRecord
    result: the Collaborate Chat tab lists the Sidebar discussions linked to this record only, newest first; a private discussion only to its members
    hash: bf288c929ace6f72a2c6dcee306803f6ac5094ab3b7983d7369a44f77e6d641f
  E07:
    record: sys_script_include/c6b38f44775a421084ef1aceca5a99e5
    field: script
    how: read ITSMParticipantSuggestionsExtPoint
    result: 'suggestions for incident, problem, change_request and sc_request only; for a request: Opened by, Requested for and Assigned to, plus the first on-call person of the assignment group when on-call scheduling is active; none for requested items or catalog tasks'
    hash: 01f885ad845fc5197b01e7407945b20ecb66f176ad258f7ffbca1246a880e950
  E08:
    record: sys_script_include/d9c7a32b7706021084ef1aceca5a99f2
    field: script
    how: read OnCallSidebarGroupMemberResolver
    result: only incident, problem and change_request resolve a group to its on-call people
    hash: f21c54bcfe5ffd7d23458c52205ea72a6b2c14d88822505f9377dcc00226a019
  E09:
    record: sys_properties/6eb04d6f83e3ed10f80a54c8beaad316
    field: value
    how: read sn_sow_collab.enable_requester_in_sidebar_discussion
    result: "true: users without roles, such as the person a request is for, can be added"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E10:
    record: sys_cs_collab_chat_requester/d33ede987f2512107629a6470d86651a
    how: read the requester mappings (the only record in the table)
    result: incident → Caller; no mapping for sc_request, sc_req_item or sc_task
    hash: 13d35d8222967ef0868e5a8fa62d08e626533ede95df088b81f54fb82b167ce2
  E11:
    record: sys_script_include/8b914851c3b13010fe394f877840dd30
    field: script
    how: read CollabChatUtils (getRequesterMappingField, sendEmails, sendEmailToRequesterWhenAddedToDiscussion)
    result: the emails "added to a discussion" and "unread messages" go only to the requester found through that mapping, so nobody is emailed for a request, item or task
    hash: 71a028931efb695dd2d1bd87d3fa7ab29d8ab73b000abed3536c78920b1daede
  E12:
    record: sysevent_email_action/bb26b1ea43d4421029582a618ab8f2b8
    how: read Mobile Sidebar Mention Push Notification
    result: active; a mention sends a push notification to the mobile app, on any record
    hash: 58d25ea4e1093c6c037e7e803776b1c0b9372fc88f1de13ada299d2370681e94
  E13:
    record: sys_security_acl/8be75c9b971ead90a4d89804a253af75
    how: read the execute ACL on the data broker Fetch all collaboration chats, and its roles
    result: itil, sn_incident_write, interaction_agent, sn_change_write; not sn_request_write
    hash: 7f043ad676b5b5f7ec0603e07651137ec5d50ce3d6057729e12f65e0c8fa913b
  E14:
    record: sys_security_acl/c65e7dbec3713010fe394f877840dd36
    field: script
    how: read the sys_cs_collab_record read ACL
    result: whoever can read the record can read the link to its discussions
    hash: 3385de317bd6f9e48a120ad3d2046560e5c26b3157cd5122a4a1d4edfda38f1a
  E15:
    record: sys_security_acl/303b88d5c3b13010fe394f877840dd77
    field: script
    how: read the create ACL on sys_cs_collab_message
    result: only members of a discussion can post in it
    hash: 88b738dc8c95ddf4d85a2a888a0378c78d593f0d83bfa49ef3b0e22872863683
---
## When to use a discussion {label=NEW}

A **Sidebar discussion** is a chat about one record with the people who can help: another
fulfilment team, a specialist, the requester's manager or the person the order is for. It works
on requests, requested items and catalog tasks as it does on incidents; the steps are in
[Discuss an incident with colleagues](see:incident/discuss). This page says what is different
for requests.

Messages stay in the discussion, not in the work notes. When it settles something, write the
outcome in the **Work notes** of the task or item.

## Start one on a request, item or task {label=NEW}

{{animation:reqdisc}}

1. Open the record the conversation is about: the catalog task for fulfilment work, the
   requested item for the item, the request for the whole order. A discussion belongs to that
   one record. [E06]
2. Open **Collaborate** in the side panel, choose **+**, then **Start Sidebar discussion**. [E01]
   [E03] [E04] [E05] [shared/Q20] Or use the **Sidebar discussions** icon in the header and **+ New
   discussion**. [E02]
3. Check the **Subject**: it starts as the record's short description. [E02]
4. **Add participants** who can open the record. [E02] On a **request** the suggestions are its
   Opened by, Requested for and Assigned to; on items and tasks there are none, so search for
   them. [E07]
5. Write a short message and choose **Start discussion**. [E02]

## What is different from incidents {label=NEW}

| | Incident | Request, item, catalog task |
|---|---|---|
| Suggested participants | caller, assignee, on-call person [E07] | request: Opened by, Requested for, Assigned to and the on-call person; item and task: none [E07] |
| Adding a group with on-call shifts | adds only who is on call [E08] | adds the whole group [E08] |
| The person it's for | the caller can be added [E09] | can be added too [E09] |
| Emails to that person | when added, and a daily digest of unread messages [E10] | **none**: no requester is set up for these tables [E10] [E11] [shared/Q03] |
| Mentions | push notification on the mobile app [E12] | the same [E12] |
| Collaborate panel's chats | `itil` or `sn_incident_write` [E13] | `itil`; `sn_request_write` alone doesn't load them [E13] [Q02] |

## Who can read it {label=NEW}

Anyone who can open the record can see its discussions that aren't private; only members can
write in them. [E14] [E15] The person an item is for may be able to open it, so keep a discussion
**Private** when it must stay between colleagues. [E02]

## Tips

- If you add the person the order is for, tell them in the item's **Additional comments**: they
  get no email about the discussion. [E11]
- Start the discussion on the catalog task when it's about the work, so the team that owns the
  task finds it under **This record**. [E02] [E06]
- Put the decision in the work notes, where the next team will look.
