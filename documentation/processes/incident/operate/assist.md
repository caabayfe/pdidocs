---
title: Find answers with Agent Assist and recommendations
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-18
      where: Service Operations Workspace › incident › side panel › Recommendations, Agent Assist
    how: looked at the icons in the incident's side panel
    result: the side panel has a Recommendations icon and an Agent Assist icon
  E02:
    record: sys_ux_app_route/4a8f70f443b47110cc25ff53e9b8f291
    how: read the Agent Assist side panel tab of Service Operations Workspace
    result: tab Agent Assist, graduation cap icon, order 300 among the side panel tabs
    hash: a659a08d55a93c4fa36fcf479beb3137b72720436482b262b2d5e950672572e1
  E03:
    record: sys_ux_app_route/55d218a4eb98b1104c32ddde235228a6
    how: read the Recommendations side panel tab
    result: tab Recommendations, bell icon, order 200, route next_best_action (Recommended Actions)
    hash: 1c73636b89e5703f006620fb402be64eb94f1d520b0fea570d7c3387528909a4
  E04:
    record: sys_ux_screen/468f70f443b47110cc25ff53e9b8f296
    field: macroponent_config
    how: read Agent assist SNC, the screen behind the tab
    result: 'shown for incident, problem, problem task, change, change task, knowledge, interaction, alert and universal request; for incident it uses the search configuration "Agent Assist [incident]" b41ff94577300110b3771aceca5a992e'
    hash: 2320733a0cddced0e473b439f9d785a327dcedac60acbcf9185ab475711c0cd7
  E05:
    record: cxs_table_config/b41ff94577300110b3771aceca5a992e
    how: read Agent Assist [incident] (sn_sow_inc)
    result: 'active; only for incidents matching active=true; header "Agent Assist"; source selector on; 10 results a page; context Incident Deflection (SOW)'
    hash: 54dd96e1e5f1d86e72423611a6991831a610b8d5a88aa4216a9a7833d39bab3f
  E06:
    record: cxs_table_field_config/694fbd4577300110b3771aceca5a9971
    how: read the search field of Agent Assist [incident]
    result: the search term is the incident's Short description (default)
    hash: 0d501b519de30a4111431116c753c71406e479808f29b24445f0e6a167f8b172
  E07:
    record: cxs_context_config/893a754177300110b3771aceca5a99e8
    how: read Incident Deflection (SOW)
    result: 'default source "Knowledge & Catalog" (knowledge first); wildcard search on'
    hash: 256cde2985d46884cc37d06d8ea26fac2a6b789b502f68aede3cc2c31730bf11
  E08:
    record: cxs_searcher_config/2ccd7541c31121005655107698ba8f2c
    how: read Knowledge, pinned knowledge and catalog
    result: one source that interleaves knowledge articles, pinned knowledge articles and catalog items
    hash: a2c9337039cfa4cf28fe0fc5cdf12f2032fc869cf896dad9d71786f7c704a883
  E09:
    record: cxs_search_res_config/8564187a535b130005ecddeeff7b1268
    field: condition
    how: read Open Incidents
    result: active incidents created in the last 3 months, except children of an accepted major incident
    hash: 1f1a7fcf06f7cdc15e6897224db387d73e2616d1cbfb3ddb35b1ca3d95cfecdc
  E10:
    record: cxs_search_res_config/a4ed15d087452300fb3ad61e36cb0bf3
    field: condition
    how: read Incidents
    result: incidents created in the last 6 months, any state
    hash: 1a29f7dfd0ac066faef0f5ba8ebf37902c5a221036260b4105159e41a2ffbb5a
  E11:
    record: cxs_search_res_config/95c59c7a535b130005ecddeeff7b12d4
    field: condition
    how: read Resolved Incidents
    result: 'resolved or closed incidents created in the last 3 months, with resolution code Known error, Resolved by change, Resolved by problem, Resolved by request, Solution provided or Workaround provided'
    hash: 6e0f8cec1b563754abb158efedb0ef1313f84dac4289d7b32c3a95b95d26d5aa
  E12:
    record: cxs_search_res_config/a663c14f530b33005e32ddeeff7b1282
    field: condition
    how: read Outages
    result: outages (cmdb_ci_outage) created in the last 6 months
    hash: 1a29f7dfd0ac066faef0f5ba8ebf37902c5a221036260b4105159e41a2ffbb5a
  E13:
    record: sys_ux_lib_component/9873ed15229a74ad4927707f31a0e56e
    field: required_translation_keys
    how: read the labels of the Agent Assist component (now-agent-assist)
    result: 'Attach Article, Add Comments, "Details of {0} have been added to the {1} field", "You are linking the current {0} as a child to {1}.", "{0} has been set as the parent of this {1}", Flag Article, "Please provide a comment:", Copy Resolution, "You are applying the resolution code and notes from {0} to {1}.", "Resolution details are copied", No Matches Found, "Try modifying your search text or filter to find what you’re looking for.", Select a search resource, Pinned Article, Helpful'
    hash: 1e7d9f54d57d9c0bb4199ee8a2e5d0ef00dd4fd2a34dfe2c0f9e2795647cdb72
  E14:
    record: sys_ux_macroponent/6be07316430131107f08ff53e9b8f260
    how: read the events the Agent Assist SNC page handles
    result: the component can set a value on the incident form, save the record, run a form action, open a result in a workspace tab and insert a knowledge link in an email being written
    hash: 49577681565ab4b001b75e8b4cca65e8123ae20f88ece2fef18eb4e693768e5b
  E15:
    record: cxs_ui_action_config/683f0d5a77300110b3771aceca5a99e2
    how: read Attach on knowledge results
    result: 'puts a link to the article in Additional comments (comments, embed_link); the result is then badged "Attached" and the action becomes "Unattach"'
    hash: d5b992b5e58c44cc8aaa26b847492fc724b2119b85f18e71a7ac51e414e5cc4e
  E16:
    record: cxs_ui_action_config/343f0d5a77300110b3771aceca5a99e6
    field: action_condition
    how: read Flag Article on knowledge results
    result: shown only when the article's knowledge base allows suggestions (disable_suggesting is false)
    hash: a51cd3ce105710d2b70a092b5074e8eaa1d46242aacbc99b131776d0c2554e30
  E17:
    record: cxs_ui_action_config/3c3f0d5a77300110b3771aceca5a99ea
    how: read Helpful on knowledge results
    result: 'action "Helpful", undone with "Not Helpful", badge "Helpful"; every source has a Helpful action'
    hash: 0760a955a2b6ef5670eb0b6100c9f431e385f576620d4de91638aaa603adb1d5
  E18:
    record: cxs_ui_action_config/b5198e8d77300110b3771aceca5a9966
    field: ui_action_visibility_script
    how: read Link to Incident on Open Incidents results
    result: shown only when your incident has no parent incident and the result is not already its parent; with Major Incident Management active, neither may be a major incident
    hash: 5e6fc26732ac9978a12c629b909850fda2898aa2c7e97cb8ec1817ad4bb1803e
  E19:
    record: sys_ws_operation/51a836e0b32023002bf182c136a8dc60
    field: operation_script
    how: read link_incident (/api/now/cxs_actions/link_incident)
    result: 'refuses with "Roles are insufficient to perform the action" unless you can write Parent incident; for Agent Assist it returns the result''s number, and the result becomes the Parent incident of your incident'
    hash: 7f8142e1589047420e778e5710c5c12353dc8daaada0decf154cff948e3dc089
  E20:
    record: cxs_ui_action_config/e1198e8d77300110b3771aceca5a9961
    field: action_condition
    how: read Copy Resolution on incident results
    result: shown only for a result with a resolution code or resolution notes
    hash: 81d8c036c0dfc60f617894792e1edf552a0b352646b981aa63e4b5a8abc1ba1f
  E21:
    record: sys_ws_operation/c0168ad753c333005e32ddeeff7b123b
    field: operation_script
    how: read link_inc_to_outage
    result: 'needs itil or sn_incident_write; a "Link to incident" dialog ("You are linking the current {outage} to {incident}") with optional Work notes (Private) and Additional comments (Customer visible); then links the outage to the incident (task_outage)'
    hash: 3e85c4ef71c46311aa276424bc5d83efac8625368828224ed3e08ce9493523e7
  E22:
    record: cxs_ui_action_config/4260128577700110b3771aceca5a9960
    field: ui_action_visibility_script
    how: read Link to Incident on Outages results
    result: hidden when the outage is already linked to the incident
    hash: 28e32ab2b0c0011d8727d8fb51be228e619f53d973ff8b388f8e42db24d7a4db
  E23:
    record: cxs_ui_action_config/254fbd4577300110b3771aceca5a995e
    field: ui_action_visibility_script
    how: read Order on catalog results
    result: Order for ordinary items; items whose request method is Request or Submit show Request or Submit instead
    hash: c835297b56937d19bbcc72dae5f18be50e7f85a84bae94284414d0bb301e54b2
  E24:
    record: sys_properties/23c3f4ba777210108c8e303697106101
    how: read com.snc.contextual_search.min_length
    result: '3: a search needs at least three characters'
    hash: adf0e5d8143d1a7f03227be323a96c11acf82bfd5da39ed4b7547984faf7a6e2
  E25:
    record: sys_ux_screen_condition/e670bfa71b7e025022bc0d81604bcb6c
    field: script
    how: read the condition of the Recommendations tab
    result: calls RecommendedActionsSOWUtil.canViewRAPanel for the record's table
    hash: dc5fe388f97e6f1ed2fb6cd1f6f553cd16186dc571e73cc0108777801cadea7c
  E26:
    record: sys_script_include/2dda2f231b7e025022bc0d81604bcb9b
    field: script
    how: read RecommendedActionsSOWUtilSNC.canViewRAPanel
    result: for incident, incident task and interaction, the Recommendations tab needs itil or sn_incident_write
    hash: bdf5d5a93108c9b76e7de81a53609d7d493822c6117ef7c2df1cba3b04c27262
  E27:
    record: sn_nb_action_recommended_action/9214829c970f311007a138fce053afa2
    how: read AI Search Recommendation (Incident context)
    result: 'the only active recommendation for incidents: AI Search results for the short description, with the hint "This item may help you"'
    hash: 51517b71bab96045a2d70a54eba7fb9920e593e3788048dd5fc2837a9bfc042d
  E28:
    record: sys_search_context_config/ce74806c978aca10bacc3aece053afa5
    how: read [AIS] Recommended Actions for ITSM Search Config
    result: search engine ai_search
    hash: 16821032ee4111531281f5398216f0916bd3a9f5129d94ae9d7298303be32b92
  E29:
    record: sys_properties/a3f1bb94ff031010b7b67677d53bf1a0
    how: read glide.ais.enabled
    result: 'false: AI Search is switched off'
    hash: df9bd22689501b27f52fa049d9bc65d4ed1536140e1e0b04b5020c134ee200b3
  E30:
    record: sys_ux_lib_component/2baa1022bc848a1ce2e2e04555e91333
    field: required_translation_keys
    how: read the labels of the Recommendations list (sn-next-best-action-list-connected)
    result: 'Recommendations, Suggested actions, Actions history, "No active recommendations", "No recommendations to show", "Taking longer than usual to find recommendations", Retry, Dismiss, "This recommendation was dismissed"'
    hash: 480f86f18f16240b39f2326a34ba53fe4541613aa73eb5ea070e02574bed9da3
---
## Agent Assist or Recommendations {label=NEW}

The incident's side panel has two icons that look for help with the incident for you [E01]:

| Icon | What it does | On pdi2 |
|---|---|---|
| **Agent Assist** (graduation cap) | searches knowledge, the catalog, other incidents and outages with the incident's short description, and lets you act on a result [E02] [E06] | works, with a keyword search [E05] |
| **Recommendations** (bell) | suggests actions found by AI Search [E03] [E27] | finds nothing: AI Search is switched off [E29] |

Neither uses Predictive Intelligence (machine learning) on pdi2: no trained model ranks or
suggests anything in either panel. The configuration page explains why.

## Search with Agent Assist {label=NEW}

{{animation:incassist}}

1. Open an **active** incident in the workspace and choose the **Agent Assist** icon in the side
   panel. [E04] Agent Assist isn't offered on resolved or closed incidents. [E05]
2. Agent Assist searches with the incident's **Short description**. [E06] If that finds nothing
   useful, change the words in the search box; a search needs at least three characters. [E24]
3. Choose a source in the selector [E05] [E07]:

   | Source | Searches |
   |---|---|
   | **Knowledge & Catalog** (the default) | knowledge articles, pinned articles and catalog items together [E08] |
   | **Outages** | outages created in the last 6 months [E12] |
   | **Incidents** | incidents created in the last 6 months, open or not [E10] |
   | **Open Incidents** | active incidents from the last 3 months, without children of an accepted major incident [E09] |
   | **Resolved Incidents** | incidents resolved in the last 3 months with a useful resolution code, such as *Solution provided* or *Workaround provided* [E11] |

4. Results come ten at a time. [E05] Open one to read it, or act on it straight from the list
   (see below).

When nothing matches you see *No Matches Found* and "Try modifying your search text or filter to
find what you’re looking for." [E13]

## What you can do with a result {label=NEW}

| Result | Action | What happens |
|---|---|---|
| Knowledge article | **Attach** | a link to the article goes into the incident's **Additional comments**, which the caller sees; the result is marked *Attached*, and **Unattach** takes it back [E15] [E13] |
| Knowledge article | **Flag Article** | asks "Please provide a comment:" and flags the article for its owners; only where the knowledge base accepts suggestions [E16] [E13] |
| Any result | **Helpful** | records that the result helped; **Not Helpful** undoes it [E17] |
| Any result | **Full View** / **View Full** | opens the record in a workspace tab [E14] |
| Open, recent or resolved incident | **Link to Incident** | after you confirm "You are linking the current … as a child to …", the result becomes your incident's **Parent incident** [E13] [E19] |
| Open, recent or resolved incident | **Copy Resolution** | "You are applying the resolution code and notes from … to …": fills **Resolution code** and **Resolution notes** on your form [E13] [E20] |
| Outage | **Link to Incident** | a *Link to incident* dialog, with optional work notes and additional comments, then links the outage to your incident [E21] |
| Catalog item | **Order** (or **Request**, **Submit**) | starts the item's request [E23] |

**Link to Incident** appears only while your incident has no parent, and never between major
incidents. [E18] Linking an outage needs `itil` or `sn_incident_write`, and the action disappears
once the outage is linked. [E21] [E22] Linking needs the right to change *Parent incident*. [E19]

Attaching an article is the quickest way to give the caller an answer. For the other ways to share
knowledge, see [Share knowledge with the caller](see:incident/share-knowledge).

## Recommendations {label=NEW}

The **Recommendations** icon opens a list of *Suggested actions* and an *Actions history*. [E30]
For incidents it is shown to `itil` and `sn_incident_write`. [E25] [E26]

On pdi2 the list stays empty. The only active recommendation for incidents is *AI Search
Recommendation* [E27], which needs AI Search [E28], and AI Search is switched off. [E29] Expect
"No active recommendations" or "No recommendations to show". [E30] Use **Agent Assist** instead.

## Tips

- Write a clear short description first: it is what Agent Assist searches with. [E06]
- Try **Resolved Incidents** before **Incidents**: it keeps only incidents closed with a real fix.
  [E11]
- Check what **Copy Resolution** put in the resolution fields before you resolve: it copies
  another incident's words. [E13] Then save the incident.
- **Attach** writes to Additional comments, which the caller reads. Use it only for articles the
  caller can follow. [E15]

## Not yet seen {label=OPEN-QUESTION}

1. The Agent Assist and Recommendations panels were not opened on screen; only their icons were
   seen. [E01] Does the source selector show these five sources, does the search start on its
   own when the panel opens, and what does the panel show on a resolved incident? [E05]
2. Does **Attach** save the incident at once, so the caller is told, or must the agent save the
   form? The component can do either. [E14]
3. What does **Order** do from an incident: does it open the item for the caller, and is the new
   request linked to the incident?
4. Is the Recommendations panel expected to stay empty, or should AI Search be switched on?
5. Can callers read the attached articles? Knowledge access depends on each article's user
   criteria, which the mirror doesn't show.
