---
title: Knowledge bases - configuration
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: classic list Knowledge Bases (kb_knowledge_base)
    how: read the list
    result: 4 records (IT, Known Error, Knowledge, KCS Knowledge Base (demo data)); only the KCS one has a checklist; owners not recorded
  E02:
    record: sc_cat_item_producer/81c887819f203100d8f8700c267fcfb5
    how: read Request Knowledge Base
    result: 'table kb_knowledge_base_request; catalogs Service Catalog and Technical Catalog; no roles; no flow on the producer; the script redirects to catalog_home.do with an info message'
    hash: 8f42e456f583399f13102592608524713e874c8cd15cefbe1d6d83b003019a59
  E03:
    record: sys_hub_flow/7953111f83831210730e5b43c22bc0ac
    children: sys_hub_trigger_instance_v2
    how: read the trigger of Request new Knowledge Base
    result: created on kb_knowledge_base_request, runs in the background, as the user
    hash: ccb0cea916d82a4e8880e2a359d66d1e907644417503dd25b5040f17615ac84d
  E04:
    record: sys_hub_flow/7953111f83831210730e5b43c22bc0ac
    children: sys_hub_action_instance_v2
    how: read the steps of Request new Knowledge Base
    result: 'Ask for approval on the request: approves or rejects any of one static user (6816f79cc0a8016401c5a33be04be441, the default admin account); approved: Create KB; the subflow Send Email for Knowledge Base Request (sys_hub_flow/d647f21a835f1210730e5b43c22bc0ec) sends "A new Knowledge Base has been requested" (admin@example.com), "Knowledge Base request approved" and "Knowledge Base rejected" (requested_for''s email)'
    hash: 17a519f5ed47e0109d1ee922c5ee9693300f1f88ff7f19e7e558887f68709690
  E05:
    record: sys_hub_action_type_definition/9b5d8ffd3bcfd6104b63e554c3e45aea
    how: read Create KB
    result: creates the knowledge base with the requester as owner
    hash: 0b2ab991821a5a761a462c636da85e8d095655e17199942fbf315c1d518c2fd1
  E06:
    record: sys_properties/ba9192001b1331008de2b9088f07133f
    how: read glide.approval_engine.kb_knowledge_base_request
    result: no value in the mirror
    hash: 74426b213d7dcf468463ca2e6b553a4f5b91b19a59c28166953156571a7a64a3
  E07:
    record: sys_security_acl/06844433bf202100216a85ce2c0739c3
    field: script
    how: read the create, write (ce390073bf202100216a85ce2c073962) and delete (d3990073bf202100216a85ce2c07395e) ACLs on kb_knowledge_base
    result: create KBKnowledgeBase.canCreate; write canWrite (multi-update allowed); delete canDelete
    hash: 86e9e2d0ca84cc72938b63290528b572906fefcf75506a453faf98f91c4dbd66
  E08:
    record: sys_script_include/2d407422c30221000096dfdc64d3aeca
    field: script
    how: read KBKnowledgeBaseSNC
    result: canCreate isAdminUser; canWrite isAdminUser, owner or manager; canDelete false
    hash: 3545bfb77cc9a167a5e315322cd2b05a6f7d3558c2357e4437a1ad1dcb061817
  E09:
    record: sys_script/70860eb3bf3021003f07e2c1ac07398f
    field: script
    how: read Duplicate Knowledge Base
    result: refuses a title another knowledge base has
    hash: 18f90da22b0ebf3d995f0968f3237279dc5f03c60c98afb2ef5e3296c7e5ff83
  E10:
    record: sys_script/ff215a229f112100a04d7e50d67fcf0a
    field: script
    how: read Update knowledge_manager roles (after insert or update, owner or managers not empty)
    result: calls KnowledgeSecurityManager.updateKnowledgeManagers with the current and previous owner and managers
    hash: bbaccee9860cee6ca279c63fd4911546974673360dc5b0300ea2ee501a4fd912
  E11:
    record: sys_script_include/6bf2247bb712230026778d78ee11a9fb
    field: script
    how: read KnowledgeSecurityManagerSNC.updateKnowledgeManagers, addRole, removeRole
    result: inserts sys_user_has_role for knowledge_manager unless held directly; removes it from previous ones who no longer own or manage any knowledge base
    hash: 95574868b7a85dd82a0a6b90cf9b2d3f6cf12f42eb7a3c912d05732eb5dcea9b
  E12:
    record: sys_script_client/9e6b43f3d730210013ab49547e61031d
    field: script
    how: read Display owner info message, and Display manager info message (sys_script_client/7d70413dd701210013ab49547e6103ab)
    result: field messages through UserHasRoleAjax when the chosen users lack knowledge_manager
    hash: 667d1437d45806488be8c8b456f4e3de098c6f9851ecdc100e23e088f0b1fba3
  E13:
    record: sys_dictionary/18487ab38c5903100a22deb6dd2b4eab
    how: read kb_knowledge_base.kb_publish_flow, kb_retire_flow (sys_dictionary/1c487ab38c5903100a22deb6dd2b4ea9), workflow (sys_dictionary/fd457eff8c5503100a22deb6dd2b4e14) and retire_workflow (sys_dictionary/79457eff8c5503100a22deb6dd2b4e16)
    result: the flow fields are active; the legacy workflow fields are inactive
    hash: 900a82c2c6f01c7bc76e5f4d31bf003386a6569db4de2dd800201242806bed0b
  E14:
    record: sys_script/07c35286fc05ae10f877d15605e71613
    field: script
    how: read Populate Default Flows if Empty (before insert, when the workflow field is inactive)
    result: kb_publish_flow defaults to Knowledge - Instant Publish (2222030614f75210f8779da9137d35b3), kb_retire_flow to Knowledge - Instant Retire (ea32fac859c02210f877a8ba01addda2)
    hash: 7d81775b8d139b4c5fdc6fb4c3b5e6604001d314faea5004caf6f08da2fb8346
  E15:
    record: sys_script/bdb975943ddc6610f877c8d53ca9c2ff
    field: script
    how: read Validate Flow Engine selection (before insert or update, when the workflow field is active)
    result: only runs if the legacy workflow fields are switched on; then either both workflows or both flows are mandatory
    hash: b68c4f89e4fec4acf043494c6ceeaaaf6797ac0530b10149b999a73972525e25
  E16:
    record: sys_script/d5075636b7322300bc1308a9ee11a973
    field: script
    how: read Change workflow when KB changes (after update on kb_knowledge in Review when the knowledge base changes)
    result: cancels the pending approval and publishes again through the new knowledge base's flow
    hash: c332cbbc2f5066e9e4264b83190b582e3869f7f446132af92d782ec477e0fd15
  E17:
    record: sys_script/d01bb6509f112100a04d7e50d67fcf50
    field: script
    how: read Set mandatory fields (before, global knowledge bases)
    result: keeps one data policy per knowledge base on kb_knowledge (enforced in the UI) for its Mandatory fields
    hash: 9d88f54999553bf70215acb69ed738d7fd5ba6173e2f1786f6128a04b6eb16b7
  E18:
    record: sys_script_client/47814262bf1121003f07e2c1ac0739d5
    field: script
    how: read Lock slushbucket for non admin users
    result: only admin can change Mandatory fields on the form
    hash: 8e45d32d8da2625e0bcfca60be4a924940776b692c2011bed58272b393940cfa
  E19:
    record: sys_script/17982cf29f713100a04d7e50d67fcfb6
    field: script
    how: read Inherit commenting and suggesting
    result: copies disable_commenting and disable_suggesting to new articles
    hash: 3a7622c7cb500b48a30f04e282f6e00b8704008d2104849cd850d4219876c316
  E20:
    record: sys_script/c57a9e56fc25b210f8770117b3c71cdf
    field: script
    how: read Validate Standard Template Usage
    result: '"Standard cannot be disabled as it is being used by articles in {0} knowledge base."'
    hash: 5e24ec336a76b63dfc656c95835d82df63fde2a6c02b9f6c27dbcba85401b884
  E21:
    record: sys_dictionary/71457eff8c5503100a22deb6dd2b4e37
    how: read kb_knowledge_base.article_validity
    result: Article Validity; used for the default Valid to of new articles
    hash: 9c700b2eaf929da1e836a36f49ddf871053d239f27df2e9459dce433aab6de35
  E22:
    record: sys_dictionary/8d1932738c9903100a22deb6dd2b4e51
    how: read kb_knowledge_base.checklist
    result: reference to kb_quality_checklist; set only if its weights total 100
    hash: 0d17e1fba388d6060baf2c93aa29056ba87e114ec0fd9143cfaba5ddb4fa5c83
  E23:
    record: kb_uc_can_read_mtom/56b2d093ff4221009b20ffffffffffbf
    how: read the kb_uc_can_read_mtom, kb_uc_cannot_read_mtom and kb_uc_can_contribute_mtom rows
    result: 'IT a7e8a78b…: read 29b4e0c9…, 6b6df061…, 7b8a6927…; contribute 25431493…. Known Error c0a54bac…: read cc5a47fa…; contribute 78060fac…. Knowledge dfc19531…: read 0f8d9007…, cannot read 76f09af6…; contribute fd8f94c3…. No rows for any other knowledge base'
    hash: 97631f241a6fdd915a55f41233bf9d0947010d20b7bc7de278715bdb0f926b5c
  E24:
    record: user_criteria/25431493ff4221009b20ffffffffffe0
    how: read The ACME North America IT Department
    result: a company and a department, match all
    hash: 0070ac1709ae505a670d88a2b2c5ba22f3dad98223f1c6fbbcd6da64971ff44e
  E25:
    record: user_criteria/29b4e0c9873023000e3dd61e36cb0b42
    field: group
    how: read 'Problem Analyzers' and 'Problem Solving' Group Members
    result: two groups
    hash: 560deacd5a64c136da984696b706c59229492e26f3b030a889b22a39c01ae463
  E26:
    record: user_criteria/7b8a6927ef732100438236caa5c0fb89
    field: company
    how: read All ACME Corporation employees, and All ACME North America employees (user_criteria/6b6df061ff2121009b20ffffffffff44)
    result: fifteen companies; one company
    hash: 65f42353a94148ac95b2a11f45f025edd2d28d55494e99f9b8dc4ad4fb7e61f5
  E27:
    record: user_criteria/cc5a47fa53c033004558ddeeff7b12b3
    field: role
    how: read Users who can access Known Error knowledge base
    result: itil, problem_task_analyst, sn_problem_write
    hash: b1c93645a5422a8fa025285911d0999d44486cc01ee4e52bfe68119dde3fa2d9
  E28:
    record: user_criteria/78060fac871023000e3dd61e36cb0b14
    field: role
    how: read Users with 'itil' role, and Users with 'knowledge' role for KB (user_criteria/fd8f94c3b58b8110f8779c9460b514ce)
    result: itil; knowledge
    hash: 61421b3ac8212565521b7f347be39f9a9a3388e633dd3e8499b623b934bf5574
  E29:
    record: user_criteria/0f8d9007b58b8110f8779c9460b51456
    how: read Any user for KB
    result: no role, group, user, company, department or location; not advanced
    hash: 8d6128d965f61529d6cf8b6c1b048998ebb4e3ad881d7edba7d62453c0cf76f5
  E30:
    record: user_criteria/76f09af6cb1200108ad442fcf7076dbf
    field: script
    how: read Guest User
    result: advanced; matches only the guest user
    hash: 9e8b30c4f18005661fe1ec9c8076fdd9321af5282df1b7a391addd811f9d77b8
  E31:
    record: sys_properties/b8a2fb1acbb400108ad442fcf7076d9d
    field: value
    how: read glide.knowman.block_access_with_no_user_criteria
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E32:
    record: sys_script_include/e3f2247bb712230026778d78ee11a9e2
    field: script
    how: read KBDiagnosticsSNC (no Can Read or Can Contribute list)
    result: 'with the property true: no Can Read means "User denied read access to the knowledge base because Can Read is not set."; no Can Contribute gives contribute access only to the owner, managers and admins (with the property false, to anyone with a role other than snc_internal)'
    hash: 758f366cb0a4610af9be919911fdc048764f9e06110e2f1b8fb8a2147ab03a3d
  E33:
    record: sys_ux_macroponent/d03a345d65003210f877884ed83ad848
    field: required_translations
    how: read User Criteria Diagnostic (sn_km_center), on the route user-criteria-diagnostics (sys_ux_app_route/d83a345d65003210f877884ed83ad844)
    result: record type, record, user, Diagnose
    hash: 1e34e7de6dc236814a5da2785bb49194b52812cd6ab76dbe3961bf245b08d233
  E34:
    record: sys_ux_data_broker_transform/eaefc4e965407210f877884ed83ad816
    field: script
    how: read KM Diagnostic Util (sn_km_center), and its execute ACL (sys_security_acl/ead0506d65407210f877884ed83ad813)
    result: runs global.KBDiagnostics for the chosen user and knowledge base or article; roles knowledge_manager, knowledge_admin
    hash: 3aa5140b16546568abb79ff3f99645ea73bfbcf2b412c6320a5ce282acac4cca
  E35:
    record: sys_ui_action/a694eaa487101300b66b5cdac5cb0b2d
    field: condition
    how: read Run User Criteria Diagnostics (kb_knowledge_base), and on kb_knowledge (sys_ui_action/16316e2387401300b66b5cdac5cb0bac)
    result: "current.active && gs.hasRole('admin') || gs.hasRole('knowledge_admin') || manager || owner; redirects to user_diagnostics.do"
    hash: 0c8297493220f0e1a1377cda1e98adefa10f5381967490ea288e72e5d476f363
  E36:
    record: sys_properties/d20ff8ab53012300cc376512a2dc3483
    field: value
    how: read glide.knowman.ownership_group.enabled
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E37:
    record: sys_ux_list_category/647bf525ffbd2210e9c3ffffffffffad
    how: read the Knowledge Center list group Administration (order 500)
    result: 'Knowledge Bases (kb_knowledge_base, active=true), Article Templates, Style guides, Ratings, Search Log, View Log, Navigation Add-Ons, Messages, User Criteria (active=true); no roles on the lists'
    hash: 937ce1899b920ec9d7177a19f02a23d46f2380f6a040b6b54e7e804394aa456e
  E38:
    record: sys_ux_list_category/f67c8121fff52210e9c3ffffffffff97
    how: read the Knowledge Center list group Ownership Groups
    result: My Approvals, My Pending Group Requests, All Groups
    hash: a43263a4849d9e4806623ed831d4cb6180873772131035b1cc07167975189b28
  E39:
    record: sys_user_role/f8bfbd02eb202100216a87b9d106fe92
    field: description
    how: read knowledge_manager, and knowledge_admin (sys_user_role/aaa4855d0a0a0b820170399909974b83)
    result: both contain knowledge; knowledge_manager "Can administer knowledge bases and request new knowledge bases for the knowledge_admin to approve"
    hash: 359c60dade15df4ea81a3ccd5548c7385a9d4c39584c099044571e36ea07e8bb
  E40:
    record: sys_script/abfe4a3a67223200d358bb2d07415a3f
    field: script
    how: read Validate Weightage on kb_knowledge_base
    result: a checklist must have weights totalling 100; no change while reviews are pending
    hash: 6eafb24a3b4d44552d4189f558c3a6fa93edf1418436a8a978e44391602cdcf3
---
## The records {label=NEW}

| Table | What it holds |
|---|---|
| `kb_knowledge_base` | the knowledge base: title, owner, managers, flows, checklist, article validity, commenting; not in the mirror, four seen on screen [E01] [Q24] |
| `kb_uc_can_read_mtom`, `kb_uc_cannot_read_mtom`, `kb_uc_can_contribute_mtom` | who reads and contributes, by user criteria [E23] |
| `user_criteria` | the criteria [E24] |
| `kb_knowledge_base_request` | requests from the catalog [E02] |

## 1. Requesting a knowledge base {label=NEW}

1. *Request Knowledge Base* creates a `kb_knowledge_base_request`; open to everyone, in the
   Service Catalog and the Technical Catalog. [E02]
2. *Request new Knowledge Base* starts on create. [E03]
3. It asks one fixed user for approval, the default admin account, and emails *A new Knowledge
   Base has been requested*. [E04]
4. Approved: *Create KB* makes the knowledge base with the requester as owner, and the requester
   gets *Knowledge Base request approved*; rejected, *Knowledge Base rejected*. [E04] [E05]

`glide.approval_engine.kb_knowledge_base_request` has no value in the mirror. [E06] The
knowledge_manager role's description expects knowledge administrators to approve requests; the
flow does not. [E04] [E39] [Q03]

## 2. Creating and editing {label=NEW}

| Operation | Who | Record |
|---|---|---|
| Create | `isAdminUser` | [E07] [E08] |
| Write | `isAdminUser`, the owner, a manager | [E07] [E08] |
| Delete | nobody | [E07] [E08] |

Rules on save, in order of effect:

1. *Duplicate Knowledge Base*: unique titles. [E09]
2. *Populate Default Flows if Empty* (insert): the instant flows; the legacy workflow fields are
   inactive, so *Validate Flow Engine selection* does not run. [E13] [E14] [E15]
3. *Set mandatory fields*: a data policy per knowledge base for its mandatory article fields;
   only admin can change the list on the form. [E17] [E18]
4. *Validate Weightage*: the checklist's weights must total 100. [E22] [E40]
5. *Validate Standard Template Usage*: the Standard template can't be disabled while articles use
   it. [E20]
6. *Update knowledge_manager roles* (after): grants and revokes `knowledge_manager`. [E10] [E11]
   The form warns before saving. [E12]

On articles: *Inherit commenting and suggesting* copies the knowledge base's settings to new
articles [E19]; *Change workflow when KB changes* re-runs publishing when an article in Review
moves to another knowledge base [E16]; *Article Validity* sets the default Valid to. [E21]

Approvers are the owner and managers: ownership groups are off, so the Knowledge Center's
*Ownership Groups* lists are unused. [E36] [E38]

## 3. Read and contribute {label=NEW}

| Knowledge base | Can read | Cannot read | Can contribute |
|---|---|---|---|
| IT | *'Problem Analyzers' and 'Problem Solving' Group Members* (two groups) [E25]; *All ACME North America employees*, *All ACME Corporation employees* (companies) [E26] | | *The ACME North America IT Department* (company and department, match all) [E24] |
| Known Error | *Users who can access Known Error knowledge base*: itil, problem_task_analyst, sn_problem_write [E27] | | *Users with 'itil' role* [E28] |
| Knowledge | *Any user for KB*: no conditions [E29] [Q25] | *Guest User* (script) [E30] | *Users with 'knowledge' role for KB* [E28] |
| KCS Knowledge Base (demo data) | none in the mirror [Q12] | | none in the mirror |

[E23]

`glide.knowman.block_access_with_no_user_criteria` is true [E31]: a knowledge base with no Can Read
list is denied to readers, and with no Can Contribute list only the owner, managers and admins may
contribute. [E32] [Q25]

## 4. Diagnostics {label=NEW}

- Knowledge Center: the page *User Criteria Diagnostic* runs `KBDiagnostics` for a user and a
  knowledge base or article; its data broker needs `knowledge_manager` or `knowledge_admin`.
  [E33] [E34]
- Classic: *Run User Criteria Diagnostics* related links on knowledge bases and articles open
  `user_diagnostics.do`. [E35]

## 5. The Knowledge Center's administration lists {label=NEW}

The *Administration* group (order 500) has no roles of its own: what each user sees follows the
tables' ACLs. [E37]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `glide.knowman.block_access_with_no_user_criteria` | true | no criteria, no access [E31] |
| `glide.knowman.ownership_group.enabled` | false | approvers are owner and managers [E36] |
| `glide.approval_engine.kb_knowledge_base_request` | no value in the mirror | approval engine for requests [E06] |
