---
title: Article versions - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_properties/58b7a716db103200a042f278f0b8f585
    field: value
    how: read glide.knowman.versioning.enabled
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E02:
    record: sys_properties/960e23bcdb0f2200a042f278f0b8f581
    field: value
    how: read glide.knowman.versioning.enable_minor_edits, and glide.knowman.versioning.minor_edit_fields (sys_properties/91be67bcdb0f2200a042f278f0b8f565)
    result: false; no fields listed
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E03:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canWrite and getEditableFields
    result: 'only the latest version is writable; Draft: owner, knowledge admin, contributing reviser, ownership group; Scheduled for publish: nobody; Review and Pending retirement: owner, admin or approver; Retired and Outdated: nobody; Published: elevated users only when minor edit fields are set'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E04:
    record: sys_ui_action/1343604253c000108bd7ddeeff7b1243
    field: client_script_v2
    how: read Checkout (workspace form button, ui16 off)
    result: 'calls KBAjax checkoutArticle and opens the new version with "A new version of the article is created for revision."'
    hash: b1bff8c6f3fb575385e8bf358a4a76939abb3c593ca2834eb7159f341b6c15cd
  E05:
    record: sys_ui_action/169ee7fcdb122200a042f278f0b8f58e
    field: script
    how: read Checkout (classic form button)
    result: 'KBVersioning.checkout; reports a changed Valid to; "You cannot checkout this article as it is already checked out."'
    hash: 7c5e73a47f4c21df74d8bf5f6916f80018653d541501cf785d82b06658e86801
  E06:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canCheckout
    result: 'domain check when glide.knowman.allow_edit_global_articles is false; not external; Published; nothing checked out; with an ownership group: elevated or member (or author/reviser with override); otherwise elevated or a contributor'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E07:
    record: sys_properties/aeac4f38cb41330021741a2df8076d99
    field: value
    how: read glide.knowman.allow_edit_global_articles
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E08:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC._performCheckout and _resetFieldsForCheckout
    result: 'inserts a copy: base_version = old, revised_by = me, latest = true, Draft, flagged false, published empty, confidence work in progress, views, use count, helpful count and rating copied; marks older versions latest = false; next minor version; copies attachments, translations, pinned keywords, affected products, tags, related articles and catalog items; resets Valid to when the knowledge base sets an article validity'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E09:
    record: sys_script/491d9728db122200a042f278f0b8f56f
    field: script
    how: 'read Versioning : Initialize Version'
    result: new article 0.01, or 1.0 when inserted as published; skipped for checked-out copies
    hash: a19bcede3d2de01553a7b6b45a3677fe13e6412f2094c2f68ce1d6132b107cca
  E10:
    record: sys_script/2e03c5a3dbd62200a042f278f0b8f55b
    field: script
    how: 'read Versioning : Increment Version (after update, workflow state changes)'
    result: 'to Published: next major version; Pending retirement, Retired and Outdated ignored'
    hash: 13639e2e828eeee1e34c72e92e814422c366ff79fe70fc9e67a5f5431226cd99
  E11:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.incrementMajorVersion, outdateOldVersion and _triggerOutdatedFlow
    result: 'on publish, every other Published version of the article becomes Outdated: when the knowledge base has a publish flow, by firing knowledge__outdate_article (FlowTriggerAPI.fireKnowledgeTrigger), otherwise by setting the state; view counts are added up'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E12:
    record: sys_hub_flow/6a151635c416f610f8775e5cc901a819
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Outdate Article
    result: 'if the article is Published: marks it outdated, logs "Article is outdated"; active, runs as user'
    hash: c3b5b1104a52c9e6e1f034d0cd293990f98d4a3a6073f6a76a33cb09243570c7
  E13:
    record: sys_script_include/57ba1b4ccda7d210f8773a67f5539799
    field: script
    how: read KBFlowSNC.getKnowledgeFlows
    result: the outdate flow is left out of the flows offered for a knowledge base
    hash: a686f3bd4e65eb8ad3cf16bc3cdb4dfd6823df6e9ba29a485b1980661c4f7080
  E14:
    record: sys_ui_action/3ba2c012db432200a042f278f0b8f507
    field: script
    how: read Recall (workspace and classic form button)
    result: 'canRecall, then KBVersioning.recall: cancels a legacy workflow or the waiting flow and its requested approvals, back to Draft'
    hash: 6ec6ab4a5411d82fa43ebf5296fd2f7851c2371018b6778bc40a0d1a80d4e77e
  E15:
    record: sys_ui_action/0acbaa0f73100010bcfd1c86fbf6a7eb
    field: client_script_v2
    how: 'read Make this Current (workspace), the classic one (sys_ui_action/008d71f8db8b2200a042f278f0b8f53c) and canMakeThisCurrent'
    result: 'Outdated, not linked to a Word document, elevated user or ownership group member, nothing checked out; performs a checkout from the outdated version'
    hash: 69bb7aee57afb58aea658cc24e871fcdc4199756b924dd4b45d183a8294f9ad3
  E16:
    record: sys_declarative_action_assignment/869cc60489631010f8779cb12a81070d
    how: read Compare (sn_km_uib, kb_version)
    result: list action, record selection required
    hash: 2b52d05563e4f4cda4a7860645174bda61184e48097fa3e12d6d432d040964ea
  E17:
    record: sys_ux_app_route/53a62321ffb872106f72ffffffffffd1
    how: read Version Compare (Knowledge Center)
    result: route kb_version_compare with fields table, versions
    hash: 21539fb9ebbca4557d539fc04c32f7f3c7d63c6ecc79c61d0c12ad1310ac52b4
  E18:
    record: sys_script/ce68d00d67203200d358bb2d07415a3f
    field: script
    how: read Notify about article's checkout (after insert, base_version not empty)
    result: an activity "checkedout" for subscribers while glide.knowman.enable_km_subscription is true
    hash: 06fe569f4a1f1db35106891ad4bc9272cb4647dc5565f88d3f6274abcfd6e37f
  E19:
    record: sys_properties/7948c79367583200d358bb2d07415aa0
    field: value
    how: read glide.knowman.enable_km_subscription
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E20:
    record: sys_script/65c8e098db872200a042f278f0b8f543
    field: script
    how: 'read Versioning : Retire all versions'
    result: when an article becomes Retired, every other version with the same article_id is retired, without running rules
    hash: 724cd8b3285bcf796b38973fa9ebfdaa8510ca63e55b4c1c14bae09194521951
  E21:
    record: sys_script/62cda713db503200a042f278f0b8f5f3
    field: script
    how: 'read Versioning : Update latest flag (after delete)'
    result: the newest remaining version, unless outdated, becomes latest
    hash: 0c2ce4e22d63787e82ac0e4cdd93d037343c1ce768f87a98f6454aa00dadb4c0
---
## Versioning on pdi2 {label=NEW}

`glide.knowman.versioning.enabled` is true [E01], so the `KBVersioning` script include decides who
may edit, publish, delete and retire. [E03] Minor edits are off and no fields are listed, so a
published article can't be edited in place by anyone. [E02] [E03] [Q10]

## 1. Checkout {label=NEW}

Two UI actions named **Checkout**: one for the workspace and Knowledge Center (`form_button_v2`,
client script calling `KBAjax`) [E04] and one for the classic form. [E05] Both use `canCheckout`
[E06]:

| Check | pdi2 |
|---|---|
| domain: global articles editable | `glide.knowman.allow_edit_global_articles` true [E07] |
| article is Published and the latest version | required |
| no version already checked out | required |
| user | owner, manager or knowledge admin, or anyone who may contribute (no ownership groups) |

`_performCheckout` [E08] inserts a copy as a Draft with the user as **reviser**, keeps the
article number, copies the feedback counts and the related data, marks older versions as not
latest, and gives it the next minor version. It resets **Valid to** when the knowledge base sets
an article validity. [E08] [Q24] *Notify about article's checkout* posts an activity
to subscribers [E18] [E19].

## 2. Version numbers {label=NEW}

| Moment | Version | Rule |
|---|---|---|
| a new article is saved | 0.01 | *Versioning : Initialize Version* [E09] |
| a version is checked out | + 0.01 | `_performCheckout` [E08] |
| a version is published | next whole number | *Versioning : Increment Version* [E10] |

## 3. Outdating the previous version {label=NEW}

On publish, `incrementMajorVersion` calls `outdateOldVersion`: every other Published version of the
same article becomes Outdated, and its view count is added to the new one. [E11] When the
knowledge base has a publish flow (pdi2's default), this fires *Knowledge - Outdate Article*
(`knowledge__outdate_article`), which marks the article outdated and sets its stage for the list
views [E11] [E12]; otherwise the state is set directly. The flow is kept out of the flows a
knowledge base can choose. [E13] Its executions are not in the mirror. [Q30]

## 4. Recall, Make this Current, Compare {label=NEW}

| Action | Records | Does |
|---|---|---|
| **Recall** | UI action [E14] | Review or Scheduled for publish back to Draft; cancels the flow and its approvals |
| **Make this Current** | workspace and classic UI actions [E15] | checks out an Outdated version as a new draft; elevated users only |
| **Compare** | `sn_km_uib` list action on `kb_version` [E16] and the Knowledge Center route *Version Compare* [E17] | side-by-side view of two selected versions |

## 5. Retiring and deleting versions {label=NEW}

Retiring an article retires all its versions, without running their rules. [E20] Deleting a
version moves the *latest* flag to the newest remaining one, unless it is outdated. [E21]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `glide.knowman.versioning.enabled` | true | versions, Checkout [E01] |
| `glide.knowman.versioning.enable_minor_edits` | false | no in-place edits of published articles [E02] |
| `glide.knowman.versioning.minor_edit_fields` | empty | [E02] |
| `glide.knowman.allow_edit_global_articles` | true | no domain restriction on checkout [E07] |
| `glide.knowman.enable_km_subscription` | true | checkout activity to subscribers [E19] |
