---
title: Sidebar discussions on requests - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_extension_instance/56debeed7f612210549f8fbe5d8665a7
    how: read the sn_sow_req implementation of sn_uib_collab.ContextualPanelVisibility
    result: 'active, order 100, class sn_sow_req.ContextualPanelRequestVisibility'
    hash: b5d03ac97044a280f6b6cf6123eab10449a4443a75849d5af9909b04b0e134d4
  E02:
    record: sys_script_include/624e76ed7f612210549f8fbe5d8665af
    field: script
    how: read ContextualPanelRequestVisibilitySNC
    result: 'handles sc_request and sc_req_item; canLaunchChat when SidebarChatUtils.isSidebarSupported, or with com.snc.ms_teams.it for itil and sn_request_write'
    hash: 30805c40d036c01536de29de79bc39fa384ca3a14a812b087c416f4776f43406
  E03:
    record: sys_script_include/4955e759ff5a2210e7caffffffffff99
    field: script
    how: read DefaultContextualPanelVisibilitySNC
    result: handles every other table, sc_task included; false for new records; true when Sidebar is supported
    hash: 3431ac74c789d974078eeddf67454c999a6726b76d96b72c4d850fea8b6eaf1b
  E04:
    record: sys_security_acl/8be75c9b971ead90a4d89804a253af75
    how: read the execute ACL on the data broker Fetch all collaboration chats, and its sys_security_acl_role records (sn_sow_collab)
    result: roles itil, sn_incident_write, interaction_agent, sn_change_write
    hash: 7f043ad676b5b5f7ec0603e07651137ec5d50ce3d6057729e12f65e0c8fa913b
  E05:
    record: sys_user_role/89d4c6040f103300402c6b198b767e3c
    how: read the roles sn_request_write contains (sys_user_role_contains)
    result: 'among others sn_request_read, agent_workspace_user, task_editor, email_composer; not sn_uib_collab.user'
    hash: 2aca8177e85d610809f5e166a4ca69d6866462311c7c3a47be455ea3c1bfe8f8
  E06:
    record: sys_script_include/c6b38f44775a421084ef1aceca5a99e5
    field: script
    how: read ITSMParticipantSuggestionsExtPoint.isValid and getParticipantSuggestions
    result: 'valid for incident, problem, change_request and sc_request while com.glide.sn_participant_suggestions is inactive; sc_request: opened_by, requested_for, assigned_to and the on-call user of the group'
    hash: 01f885ad845fc5197b01e7407945b20ecb66f176ad258f7ffbca1246a880e950
  E07:
    record: sys_script_include/d9c7a32b7706021084ef1aceca5a99f2
    field: script
    how: read OnCallSidebarGroupMemberResolver
    result: tables incident, problem and change_request only
    hash: f21c54bcfe5ffd7d23458c52205ea72a6b2c14d88822505f9377dcc00226a019
  E08:
    record: sys_cs_collab_chat_requester/d33ede987f2512107629a6470d86651a
    how: read the only requester mapping in the mirror
    result: incident → caller_id, active
    hash: 13d35d8222967ef0868e5a8fa62d08e626533ede95df088b81f54fb82b167ce2
  E09:
    record: sys_script_include/8b914851c3b13010fe394f877840dd30
    field: script
    how: read CollabChatUtils.getRequesterMappingField
    result: looks for an active mapping of the table, then of a parent table marked inherit; returns nothing for sc_request, sc_req_item and sc_task on pdi2
    hash: 71a028931efb695dd2d1bd87d3fa7ab29d8ab73b000abed3536c78920b1daede
  E10:
    record: sys_cs_collab_user_query/ef3970e783e3ed10f80a54c8beaad30d
    field: condition_script
    how: read Exclude requester from sidebar discussion
    result: 'applies to sc_request and sc_req_item (with incident, change_request and interaction) only when sn_sow_collab.enable_requester_in_sidebar_discussion is false'
    hash: bc9410ffbdb2d91b9d7d505f44191ae22d5003e71d61ef58f62753bea0acef93
  E11:
    record: sys_properties/6eb04d6f83e3ed10f80a54c8beaad316
    field: value
    how: read sn_sow_collab.enable_requester_in_sidebar_discussion
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E12:
    record: sysevent_email_action/857640c093fe2d105f5effbd1dba1031
    how: read Sidebar Discussion Started (sn_sow_collab)
    result: on incident only, condition active and caller set
    hash: 9fafea57ab4b4797d554526d8189278e8c5a9471f4335842fe906ac9eb239f10
  E13:
    record: sys_declarative_action_assignment/040b41b5c31130100f24c87af040dd66
    how: read Open create collab chat modal (table task)
    result: 'Open Sidebar discussion in the Next Experience form action bar of saved task records, sc_task, sc_req_item and sc_request included; no required roles'
    hash: 2097dd1e8daaf9fca89f75698f885012e04b3ab79c07f0995fc63432efc083ea
---
## What is the same {label=NEW}

Sidebar, its access rules, its notifications and its properties are shared by every task table;
they are described in [Sidebar discussions - configuration](see:incident/configure/discuss).
This page covers what differs for `sc_request`, `sc_req_item` and `sc_task`.

## 1. Where the Collaborate chat shows {label=NEW}

| Table | Visibility record | Rule |
|---|---|---|
| `sc_request`, `sc_req_item` | *ContextualPanelRequestVisibility* (`sn_sow_req`) [E01] [E02] | Sidebar supported for the record |
| `sc_task` | the default of `sn_uib_collab` [E03] | Sidebar supported, saved records only |

The data broker that loads the panel's chats runs for `itil`, `sn_incident_write`,
`interaction_agent` and `sn_change_write` [E04], and `sn_request_write` contains neither those
roles nor `sn_uib_collab.user` [E05]. A fulfiller with `sn_request_write` but not `itil` can't load the
panel's chats; the header's Sidebar isn't limited by these roles.

The classic form's *Open Sidebar discussion* button is on every task table. [E13]

## 2. Suggestions and groups {label=NEW}

| Table | Suggested | Group with on-call shifts |
|---|---|---|
| `sc_request` | Opened by, Requested for, Assigned to, on-call user of the group [E06] | whole group [E07] |
| `sc_req_item`, `sc_task` | none [E06] | whole group [E07] |

## 3. The requester {label=NEW}

Requesters may be added: the property is true [E11], so *Exclude requester from sidebar
discussion* doesn't apply to requests and items. [E10] But the only requester mapping is for
incident [E08], and the Sidebar emails find their recipient through it [E09]. On requests, items
and tasks nobody receives *"You have been added to a discussion"* or the daily unread digest.
*Sidebar Discussion Started* is for incidents only as well. [E12]

To email the person an item is for, add an active `sys_cs_collab_chat_requester` record for
`sc_req_item` with `requested_for` (and for `sc_request`, `requested_for`). [E08] [E09]

## Open questions {label=OPEN-QUESTION}

1. Is Sidebar enabled per record for `sc_request`, `sc_req_item` and `sc_task`? The mirror can't
   show it; the Collaborate icon was seen on a requested item.
2. Should `sn_request_write` load the Collaborate chats? It would need the role in the data
   broker ACLs [E04], or `itil` for every fulfiller.
3. Should requesters be emailed about discussions on their items? [E08]
