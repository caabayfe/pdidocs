---
title: CI data and access - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_security_acl/8befa3be0a0a0b44015ec85eea1ca44c
    how: read the cmdb_ci write ACL for asset and itil
    result: itil can edit CIs
    hash: e5a5f132a1148fca2248f7f35bcba146c3e0c1433eee17be52f9981a964f5c3d
  E02:
    record: sys_security_acl/8bee9ba70a0a0b44001693883b4358bf
    how: read the cmdb_ci create ACL for asset and itil
    result: itil can create CIs
    hash: 1a5e6b95f6e619ed6c9975b1f90029cf2324373c51d85677bf6a6ecaa0ce471b
  E03:
    record: sysauto_script/dafaa231b7862210e1a480408e11a9b4
    how: read Remove CMDB Roles from ITIL roles…
    result: an on-demand job that would limit CI editing to the CMDB roles; not run
    hash: d26b960f66ccd29f670b95e3fd03a8ab408eadf39ab3a65ffabd292691b84907
  E04:
    record: sys_dictionary/a6023a7b8c9103100a22deb6dd2b4e33
    how: read cmdb_ci.support_group
    result: Support group
    hash: 8b955b25b82919d339234d4bced5973f057c5757c25479458bcfa532b5e002c1
  E05:
    record: sys_properties/88e57eecffa0a2105872ffffffffffb7
    field: value
    how: read sn_cmdb_ws.explore_ci.record.enabled (read and write role sn_cmdb_admin)
    result: '"true": records in the cmdb_ci hierarchy open on the Explore CI page in workspaces that have adopted it'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E06:
    record: sys_ux_data_broker_transform/e20d9d9c53821110f6fdddeeff7b12be
    field: script
    how: read CMDB Workspace - Resolve Routes
    result: a link to a record of a cmdb table goes to route ci-record when the property is true, otherwise to record; a record the user can't read goes to record
    hash: 1f2173696d28d623f037611d73b0e4966ab1f8702e1cdc54070c2f43cd13d04c
  E07:
    record: sys_ux_client_script/8fefdd1ea3f3121066189bd2361e61fc
    field: script
    how: read Redirect cmdb ci, on the record page (record-srp)
    result: on the record route, a saved record of a cmdb_ci extension is redirected to ci-record when the property is true; sysId -1 (a new record) stays
    hash: dfd79c6ecd04acdd8edd492027cabe6f35351a25d5688b71510fc585b3fe1a41
  E08:
    record: sys_ux_macroponent/d5da4451a367121066189bd2361e6170
    field: composition
    how: read Explore CI Header Default (sn_cmdb_ws)
    result: elements ci_header, class_name, open_map_button (event to route unifiedmap, hidden by the optional parameter hideOpenMap), configuration_action_bar; no declarative action bar
    hash: 83c3227274cf7640cfbe38985f6c81b0e7401bb5f33a938e26c6e1e32aebe0a5
  E09:
    record: sys_ux_client_script/3a3f51654f352210a27b87af20ce0b6f
    field: script
    how: read Set configuration actions
    result: Configure attributes for admin, maint, personalize_form; Configure resources for admin, maint, personalize_list
    hash: 62640e330ea72e8a53f48605ab9d81bd16266c33139f2129880c47f4ba3e9181
  E10:
    record: sys_ui_view/2713005f537320100764ddeeff7b1269
    how: read the view CMDB - Workspace (sn_cmdb_pg_templts)
    result: name cmdb_browse, no roles
    hash: 3acc7d0cb741881fed2c6c5121e79a8b92b019a7f8e1df7175375f6ae7ea4549
  E11:
    record: sysrule_view_workspace/360d3df9535030100764ddeeff7b127a
    how: read cmdb_ci_service - browse, one of the 130 view rules of sn_cmdb_pg_templts
    result: active, no condition, view cmdb_browse; each of the 130 names one class
    hash: 4ae9dec5d83cf65621c0dde21c268979b664c0b901b326ad227c01058e4a385d
  E12:
    record: sys_ux_m2m_workspace_view_rule_ux_view_rule_config/604a7960532430100764ddeeff7b120b
    how: read the link of cmdb_ci_service - browse to CMDB Workspace View Rules
    result: the view rules apply in the CMDB Workspace
    hash: 2fed8193eaa8f759a9c07ed32771489fd2094be08773e9c531472a711bd99093
  E13:
    record: sys_ui_action/f9c2f25ab710301094bb21208e11a9b7
    field: condition
    how: read Create incident (cmdb_ci)
    result: 'new GlideRecord(''incident'').canCreate() && gs.hasRole("sn_incident_write"); workspace More actions menu; opens incident -1 with cmdb_ci set'
    hash: 9b59ed0b8853f05e2a4fe7392de20e8228f6a81f16743db7ac50d8d159805132
  E14:
    record: sys_ui_action/e7bef692b750301094bb21208e11a9c9
    field: condition
    how: read Create change (cmdb_ci)
    result: new GlideRecord("change_request").canCreate(); More actions menu; opens change_request -1 with cmdb_ci set
    hash: 49e6a1bf23d278f3cf4134882e38908f37b082894aa734a6fb99abf9cb5054bc
  E15:
    record: sys_ui_action/81c5badab710301094bb21208e11a92d
    field: condition
    how: read Open dependency view (cmdb_ci)
    result: current.isValidRecord(); workspace button; opens /$ngbsm.do?id=<CI> in a new window
    hash: 5f7b675ce0b5e61f4581a1ae06a81a06f1c0763ecd6efa9b4ec418f0f19c3f10
  E16:
    record: sys_ui_action/ef76721eb710301094bb21208e11a9d4
    field: condition
    how: read View CMDB 360 Data (cmdb_ci)
    result: glide.identification_engine.multisource_enabled is true, the plugin com.snc.itom.discovery.license is active, and the record is saved; opens $multisource_query_report_data_preview.do
    hash: ca675c23900c8f846b8e0f76638ebda66f1feb35f0859bfcdf2371547d6bdfcf
  E17:
    record: sys_ui_action_view/d604769ab710301094bb21208e11a973
    how: read the view restriction of Create incident (the other three have one each)
    result: include, view cmdb_browse only
    hash: af6b777eb75b5de457b3e77688ecb2a389068d3ec97465e52d0baeab863bfff8
  E18:
    record: sys_properties/6fd83eec5b020110693e7da52d81c738
    field: value
    how: read glide.identification_engine.multisource_enabled
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E19:
    record: sys_ui_action/f756edc77f59521061ea02c9ec8665b7
    how: read Open Dependency View (cmdb_ci_business_process, sn_cmdb_pg_templts) and its view records
    result: 'replaces the global action of the same name in the view workspace (one record includes this one, one excludes the global); More actions menu; not formatted for configurable workspaces'
    hash: 4c3f0eab6803a75771e158690c48a80879b448e3766baf7e8ce0f5f8f6cca437
  E20:
    record: sys_script/e93b30e753e830100764ddeeff7b1232
    field: script
    how: read Check Domain Separation Enabled (display, cmdb_ci)
    result: puts in the scratchpad whether com.glide.domain.msp_extensions.installer is active; the client script Hide Domain Separation Attributes hides the form section domain_separationattributes when it isn't
    hash: 4899123186f298a6f19a0b457becb69af582f01b4c7c626c42236be642b0f3ae
---
## Who can edit CIs {label=OPEN-QUESTION}

Anyone with `itil` can create, edit and delete CIs [E01] [E02]. The platform offers a job that
moves those rights to the CMDB roles [E03]; it hasn't been run. Should the service desk keep
editing CIs?

## Data owners

Ask CI owners to fill the **Support group** [E04] and Change Group: most CIs here have neither.

## The CI page and the CI form {label=NEW}

The CMDB Workspace has two ways to show a CI:

| | CI page (Explore CI) | CI form |
|---|---|---|
| Route | `ci-record` | `record`, view `cmdb_browse` (*CMDB - Workspace*) [E10] |
| Built by | `sn_cmdb_ws` | `sn_cmdb_pg_templts`: 130 view rules, one per class, 129 of them linked to *CMDB Workspace View Rules* [E11] [E12] |
| Header actions | **Open map**, and **Configure attributes** / **Configure resources** for admins and the personalize roles [E08] [E09] | **Create incident**, **Create change**, **Open dependency view**, **View CMDB 360 Data** [E13] [E14] [E15] [E16] |

`sn_cmdb_ws.explore_ci.record.enabled` is true [E05], so every link to a CI resolves to the CI page
[E06], and the record page redirects any saved CI there. [E07] The four form buttons are limited to
the `cmdb_browse` view [E17], so on pdi2 they show nowhere for a saved CI: not on services, not on
any other class.

| Button | Condition | Would do |
|---|---|---|
| **Create incident** | can create incidents and has `sn_incident_write` [E13] | new incident with this CI |
| **Create change** | can create changes [E14] | new change with this CI |
| **Open dependency view** | saved record [E15] | classic dependency view in a new window |
| **View CMDB 360 Data** | multisource on, Discovery licence plugin active, saved record [E16] | CMDB 360 preview; off here, multisource is false [E18] |

On a business process, `sn_cmdb_pg_templts` also swaps the global **Open Dependency View** for its
own in the `workspace` view. [E19] Its domain separation script hides the domain section of the
form when domain separation extensions aren't installed. [E20]

## Open questions {label=OPEN-QUESTION}

1. Keep the CI page? Turning `sn_cmdb_ws.explore_ci.record.enabled` off (`sn_cmdb_admin`) brings
   back the form and its **Create incident** and **Create change**, and loses the CI page's
   sections. [E05]
2. If the CI page stays, should **Create incident** and **Create change** be added to its header?
   It has no declarative action bar today. [E08]
3. **Create incident** and **Create change** are also allowed on a **new** CI's form, the only
   case that stays on the form [E07] [E13] [E14]; there they would open a ticket for an unsaved
   CI. Should they be hidden on new records?

