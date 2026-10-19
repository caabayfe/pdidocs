---
title: Publishing articles - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_dictionary/18487ab38c5903100a22deb6dd2b4eab
    how: read kb_knowledge_base.kb_publish_flow, and the legacy Publish workflow (sys_dictionary/fd457eff8c5503100a22deb6dd2b4e14)
    result: 'Publish flow, a reference to sys_hub_flow, active; Publish workflow inactive'
    hash: 900a82c2c6f01c7bc76e5f4d31bf003386a6569db4de2dd800201242806bed0b
  E02:
    record: sys_script/07c35286fc05ae10f877d15605e71613
    field: script
    how: read Populate Default Flows if Empty
    result: a knowledge base without flows gets Knowledge - Instant Publish and Knowledge - Instant Retire
    hash: 7d81775b8d139b4c5fdc6fb4c3b5e6604001d314faea5004caf6f08da2fb8346
  E03:
    record: sys_declarative_action_assignment/333db22a371322109fce1f0964924b4c
    field: script_condition
    how: read Publish (sn_km_center, "Saves and publishes the knowledge article.")
    result: 'saved record, isEnhancedEditorEnabled, showPublishModals(current, false, false), not a form dialog, canPublish'
    hash: e3f2c4930d2f2594d1ee6fcd53afb23bbe46a83dba31b92ff583b243a492b8dd
  E04:
    record: sys_declarative_action_assignment/cbb12c58ff6322109fcecf437d931f0d
    field: script_condition
    how: read Publish (sn_km_center, "Publish the article through modal flow")
    result: 'isEnhancedEditorEnabled, showPublishModals(current, true, false), not a form dialog, canPublish; payload kc_confirm_publish_modal'
    hash: c59cb1cb99612af7847a67a10e1047becd2bd444f7993da438ce1474b77d782f
  E05:
    record: sys_declarative_action_assignment/dce48bff77420110dc25a5ed5b5a99b0
    field: script_condition
    how: read Publish (sn_km_uib)
    result: 'showPublishModals(current, true, false) and canPublish, without the enhanced editor check'
    hash: e3911875b1beadc5a97f95257d3ab52ff9d2a0c061dba165e8ccc137aac9ad4c
  E06:
    record: sys_ux_app_route/3fc3a45cff6322109fcecf437d931fd9
    how: read KC Confirm Publish Modal, and Confirm Publish Modal (sys_ux_app_route/69b64ac3497dbe10f877e22d332bde75)
    result: modal routes for a table and sys_id
    hash: ac6ad7f0c4981fb0d443aa35b252a587635f04f49624d3f30a7fb58798126270
  E07:
    record: sys_ui_page/d15a1ab577210110dc25a5ed5b5a9957
    field: client_script
    how: read confirm_publish
    result: '"This article may be visible to unauthenticated users after it is published. Do you still want to proceed?"'
    hash: 3f9b2e83a033460da84e871959cd6ff3e68d865b1fb4505e0e3fd17fb9fb29cd
  E08:
    record: sys_script_include/53f2247bb712230026778d78ee11a971
    field: script
    how: read KnowledgeUIActionSNC (showModal, showPublishModals, checkDuplicateExists, publish)
    result: 'the modal when the guest user can read the article (KBCommon.checkGuestUserHasAccess) and it has no merged duplicates; publish checks the scheduled date, canPublish, then on a version 3 knowledge base starts its publish workflow or flow (KBFlow.startFlow), on version 2 sets Published'
    hash: fa4acf54f065d62c01e15ef2f854f07a492b75174862714dc74aa1cb129b2ce7
  E09:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canPublish, canRecall, recall and cancelApprovals
    result: 'publish: Draft, by owner or knowledge admin, a reviser who may contribute, or an ownership group member; recall: Review or Scheduled for publish, cancels the waiting flow and sets requested approvals to Cancelled'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E10:
    record: sys_script_include/39e84ab2d72121004792a1737e610306
    field: script
    how: read KBCommonSNC.validateScheduledPublishDate, isEnhancedEditorEnabled and canRepublishKnowledge
    result: 'less than 86 400 000 ms ahead is refused; ECE needs the Knowledge Center plugin and sn_km_center.glide.knowman.ece.enable; republish: retired and admin user'
    hash: 1c1915ccac83f5eed04b63b52c45f9cd68c7dc8bf3995326bb6e091dbd5a85d5
  E11:
    record: sys_script/369f358f43a211107d9bbe243bb8f244
    how: read Validate Scheduled publish date
    result: before insert and update on kb_knowledge, when scheduled_publish_date changes; aborts
    hash: aa5164f8190cca346a4c5e62a8f1637d955e2c80174cde36d9de35b06c53791f
  E12:
    record: sys_hub_flow/2222030614f75210f8779da9137d35b3
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Instant Publish
    result: '"Instantaneously publishes articles upon creation."; if draft: versioning on → scheduled publish? wait for the date, publish : publish; versioning off → publish'
    hash: 706f5745a9d2cf91d4b051f76133b9bd790b016d280bf619af5c0346ac35afdd
  E13:
    record: sys_hub_flow/6701501859882210f877a8ba01addd41
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Approval Publish
    result: 'ask for approval on Knowledge; approved: event knowledge.approval.approved, then the same versioning and scheduled branches; rejected: event knowledge.approval.rejected'
    hash: 2961a40817838ff4b3c84de390367935622b602b926c95abc50e3a4bcd7ffb3e
  E14:
    record: sys_hub_flow/6701501859882210f877a8ba01addd41
    children: sys_hub_action_instance_v2
    how: read the action inputs
    result: 'approval with no due date; knowledge.approval.approved with no parm1; knowledge.approval.rejected with parm1 = revised_by'
    hash: 40ba56aba36db2222e78a4de710f8e5509a671af41117837f97bb82aacc5e2fa
  E15:
    record: sys_script_include/a659e923c30321000096dfdc64d3ae33
    field: script
    how: read KBWorkflowSNC.getApprovers
    result: 'ownership group members when versioning and glide.knowman.ownership_group.enabled (minus the author when self-approval is off); otherwise the owner if active, plus active managers'
    hash: 25c0f0e7da5e3fe9a5d385c225dfd3ade8ba2d0ea08ba2c53ccd270920afc36c
  E16:
    record: sys_properties/d20ff8ab53012300cc376512a2dc3483
    field: value
    how: read glide.knowman.ownership_group.enabled
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E17:
    record: sys_script/ff215a229f112100a04d7e50d67fcf0a
    field: script
    how: read Update knowledge_manager roles (after, on kb_knowledge_base with an owner or managers)
    result: calls KnowledgeSecurityManager.updateKnowledgeManagers with the current and previous owner and managers
    hash: bbaccee9860cee6ca279c63fd4911546974673360dc5b0300ea2ee501a4fd912
  E18:
    record: sys_ux_list/066fe853ff922610e9c3ffffffffff12
    field: condition
    how: read My Approvals (Knowledge Center)
    result: 'approver is me, source table kb_knowledge, kb_template* or kb_knowledge_block, state requested'
    hash: 01c3e68ff67f3e289b69f76da9ffed539978faccac243b51758e2b11d714cb73
  E19:
    record: sys_declarative_action_assignment/a7b8c778ff123210e49cffffffffff4a
    field: script_condition
    how: read Approve (sn_km_uib, sysapproval_approver) and its server script
    result: 'requested, and approval_admin or ApprovalDelegationUtil.isMyApproval; role snc_internal; record condition: source table kb_knowledge, kb_template*, u_kb_template* or kb_knowledge_block; sets approved, ApprovalUserFeedback.approved'
    hash: 53237e03a40349f657b19b29b1daa91ebed7d6ecae595156bb8cc4e6c56a222b
  E20:
    record: sys_declarative_action_assignment/82a98b3cff123210e49cffffffffff64
    how: read Reject (sn_km_uib) and its server script
    result: 'same conditions; needs a comment ("Comments are required when rejecting an approval"); sets rejected'
    hash: a1767c686ea562f11a3ad9055de10af1a79abb1847855643ef884c990260a703
  E21:
    record: sysevent_email_action/8d4c2145b7312300bc1308a9ee11a96d
    how: 'read KM: Approve article for publishing (sysapproval_approver), mail script km_approval (sys_script_email/658df9c6b7122300bc1308a9ee11a9c4)'
    result: '"<number> is awaiting approval.", to each approver of an article or template'
    hash: bb1ca1df2e6bb1dd942f7c8be9e6c9c2bc248d77c4b73bf331e4df52e807e211
  E22:
    record: sysevent_email_action/298b8301b7403300343f08a9ee11a99f
    how: 'read KM: Article approved for publish (event knowledge.approval.approved), mail script km_approved (sys_script_email/d2e7f439b7122300bc1308a9ee11a939)'
    result: '"<number> is approved.", to the event''s parm1'
    hash: cca5c3d1bb594113618faa1299994ccf0bf0efa8733302b6665b3e153e8d195c
  E23:
    record: sysevent_email_action/d859653dcb403300343f582df8076d62
    how: 'read KM: Article rejected for publish (event knowledge.approval.rejected), mail script km_rejected (sys_script_email/44f4bd7db7522300bc1308a9ee11a933)'
    result: '"<number> is rejected.", to the event''s parm1'
    hash: 5801342eba8fa658524626d4aac7180c267537e158fea17eaccbe817c0381f09
  E24:
    record: sys_properties/0d8e2767b7122300bc1308a9ee11a9bf
    field: value
    how: read glide.knowman.enable_approval_notification
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E25:
    record: sys_script/42c4c2c40b23120099f1ab5c37673a7a
    field: script
    how: read Ensure published date is set (before update, workflow_state changes to published)
    result: published = today
    hash: 8cb6abade27db022051428fa9783715a0739e02ce883b2466d559c362ae0a0fe
  E26:
    record: sys_ui_action/d0c86952eb8321007128a5fc5206fe64
    field: script
    how: read Publish (classic form button)
    result: 'calls KBAjax.checkGuestUserHasAccess; if true, opens the confirm_publish dialog titled Confirmation, else submits publish_knowledge'
    hash: 683469af098bf91b8321e2e6372b818be9c99690ee8955ebf0b46b1f92b4528d
  E27:
    record: sys_declarative_action_assignment/6272a5f2ff2322109fcecf437d931f89
    field: script_condition
    how: read Republish (sn_km_center)
    result: isEnhancedEditorEnabled, not a form dialog, canRepublish
    hash: 25b070805db90a20f2f4d14dcfd8fa3cddb827cc8278676f61c14c6e0f8be738
---
## The records {label=NEW}

| Scope | What it gives publishing |
|---|---|
| `global` | the publish and approval flows, the approver list, the rules on publish dates, the emails, the classic Publish button |
| `sn_km_center` | the Knowledge Center's Publish, Republish and confirmation modal, and its **My Approvals** list |
| `sn_km_uib` | Publish, **Approve** and **Reject** on Next Experience record pages |

## 1. The knowledge base's publish flow {label=NEW}

Each knowledge base names a **Publish flow** (`kb_publish_flow`); the legacy *Publish workflow*
field is inactive, so flows are used. [E01] A knowledge base saved without flows gets
*Knowledge - Instant Publish* and *Knowledge - Instant Retire*. [E02] To require approval, set its
Publish flow to *Knowledge - Approval Publish*.

## 2. The Publish button {label=NEW}

In the Knowledge Center, with the enhanced editor on, one of two `sn_km_center` actions shows on a
draft the user may publish [E03] [E04] [E10]:

| Action | When | Does |
|---|---|---|
| **Publish** (333db22a) | the guest user can't read the article | saves and publishes [E03] |
| **Publish** (cbb12c58) | the guest user can read it | opens the confirm-publish modal first [E04] [E06] [E07] |

Both are hidden when the article has merged duplicates waiting. [E08] `sn_km_uib` has the same
Publish for Next Experience record pages without the editor check [E05]; the classic form uses its
own button with the same confirmation. [E26]

Who may publish: the knowledge base owner, a knowledge admin, the reviser who may contribute, or an
ownership group member (off on pdi2). [E09] [E16]

## 3. What Publish runs {label=NEW}

`KnowledgeUIActionSNC.publish` [E08]:

1. If the scheduled publish date changed and is less than 24 hours ahead, refuses (the same check
   runs as a business rule on every save). [E08] [E10] [E11]
2. Checks `canPublish`. [E08] [E09]
3. On a current-style (version 3) knowledge base, starts its publish workflow or flow; on version
   2, sets Published. [E08]
4. Shows the new state's message.

Then the flow:

| Flow | Steps |
|---|---|
| *Knowledge - Instant Publish* | draft → with a scheduled date, wait for it → publish [E12] |
| *Knowledge - Approval Publish* | ask for approval → approved: queue `knowledge.approval.approved`, then as above; rejected: queue `knowledge.approval.rejected` [E13] |

The approval has no due date. [E14] On publish, *Ensure published date is set* sets **Published**
to today. [E25] **Recall** cancels the waiting flow and its requested approvals. [E09]

## 4. Approvers {label=NEW}

`KBWorkflowSNC.getApprovers` returns the knowledge base's owner, if active, and its active
managers. [E15] Ownership groups would replace them, but `glide.knowman.ownership_group.enabled`
is false. [E16] Owners and managers get `knowledge_manager` through *Update knowledge_manager
roles*. [E17]

They act in the Knowledge Center's **My Approvals** list (the *Your approvals* card) [E18] with:

- **Approve**: for the approver, a delegate, or `approval_admin`; sets Approved. [E19]
- **Reject**: same, and requires a comment. [E20]

## 5. Emails {label=NEW}

| Notification | Event | To | Record |
|---|---|---|---|
| *KM: Approve article for publishing* | an approval is requested | each approver | [E21] |
| *KM: Article approved for publish* | `knowledge.approval.approved` | parm1: empty in the flow | [E22] [E14] |
| *KM: Article rejected for publish* | `knowledge.approval.rejected` | parm1: the article's reviser | [E23] [E14] |

The approved and rejected emails are sent only while `glide.knowman.enable_approval_notification`
is true; it is. [E24] Because the flow names nobody for *approved*, that email may reach nobody,
and for a first version (no reviser) the *rejected* one too. [E14]

## 6. Republish {label=NEW}

**Republish** puts a retired article back. It needs the enhanced editor, the latest version, and
an admin user. [E27] [E10]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `glide.knowman.ownership_group.enabled` | false | approvers are owner and managers [E16] |
| `glide.knowman.enable_approval_notification` | true | approved and rejected emails [E24] |
| `sn_km_center.glide.knowman.ece.enable` | true | the Knowledge Center Publish actions [E10] |

## Open questions {label=OPEN-QUESTION}

1. Which publish flow does each knowledge base use? The knowledge base records are not in the
   mirror; the walk listed four knowledge bases but not their flows.
2. Should *Knowledge - Approval Publish* name the author in `knowledge.approval.approved` and fall
   back to the author for `knowledge.approval.rejected`, so that a first version's author is told?
   [E14]
3. Should approvals have a due date, or a reminder, since they wait on named people? [E14]
4. Which knowledge bases can the guest user read (public knowledge bases), so that the confirmation
   appears?
