---
title: Writing articles - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_security_acl/3fe580ef9f635210ecf142a4ba0a1c23
    how: read the read ACL on now.knowledge-center.* and its sys_security_acl_role records (sn_km_center)
    result: roles knowledge, knowledge_manager, knowledge_admin
    hash: 6a02b65ea34d5c8933d98842aeced291890aef89f314ca277a69dcb58e7c6c9b
  E02:
    record: sys_user_role/1f26da36c0a8016b000c7f06a1ce7e14
    how: read knowledge, knowledge_manager (sys_user_role/f8bfbd02eb202100216a87b9d106fe92) and knowledge_admin (sys_user_role/aaa4855d0a0a0b820170399909974b83)
    result: '"Can write, edit, and review knowledge management articles"; "Can administer knowledge bases and request new knowledge bases for the knowledge_admin to approve"; "Can manage Knowledge Bases"'
    hash: 6288bbbaed9a96b165aa5f02445c4a4a4e5fb38d91d2dc26cfa7ebcd8e9d33fe
  E03:
    record: sys_properties/0e671b0aff43e2107a91ffffffffff33
    field: value
    how: read sn_km_center.glide.knowman.enable
    result: '"Enable Knowledge Center experience system wide": true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E04:
    record: sys_properties/b9a06742ff83e2107a91ffffffffffdc
    field: value
    how: read sn_km_center.glide.knowman.redirect.enable
    result: '"Enable redirection to Knowledge Center experience system wide": true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E05:
    record: sys_properties/49e02742ff83e2107a91ffffffffff53
    field: value
    how: read sn_km_center.glide.knowman.ece.enable
    result: '"Turn on the Enhanced Content Editor (ECE) component used for editing knowledge article content within Knowledge Center": true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E06:
    record: sys_script_include/39e84ab2d72121004792a1737e610306
    field: script
    how: read KBCommonSNC.shouldRedirectToKnowledgeCenter, redirectionUrlToKnowledgeCenter and isEnhancedEditorEnabled
    result: 'redirect = Knowledge Center plugin active, sn_km_center.glide.knowman.enable and .redirect.enable true, and the user has knowledge, knowledge_manager or knowledge_admin; with templates the target is the kb_interceptor page, otherwise now/knowledge-center/record/kb_knowledge/-1; the enhanced editor needs the plugin and .ece.enable'
    hash: 1c1915ccac83f5eed04b63b52c45f9cd68c7dc8bf3995326bb6e091dbd5a85d5
  E07:
    record: sys_processor/cd2ad1ee87132300420e5cdac5cb0b63
    field: script
    how: read KnowledgeCreateLauncher (path knowledge_create)
    result: 'redirects to the Knowledge Center only when the redirect applies and the source is empty or kb_feedback_task; otherwise to kb_knowledge_create.do (templates) or kb_knowledge.do, or for an incident with glide.knowman.submission.workflow on and no incident knowledge plugin, to a kb_submission'
    hash: 99a70659fefec6b11aa82f9f078d2fe7b35b9cb405dcb9e12373f3ee0668c832
  E08:
    record: sys_processor/7137584a4f5322107a9168bc32ce0b9a
    field: script
    how: 'read KnowledgeEditLauncher (knowledge_edit) and KnowledgeListLauncher (sys_processor/c2df0bba4f93a2107a9168bc32ce0b90, knowledge_list)'
    result: 'edit: now/knowledge-center/record/kb_knowledge/<sys_id> or kb_knowledge.do; list: one of 28 Knowledge Center lists by sysparm_kb_list_type, or the matching classic list'
    hash: ec21aaa6f45c047a2418212de18f76a9c65283eaa9e5128ad8cb6d027a5f6324
  E09:
    record: sys_app_module/d78ed921ff4221009b20ffffffffffdf
    how: read Knowledge › Create New
    result: 'knowledge_create.do?sysparm_stack=kb_knowledge_list.do; roles knowledge_admin, knowledge_manager, knowledge'
    hash: 2a2b1fc3259fbc9f546655a090925144f78bbbbc16c9a601c43a6bcbe612e86b
  E10:
    record: sys_ui_action/f9490d40ff2131003f07ffffffffff6d
    field: script
    how: read New (sysverb_new on kb_knowledge, related lists)
    result: 'goes to knowledge_create.do, except on the knowledge base''s own relationship'
    hash: e31bbfd7257b597b9dc8c6bdf7a5210bd420d308995e09c175966cb9e7e4406a
  E11:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: classic UI, kb_knowledge.do?sys_id=-1 (new article, not saved)
    how: opened the classic new-article form by its address
    result: the classic form opened, not the Knowledge Center; header Submit, Search for Duplicates
  E12:
    record: sys_ux_app_route/c9687e872f2122102a76b001a03f9b85
    how: read Create new article (route kb_interceptor, Knowledge Center app config)
    result: 'chooses knowledge base and template; optional parameters gapsSysIds, interceptorExtraParams'
    hash: ecb80c259ecc613e85bf5ea1de35bde380fd86115bf483b6939d23e96f7ab6a8
  E13:
    record: sys_declarative_action_assignment/85ad09be535b10108ce6ddeeff7b120e
    field: script_condition
    how: 'read the New actions on kb_knowledge: open article template selector (sn_km_uib), New that opens the form (sys_declarative_action_assignment/ba4a8dfa535b10108ce6ddeeff7b1253), and the Knowledge Center override (sys_declarative_action_assignment/6f03a4abff112210e9c3ffffffffffe2)'
    result: 'the selector when canCreate, versioning installed and canContributeToTemplates; the plain form otherwise; in the Knowledge Center (experience restricted) a new record page instead of the selector pop-up'
    hash: 5a1a6ee4318bfe5df01d282602f913ba2771d923c1fced49384d30a2192a1928
  E14:
    record: sys_script_include/b3f2647bb712230026778d78ee11a915
    field: script
    how: read ArticleTemplateUtilSNC.canContributeToTemplates
    result: the user is a contributor and at least one kb_article_template is active
    hash: 663d79fa7cf007bdb588a8c074481f21230bdf92e965ce0124ef928f59699cfc
  E15:
    record: kb_article_template/478034d4870023000e3dd61e36cb0b56
    how: read the five kb_article_template records
    result: 'active: Known Error article (kb_template_known_error_article); inactive: KCS Article, What Is, How to, FAQ'
    hash: cf7b94820c1810cb63fb7e0597bf329536e3ce369e2c066463ecba33142d7325
  E16:
    record: sys_script_include/da5a4ab2d72121004792a1737e6103c5
    field: script
    how: read KBKnowledgeSNC.canCreate, canRead and canWrite
    result: 'canCreate: an active knowledge base (not version 2) the user can contribute to; drafts readable by admins, owner, managers, author and reviser; with versioning on, write is delegated to KBVersioning'
    hash: ea7fa785fad6dfc913579342763268a2f81308385059c001d4ca27ca00c8ea83
  E17:
    record: sys_script/8a3855129f1112003be01050a57fcf4f
    field: script
    how: read Populate Default KB if Empty (before insert, order 100)
    result: an empty knowledge base is set to dfc19531bf2021003f07e2c1ac0739ab
    hash: 03de0129e37da35f5db95db20a70c00eed497c3bb6afb3328bdd4c859a8bcd97
  E18:
    record: sys_script/70a80903d731310013ab49547e6103f9
    field: script
    how: read Set article in draft state on insert (before insert, workflow not draft)
    result: forces Draft for a version 3 knowledge base
    hash: ff2c6d44720dbce39bfdd1b7dbabb4b5861fc31572e20d7018ffaaaf98523b83
  E19:
    record: sys_script/f2307605c3313100bde4beae82d3ae35
    field: script
    how: read Check User CanContribute To Kb (before insert, order 101)
    result: 'aborts with "You do not have permission to contribute to this knowledge base." unless SNC.KnowledgeHelper.canContribute passes, or the user is in a valid ownership group (Knowledge Advanced)'
    hash: 83f02a789a52087e807f802ac7544a7e9edcde3e97f98a0271f39faf9670d7a2
  E20:
    record: sys_script/491d9728db122200a042f278f0b8f56f
    field: script
    how: 'read Versioning : Initialize Version (after insert)'
    result: a new draft gets version 0.01; an article inserted as published gets 1.0
    hash: a19bcede3d2de01553a7b6b45a3677fe13e6412f2094c2f68ce1d6132b107cca
  E21:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canWrite and canDelete for drafts
    result: owner or knowledge admin, the reviser who may contribute, or an ownership group member
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E22:
    record: sys_ui_action/600e6f730a0a0b520138ee854545d45c
    how: read Search for Duplicates
    result: 'classic form, draft or review, itil or knowledge, only while com.snc.knowledge_ml is inactive; opens knowledge_home_launcher.do with the short description'
    hash: 125ee542f9f2b9f68c33c5245019f12834d34d76e6924bfbe065a6f0ca9e64e6
  E23:
    record: sys_ux_list/4d7327bdffda2210e9c3ffffffffff7e
    field: condition
    how: read My Articles and Unpublished (sys_ux_list/cdd099edfff52210e9c3ffffffffff9e)
    result: 'author is me, active, not retired or outdated; Draft or Review, not knowledge blocks'
    hash: c61c669e82529fb854b613cea400b5297d44702169fc4d02b769b6b2c1ffd9f2
  E24:
    record: sys_properties/58b7a716db103200a042f278f0b8f585
    field: value
    how: read glide.knowman.versioning.enabled
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## The applications {label=NEW}

| Scope | What it gives authors |
|---|---|
| `global` | the article table, its rules, the classic form and the launchers |
| `sn_km_center` | the Knowledge Center workspace: home, lists, the create page, its Publish actions |
| `sn_km_uib` | the record page's actions in Next Experience: the template selector, Publish, Approve, Reject, Compare |
| `sn_ui_knowledge` | the knowledge components, among them the article template selector |

## 1. Who can open the Knowledge Center {label=NEW}

The Knowledge Center pages are readable by `knowledge`, `knowledge_manager` and `knowledge_admin`.
[E01] [E02] Contributing to a knowledge base is a separate check, made by its user criteria
through `SNC.KnowledgeHelper.canContribute`. [E16] [E19] [Q26]

## 2. How people arrive {label=NEW}

| Entry | Goes to |
|---|---|
| Knowledge Center › **Create an article** | the `kb_interceptor` page [E12] |
| **Knowledge › Create New** (`knowledge_create.do`) | the Knowledge Center when the redirect applies, else the classic form [E07] [E09] |
| **New** on an article related list | `knowledge_create.do`, as above [E10] |
| `knowledge_edit.do`, `knowledge_list.do` | the Knowledge Center record or list, or the classic one [E08] |
| `kb_knowledge.do?sys_id=-1` | **always the classic form**: no launcher is involved [E11] |

The redirect applies when the Knowledge Center plugin is active, `sn_km_center.glide.knowman.enable`
and `sn_km_center.glide.knowman.redirect.enable` are true, and the user has one of the three
knowledge roles. [E03] [E04] [E06] All three hold on pdi2, so a `knowledge` user using the module is
redirected. The create launcher redirects only for a new article or one from a feedback task; from
any other source (an incident, for example) it keeps the classic route. [E07]

The redirect does **not** cover the article form itself: the walk opened `kb_knowledge.do?sys_id=-1`
and stayed on the classic form. [E11] Bookmarks, links in emails and list **New** buttons outside
the launchers still reach the classic UI. [Q11]

## 3. Template chooser {label=NEW}

1. `New` on `kb_knowledge` opens the template selector when the user can create, versioning is
   installed, and `canContributeToTemplates` passes; otherwise the plain form. [E13]
2. `canContributeToTemplates` needs only one active template. [E14] On pdi2 that is **Known Error
   article**; KCS Article, What Is, How to and FAQ are inactive. [E15] [Q17] So everyone who may
   contribute sees the chooser, with the standard article and Known Error.
3. In the Knowledge Center, a list's **New** opens a new record page instead of the pop-up. [E13]

## 4. When the draft is saved {label=NEW}

Before insert on `kb_knowledge`, in order:

| Rule | Does |
|---|---|
| *Populate Default KB if Empty* (100) | fills an empty knowledge base with a fixed sys_id [E17] [Q24] |
| *Set article in draft state on insert* (100) | forces Draft [E18] |
| *Check User CanContribute To Kb* (101) | refuses the insert if the user can't contribute [E19] |

After insert, *Versioning : Initialize Version* sets version 0.01. [E20] Versioning is on. [E24]

Who can then read, edit and delete the draft: the knowledge base owner, a knowledge admin, and its
author or reviser while they may contribute. [E16] [E21] The Knowledge Center lists **My Articles**
and **Unpublished** show them. [E23]

## 5. Editor {label=NEW}

The Knowledge Center uses the **Enhanced Content Editor**: `sn_km_center.glide.knowman.ece.enable`
is true. [E05] [E06] The Knowledge Center's own Publish actions depend on it (see
[Publishing - configuration](see:publish)).

**Search for Duplicates** exists only on the classic form, for `itil` or `knowledge`, on drafts and
articles in review, and only while the machine-learning knowledge plugin is inactive. [E22]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `sn_km_center.glide.knowman.enable` | true | Knowledge Center on [E03] |
| `sn_km_center.glide.knowman.redirect.enable` | true | launchers redirect to it [E04] |
| `sn_km_center.glide.knowman.ece.enable` | true | enhanced editor and its Publish actions [E05] |
| `glide.knowman.versioning.enabled` | true | drafts start at 0.01 [E24] |
