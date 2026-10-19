---
title: Work a change in the workspace
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Service Operations Workspace › change request (normal, New) › header
    how: looked at the header buttons and opened More actions
    result: 'Save; More actions: Compose Email, Delete'
  E02:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Service Operations Workspace › change request (normal, New) › side panel
    how: looked at the icons in the record's side panel
    result: Recommendations, Agent Assist, Collaborate, Attachments, Response Templates, Templates, Email template
  E03:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Service Operations Workspace › change request (normal, New) › Related records
    how: opened the Related records tab
    result: Affected CIs, Impacted Services/CIs, Approvers, Change Tasks, Problems, Task SLAs, Outages
  E04:
    record: sys_ux_list/cabc35660b023010bac9818393673a21
    how: read the workspace list Assigned to you (sn_sow_itsm_common)
    result: 'category Tasks; table task; active records assigned to you (getMyAssignments); no roles'
    hash: ae4c4bddc1ccc935a2a7d13fa9888e9d68eebc75503407412b5559cb0b77fdc0
  E05:
    record: sys_ux_list/0d6786ea0b023010bac9818393673a8f
    how: read the workspace list Assigned to your group
    result: 'category Tasks; table task; active records of one of your groups, assigned to someone else or to nobody'
    hash: 441afcbf90b0bba673127841091c69d5b05f30182768964ed2180bbf50c35981
  E06:
    record: sys_declarative_action_assignment/a9d63636ff30011027aaf9a7cddcbdc8
    how: read Assign to me (list action of the workspace's Tasks lists)
    result: 'needs a selected record; shown when SOWITSMCommonUtils.canAssignToMeOnList passes'
    hash: cced1a340ab4379d95705c1ec8fdbe481d96180fc5018540ab6fd429e7dc873d
  E07:
    record: sys_script_include/31903c09c7f13010d7e818b1c7c2603d
    field: script
    how: read SOWITSMCommonUtilsSNC.canAssignToMeOnList and canAssignToMe
    result: 'the list action is only for incidents, problems and change requests, and for a change needs itil or sn_change_write; the form action also needs an active, unassigned record, the right to change Assigned to, and that you are in its assignment group if it has one; change tasks are in neither'
    hash: 65116c33f05808534f0e490b4a150f944c6317f8ca8130bfef5664310e40685f
  E08:
    record: sys_declarative_action_assignment/a9d63636ff30011027aaf9a7cddcbdc8
    field: server_script
    how: read what Assign to me does on the list
    result: 'refuses with "You do not have permission to update assigned to" or "Assigned to user … must be member of Assignment group …"; with no group, sets your only group, or refuses with "… is member of multiple groups, please select one as Assignment group or add a primary group …"; then assigns you and saves'
    hash: 34fa5699362b322b3050c556e321f3e919fc687515fdcc64ad0d8e27fad77302
  E09:
    record: sys_ui_action/8513fcd0773b301027aae297cd5a9968
    field: client_script_v2
    how: read Assign to me (form button in the workspace)
    result: 'when the group is mandatory, empty and you are in several groups, a "Select Assignment Group" dialog (Assignment Group, Assign, Cancel); otherwise sets your only group if empty; then sets you as Assigned to and saves'
    hash: 37ee29255e26fd3b455b269904d2191825dbcf28efe396ec559ab135080479b0
  E10:
    record: sys_ui_action/6663cf5323c333001488dc1756bf65bd
    how: read Create Change Task (sn_itsm_workspace)
    result: 'workspace More actions item on saved change requests, roles itil or sn_change_write; opens a "Create Change Task" dialog (Create, Cancel) for a change task of this change, then opens the new task'
    hash: 2707d2e6ef02260bf84753b644aa6b4194f9ff14dea337b66042776b08d0ff27
  E11:
    record: sys_script_client/dac4547bdbe7330084f07ffdbf961967
    field: script
    how: read Set State field on WS (onChange of Type)
    result: when Type changes, State becomes read-only, and its choices are cut to the current state and its next states if the form carries a state model
    hash: f730608343284187de6717fe72b5ea363c85dcbe908764cae47aea499c85ea96
  E12:
    record: sys_script/262ea9a787233200277eff0b84e3ec54
    how: read Get state model and new flag (display)
    result: the state model is put on the form only for change requests without a change model
    hash: 580fa4f3b98a6f86d8c01d80f77b4bccddc7a757e282c9c9303f594df06c3dac
  E13:
    record: sys_ux_screen/468f70f443b47110cc25ff53e9b8f296
    field: macroponent_config
    how: read Agent assist SNC, the screen behind the Agent Assist tab
    result: 'change_request uses Agent Assist [change_request] 60aeafe0…, change_task uses Agent Assist [change_task] 16deafa4…'
    hash: 2320733a0cddced0e473b439f9d785a327dcedac60acbcf9185ab475711c0cd7
  E14:
    record: cxs_table_config/60aeafe0231333001488dc1756bf6559
    how: read Agent Assist [change_request]
    result: 'active; only for active changes; no required roles; source selector on; 10 results a page; context Knowledge and IPC'
    hash: 5f222c217d9a9c6e3e00377886c45aa8f3f217e9c4fa486c02848ed781761c02
  E15:
    record: cxs_table_config/16deafa4231333001488dc1756bf654b
    how: read Agent Assist [change_task]
    result: 'active; only for active change tasks; no required roles; source selector on; 10 results a page; context Knowledge and IPC'
    hash: 462221def1a3bcc1645cf5e13742de59811c02a3c6d7eea0bba898b5616df588
  E16:
    record: cxs_context_config/988e67a0231333001488dc1756bf65e5
    how: read Knowledge and IPC
    result: 'default source "Default Sources" (knowledge, pinned knowledge and catalog together); wildcard search off'
    hash: 7c4d5f8a1d9ece402d8c51175c7d72069293fa2fbb6f13fe8ce39a5b2b21cffc
  E17:
    record: cxs_search_res_config/23ac7f95b7100010759ff2b1de11a947
    how: read Change Related Incidents
    result: incidents whose Caused by is empty
    hash: 1a61ea3f395cce3956c43202d554bd63525a1017be2a5ad586e8f39b0e8aa486
  E18:
    record: cxs_table_fltr_config/ec8c639b73100010dff9d1bd04f6a73d
    field: filter_script
    how: read the Change Related Incidents filter of Agent Assist [change_request]
    result: active incidents created on or after the change's actual start, or its planned start when it has no actual start
    hash: 0fe2b7117d4afe496014b2559c95bf4e80d36e3363d216ffca5b898130417756
  E19:
    record: cxs_search_res_config/c1dd6816536323004acaddeeff7b12ac
    how: read Open Changes
    result: active change requests created in the last 6 months
    hash: cd568e443c1a545dbe1bd95dcd10e01467db1d7154e82e6dc033566f01de10e2
  E20:
    record: cxs_search_res_config/c8952343535323004acaddeeff7b12ab
    how: read Closed Changes
    result: change requests in state Closed, closed in the last 6 months
    hash: 635e4938ff3a5ed6709848ce37a688a95debf95d1d8dca123e288841475f463b
  E21:
    record: cxs_search_res_config/739dd1d087452300fb3ad61e36cb0b77
    how: read Problems
    result: problems created in the last 6 months
    hash: 2472a2b53273919ed18d27866536052d7234024dfbf9980287d150a412236f6e
  E22:
    record: cxs_search_res_config/a4ed15d087452300fb3ad61e36cb0bf3
    how: read Incidents
    result: incidents created in the last 6 months, any state
    hash: a87f0712592a625c52307dcdf0907b16b70d827983406b36100c17fdddc59004
  E23:
    record: cxs_ui_action_config/5729dfe70f333300759fb0add7767e6a
    how: read Link to Incident on Change Related Incidents results
    result: 'only on Agent Assist [change_request], only for incidents whose Caused by is empty; calls link_chg_to_inc'
    hash: 8f41bf6b6729248a69fc68dee4321eea960618ea99b106093cd6ec637624e8d0
  E24:
    record: sys_ws_operation/0199572b0f333300759fb0add7767e6f
    field: operation_script
    how: read link_chg_to_inc (/api/now/cxs_actions/link_chg_to_inc)
    result: 'a "Link to Incident" dialog, "Now linking {change} to {incident}.", with Work notes and Additional comments boxes; then sets the incident''s Caused by to the change, with "{change} has been identified as a possible cause for {incident}."; reads and writes through the caller''s access'
    hash: 304601683a306cdd34f44b89a81597a5786449e686e026dbf0f3b862e3b97a8f
  E25:
    record: cxs_ui_action_config/a6ce2ba4231333001488dc1756bf65dc
    how: read Attach on knowledge results (Agent Assist [change_request])
    result: puts a link to the article in Additional comments; badge Attached, undone with Unattach
    hash: 4d14a0b8f7e185d7f4b80dbd5c99414c56e6ec10029ebfadc6d0c54d411e3237
  E26:
    record: sys_script_include/2dda2f231b7e025022bc0d81604bcb9b
    field: script
    how: read RecommendedActionsSOWUtilSNC.canViewRAPanel
    result: for change requests and change tasks, the Recommendations tab needs itil or sn_change_write
    hash: bdf5d5a93108c9b76e7de81a53609d7d493822c6117ef7c2df1cba3b04c27262
  E27:
    record: sn_nb_action_rule_context/c86cb259839aca506f7fa570ceaad391
    how: read Change request context (sn_itsm_ra)
    result: 'active; searches with the short description through the search configuration ce74806c…, which uses AI Search'
    hash: c47e030a17de5930b9eee64bc4414fef850a479edda1cbaae84e3d7898a33005
  E28:
    record: sys_properties/a3f1bb94ff031010b7b67677d53bf1a0
    how: read glide.ais.enabled
    result: 'false: AI Search is switched off'
    hash: df9bd22689501b27f52fa049d9bc65d4ed1536140e1e0b04b5020c134ee200b3
  E29:
    record: sys_script_include/ba79c9dd53500110b569ddeeff7b128a
    field: script
    how: read SOWContextualPanelIncidentChangeVisibility
    result: the Collaborate chat is offered on incidents and change requests only, when Sidebar is supported
    hash: 9cdfb41e6f28902063354665b96c3ff0202bc1ab95816eb4f51c043fe8c6bfd9
  E30:
    record: sys_script_include/c6b38f44775a421084ef1aceca5a99e5
    field: script
    how: read ITSMParticipantSuggestionsExtPoint
    result: 'for a change request, suggested participants are "Opened by", "Requested by" and "Assigned to", plus the first on-call person of the assignment group ("On call") when on-call scheduling is active'
    hash: 01f885ad845fc5197b01e7407945b20ecb66f176ad258f7ffbca1246a880e950
  E31:
    record: sys_cs_collab_chat_requester/d33ede987f2512107629a6470d86651a
    how: read the requester mappings and searched the mirror for others
    result: the only mapping is for incident (Caller); none for change_request or change_task
    hash: 13d35d8222967ef0868e5a8fa62d08e626533ede95df088b81f54fb82b167ce2
  E32:
    record: sys_script_include/8b914851c3b13010fe394f877840dd30
    field: script
    how: read CollabChatUtils.getRequesterMappingField and the two requester emails
    result: the added-to-a-discussion and unread-messages emails go only to the requester named by a mapping; with no mapping, nobody is emailed
    hash: 71a028931efb695dd2d1bd87d3fa7ab29d8ab73b000abed3536c78920b1daede
  E33:
    record: sys_notification/47cafbd277420110e6330ea24b5a99d5
    how: read Collab Chat Collaborator Added
    result: inactive, so colleagues added to a discussion get no email
    hash: 5adc709f761e310e5cd5c3f662d95f9325c7eee94bd87310546b4a3388b8f6b9
  E34:
    record: sysevent_email_action/bb26b1ea43d4421029582a618ab8f2b8
    how: read Mobile Sidebar Mention Push Notification
    result: active; a mention sends a push notification to the mobile app
    hash: 58d25ea4e1093c6c037e7e803776b1c0b9372fc88f1de13ada299d2370681e94
  E35:
    record: sys_declarative_action_assignment/040b41b5c31130100f24c87af040dd66
    how: read Open create collab chat modal (table task)
    result: 'an "Open Sidebar discussion" button on saved records of any task, change tasks included, with Next Experience on; no roles'
    hash: 2097dd1e8daaf9fca89f75698f885012e04b3ab79c07f0995fc63432efc083ea
  E36:
    record: sys_security_acl/c65e7dbec3713010fe394f877840dd36
    field: script
    how: read the read ACL on sys_cs_collab_record
    result: a discussion's link to a record can be read only by someone who can read the record
    hash: 3385de317bd6f9e48a120ad3d2046560e5c26b3157cd5122a4a1d4edfda38f1a
  E37:
    record: sys_properties/23c3f4ba777210108c8e303697106101
    how: read com.snc.contextual_search.min_length
    result: '3: a search needs at least three characters'
    hash: adf0e5d8143d1a7f03227be323a96c11acf82bfd5da39ed4b7547984faf7a6e2
  E38:
    record: sys_script_include/d9c7a32b7706021084ef1aceca5a99f2
    field: script
    how: read OnCallSidebarGroupMemberResolver
    result: for incidents, problems and change requests, adding a group with on-call shifts adds only who is on call now
    hash: f21c54bcfe5ffd7d23458c52205ea72a6b2c14d88822505f9377dcc00226a019
---
## What the workspace gives you {label=NEW}

The Service Operations Workspace shows a change request with a header, a side panel and a
**Related records** tab. On a new normal change it looked like this [E01] [E02] [E03]:

| Part | What is there |
|---|---|
| **Header** | **Save**; **More actions** with *Compose Email* and *Delete* |
| **Side panel** | Recommendations, Agent Assist, Collaborate, Attachments, Response Templates, Templates, Email template |
| **Related records** | Affected CIs, Impacted Services/CIs, Approvers, Change Tasks, Problems, Task SLAs, Outages |

The steps to plan, approve, implement and close are the same as on the classic form: see
[Raise a change](see:raise), [Schedule and implement](see:implement) and
[Review, close or cancel](see:close). This page covers what the workspace adds.

## Find your changes and change tasks {label=NEW}

{{animation:chgws}}

The workspace has no list of its own for changes. Changes and change tasks come to you through
the **Tasks** lists, which hold every kind of task:

| List | Shows |
|---|---|
| **Assigned to you** | active tasks assigned to you, changes and change tasks among them [E04] |
| **Assigned to your group** | active tasks of your groups that are assigned to someone else or to nobody [E05] |

Filter the list on the task type when you want only changes or change tasks.

## Take a change: Assign to me {label=NEW}

**From the list:** select one or more changes in a Tasks list and choose **Assign to me**. You need
`itil` or `sn_change_write`. [E06] [E07] The workspace refuses when [E08]:

- you can't change *Assigned to*: "You do not have permission to update assigned to";
- the change has a group you aren't in: "Assigned to user … must be member of Assignment group …";
- the change has no group and you are in several: "… is member of multiple groups, please select
  one as Assignment group or add a primary group …". With one group, it is filled in for you.

**On the form:** **Assign to me** shows on an active change that nobody is assigned to, when you
can change *Assigned to* and are in its group. [E07] If the group is required, empty, and you are
in several groups, a **Select Assignment Group** dialog asks which. [E09] The change is saved at
once.

**Assign to me** isn't offered for **change tasks**, neither in the list nor on the form. [E07]
Set **Assigned to** on the task yourself.

## Add a change task {label=NEW}

Change tasks are listed under **Related records › Change Tasks**. [E03] The *Implementation* and
*Post Implementation* tasks are created for you when the change is implemented (see
[Schedule and implement](see:implement)).

The workspace also has a **Create Change Task** action: under **More actions** on a saved change,
for `itil` and `sn_change_write`, it opens a **Create Change Task** dialog and then the new task.
[E10] It wasn't in **More actions** on the change that was walked. [E01] See the questions below.

## Changing the type {label=NEW}

If you change **Type** on the form, **State** becomes read-only until you save. [E11] The script
would also narrow the state choices, but only for changes without a change model. [E12]

## Find answers with Agent Assist {label=NEW}

Agent Assist works for changes as for incidents (see
[Find answers with Agent Assist](see:incident/assist)): open the **Agent Assist** icon in the side
panel [E02], and it searches with the **Short description** of the active change or change task.
[E13] [E14] [E15] A search needs at least three characters. [E37] What differs is where it looks:

| Source | Searches |
|---|---|
| **Default Sources** (the default) | knowledge articles, pinned articles and catalog items together [E16] |
| **Incidents** | incidents created in the last 6 months, any state [E22] |
| **Change Related Incidents** | active incidents opened since the change's actual start (or planned start), not yet linked to a change as their cause [E17] [E18] |
| **Open Changes** | active changes created in the last 6 months [E19] |
| **Closed Changes** | changes closed in the last 6 months [E20] |
| **Problems** | problems created in the last 6 months [E21] |

Wildcard search is off for changes, so type whole words. [E16]

**Link to Incident** is the change's own action. On a **Change Related Incidents** result, it asks
"Now linking CHG… to INC…", with boxes for work notes and additional comments, and then makes your
change the incident's **Caused by**: "CHG… has been identified as a possible cause for INC…".
[E23] [E24] Use it when the incidents started after your change and look like its result. It
shows only on change requests, and only for incidents with no *Caused by* yet. [E23]

The knowledge actions are the same as for incidents: **Attach** puts a link to the article in the
change's **Additional comments** [E25]; **Helpful**, **Flag Article**, **Full View** and **Order**
also work. There is no **Copy Resolution** for changes.

The **Recommendations** icon next to it (`itil` or `sn_change_write`) stays empty: it needs AI
Search, which is switched off. [E26] [E27] [E28]

## Discuss a change {label=NEW}

Sidebar discussions work for changes as for incidents (see
[Discuss an incident with colleagues](see:incident/discuss)). What differs:

| | On a change request | On a change task |
|---|---|---|
| **Collaborate › Chat** in the side panel | yes [E02] [E29] | no: the Collaborate chat is only for incidents and changes [E29] |
| **Open Sidebar discussion** on the Next Experience form | yes [E35] | yes [E35] |
| **Suggested participants** | *Opened by*, *Requested by*, *Assigned to*, and the person on call for its group when on-call scheduling is in use [E30] | none [E30] |
| A **group** with on-call shifts | adds only who is on call now [E38] | not resolved to the on-call people [E38] |

**Nobody is emailed** about a discussion on a change. The emails that tell a caller about an
incident discussion go only to a record's requester, and no requester is set up for changes or
change tasks. [E31] [E32] Colleagues get no email either [E33]; they see the discussion in their
**Sidebar discussions** panel, and a mention sends a push notification to the mobile app. [E34]

Only people who can open the change can read its discussions. [E36] Invite a business approver
or a CAB member only if they can open changes.

## Tips

- Use **Assigned to your group** to pick up new changes, and **Assign to me** to take one: it
  checks the group for you. [E05] [E08]
- After an incident starts during your window, look at **Change Related Incidents** in Agent
  Assist: it lists exactly those. [E18]
- Write in the discussion that you have linked an incident: **Link to Incident** writes to the
  incident, not to the change. [E24]
- Mention people in a discussion when it is urgent: outside the workspace, it's the only alert
  they get. [E33] [E34]

## Not yet seen {label=OPEN-QUESTION}

1. **Create Change Task** and **Assign to me** were not in the header of the change that was
   walked (a new normal change, as admin). [E01] Do they show on a saved change with no
   assignee? And does **Related records › Change Tasks** offer **New**?
2. The Agent Assist panel wasn't opened. Does its selector show these sources, does **Change
   Related Incidents** appear on change tasks, where it has no filter or actions? [E18] [E23]
3. **Link to Incident** asks for work notes and comments, but its script writes only *Caused by*
   on the incident. [E24] Are the notes saved, and on which record?
4. What do the Tasks lists show for a change task: its number and short description, or also the
   change it belongs to?
5. Is a discussion on a change task expected? The Collaborate chat isn't offered there. [E29]
