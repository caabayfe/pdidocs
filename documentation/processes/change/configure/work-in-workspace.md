---
title: Changes in the workspace - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_ux_list_category/2b7646aa0b023010bac9818393673af0
    how: read the workspace list category Tasks (sn_sow_itsm_common)
    result: active, order 5000
    hash: 2ae083238e71f72afa4d58c6f4f36ae92b8801272faab607d7584bed6c35b5dc
  E02:
    record: sys_ux_list/cabc35660b023010bac9818393673a21
    how: read Assigned to you
    result: 'table task, view sow, condition active=true^assigned_to=javascript:getMyAssignments(), no roles'
    hash: ae4c4bddc1ccc935a2a7d13fa9888e9d68eebc75503407412b5559cb0b77fdc0
  E03:
    record: sys_ux_list/0d6786ea0b023010bac9818393673a8f
    how: read Assigned to your group
    result: 'table task, view sow, condition active=true^assignment_group is one of my groups^assigned_to is not me or is empty'
    hash: 441afcbf90b0bba673127841091c69d5b05f30182768964ed2180bbf50c35981
  E04:
    record: sys_declarative_action_assignment/a9d63636ff30011027aaf9a7cddcbdc8
    how: read Assign to me (sn_sow_itsm_common, list)
    result: 'table task, view sow, specificity 12, record selection required, condition SOWITSMCommonUtils().canAssignToMeOnList(current)'
    hash: cced1a340ab4379d95705c1ec8fdbe481d96180fc5018540ab6fd429e7dc873d
  E05:
    record: sys_declarative_action_assignment/a9d63636ff30011027aaf9a7cddcbdc8
    field: server_script
    how: read its server script
    result: 'checks active and write on assigned_to, membership of the assignment group; with no group, sets the only active group (getMemberGroups, limit 2), or the primary group when com.snc.wfo is active, else refuses; then assigned_to = you and update'
    hash: 34fa5699362b322b3050c556e321f3e919fc687515fdcc64ad0d8e27fad77302
  E06:
    record: sys_declarative_action_assignment/7047f78453103300099addeeff7b1248
    how: read Assign to me (global, list)
    result: 'table task, any view, specificity 11, role itil; sets assigned_to and updates, no checks'
    hash: bb867799f2b5bc1d37c8b13caa437a7332b35bb93ed2abfa9a8d86a3e6900e3f
  E07:
    record: sys_script_include/31903c09c7f13010d7e818b1c7c2603d
    field: script
    how: read SOWITSMCommonUtilsSNC
    result: 'canAssignToMeOnList: problem, incident, change_request; canAssignToMe: also problem_task and sc_task, active, assigned_to writable and empty, member of the group if any; _checkRolesForAssignment: change_request needs itil or sn_change_write'
    hash: 65116c33f05808534f0e490b4a150f944c6317f8ca8130bfef5664310e40685f
  E08:
    record: sys_ui_action/8513fcd0773b301027aae297cd5a9968
    how: read Assign to me (sn_sow_itsm_common, form)
    result: 'table task, workspace form button, condition canAssignToMe(current); shown in the views sow and sow_new_record'
    hash: 1013cca37d22631f0ae734115f526063ee178a8df4ff7496cf05302af64e66bc
  E09:
    record: sys_declarative_action_assignment/1625d9d893224210c3bbf04e6489186a
    how: read Assign to me (SOW landing page)
    result: 'table task, view sow_landing_page, condition itil or current.canWrite(); sets assigned_to and updates'
    hash: 163d1b2fc5641e428284020f09468c1c7df2a208acc18e8ec521352b67fbc50a
  E10:
    record: sys_declarative_action_assignment/74a432a477320110949878dabd5a997b
    how: read Assign to me (SOW landing page assigned)
    result: 'disabled, to hide the action on the landing page list of your own assignments'
    hash: 6817f1d1abc8e6adcad7793d08b39641a8ac81dc0cd479598be01a3b7d2e303a
  E11:
    record: sys_declarative_action_assignment/71ea841943a21210d9dedc5f6ab8f2ff
    how: read New (create-new-uxf) on change_request
    result: 'list action, view sow_landing_page, client action ba77e18f…, no roles'
    hash: 557a22971c999d8ffb6940ca52eafb0a932c1eb283cb1bdebb176cf6a81b2502
  E12:
    record: sys_declarative_action_assignment/08ef66b377531110b4e6aeb4bb5a997b
    how: read New (create-new-uxf) on change_request
    result: 'same, view sow_landing_page_assigned'
    hash: 3a554b6ef088074584aa299c9652b9332fbbb5ddfe13b997603f1f367a878cf5
  E13:
    record: sys_aw_master_config/7b24ceae5304130084acddeeff7b12a3
    how: read Agent Workspace (sn_agent_workspace)
    result: 'active false: the older Agent Workspace is switched off'
    hash: 44070df9201fa098a12524acc5a83700296ac703f9bce1d3d0fe035395431336
  E14:
    record: sys_declarative_action_assignment/1ad8b74e5340001007bdddeeff7b127e
    how: read New on change_request (sn_itsm_workspace)
    result: 'workspace Agent Workspace; the New of a Change Requests related list whose parent is an incident or a problem; opens the interceptor sn-itsm-new-record-interceptor with parent={{parentRecordSysId}}; roles itil, sn_change_write'
    hash: fa1cd32fc0c10f6132733c46ef47182b192a73bc91c700387e383f3dc34f0a5a
  E15:
    record: sys_declarative_action_assignment/079893e6b733330059128ac7ee11a967
    how: read New on change_request (sn_itsm_workspace)
    result: 'workspace Agent Workspace; "Create a new change request" through the interceptor'
    hash: 78f57985c1f86b1535291b5169a2f44c0bf5338df702478ab1f98c75eb53d10a
  E16:
    record: sys_declarative_action_assignment/0c723b6eb733330059128ac7ee11a9a9
    how: read New on change_task (sn_itsm_workspace)
    result: 'workspace Agent Workspace; "Create a new Change Task" with change_request={{parentRecordSysId}}'
    hash: 6dbef364a50f47f4ed6d23fa4fa7c45c35765a6c7bc32a6106bb07d976d01d1e
  E17:
    record: sys_declarative_action_assignment/a68f872c239733001488dc1756bf6500
    how: read Agent Assist on change_request (sn_itsm_workspace)
    result: 'workspace Agent Workspace; contextual side bar, active records, roles itil, sn_change_write; configuration 60aeafe0…'
    hash: 6c67bdde559393f1baf5521385b6ace5a9ab243ac94ace2e621e6d46cba01ddb
  E18:
    record: sys_declarative_action_assignment/639f872c239733001488dc1756bf6519
    how: read Agent Assist on change_task (sn_itsm_workspace)
    result: 'the same for change_task, configuration 16deafa4…'
    hash: a32098508cae961e283f78bc286416030aa1ae7cc8b9478bc0f6a963f146367a
  E19:
    record: sys_script/5c635726731220108ef62d2b04f6a7fa
    field: script
    how: read Set Normal Model in Workspace (display, order 40)
    result: on a new normal change without the Normal model, sets the model only when the request comes from /now/workspace/agent/ (the older Agent Workspace)
    hash: 369b5d18d5c4daf021d28a5aa28efa09567f8b1542de0182c2ed29f67d8f7b37
  E20:
    record: sys_script/836437e6731220108ef62d2b04f6a7b0
    field: script
    how: read Set Emergency Model in Workspace (display, order 40)
    result: the same for emergency changes and the Emergency model
    hash: 70ff10866a7473db80381065be481a332e948862d50618cd74ac3df0ef3b9c1e
  E21:
    record: sys_script/5bed2de0235123001488dc1756bf65af
    field: script
    how: read Link change to incident in Wkspace (after insert, change_request)
    result: 'reads the session property change_link and writes the new change into the field it names on the source record; no message in a workspace'
    hash: ae78d0d66942d54665708e23c818966dcaf7d138745e72f272d40d342270b2d3
  E22:
    record: sys_ui_action/1d850156230123001488dc1756bf6504
    field: script
    how: read Create Change Request (incident)
    result: 'puts change_link (incident, rfc) in the session before opening the interceptor; workspace form menu, itil or sn_change_write, open incident with no change'
    hash: 5d1d0e50f4d0f5fa2b919324d1e974f7f0924635d6555632f4656e400c5ee063
  E23:
    record: sys_ui_action/5a1a47e0537273005e32ddeeff7b1290
    field: script
    how: read Create Change Request (problem)
    result: 'puts change_link (problem, rfc) in the session; workspace form menu, when you can create changes and the problem has none'
    hash: 5d1d0e50f4d0f5fa2b919324d1e974f7f0924635d6555632f4656e400c5ee063
  E24:
    record: sys_ui_action/6663cf5323c333001488dc1756bf65bd
    field: client_script_v2
    how: read Create Change Task (sn_itsm_workspace)
    result: 'g_modal.sn_itsm_workspace.showInterceptor for change_task with change_request set, then g_aw.openRecord; form menu, saved records'
    hash: d7c77dca52d24c31ef092790658897cff71460946e3c5a3637b76329ec523724
  E25:
    record: sys_ui_action_role/57deaab9db2f330084f07ffdbf96193d
    how: read the roles of Create Change Task
    result: itil (and sn_change_write in sys_ui_action_role/96eeaab9…)
    hash: 3464014bc3e6a7cb18e0e3423d3b96f0f5c3535162ce507752196b024a32868b
  E26:
    record: sys_script_client/dac4547bdbe7330084f07ffdbf961967
    how: read Set State field on WS
    result: 'onChange of type on change_request, UI type Mobile / Service Portal (1), global, active'
    hash: 64bbb177bb4919e36c6b5111857286dc7729ea38cff1dcc7d2267fa2e3b5bc63
  E27:
    record: sys_script/262ea9a787233200277eff0b84e3ec54
    how: read Get state model and new flag
    result: 'display on change_request, only when chg_model is empty: g_scratchpad.stateModel from ChangeRequestStateHandler'
    hash: 580fa4f3b98a6f86d8c01d80f77b4bccddc7a757e282c9c9303f594df06c3dac
  E28:
    record: sys_ux_screen/468f70f443b47110cc25ff53e9b8f296
    field: macroponent_config
    how: read Agent assist SNC (sn_sow)
    result: 'cxsTableConfig: change_request → 60aeafe0231333001488dc1756bf6559, change_task → 16deafa4231333001488dc1756bf654b'
    hash: 2320733a0cddced0e473b439f9d785a327dcedac60acbcf9185ab475711c0cd7
  E29:
    record: cxs_table_config/60aeafe0231333001488dc1756bf6559
    how: read Agent Assist [change_request] (global)
    result: 'active; match active=true; no roles; ui type workspace; source selector; limit and page 10; context 988e67a0…'
    hash: 5f222c217d9a9c6e3e00377886c45aa8f3f217e9c4fa486c02848ed781761c02
  E30:
    record: cxs_table_config/16deafa4231333001488dc1756bf654b
    how: read Agent Assist [change_task]
    result: the same settings for change_task, same context
    hash: 462221def1a3bcc1645cf5e13742de59811c02a3c6d7eea0bba898b5616df588
  E31:
    record: cxs_table_field_config/32ce6ba4231333001488dc1756bf65ea
    how: read the search field of Agent Assist [change_request]
    result: short_description, default (and the same for change_task in cxs_table_field_config/46ee2728…)
    hash: dbdfbec5a7df3267612a92ddf21017ee4e74caacbfc5cf4351b0b63b33aa0a29
  E32:
    record: cxs_context_config/988e67a0231333001488dc1756bf65e5
    how: read Knowledge and IPC
    result: 'searcher 2ccd7541… with the text "Default Sources"; no default searcher resource; wildcard search off'
    hash: 7c4d5f8a1d9ece402d8c51175c7d72069293fa2fbb6f13fe8ce39a5b2b21cffc
  E33:
    record: cxs_res_context_config/6653e9390f100010e0acb0add7767ee2
    how: read the sources of Knowledge and IPC (cxs_res_context_config)
    result: 'knowledge 100, catalog 100, Incidents 100, Change Related Incidents 200, Open Changes 300, Closed Changes 400, Problems 500, all active'
    hash: 16a85acb59ac108d68bb020f64669c3ddbb09182f00fbf8125645a8c0dbfec44
  E34:
    record: cxs_search_res_config/23ac7f95b7100010759ff2b1de11a947
    how: read Change Related Incidents
    result: 'table incident, GlideRecordSearchResource, condition caused_byISEMPTY'
    hash: 1a61ea3f395cce3956c43202d554bd63525a1017be2a5ad586e8f39b0e8aa486
  E35:
    record: cxs_table_fltr_config/ec8c639b73100010dff9d1bd04f6a73d
    field: filter_script
    how: read the scripted filter of Change Related Incidents on Agent Assist [change_request]
    result: active incidents with sys_created_on on or after work_start, or start_date when work_start is empty
    hash: 0fe2b7117d4afe496014b2559c95bf4e80d36e3363d216ffca5b898130417756
  E36:
    record: cxs_search_res_config/c1dd6816536323004acaddeeff7b12ac
    how: read Open Changes
    result: active=true, created in the last 6 months
    hash: cd568e443c1a545dbe1bd95dcd10e01467db1d7154e82e6dc033566f01de10e2
  E37:
    record: cxs_search_res_config/c8952343535323004acaddeeff7b12ab
    how: read Closed Changes
    result: state=3 (Closed), closed_at in the last 6 months
    hash: 635e4938ff3a5ed6709848ce37a688a95debf95d1d8dca123e288841475f463b
  E38:
    record: cxs_search_res_config/739dd1d087452300fb3ad61e36cb0b77
    how: read Problems
    result: created in the last 6 months
    hash: 2472a2b53273919ed18d27866536052d7234024dfbf9980287d150a412236f6e
  E39:
    record: cxs_ui_action_config/5729dfe70f333300759fb0add7767e6a
    how: read Link to Incident (Agent Assist [change_request])
    result: 'action condition caused_byISEMPTY; REST link_chg_to_inc; current table change_request; no visibility script'
    hash: 8f41bf6b6729248a69fc68dee4321eea960618ea99b106093cd6ec637624e8d0
  E40:
    record: sys_ws_operation/0199572b0f333300759fb0add7767e6f
    field: operation_script
    how: read link_chg_to_inc
    result: 'GlideRecordSecure on both records; pre_modal: dialog with work_notes and comments fields; post_modal: incident.caused_by = change, update; requires ACL authorisation'
    hash: 304601683a306cdd34f44b89a81597a5786449e686e026dbf0f3b862e3b97a8f
  E41:
    record: cxs_ui_action_config/a6ce2ba4231333001488dc1756bf65dc
    how: read Attach (knowledge, Agent Assist [change_request])
    result: comments, embed_link, badge Attached, undo Unattach (and c6ee2728… for change_task)
    hash: 4d14a0b8f7e185d7f4b80dbd5c99414c56e6ec10029ebfadc6d0c54d411e3237
  E42:
    record: sys_script_include/2dda2f231b7e025022bc0d81604bcb9b
    field: script
    how: read RecommendedActionsSOWUtilSNC.canViewRAPanel
    result: change_request and change_task need itil or sn_change_write
    hash: bdf5d5a93108c9b76e7de81a53609d7d493822c6117ef7c2df1cba3b04c27262
  E43:
    record: sn_nb_action_rule_context/c86cb259839aca506f7fa570ceaad391
    how: read Change request context
    result: active, synchronous, refresh 15 minutes, search field short description, search configuration ce74806c…
    hash: c47e030a17de5930b9eee64bc4414fef850a479edda1cbaae84e3d7898a33005
  E44:
    record: sn_nb_action_rule_context/b2250e60936e82907b5bfff56aba1065
    how: read Change task context
    result: the same for change_task
    hash: b4cb468638741339c347e8d1a18f395587209df1e3133c2a3502ffa1de360173
  E45:
    record: sys_search_context_config/ce74806c978aca10bacc3aece053afa5
    how: read [AIS] Recommended Actions for ITSM Search Config
    result: search engine ai_search
    hash: 16821032ee4111531281f5398216f0916bd3a9f5129d94ae9d7298303be32b92
  E46:
    record: sys_properties/a3f1bb94ff031010b7b67677d53bf1a0
    how: read glide.ais.enabled
    result: 'false'
    hash: df9bd22689501b27f52fa049d9bc65d4ed1536140e1e0b04b5020c134ee200b3
  E47:
    record: sys_script_include/ba79c9dd53500110b569ddeeff7b128a
    field: script
    how: read SOWContextualPanelIncidentChangeVisibility.canLaunchChat
    result: incident and change_request only; Sidebar supported on SOW, or MS Teams IT active (itil, sn_change_write for changes)
    hash: 9cdfb41e6f28902063354665b96c3ff0202bc1ab95816eb4f51c043fe8c6bfd9
  E48:
    record: sys_script_include/c6b38f44775a421084ef1aceca5a99e5
    field: script
    how: read ITSMParticipantSuggestionsExtPoint
    result: 'valid for incident, problem, change_request and sc_request while com.glide.sn_participant_suggestions is inactive; change_request: opened_by, requested_by, assigned_to, plus the first on-call user of the group when com.snc.on_call_rotation is active'
    hash: 01f885ad845fc5197b01e7407945b20ecb66f176ad258f7ffbca1246a880e950
  E49:
    record: sys_script_include/d9c7a32b7706021084ef1aceca5a99f2
    field: script
    how: read OnCallSidebarGroupMemberResolver
    result: incident, problem and change_request resolve a group with a rota to its on-call users
    hash: f21c54bcfe5ffd7d23458c52205ea72a6b2c14d88822505f9377dcc00226a019
  E50:
    record: sys_cs_collab_chat_requester/d33ede987f2512107629a6470d86651a
    how: read sys_cs_collab_chat_requester (the only record in the mirror)
    result: incident → caller_id, active; no mapping for change_request, change_task or task
    hash: 13d35d8222967ef0868e5a8fa62d08e626533ede95df088b81f54fb82b167ce2
  E51:
    record: sys_script_include/8b914851c3b13010fe394f877840dd30
    field: script
    how: read CollabChatUtils.getRequesterMappingField
    result: looks up an active mapping for the table, then an inherited one for its parents; returns null when none, and both requester emails stop there
    hash: 71a028931efb695dd2d1bd87d3fa7ab29d8ab73b000abed3536c78920b1daede
  E52:
    record: sys_declarative_action_assignment/040b41b5c31130100f24c87af040dd66
    how: read Open create collab chat modal (sn_oe_sfs)
    result: 'table task, form action bar, not on new records, hasAccessToCreateSidebar and Next Experience on, no roles'
    hash: 2097dd1e8daaf9fca89f75698f885012e04b3ab79c07f0995fc63432efc083ea
  E53:
    record: sys_security_acl/8be75c9b971ead90a4d89804a253af75
    how: read the execute ACL on the data broker Fetch all collaboration chats (sn_sow_collab)
    result: roles itil, sn_incident_write, interaction_agent, sn_change_write
    hash: 7f043ad676b5b5f7ec0603e07651137ec5d50ce3d6057729e12f65e0c8fa913b
---
## The applications {label=NEW}

| Scope | What it gives changes in the workspace |
|---|---|
| `sn_sow_itsm_common` | the **Tasks** lists, **Assign to me** (list and form), **New** on the landing page's change lists [E02] [E04] [E08] [E11] |
| `sn_sow` | the **Agent Assist** side panel tab and its screen [E28] |
| global (Contextual Search) | Agent Assist's change and change task configurations, sources, actions and REST operation [E29] [E40] |
| `sn_itsm_ra` | the Recommendations contexts for changes and change tasks [E43] [E44] |
| `sn_sow_collab`, `sn_oe_sfs` | the Collaborate panel and Sidebar discussions [E47] [E52] |
| `sn_itsm_workspace` | the older **Agent Workspace**'s change actions, plus *Create Change Task* and *Set State field on WS* [E14] [E24] [E26] |

The older Agent Workspace is switched off. [E13] Its declarative actions for changes (*New* with
the record interceptor, *Agent Assist*) are tied to it and do nothing in Service Operations
Workspace. [E14] [E15] [E16] [E17] [E18] The same goes for the business rules *Set Normal Model in
Workspace* and *Set Emergency Model in Workspace*, which act only on requests from
`/now/workspace/agent/`. [E19] [E20] [shared/Q15]

## 1. Lists {label=NEW}

No workspace list is on `change_request` or `change_task`. Changes reach agents through the
category **Tasks** [E01]:

| List | Condition | Roles |
|---|---|---|
| *Assigned to you* | `active=true^assigned_to=javascript:getMyAssignments()` [E02] | none |
| *Assigned to your group* | active, one of my groups, assigned to someone else or nobody [E03] | none |

The landing page's change lists have their own **New** (`create-new-uxf`, client action
`ba77e18f…`) in the views *sow_landing_page* and *sow_landing_page_assigned*. [E11] [E12]

## 2. Assign to me {label=NEW}

| Where | Record | Applies to | Checks |
|---|---|---|---|
| Tasks lists (view `sow`) | declarative action, specificity 12 [E04] | incident, problem, change request [E07] | `itil` or `sn_change_write`; server script checks group membership and picks the group [E05] |
| Any other list | global declarative action, specificity 11 [E06] | any task, `itil` | none |
| Landing page lists | declarative action [E09]; disabled on the *assigned* view [E10] | any task, `itil` or write access | none |
| Workspace form | UI action, views `sow` and `sow_new_record` [E08] | incident, problem, change request, problem task, catalog task [E07] | active, unassigned, `assigned_to` writable, member of the group; group dialog when required [E07] |

In the Tasks lists the more specific `sn_sow_itsm_common` action wins, so change tasks get no
**Assign to me** there or on the form. [E04] [E07]

## 3. Creating changes and change tasks {label=NEW}

1. *Create Change Request* on the incident [E22] and on the problem [E23] put `change_link` in the
   session; the after-insert rule *Link change to incident in Wkspace* writes the new change into
   the record's *Change request* (`rfc`). [E21] These are workspace form-menu actions that open the
   `sn_itsm_workspace` record interceptor; on Service Operations Workspace the incident's menu
   doesn't show them (see [Escalate and link related work](see:incident/escalate)). [Q23]
2. *Create Change Task* is a form-menu action for `itil` and `sn_change_write` on saved changes.
   [E24] [E25] It opens the same interceptor, then the task with `g_aw.openRecord`. [Q23]
3. The Agent Workspace *New* actions on Change Requests and Change Tasks related lists (with the
   parent filled in) don't apply, the workspace being off. [E13] [E14] [E16]

## 4. Changing the type {label=NEW}

*Set State field on WS* runs on a change of **Type**: it makes **State** read-only and rebuilds its
choices from `g_scratchpad.stateModel`. [E26] Its UI type is *Mobile / Service Portal*. [Q24] The state
model is only put on the form for changes without a model (`chg_modelISEMPTY`), so for changes
with a model only the read-only part can apply. [E27]

## 5. Agent Assist {label=NEW}

1. The *Agent assist SNC* screen maps `change_request` and `change_task` to their configurations.
   [E28]
2. *Agent Assist [change_request]* and *[change_task]* (global): active records only, no roles,
   source selector, 10 results, search on the short description. [E29] [E30] [E31] The minimum
   search length is 3 (`com.snc.contextual_search.min_length`, see
   [the incident configuration](see:incident/assist)).
3. Context *Knowledge and IPC*, shared by both: the searcher *Default Sources* and wildcard search
   off. [E32] Its sources [E33]:

   | Order | Source | Records |
   |---|---|---|
   | 100 | knowledge, catalog | knowledge articles, catalog items |
   | 100 | Incidents | incidents of the last 6 months |
   | 200 | Change Related Incidents | `caused_byISEMPTY` [E34], plus a scripted filter on `change_request` only: active, created since `work_start`, else `start_date` [E35] [Q02] |
   | 300 | Open Changes | active, last 6 months [E36] |
   | 400 | Closed Changes | Closed, closed in the last 6 months [E37] |
   | 500 | Problems | last 6 months [E38] |

4. Actions: Attach (to `comments`, embedded link) [E41], Flag Article, Helpful, Full View and Order,
   as for incidents; on `change_request` only, **Link to Incident** on Change Related Incidents.
   [E39] Its REST operation `link_chg_to_inc` uses `GlideRecordSecure`, so the agent needs read on
   both records and write on the incident; it sets `incident.caused_by` and nothing else, although
   its dialog offers work notes and comments. [E40]

## 6. Recommendations {label=NEW}

The Recommendations tab needs `itil` or `sn_change_write` on changes and change tasks. [E42] Both
have an active context [E43] [E44] that searches through the `ai_search` engine [E45], and
`glide.ais.enabled` is false [E46], so nothing is recommended.

## 7. Sidebar discussions {label=NEW}

For the base set-up (properties, ACLs, notifications), see
[Sidebar discussions - configuration](see:incident/discuss). What is specific to changes:

| Setting | Changes | Change tasks |
|---|---|---|
| Collaborate chat in the side panel | `canLaunchChat` allows `change_request` [E47] | not allowed [E47] |
| Data brokers of the Collaborate panel | `itil` or `sn_change_write` [E53] | same |
| Open Sidebar discussion (Next Experience form, `task`) | yes [E52] | yes [E52] |
| Participant suggestions | opened by, requested by, assigned to, on call [E48] | none [E48] |
| On-call group resolution | yes [E49] | no [E49] |
| Requester mapping (emails) | none [E50] | none [E50] |

Without a requester mapping `getRequesterMappingField` returns nothing, so neither the
*added to a discussion* email nor the daily unread digest is sent for changes. [E51] Add an
inherited mapping (for example on `change_request`, field `requested_by`) if requesters should be
told. [shared/Q03]
