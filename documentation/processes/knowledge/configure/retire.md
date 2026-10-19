---
title: Retiring articles - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_declarative_action_assignment/2f1f9ac5c3030110c92609c77d40dd7c
    field: script_condition
    how: read the Knowledge Center's Retire action (sn_km_uib)
    result: "!isStackNameDialog() && KBKnowledge.canRetire(current) && KBKnowledge.canProvideReplacementArticle() && not a knowledge block; client action kb_retire_confirmation_modal (sys_declarative_action_payload_definition/769f9209c3030110c92609c77d40ddab), a medium modal on the route kb_retire_confirmation_modal"
    hash: 61592a13c7eed6ea58dd330d92e502d829c715ee72ebf8560bffad6ce4b648d9
  E02:
    record: sys_ux_macroponent/6209718dc3030110c92609c77d40dd4d
    field: data
    how: read the Retire Confirmation Modal's data
    result: 'the picker queries kb_knowledge with workflow_state=published^sys_id!=<this article>^kb_knowledge_base.application=<its application>, number or short description LIKE the search, sorted by number, 100 rows'
    hash: eff0ebcbf8c0007c607b98226b61052423666cf20de6722f9d3e80a909277d6b
  E03:
    record: sys_ux_data_broker_transform/a9d81e41c3030110c92609c77d40dd50
    field: script
    how: read the Retire Knowledge transform (sn_km_uib)
    result: calls KBKnowledge.retireKnowledgeById, or retireKnowledgeWithReplacementByIds when a replacement was chosen
    hash: 9a5b44a1ad99f571b032036876af620d05012c5231a538fee3b31f80820a7002
  E04:
    record: sys_ui_action/f21d1087f034c510f877bdce65680991
    field: script
    how: read Retire (retire_replacement), classic form
    result: 'GlideModal knowledge_retire_confirm_form titled "Retire Confirmation"; the chosen replacement comes back through the session client data replacementArticleId_<sys_id>; then the same KBKnowledge methods'
    hash: 11108ae088faff3358cbb8b1ed7303f813d4c832a228d3c3bd480965c36f0478
  E05:
    record: sys_ui_action/bf63c426c30031000096dfdc64d3ae2c
    field: condition
    how: read Retire (retire), and Retire (retire_classic_workspace, sys_ui_action/4c605b34771221102b76b1b0af5a9957)
    result: 'the first only when replacements are off; the second when they are on; both call KnowledgeUIAction.retireKnowledgeRecord, which starts the retire flow without a replacement'
    hash: c5153518898e503c5137acb8af1bad73f23f8d8b7fbbe16d36584f9b21eac4c0
  E06:
    record: sys_properties/711dad9fc3110110c92609c77d40dd2e
    field: value
    how: read glide.knowman.enable_article_replacement_on_retire
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E07:
    record: sys_script_include/da5a4ab2d72121004792a1737e6103c5
    field: script
    how: read KBKnowledgeSNC.canRetire, retireKnowledge and retireKnowledgeWithReplacement
    result: 'canRetire: not external; KCS contributors and candidates refused when the KCS plugin is active; with versioning, KBVersioning.canRetire. retireKnowledge: for a version 3 knowledge base, starts the retire workflow or flow, then updates the article; for version 2, sets Retired. With a replacement: it must be published, different and readable; replacement_article is set before the flow starts'
    hash: ea7fa785fad6dfc913579342763268a2f81308385059c001d4ca27ca00c8ea83
  E08:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canRetire, hasAnyElevatedAccess and republish
    result: 'latest version, published; admin user, knowledge base owner or manager; or (no ownership group) author or reviser who can contribute. republish: other retired versions to Outdated, this one Published with today''s published date, retired date cleared'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E09:
    record: sys_script_include/53f2247bb712230026778d78ee11a971
    field: script
    how: read KnowledgeUIActionSNC.retireKnowledgeRecord
    result: starts the retire_workflow or kb_retire_flow of the knowledge base and shows the state message
    hash: fa4acf54f065d62c01e15ef2f854f07a492b75174862714dc74aa1cb129b2ce7
  E10:
    record: sys_dictionary/1c487ab38c5903100a22deb6dd2b4ea9
    how: read kb_knowledge_base.kb_retire_flow
    result: Retire flow, reference to sys_hub_flow, active
    hash: 3d5986a7e47e6240fe96263ee96f410ed16b6c8ed4e391d9462cc300ce8cc22e
  E11:
    record: sys_dictionary/79457eff8c5503100a22deb6dd2b4e16
    how: read kb_knowledge_base.retire_workflow
    result: Retire workflow (wf_workflow), inactive, so flows are used
    hash: 14e8de4f8b0fbbd007bb3fb10ccfadf694437f3de0e0a7818ebc18a8ca408c2f
  E12:
    record: sys_script/07c35286fc05ae10f877d15605e71613
    field: script
    how: read Populate Default Flows if Empty (before insert on kb_knowledge_base)
    result: an empty retire flow becomes Knowledge - Instant Retire (ea32fac859c02210f877a8ba01addda2)
    hash: 7d81775b8d139b4c5fdc6fb4c3b5e6604001d314faea5004caf6f08da2fb8346
  E13:
    record: sys_hub_flow/ea32fac859c02210f877a8ba01addda2
    how: read Knowledge - Instant Retire
    result: '"This flow is used for retiring knowledge records without approvals." active, published, runs as the user'
    hash: 0e7aaab71e0f8a4e917e75c41fce01c39b209ec6435b8ba2da3fbf1b67f45b16
  E14:
    record: sys_hub_flow/8b24579a5984ea10f877a8ba01addd14
    children: sys_hub_flow_stage
    how: read Knowledge - Approval Retire
    result: '"This flow is used for retiring knowledge records with approvals." active, published, runs as the user; stages Pending retirement and Retired'
    hash: 110d96ae4a1abbfe92eb63d05b3331dcde68e24276c4ddcbb74d7ce924126219
  E15:
    record: sys_script_include/a659e923c30321000096dfdc64d3ae33
    field: script
    how: read KBWorkflowSNC.getApprovers
    result: ownership group members when ownership groups are on, otherwise the knowledge base owner (if active) and managers
    hash: 25c0f0e7da5e3fe9a5d385c225dfd3ade8ba2d0ea08ba2c53ccd270920afc36c
  E16:
    record: sys_properties/d20ff8ab53012300cc376512a2dc3483
    field: value
    how: read glide.knowman.ownership_group.enabled
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E17:
    record: sysevent_email_action/8d4c2145b7312300bc1308a9ee11a96d
    field: condition
    how: 'read KM: Approve article for publishing (sysapproval_approver)'
    result: 'stateCHANGESTOrequested with source_table kb_knowledge (or a knowledge template), and KBCommon.canNotify; so retire approvals are emailed too, as "<number> is awaiting approval."'
    hash: 8a02bc1c9ec6e163c4b6cf3904bcdbac84a2e1838cbbcd76f371004149bc8bf9
  E18:
    record: sys_script/65c8e098db872200a042f278f0b8f543
    field: script
    how: 'read Versioning : Retire all versions (after insert or update, workflow_state changes to retired)'
    result: sets every other version with the same article_id to Retired, without running business rules
    hash: 724cd8b3285bcf796b38973fa9ebfdaa8510ca63e55b4c1c14bae09194521951
  E19:
    record: sys_script/3378ee5dc32d0110c92609c77d40dd71
    field: script
    how: read Update Replacement Article References (before update, from retired or pending retirement to published, when replacements are on)
    result: clears replacement_article
    hash: 89a4555ccf4022b181e40d0a196e7f5256ef9ddedd57a2b06ac86b161385a6e5
  E20:
    record: sp_widget/a47ea1cb0b9432004ce28ffe15673a5b
    field: script
    how: read Knowledge Article Content (sn_km_portal)
    result: 'follows replacement_article to the latest accessible version, in a loop, and shows a replacement alert; an admin gets a link back to the retired article (sysparm_redirect=false)'
    hash: ade57e9bff48b006aab67cdeca19f7a33211e8f5ac8baffadd0920e4c3def7f8
  E21:
    record: sys_ux_data_broker_transform/26def212c3430110c92609c77d40dd51
    field: script
    how: read Get Replacement Article (sn_km_uib)
    result: the same replacement chain for the Knowledge Center's article view
    hash: f4c393ae217b88f2ca784c65015f3a8ab7401f7ed1b4d4b556d0042be0302150
  E22:
    record: sys_script_include/aef116f1d73221004792a1737e6103a4
    field: script
    how: read KBViewModelSNC.canAccessRetiredArticle and findKnowledgeByNumberAndLanguage
    result: 'a retired article is valid to view only for isAdminUser, or when replacements are on and it has a replacement (and the user can read it)'
    hash: d5d8ffdf8f3716dc3c10868cf3f3093714ff42f5b485cce4a8b16d962c3c41c1
  E23:
    record: sys_ui_action/8ac310c2531033008bd7ddeeff7b121b
    field: condition
    how: read Republish, and KBKnowledgeSNC.canRepublish and KBCommonSNC.canRepublishKnowledge (sys_script_include/39e84ab2d72121004792a1737e610306)
    result: retired, latest version, and isAdminUser; the Knowledge Center's Republish (sys_declarative_action_assignment/6272a5f2ff2322109fcecf437d931f89) adds isEnhancedEditorEnabled
    hash: 5b0753a912812ce246db278f7bef9aaf82c09c1cac532673197eb7b9230e003c
  E24:
    record: sys_dictionary/ed453eff8c5503100a22deb6dd2b4e58
    field: default_value
    how: read kb_knowledge.valid_to, and KBCommonSNC.getDefaultValidToDateFromDate
    result: today plus kb_knowledge_base.article_validity days when positive, otherwise 2100-01-01
    hash: 9245f75a758aed7ddc7cc78807ce80b50b26569e0b3c9a2b0b831b81a4dfe243
  E25:
    record: sys_script_client/83be79e0cb2033007a94582df8076dff
    field: script
    how: read Change Default Article Validity Date (onChange of kb_knowledge_base on kb_knowledge)
    result: resets Valid to from the new knowledge base's Article Validity when the knowledge base changes
    hash: d8c63a04e65f265e9b9f8ef44816933cf237b6c11748e04b140c9d9fc258ae12
  E26:
    record: sys_ui_policy/726318a6cb2033007a94582df8076d2a
    how: read Restrict Negative Article Validity (kb_knowledge_base)
    result: applies when article_validity <= 0
    hash: c61c2d4ed3c65955be7305c89d80c72776d2b993d0edd9d43bbac64e94c8d883
  E27:
    record: sys_script_include/da5a4ab2d72121004792a1737e6103c5
    field: script
    how: read KBKnowledgeSNC.getKnowledgeEncodedQuery
    result: readable knowledge bases, active, not blocks, workflow_state=published, active=true, valid_to after yesterday
    hash: ea7fa785fad6dfc913579342763268a2f81308385059c001d4ca27ca00c8ea83
  E28:
    record: sys_ux_list/9b5a59ca53026210e9c3e40b10e5e662
    field: condition
    how: read Expiring Articles (sn_km_center, Articles group, order 700)
    result: valid_to within the next 90 days and not before today, active, workflow_state not retired or outdated
    hash: fe5641341c2948535a7ec5d630d9abbc514c6c35ed5748fcbbbccb79a7004871
  E29:
    record: sys_ux_list/a2af012dfff52210e9c3ffffffffff38
    field: condition
    how: read Retired (sn_km_center, Articles group, order 300)
    result: workflow_state=retired, not kb_knowledge_block
    hash: 453ea195f57980ca406d1f6e28a48c8e9c5a0978b76ba28dbee115d401942003
  E30:
    record: sysauto_script/5df51be7cb2600101b6b1a2df8076def
    how: read Notification for Article Expiry Warning
    result: active, monthly on day 1, conditional; calls KBKnowledge.notifyForExpiringArticles
    hash: 2d5be18104aff67df30fc60dc8d2d403e9348b18aa56df93e309884ba5cb7a2e
  E31:
    record: sys_script_include/da5a4ab2d72121004792a1737e6103c5
    field: script
    how: read KBKnowledgeSNC.notifyForExpiringArticles
    result: 'does nothing unless glide.knowman.enable_article_expiry_notification is true; otherwise collects published articles whose Valid to is next month and queues one email per author, reviser, knowledge base owner and manager'
    hash: ea7fa785fad6dfc913579342763268a2f81308385059c001d4ca27ca00c8ea83
  E32:
    record: sysevent_email_action/b41210e9cba200101b6b1a2df8076d92
    how: 'read KM: Article Expiry Warning'
    result: 'active, event kb.article.expiry.warning, subject "Knowledge articles expiring next month"'
    hash: 04d6c0e77e0c6efc033096f722e41dd73dabf886fc3d58938201c6aa5168b71b
  E33:
    record: sys_properties/477c4b4ecba600101b6b1a2df8076df9
    field: value
    how: read glide.knowman.enable_article_expiry_notification
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E34:
    record: sys_properties/58b7a716db103200a042f278f0b8f585
    field: value
    how: read glide.knowman.versioning.enabled
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E35:
    record: sys_ui_policy/66602536c34031000096dfdc64d3ae98
    how: read Manage display of Retired field (kb_knowledge)
    result: applies when the Retired date is filled
    hash: 2bc72973c6b4f1ab96fc5dd290082997e3a0ced93d3f348bfc7fde000d91ee10
  E36:
    record: sys_hub_flow/8b24579a5984ea10f877a8ba01addd14
    children: sys_hub_flow_logic_instance_v2
    how: read the logic of Knowledge - Approval Retire
    result: 'asks for approval; approved: retires the article; rejected: moves it back to the state it had'
    hash: e3edddf92545c0426d86f9dc59872c8f47b406a07c7f91c80402b34c8c07a38f
---
## The pieces {label=NEW}

| Scope | What it gives retiring |
|---|---|
| `global` | the Retire, Republish buttons on the classic form, `KBKnowledge`, `KBVersioning`, the retire flows, the versioning rules, the approval email |
| `sn_km_uib` | the Knowledge Center's **Retire** action and its *Retire Confirmation Modal* |
| `sn_km_center` | the Knowledge Center's **Republish** action and the *Expiring Articles* and *Retired* lists |
| `sn_km_portal` | what a reader sees in Employee Center when an article is retired |

## 1. The Retire action {label=NEW}

| Where | Record | Shown when |
|---|---|---|
| Knowledge Center | action *Retire*, opens the modal `kb_retire_confirmation_modal` | `canRetire` and replacements on [E01] |
| Classic form | *Retire* (`retire_replacement`), opens `knowledge_retire_confirm_form` | `canRetire` and replacements on [E04] |
| Classic form | *Retire* (`retire_classic_workspace`) | `canRetire` and replacements on; retires without the dialog [E05] |
| Classic form | *Retire* (`retire`) | replacements **off**, so not on pdi2 [E05] [E06] |

`canRetire`, with versioning on [E34]: the article is not external, it is the latest version and
published, and the user is an admin user, the knowledge base's owner or a manager, or its author
or reviser with contribute access. [E07] [E08] The KCS restriction in `canRetire` applies only
when the KCS Capabilities plugin is active. [E07]

## 2. The modal and the replacement {label=NEW}

The picker offers published articles other than this one, in knowledge bases of the same
application (`kb_knowledge_base.application`), searched by number or short description, 100 at a
time. [E02] *Retire Knowledge* then calls `retireKnowledgeById` or
`retireKnowledgeWithReplacementByIds`. [E03] The server checks again that the replacement is
published, different and readable, and writes `replacement_article` before the retire flow
starts. [E07]

## 3. The retire flow {label=NEW}

1. `retireKnowledge` starts the knowledge base's retire workflow or flow (`kb_version` 3); a
   version 2 knowledge base is set to Retired directly. [E07] [E09]
2. The legacy *Retire workflow* field is inactive, so `kb_retire_flow` is used. [E10] [E11] A new
   knowledge base without one gets *Knowledge - Instant Retire*. [E12]
3. The flows:

| Flow | Behaviour |
|---|---|
| *Knowledge - Instant Retire* | no approval [E13] |
| *Knowledge - Approval Retire* | Pending retirement, then approval; rejected, back to the previous state [E14] [E36] |

4. Approvers: the owner (if active) and managers; ownership groups are off. [E15] [E16] They get
   *KM: Approve article for publishing*, which fires for every approval on `kb_knowledge`,
   publish or retire. [E17]
5. On Retired, *Versioning : Retire all versions* retires every other version of the article,
   with business rules off. [E18]

## 4. What readers get {label=NEW}

- Employee Center's *Knowledge Article Content* widget and the Knowledge Center's *Get
  Replacement Article* follow `replacement_article` to the latest accessible version, through any
  chain. [E20] [E21]
- Without a replacement, a retired article opens only for `isAdminUser`. [E22]
- Lists and search use `getKnowledgeEncodedQuery`: published, active, Valid to after yesterday.
  [E27]

## 5. Republish {label=NEW}

*Republish* (classic and Knowledge Center) is offered on the latest retired version to
`isAdminUser`; the Knowledge Center's needs the enhanced editor too. [E23] It sets the other
retired versions to Outdated and this one to Published. [E08] *Update Replacement Article
References* clears the replacement. [E19]

## 6. Valid to and expiry {label=NEW}

- Default: today plus the knowledge base's `article_validity` days, else 2100-01-01. [E24] It is
  recalculated when the article's knowledge base changes. [E25] A UI policy guards zero or
  negative validity on the knowledge base. [E26]
- Lists: *Expiring Articles* (next 90 days) and *Retired* in the Knowledge Center's Articles
  group. [E28] [E29]
- The monthly job runs on day 1 but does nothing while the property is false; the email
  *Knowledge articles expiring next month* is active but never queued. [E30] [E31] [E32] [E33]
- The classic form shows the *Retired* date only once it is filled. [E35]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `glide.knowman.enable_article_replacement_on_retire` | true | replacement dialog, redirect to the replacement [E06] |
| `glide.knowman.versioning.enabled` | true | retire rules of `KBVersioning`; all versions retired together [E34] |
| `glide.knowman.ownership_group.enabled` | false | approvers are owner and managers [E16] |
| `glide.knowman.enable_article_expiry_notification` | false | no expiry emails [E33] |

## Open questions {label=OPEN-QUESTION}

1. Which `kb_retire_flow` does each knowledge base use? The knowledge base records are not in the
   mirror; a knowledge base created without one gets *Instant Retire*. [E12]
2. `isAdminUser` (opening retired articles, Republish) is a platform check: does it include the
   knowledge base's owner and managers, or only `admin` and `knowledge_admin`? [E22] [E23]
3. Should `glide.knowman.enable_article_expiry_notification` be switched on? The job and email
   are ready. [E30] [E32]
4. Should any knowledge base set an *Article Validity*, so that articles come up for review
   instead of being valid until 2100? [E24]
