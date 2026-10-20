---
title: Discuss an incident with colleagues
reviewed: 2026-10-18
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-18
      where: Service Operations Workspace, INC0010023, header › Sidebar discussions
    how: opened the Sidebar discussions icon in the header
    result: 'a panel with the tabs All, Unread, This record, Mentions (and more) and a "My discussions" filter; for this record: "This record doesn''t include any discussions you''re part of" and "+ New discussion"'
  E02:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-18
      where: Service Operations Workspace, INC0010023, side panel › Collaborate
    how: opened the Collaborate icon in the record's side panel
    result: 'a Chat tab: "Start a new chat using the "+" button"'
  E03:
    record: sys_ux_lib_component/c9227686bf8eb52fff28afbac4ee8ed2
    field: required_translation_keys
    how: read the labels of the Sidebar component (sn-collab-chat-menu-header)
    result: 'New discussion, Subject ("We''ve filled in this record''s short description, but you can edit it."), Add participants ("You can add users that have access to this record."), "When adding a group to a discussion, any child groups will also be added.", Include a brief message for participants, Private discussion ("Making a discussion private can''t be undone."), Start discussion; filters All, Unread, This record, Mentions, Favorites, My discussions, Other discussions; Join discussion, Leave discussion, Close discussion'
    hash: f83bb80f0d7ee87268184b4881ebb9d4d7763962264bfcbc2108707c7cc63987
  E04:
    record: sys_script_include/917e3fb753822110ad0fddeeff7b1279
    field: script
    how: read SOWSidebarChatUtilsSNC.getChatsForRecord
    result: the Collaborate Chat tab lists the Sidebar discussions linked to the record (type sidebar_discussion), newest first; a private discussion is listed only to its members
    hash: bf288c929ace6f72a2c6dcee306803f6ac5094ab3b7983d7369a44f77e6d641f
  E05:
    record: sys_script_include/1a9b636e53322110ad0fddeeff7b12b0
    field: script
    how: read CollaborateDropdownChatOptionsSNC.getDropDownChoices
    result: 'the Collaborate "+" menu offers "Start Sidebar discussion" in a Chat section, plus Microsoft Teams chats only when the MS Teams plugin is active'
    hash: da5340c7ebd1a2c3208285a55976f17820d6ad9081e0530e4381c837c9a88420
  E06:
    record: sys_script_include/c6b38f44775a421084ef1aceca5a99e5
    field: script
    how: read ITSMParticipantSuggestionsExtPoint
    result: 'for an incident, suggested participants are the caller ("Caller") and the assignee ("Assigned to"), plus the first on-call person of the assignment group when on-call scheduling is active'
    hash: 01f885ad845fc5197b01e7407945b20ecb66f176ad258f7ffbca1246a880e950
  E07:
    record: sys_script_include/d9c7a32b7706021084ef1aceca5a99f2
    field: script
    how: read OnCallSidebarGroupMemberResolver
    result: 'adding a group that has on-call shifts adds only who is on call now (one per roster), with the message "On-Call members of {group} joined the discussion"'
    hash: f21c54bcfe5ffd7d23458c52205ea72a6b2c14d88822505f9377dcc00226a019
  E08:
    record: sys_properties/6eb04d6f83e3ed10f80a54c8beaad316
    field: value
    how: read sn_sow_collab.enable_requester_in_sidebar_discussion
    result: "true: requesters (users without roles, such as callers) can be added to a discussion"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E09:
    record: sys_script/98b362e67fa112107629a6470d8665b8
    field: script
    how: read Requester added to Collab Chat (after insert or update on sys_cs_collab_member)
    result: when someone other than the creator is added, the record's requester (for an incident, the caller) is emailed, unless the incident is inactive or the discussion is mirrored to Teams or Slack
    hash: 58337ebc65cce4fae3d02a5d1180717f876b8bd3b9d7510ddb780362401b62b0
  E10:
    record: sys_script_email/8c5dc72a7f6512107629a6470d866541
    field: script
    how: read sn_oe_sfs.collab_chat_new_member
    result: '"You have been added to a discussion and may have unread message(s) on INC…", a View discussion button, the discussion title, short description and urgency'
    hash: 652da702923db23bf52a2775be112dc6e1f1dec9fd742b2538040b93ce685032
  E11:
    record: sysauto_script/cf9916537f7012107629a6470d866529
    how: read Collab Chat - Notify Unread Messages
    result: daily at 08:00 GMT, active; calls CollabChatUtils.sendEmails
    hash: b0d6f96b542993a448c585cc6713a9cd8094bfe6579329a3e2742cda124d38e4
  E12:
    record: sys_script_include/8b914851c3b13010fe394f877840dd30
    field: script
    how: read CollabChatUtils.sendEmails
    result: open discussions with a message in the last day; only the record's requester is emailed, and only if they have unread messages and the record is active
    hash: 71a028931efb695dd2d1bd87d3fa7ab29d8ab73b000abed3536c78920b1daede
  E13:
    record: sysevent_email_action/0a7bb6817fb012107629a6470d86656c
    how: read Collab Chat - Notify Unread Messages
    result: 'subject "You have new message(s) on Sidebar Discussion", active'
    hash: 9090113c37b82684863e625778a5e0a86039bdb7d835e9035ab212f15dd48c44
  E14:
    record: sys_security_acl/c65e7dbec3713010fe394f877840dd36
    field: script
    how: read the read ACL on sys_cs_collab_record
    result: a discussion's link to the incident can be read only by someone who can read the incident ("to open the chat in read only mode")
    hash: 3385de317bd6f9e48a120ad3d2046560e5c26b3157cd5122a4a1d4edfda38f1a
  E15:
    record: sys_security_acl/c053c891c3b13010fe394f877840dd59
    field: script
    how: read the read ACL on sys_cs_collab_message
    result: messages can be read by someone who can read the incident's discussion link; private discussions only by their active members
    hash: ed675b5dffcb8850a822c3e561c7dad18393c5821bd0b4689fb7505fbb5c587c
  E16:
    record: sys_security_acl/303b88d5c3b13010fe394f877840dd77
    field: script
    how: read the create ACL on sys_cs_collab_message
    result: only members of a discussion can post in it
    hash: 88b738dc8c95ddf4d85a2a888a0378c78d593f0d83bfa49ef3b0e22872863683
  E17:
    record: sysevent_email_action/bb26b1ea43d4421029582a618ab8f2b8
    how: read Mobile Sidebar Mention Push Notification
    result: active; a mention sends a push notification to the mobile app (push only)
    hash: 58d25ea4e1093c6c037e7e803776b1c0b9372fc88f1de13ada299d2370681e94
  E18:
    record: sys_cs_collab_chat_requester/d33ede987f2512107629a6470d86651a
    how: read the requester mapping
    result: for incident, the requester is the Caller (caller_id)
    hash: 13d35d8222967ef0868e5a8fa62d08e626533ede95df088b81f54fb82b167ce2
---
## When to use a discussion {label=NEW}

A **Sidebar discussion** is a chat about the incident with the people who can help: other
resolvers, a specialist, the on-call person of a team, or the caller. Use it when you need a quick
back-and-forth that would clutter the work notes.

| Use | For |
|---|---|
| **Work notes** | what was found and done, for the record and the next person |
| **Additional comments** | what the caller must know |
| **A discussion** | working it out together, in real time |

Messages in a discussion are kept with the discussion, not in the incident's work notes. [E15]
When the discussion settles something, write the outcome in the work notes. [Q30]

## Start a discussion from an incident {label=NEW}

{{animation:incdisc}}

The New discussion dialog, the participant picker and the Mentions tab weren't opened on screen;
the steps follow the component's labels.

1. Open the incident in the workspace and choose the **Sidebar discussions** icon in the header.
   The panel opens on the discussions of this record you are part of. [E01]
2. Choose **+ New discussion**. [E01]
3. The **Subject** is filled with the incident's short description; you can change it. [E03] [Q77]
4. **Add participants**: people, or a group. Adding a group adds its child groups too. [E03]
   The suggestions for an incident are its caller and its assignee, and the person on call for
   its assignment group when on-call scheduling is in use. [E06] [Q65] A group with on-call shifts adds
   only who is on call now. [E07]
5. Write a short message for the participants, and choose **Start discussion**. [E03]

Tick **Private discussion** only when the discussion must stay between its members: it can't be
undone. [E03]

You can also start one from the record's side panel: **Collaborate › Chat**, then **+**, then
**Start Sidebar discussion**. [E02] [E05]

## Who you can invite {label=NEW}

- People who can open the incident. The dialog says "You can add users that have access to this
  record". [E03]
- The **caller**, even though callers have no support roles: this is switched on for pdi2. [E08]
- A **group**, with its child groups, or its on-call people. [E03] [E07]

Someone who can't open the incident can't read the discussion either, even if added to it. [E14]
[E15]

## Find it later {label=NEW}

The **Sidebar discussions** icon in the header shows your discussions across all records. [E01]

| Tab or filter | Shows |
|---|---|
| **All** | every discussion you're in |
| **Unread** | discussions with messages you haven't read |
| **This record** | the discussions of the incident you have open |
| **Mentions** | messages where someone mentioned you |
| **My discussions** / **Other discussions** | in *This record*, the ones you're in, or the others on the record you could join |

[E01] [E03]

Anyone who can open the incident can see its discussions that aren't private, and read them;
to write, they must **Join discussion**. [E03] [E15] [E16]

## What the others receive {label=NEW}

| Who | What | When |
|---|---|---|
| **Colleagues** you add | the discussion in their **Sidebar discussions**, under *Unread* | at once, in the workspace [E01] |
| Anyone you **@mention** | a push notification on the mobile app | at once [E17] |
| The **caller**, when added | the email *You have new message(s) on Sidebar Discussion*: "You have been added to a discussion and may have unread message(s) on INC…", with a **View discussion** button | at once [E09] [E10] [E18] [Q78] |
| The **caller**, with unread messages | the same subject: "You have unread message(s) on INC…" | once a day, 08:00 GMT [E11] [E12] [E13] [Q29] |

Colleagues get no email. Only the caller does, and only while the incident is active. [E09]
[E12]

## The Collaborate panel's Chat tab {label=NEW}

The record's side panel has a **Collaborate** icon with a **Chat** tab. [E02] It isn't a
separate chat: it lists the same Sidebar discussions linked to this incident, newest first,
and its **+** starts one. [E04] [E05] Use whichever you have open:

- **Collaborate › Chat** when you are on the incident and want its discussions;
- the header's **Sidebar discussions** to see all yours, across records, and the unread ones.

Private discussions appear in either only for their members. [E04]

## Tips

- Give the discussion a subject others will recognise in their list; the short description is
  only a start.
- Add the caller only when you need them in the conversation: they are emailed, and the email
  repeats the incident's short description and urgency. [E10]
- When the discussion reaches a decision, put it in the work notes, where the next person will
  look.
