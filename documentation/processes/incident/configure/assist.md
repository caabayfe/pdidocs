---
title: Agent Assist and recommendations - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_ux_app_route/4a8f70f443b47110cc25ff53e9b8f291
    how: read the Agent Assist route of Service Operations Workspace (sn_sow)
    result: 'extension point sow-sidebar-tabs-top, route agent-assist, icon graduation-cap-outline, order 300'
    hash: a659a08d55a93c4fa36fcf479beb3137b72720436482b262b2d5e950672572e1
  E02:
    record: sys_ux_app_route/55d218a4eb98b1104c32ddde235228a6
    how: read the Recommendations route (sn_sow)
    result: 'same extension point, route next_best_action, icon bell-outline, order 200'
    hash: 1c73636b89e5703f006620fb402be64eb94f1d520b0fea570d7c3387528909a4
  E03:
    record: sys_ux_screen/468f70f443b47110cc25ff53e9b8f296
    field: macroponent_config
    how: read Agent assist SNC
    result: 'screen condition: incident, problem, problem_task, change_request, change_task, kb_knowledge, interaction, em_alert, universal_request, kb_template*; a table → search configuration map, incident → b41ff94577300110b3771aceca5a992e'
    hash: 2320733a0cddced0e473b439f9d785a327dcedac60acbcf9185ab475711c0cd7
  E04:
    record: sys_ux_client_script/f3e0775a430131107f08ff53e9b8f2fb
    field: script
    how: read agent_assist_1/cxsTableConfig
    result: picks the search configuration for the record's table from that map (kb_template_* tables use kb_template)
    hash: edef3ffbc05fd8b55cdb6d16042dd974b17de4f6523bdc303bc738a1c4fd86ac
  E05:
    record: cxs_table_config/b41ff94577300110b3771aceca5a992e
    how: read Agent Assist [incident] (sn_sow_inc)
    result: 'active, ui_type workspace, match_condition active=true, required_roles empty, context 893a754177300110b3771aceca5a99e8, source selector on, searcher shown first, related search on, limit 10, 10 a page, "search as" off'
    hash: 54dd96e1e5f1d86e72423611a6991831a610b8d5a88aa4216a9a7833d39bab3f
  E06:
    record: cxs_table_field_config/694fbd4577300110b3771aceca5a9971
    how: read the field configuration
    result: short_description, default
    hash: 0d501b519de30a4111431116c753c71406e479808f29b24445f0e6a167f8b172
  E07:
    record: cxs_context_config/893a754177300110b3771aceca5a99e8
    how: read Incident Deflection (SOW)
    result: 'searcher 2ccd7541c31121005655107698ba8f2c, labelled "Knowledge & Catalog", default resource knowledge, search on tab, wildcard search on'
    hash: 256cde2985d46884cc37d06d8ea26fac2a6b789b502f68aede3cc2c31730bf11
  E08:
    record: cxs_res_context_config/143f495a77300110b3771aceca5a999d
    how: read the knowledge resource of the context and its properties
    result: 'knowledge (2b727933…), IR_AND_OR_QUERY; properties Condition empty, Exclude Pinned Articles false'
    hash: 74af6052af10c415ed5d70a82ad5331b52dd3301134568b9241187c926cc5cc8
  E09:
    record: cxs_res_context_config/e03f0d5a77300110b3771aceca5a99cf
    how: read the catalog resource of the context
    result: 'catalog (c6eb806d…), IR_AND_OR_QUERY; Catalog Name empty (all catalogs)'
    hash: ce60914612a8fa70934ab0f2421cd2d7bf2ce86b32de88799d62643b7bce6432
  E10:
    record: cxs_res_context_config/0260128577700110b3771aceca5a9956
    how: read the Outages resource of the context
    result: Outages (a663c14f…), order 100
    hash: 3fdf26ef779557ea6ac4e1b2062eb2ffc756ef641fdf67426c477ccee1531b9f
  E11:
    record: cxs_res_context_config/53705d9a77300110b3771aceca5a99f1
    how: read the Incidents resource of the context
    result: Incidents (a4ed15d0…), order 200
    hash: 6869d150d6bfcef7f083c1dcc336066c6afb3d224020f93362080fcb5eb7eab6
  E12:
    record: cxs_res_context_config/a5198e8d77300110b3771aceca5a995f
    how: read the Open Incidents resource of the context
    result: Open Incidents (8564187a…), order 300
    hash: 553d9cea615ef6894f1a70379230705d0cebf6ffb0bc4c9a53f80a4cfb3f7a6b
  E13:
    record: cxs_res_context_config/00bc028177700110b3771aceca5a9988
    how: read the Resolved Incidents resource of the context
    result: Resolved Incidents (95c59c7a…), order 400
    hash: 85e06545a3c632a80c4557e54d67bba5657befbde9726a951d56068e1023c5e5
  E14:
    record: cxs_search_res_config/2b727933c30221003d2ae219cdba8f40
    how: read Knowledge Articles
    result: KnowledgeSearchResource on kb_knowledge, no condition, no ML solution
    hash: 56553fe2d260b4e0f1f0695ddbb800011f15fc5b4c3b2afaa2f1b197ae6447f5
  E15:
    record: cxs_search_res_config/c6eb806def32210066fc36caa5c0fbf7
    how: read Catalog Items
    result: ServiceCatalogSearchResource on sc_cat_item, no ML solution
    hash: 9a7335190fac92939944e6b3dd9af11e4213061b63be87df7909e0c30a4469a2
  E16:
    record: cxs_search_res_config/8564187a535b130005ecddeeff7b1268
    how: read Open Incidents
    result: 'GlideRecordSearchResource on incident: active=true, created in the last 3 months, parent not an accepted major incident'
    hash: d3d7fb6fe4c67c86afde364e3abc04bc3c3d0b7252ce4715fa1220f618aafbd0
  E17:
    record: cxs_search_res_config/a4ed15d087452300fb3ad61e36cb0bf3
    how: read Incidents
    result: 'GlideRecordSearchResource on incident: created in the last 6 months'
    hash: a87f0712592a625c52307dcdf0907b16b70d827983406b36100c17fdddc59004
  E18:
    record: cxs_search_res_config/95c59c7a535b130005ecddeeff7b12d4
    how: read Resolved Incidents
    result: 'GlideRecordSearchResource on incident: state Resolved or Closed, created in the last 3 months, six resolution codes'
    hash: e63ba2b3caed6c5cc5be408cd0353835390b537ff2161361fa96b876cb3abc4f
  E19:
    record: cxs_search_res_config/a663c14f530b33005e32ddeeff7b1282
    how: read Outages
    result: 'GlideRecordSearchResource on cmdb_ci_outage: created in the last 6 months'
    hash: c52f90dbaa406090d03c3401dff72335e19cc53e28d31ba21e2551df3ee0e5de
  E20:
    record: cxs_searcher_config/2ccd7541c31121005655107698ba8f2c
    how: read Knowledge, pinned knowledge and catalog
    result: interleaves knowledge articles, pinned knowledge articles and catalog items
    hash: a2c9337039cfa4cf28fe0fc5cdf12f2032fc869cf896dad9d71786f7c704a883
  E21:
    record: sys_properties/a3f1bb94ff031010b7b67677d53bf1a0
    how: read glide.ais.enabled
    result: false
    hash: df9bd22689501b27f52fa049d9bc65d4ed1536140e1e0b04b5020c134ee200b3
  E22:
    record: cxs_ui_action/7a02029353c4230005ecddeeff7b123b
    how: read Link to Incident
    result: 'action id link_to:link_to_incident, REST link_incident, for incident results on an incident; Desktop and Service Workspace'
    hash: 856216263531d0a121c3c9a0968468c5c2e4ea71780ed3a223a67c48fbd2bd4b
  E23:
    record: sys_ws_operation/51a836e0b32023002bf182c136a8dc60
    field: operation_script
    how: read link_incident (global, /api/now/cxs_actions/link_incident)
    result: checks write on incident.parent_incident; for Agent Assist returns the result's number and the messages; link_to:… sets the current incident's parent_incident to the result
    hash: 7f8142e1589047420e778e5710c5c12353dc8daaada0decf154cff948e3dc089
  E24:
    record: sys_ws_operation/b2edb50577300110b3771aceca5a99bb
    field: operation_script
    how: read link_incident (sn_sow_inc, /api/now/cxs_actions/link_incident_rest)
    result: same link, with a dialog for work notes and additional comments, only for action ids containing "rest"
    hash: 76f2d8e99090094c3925bed2c10f034e1373d6256bdd91ac8c19b3adb255f20f
  E25:
    record: sys_security_acl/83ff4d20531e4110ae50ddeeff7b1285
    how: read the execute ACL on /api/now/cxs_actions/link_incident_rest and its roles
    result: allow, roles sn_incident_write and itil
    hash: cceaa2ab446524a34421e1c7345391a82d9d6d6f614e9abf53d3905c2bf7e186
  E26:
    record: sys_ws_operation/c0168ad753c333005e32ddeeff7b123b
    field: operation_script
    how: read link_inc_to_outage
    result: needs itil or sn_incident_write; dialog with work notes and additional comments; inserts task_outage
    hash: 3e85c4ef71c46311aa276424bc5d83efac8625368828224ed3e08ce9493523e7
  E27:
    record: cxs_ui_action/c326191db32023002bf182c136a8dc83
    how: read Copy Incident Resolution
    result: 'action id copy_resolution:incident, Service Workspace only, default condition close_code or close_notes not empty'
    hash: c3ca6028f6afaf2f84dec8ddf14e3df64dcfdec9af4cb24e4c3495774a36d591
  E28:
    record: cxs_ui_action_config/683f0d5a77300110b3771aceca5a99e2
    how: read Attach (knowledge, Agent Assist [incident])
    result: attach note field comments, attachment type embed_link, badge Attached, undo Unattach
    hash: d5b992b5e58c44cc8aaa26b847492fc724b2119b85f18e71a7ac51e414e5cc4e
  E29:
    record: cxs_ui_action_config/343f0d5a77300110b3771aceca5a99e6
    field: action_condition
    how: read Flag Article
    result: kb_knowledge_base.disable_suggesting=false
    hash: a51cd3ce105710d2b70a092b5074e8eaa1d46242aacbc99b131776d0c2554e30
  E30:
    record: sys_ux_screen/7166c0b5fb1a8a10763dfc785eefdc26
    how: read Recommended Actions Default (sn_itsm_ra)
    result: 'active; incident, incident_task, interaction, problem, problem_task, change, change task, request, requested item, catalog task; saved records only'
    hash: a07cb35fe57463392050772e3a22e2426ff1cbc06ead76d02cd886ba20c9603c
  E31:
    record: sys_script_include/2dda2f231b7e025022bc0d81604bcb9b
    field: script
    how: read RecommendedActionsSOWUtilSNC.canViewRAPanel, called by the screen condition e670bfa71b7e025022bc0d81604bcb6c
    result: incident, incident_task, interaction need itil or sn_incident_write
    hash: bdf5d5a93108c9b76e7de81a53609d7d493822c6117ef7c2df1cba3b04c27262
  E32:
    record: sn_nb_action_rule_context/71e20d52532211101d87ddeeff7b1206
    how: read Incident context (sn_sow_inc)
    result: 'active, synchronous, default search field {{vp_context.short_description}}, refreshed every 15 minutes, search configuration ce74806c978aca10bacc3aece053afa5'
    hash: aa16e5b3b7b63f8533267319a9ceff7f7a25655734c26dddcc44cf6dcf4c3416
  E33:
    record: sn_nb_action_condition_based_rule/d22242d8970f311007a138fce053af74
    how: read rule AI Search
    result: 'active, order 50, condition active=true, roles itil, re-evaluated when short_description changes'
    hash: 69a80ad5485697bf0b5380c547f21c7713f891ed810fbf7adf11aabb8fc494b8
  E34:
    record: sn_nb_action_condition_based_rule/06c8fb8153321110ede0ddeeff7b1251
    how: read rule Active non-child non-MI Incident
    result: 'active, order 100, active=true, no parent incident, short description set; roles sn_incident_write, itil'
    hash: b91fa2bda677565c3560d2ad8666c88609e5246f1bc9f94aa0c6ba9f304c78cf
  E35:
    record: sn_nb_action_condition_based_rule/5026f4a6ff202110307fff97cddcbdec
    how: read rule Active incident
    result: 'active, order 200, active=true, short description set; roles itil, sn_incident_write'
    hash: 2cb4894800977ba2300a982f0f3c6aeccc0f735b77436a389127ac9639d70101
  E36:
    record: sn_nb_action_recommended_action/9214829c970f311007a138fce053afa2
    how: read AI Search Recommendation
    result: 'active; rule AI Search; resource generator AI Search Resource Generator; hint "This item may help you"'
    hash: 51517b71bab96045a2d70a54eba7fb9920e593e3788048dd5fc2837a9bfc042d
  E37:
    record: sn_nb_action_recommended_action/67042934ff43211001b9ffffffffffb0
    how: read Open incidents (CI & Service)
    result: 'inactive; hint "Make parent incident"'
    hash: 277a2465bdc8293b385e0d4157ddac3e23f60647aad0b4731a56df732e481165
  E38:
    record: sn_nb_action_recommended_action/ecc41c20ff43211001b9ffffffffff64
    how: read Open PRBs (CI & Service)
    result: 'inactive; hint "Link to a problem"'
    hash: d8a37852bb735c9653928c0f356cdaa79c84c0020ca814a9ebdf5230f495c0f6
  E39:
    record: sn_nb_action_recommended_action/889bd2a4ff03211001b9ffffffffff63
    how: read Similar Resolved incidents (CI & Service)
    result: 'inactive; hint "Copy resolution notes"'
    hash: 02f0ccb9f9d54142d4a64f66a0b0088f204707e68230c711628c1678336077ea
  E40:
    record: sn_nb_action_resource_generator/daa38a5c970f311007a138fce053afd2
    children: sys_variable_value
    how: read AI Search Resource Generator and its inputs
    result: 'type AI search; search term {{vp_context.short_description}}, top 5 results'
    hash: 5e880bbfde7d3148d39ae267fbf4d21905b22c9f486dcff7554ebe68bb20b0c3
  E41:
    record: sys_search_context_config/ce74806c978aca10bacc3aece053afa5
    how: read [AIS] Recommended Actions for ITSM Search Config
    result: search_engine ai_search, 10 results, 1 genius result
    hash: 16821032ee4111531281f5398216f0916bd3a9f5129d94ae9d7298303be32b92
  E42:
    record: sn_nb_action_search_result_ra_mapping/33b4ca9c970f311007a138fce053af48
    how: read the knowledge mapping of the Incident context
    result: kb_knowledge results become the guidance Attach and share article
    hash: 9f593f01156a8c57ea2216b6849d2e6138d1c1773b6ae19f4ae83e75ee05b034
  E43:
    record: sn_nb_action_search_result_ra_mapping/7cd50a10974f311007a138fce053aff1
    how: read the incident mapping of the Incident context
    result: incident genius results become the guidance Show genius result
    hash: e322771cd7f7d3a4b0b089ea658ba90426f9655c1d3f4518f52ffef8136ac853
  E44:
    record: sn_nb_action_search_result_ra_mapping/589bbe02fba6ce105037fc785eefdc3d
    how: read an sn_itsm_ra mapping for the Incident context
    result: incident results become the guidance [Task] Link incident; sibling mappings do the same for problem, change_request, cmdb_ci_outage and sc_cat_item
    hash: 5c1e384016f340752c5ce9e702ee67ccfd94eaad5dd6b06e674e956a191d72c1
  E45:
    record: agent_assist_recommendation/13d130a0313b6300964fa7ff5fe4a729
    how: read Common Incident Resolutions (sn_agent_recommend)
    result: 'active; source agent_intelligence; ML definition Similar Incidents; table configuration e15061a4b30303002bf182c136a8dc34, not the one Service Operations Workspace uses'
    hash: a74596340cd231dbdbb8495cc0bbcd7275ec92612622af0261757813ef0c27a3
  E46:
    record: cxs_table_config/e15061a4b30303002bf182c136a8dc34
    how: read Agent Assist [incident] (global)
    result: the older configuration, context Incident Deflection, used by the Agent Workspace action
    hash: d11710e5a659ae1f861b91c8ce8e6a86325e4beceedd91b5bc17569a6bc0b3cd
  E47:
    record: sys_script_include/b221e1ba73332300e64cc1f52ff6a7b6
    field: script
    how: read AgentAssistRecommendationHelper.getRecommendation
    result: 'looks up recommendations by table configuration; needs an active trained solution (MLPredictor.findActiveSolution), then a trend from the similar records'
    hash: 4537b41adf3084be28b1770f0d5639a6699c5eeea91221fdd235214c35350512
  E48:
    record: ml_capability_definition_similarity/87ea2f1053c40010d1dcddeeff7b12e9
    how: read Similar Incidents
    result: 'definition active, solution ml_sn_global_similar_incidents, incidents of the last 6 months, training every 90 days, update every 15 minutes'
    hash: a1e5999f049344c7e6083de1576101f2a42f0c1b3c094d9a212f542ed0a69a4b
  E49:
    record: ml_capability_definition_classification/0bea2f1053c40010d1dcddeeff7b12ec
    how: read Incident Assignment
    result: definition inactive (assignment group)
    hash: e3a5c4888432a1f72c1c9f008000afb2fc469602eaebcf044fd7d67da3167556
  E50:
    record: ml_capability_definition_classification/cfea2f1053c40010d1dcddeeff7b12ef
    how: read Incident Categorization
    result: definition inactive (category)
    hash: d807d3801ad11842f7256f11166ff091f9ae2f231bcff3cb544497e7fc5827a7
  E51:
    record: cxs_search_res_config/0c24b6db73331300d144234ffff6a7e2
    how: read Similar Incidents (search resource)
    result: an ML search resource on incident (Similar Incidents definition); no resource context of Incident Deflection (SOW) uses it
    hash: bb13fa2a7d4429765434aa83cdecb661b60b69dfd274ccf1bda6d7cdbdddc133
  E52:
    record: sys_declarative_action_assignment/a87249b553332300099addeeff7b1228
    how: read Agent Assist (sn_itsm_workspace)
    result: 'contextual side bar action on incident for the workspace Agent Workspace (7b24ceae…), active=true, roles sn_incident_write or itil, configuration e15061a4…'
    hash: d4c6306369da5683da97f7e8db5b75601144654649cafc56752c00caff45ad5b
  E53:
    record: sys_properties/23c3f4ba777210108c8e303697106101
    how: read com.snc.contextual_search.min_length
    result: '3'
    hash: adf0e5d8143d1a7f03227be323a96c11acf82bfd5da39ed4b7547984faf7a6e2
  E54:
    record: sys_properties/a4ddef01372121003e7d40ed9dbe5dff
    how: read com.snc.contextual_search.result.default.limit
    result: '10'
    hash: e9bc15fc54e2f199017d1f7f9d5f0395baa122e9ea0fef900d1957471afb29a2
---
## The applications {label=NEW}

| Scope | What it gives |
|---|---|
| `sn_sow` | the side panel tabs **Agent Assist** and **Recommendations** in Service Operations Workspace [E01] [E02] |
| `sn_ui_agent_assist` | the Agent Assist component (`now-agent-assist`) |
| `sn_sow_inc` | incident's Agent Assist search configuration, its sources' actions, and the Recommendations *Incident context* [E05] [E32] |
| global (Contextual Search) | the search sources, the result actions and their REST operations [E14] [E22] |
| `sn_itsm_ra`, `sn_nb_action`, `sn_nba_list` | Recommended Actions: the Recommendations panel, its screen and guidances [E30] |
| `sn_agent_recommend` | Agent Assist recommendations from Predictive Intelligence, for the older Agent Workspace [E45] |
| `sn_itsm_workspace` | the Agent Assist action of the older Agent Workspace, not used by Service Operations Workspace [E52] |

Agent Assist on pdi2 is Contextual Search: a keyword search over tables. It uses neither AI Search
[E21] nor Predictive Intelligence. [E14] [E15] [E51]

## 1. The Agent Assist tab {label=NEW}

1. The route *Agent Assist* puts the tab in the record page's side panel, order 300. [E01]
2. The screen *Agent assist SNC* shows it for incident and eight other tables. Its configuration
   maps each table to a search configuration. [E03] A client script picks the right one. [E04]
3. For incident: *Agent Assist [incident]* in `sn_sow_inc`. It applies only to active incidents,
   has no required roles, and offers a source selector. [E05]

No role restricts the tab beyond the workspace itself. [E03] [E05]

## 2. What it searches {label=NEW}

The search term is the short description [E06], at least 3 characters [E53]; 10 results a page
[E05] [E54]. The context *Incident Deflection (SOW)* [E07] has these sources:

| Order | Source (resource context) | Search resource | Records |
|---|---|---|---|
| default | Knowledge & Catalog [E07] | searcher: knowledge, pinned knowledge, catalog interleaved [E20] | knowledge [E08] [E14]; catalog, all catalogs [E09] [E15] |
| 100 | Outages [E10] | `GlideRecordSearchResource` | `cmdb_ci_outage`, last 6 months [E19] |
| 200 | Incidents [E11] | `GlideRecordSearchResource` | `incident`, last 6 months [E17] |
| 300 | Open Incidents [E12] | `GlideRecordSearchResource` | active, last 3 months, not under an accepted major incident [E16] |
| 400 | Resolved Incidents [E13] | `GlideRecordSearchResource` | resolved or closed, last 3 months, six resolution codes [E18] |

The ML resources *Similar Incidents*, *Similar Open Incidents*, *Similar Resolved Incidents* and
*Similar Knowledge Articles* exist but are not in this context. [E51]

## 3. Actions on results {label=NEW}

Each source has its own `cxs_ui_action_config` records under *Agent Assist [incident]*:

| Result | Actions | Notes |
|---|---|---|
| Knowledge, pinned article | Attach, Flag Article, Full View, Helpful | Attach writes an embedded link into `comments` [E28]; Flag only where the knowledge base allows suggestions [E29] |
| Catalog item | Order, Request, Submit, Helpful | by the item's request method |
| Open, recent and resolved incidents | Link to Incident, Copy Resolution, View Full, Helpful | Link sets `parent_incident` on the current incident [E22] [E23]; Copy Resolution needs a resolution code or notes on the result [E27] |
| Outage | Link to Incident, View Full | inserts `task_outage`; `itil` or `sn_incident_write` [E26] |

Two REST operations are named `link_incident`: the global one [E23], and the `sn_sow_inc` one
with a dialog for work notes and comments, which only answers action ids containing "rest". [E24]
Its execute ACL allows `itil` and `sn_incident_write`. [E25] The Agent Assist action id is
`link_to:link_to_incident`. [E22]

## 4. Recommendations {label=NEW}

1. The screen *Recommended Actions Default* serves the Recommendations tab for saved incidents
   and nine other tables. [E30] Its condition calls `canViewRAPanel`: `itil` or
   `sn_incident_write` for incident. [E31]
2. The *Incident context* evaluates its rules synchronously, refreshes every 15 minutes and
   searches with the short description. [E32]
3. Rules: *AI Search* (`itil`) [E33], *Active non-child non-MI Incident* [E34] and *Active
   incident* [E35].
4. Recommended actions: only *AI Search Recommendation* is active. [E36] The three based on the
   CI and service are inactive. [E37] [E38] [E39]
5. *AI Search Recommendation* takes the top 5 AI Search results for the short description [E40],
   from a search configuration that uses the `ai_search` engine. [E41] Results are mapped to
   guidances: an article to *Attach and share article* [E42], an incident to *Show genius result*
   [E43] or *[Task] Link incident*, and the same for problems, changes, outages and catalog items.
   [E44]

**On pdi2, nothing reaches the panel:** `glide.ais.enabled` is false. [E21] To use it, switch AI
Search on and index the sources, or activate the CI and service recommendations, which use
scripted generators instead. [E37] [E38] [E39]

## 5. Predictive Intelligence {label=NEW}

| Solution definition | pdi2 |
|---|---|
| Similar Incidents (and Similar Open, Similar Resolved, Similar Knowledge Articles) | definition active, retrained every 90 days [E48] |
| Incident Assignment | inactive [E49] |
| Incident Categorization | inactive [E50] |

The mirror holds the definitions, not the trained solutions, so it can't show whether any model
was ever trained. Nothing in Service Operations Workspace's Agent Assist uses them: no source in
its context has an ML solution [E14] [E15] [E51], and the PI recommendation *Common Incident
Resolutions* is attached to the older table configuration [E45] [E46], used only by the Agent
Workspace action. [E52] Even there, it needs an active trained solution. [E47]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `glide.ais.enabled` | false | AI Search off; Recommendations empty [E21] |
| `com.snc.contextual_search.min_length` | 3 | shortest search [E53] |
| `com.snc.contextual_search.result.default.limit` | 10 | results per search [E54] |

## Open questions {label=OPEN-QUESTION}

1. Should AI Search be switched on, so that Recommendations work, or should the Recommendations
   tab be hidden for incidents?
2. Have the Similar Incidents solutions ever been trained on pdi2? The mirror doesn't hold
   `ml_solution`.
3. Which `link_incident` operation does Agent Assist call, and does the agent see the work notes
   and comments dialog?
4. Is the older Agent Workspace still in use? If not, its Agent Assist action and the *Common
   Incident Resolutions* recommendation do nothing.
5. Should Outages, catalog items or the 3-month and 6-month windows be adjusted for pdi2's data?
