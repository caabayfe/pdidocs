---
title: Article quality index - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: kb_quality_checklist/15dae25667133200d358bb2d07415a39
    how: read Default AQI Survey
    result: the only kb_quality_checklist in the mirror
    hash: 1e591ebecc1396a4bc245b57dea47b45e82c5145b1c9846a458fc00accc1d96b
  E02:
    record: kb_checklist_question/97eb6fa667133200d358bb2d07415a14
    how: read the kb_checklist_question records of Default AQI Survey
    result: ten questions, orders 10 to 100, weight 10 each (total 100)
    hash: 0b07870278e865c73f9cf6a9d2a71177a47b0ce2ade926fb9f55eb38e46219af
  E03:
    record: sys_dictionary/8d1932738c9903100a22deb6dd2b4e51
    how: read kb_knowledge_base.checklist
    result: Checklist, reference to kb_quality_checklist
    hash: 0d17e1fba388d6060baf2c93aa29056ba87e114ec0fd9143cfaba5ddb4fa5c83
  E04:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: classic list Knowledge Bases (kb_knowledge_base)
    how: read the Checklist column
    result: only KCS Knowledge Base (demo data) has a checklist (Default AQI Survey)
  E05:
    record: sys_script_include/33e50eb667223200d358bb2d07415a20
    field: script
    how: read KBAQIHelper (KBAQI extends it, sys_script_include/af060eb667223200d358bb2d07415a74)
    result: 'canPerformAqi: checklist on the knowledge base, canRead, hasAqiRoles (knowledge_domain_expert, knowledge_coach, knowledge_admin), state in glide.knowman.aqi.article_workflow_states (default draft,review,published), not external. createQuestionInstances: kb_article_checklist_summary (reviewer = user, version_author = reviser or author, In Progress) and one kb_article_checklist_answer per question. canSubmitAqi: knowledge_admin or the reviewer, not yet submitted. setAqiInChecklistSummary: sum of weighted_score into aqi_score, kb_knowledge.latest_aqi, event km.notify_about_article_aqied'
    hash: 8afc2b4fe7d9868d47d42f25eec9cb9f5e2c5dcd6b7fde6018dec41d7e59c735
  E06:
    record: sys_ui_action/12c04dd367d23200d358bb2d07415af9
    field: condition
    how: read Perform AQI, Continue AQI (sys_ui_action/b8b782f667223200d358bb2d07415ad1), Discard AQI (sys_ui_action/737df97b67433200d358bb2d07415ab8) and Submit AQI (sys_ui_action/5e066b4467533200d358bb2d07415a5d)
    result: classic form buttons (format_for_configurable_workspace false); Perform without a pending review, Continue with one, Discard on an outdated article with one; Submit on kb_article_checklist_summary
    hash: fa20439e7adb332724530d2bd394262b26f496957767598d4a582abf626ae51e
  E07:
    record: sys_script/f409f33167433200d358bb2d07415acb
    field: script
    how: read Calculate weighted score (after update of answer on kb_article_checklist_answer)
    result: weighted_score = question weight when answer is true, else 0
    hash: 4df9f9f2e16af4a5f44b83dcc28ce26f26125270b53aff94435a04dd199a14d5
  E08:
    record: sys_script/7495585267433200d358bb2d07415a96
    field: script
    how: read Calculate AQI Score (after update, state changes to submitted)
    result: calls KBAQI.setAqiInChecklistSummary
    hash: 9caf77b98abe5063122644ed290e17522b43a2cbd5db7cb80e3c134cf9b4e910
  E09:
    record: sys_script/151e271a770231102b76b1b0af5a99e4
    field: script
    how: read Reset AQI field on insert and stay (before insert on kb_knowledge, latest_aqi not empty)
    result: a copied article starts with no Latest AQI
    hash: eed0afb56f77186f06e2c2c420ddcc5830a96d2979ca6699a05918e48aacd7ad
  E10:
    record: sys_script/c99776f767163200d358bb2d07415a9f
    field: script
    how: read Validate Weightage on kb_checklist_question (before insert, update, delete)
    result: 'refuses negative weights; refuses changes while reviews with the checklist are pending, or while it is attached to a knowledge base ("To add a new question or to edit the existing questions in this checklist you must detach the checklist from the knowledge base."); the total may not exceed 100'
    hash: 1b13559e8cd79c62b76cbb442a18064608d85efb762f1de5b96c0da9d2256b2d
  E11:
    record: sys_script/abfe4a3a67223200d358bb2d07415a3f
    field: script
    how: read Validate Weightage on kb_knowledge_base (before update, checklist changes)
    result: 'refuses the change while reviews with the old checklist are pending in the knowledge base; refuses a checklist whose weights do not total exactly 100; otherwise "AQI checklist was successfully added to the knowledge base."'
    hash: 6eafb24a3b4d44552d4189f558c3a6fa93edf1418436a8a978e44391602cdcf3
  E12:
    record: sys_script/1949e58e67200300d358bb2d07415a57
    field: script
    how: read Duplicate quality checklist (before insert or update on kb_quality_checklist)
    result: '"An AQI Checklist called ''{0}'' already exists."'
    hash: e6fabf57c873da9eb46b8ce4935e5017d3501c68664e4898c5f6c2a86813d6c2
  E13:
    record: sys_properties/f58ec03667133200d358bb2d07415ad4
    field: value
    how: read glide.knowman.aqi_pass_score
    result: "70"
    hash: ff5a1ae012afa5d4c889c50ad427aaf545d31a4fac04ffc1c4d03d403ba4250a
  E14:
    record: sys_properties/3e8c500e67220300d358bb2d07415a3d
    how: read glide.knowman.aqi.article_workflow_states
    result: no value in the mirror; the code's default is draft,review,published
    hash: a1a22f4c6e9903e118ad656ab663749ac90255cd611b5269764e1e3519f8fd4a
  E15:
    record: sysevent_email_action/dff03ef567133200d358bb2d07415a83
    how: 'read KM: AQI on Article'
    result: 'active, event km.notify_about_article_aqied, recipient from parm1, send to self; body from the mail script Notification: Article Aqied, signed "KB Administrator"'
    hash: 0529f691a51b1fd76dd2fb4d438ee1c674dcd77277d0883336d6fc8d1895224f
  E16:
    record: sys_script_email/c821f6fd67133200d358bb2d07415a64
    field: script
    how: 'read Notification: Article Aqied'
    result: 'subject "AQI Review for <display number>", cc from parm2; article, title, author, date, reviewer, score, Passed/Failed, comments'
    hash: 3646091e7f34df82601873888711628bb813f82751c75cc177141c8db0b277c0
  E17:
    record: sysevent_email_action/30c1541b67102300dbfdbb2d07415aa1
    how: 'read KM: AQI on Ownership Group Article'
    result: active, on the same event, for articles with an ownership group
    hash: 6754ad3ab47f913126933da1d0de6a7d4564f1fc89fabf5b57ff03a8ecbe4110
  E18:
    record: sys_properties/d20ff8ab53012300cc376512a2dc3483
    field: value
    how: read glide.knowman.ownership_group.enabled
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E19:
    record: sys_security_acl/32b6c21b67323200d358bb2d07415a62
    how: read the create ACL on kb_article_checklist_summary
    result: roles knowledge_admin, knowledge_coach, knowledge_domain_expert
    hash: fa192bee375e43ffffa3e5b164c7e04a2be790e655110916540c3dce5c99828b
  E20:
    record: sys_security_acl/86c6061b67323200d358bb2d07415a59
    field: script
    how: read the read ACL on kb_article_checklist_summary
    result: KBAQI.canViewAqiFields(article) - AQI roles, author or reviser, knowledge base owner or manager
    hash: b3802e531179975b4f89c403f66b26e4f672ba9034b3ce6e12ddac308d7391ec
  E21:
    record: sys_security_acl/bae6061b67323200d358bb2d07415adc
    field: script
    how: read the write ACL, and the delete ACL (sys_security_acl/dc07c61b67323200d358bb2d07415a13)
    result: 'write: knowledge_admin or the reviewer, while not submitted; delete: knowledge_admin, or the reviewer while not submitted'
    hash: 730869b54381972a91f011cef9e17fc0c9f15ca2833ce67be7085c14d3099d9d
  E22:
    record: sys_security_acl/dfd10a9767323200d358bb2d07415ab4
    how: read the create ACL on kb_quality_checklist, and on kb_checklist_question (sys_security_acl/aaa4c2d767323200d358bb2d07415a41)
    result: knowledge_admin; write and delete are refused while reviews are pending (sys_security_acl/7242ca9767323200d358bb2d07415a41, sys_security_acl/18e44ad767323200d358bb2d07415af5)
    hash: 359c3e6bb15d41cf8aeb74bbae035a082c317459b05af91abdb876ce497531b8
  E23:
    record: sys_user_role/1fcb1aa867033200d358bb2d07415a46
    field: description
    how: read knowledge_coach and knowledge_domain_expert (sys_user_role/b33c9aa867033200d358bb2d07415a1a)
    result: '"Can perform AQI surveys on articles"; both contain knowledge'
    hash: a627fb2ed716a7a6d505a58448635006a969b3a5c13616cee2da52037ead4667
  E24:
    record: sys_ux_list_category/a5419a25ffb16210e9c3ffffffffffdc
    how: read the Knowledge Center list group Article Quality Index (order 600)
    result: AQI Checklists (kb_quality_checklist); All Completed (state=submitted), All Pending (state!=submitted), My Pending and My Completed (reviewer is me) AQI Checklists (kb_article_checklist_summary)
    hash: a0f44a51eea6c77a3d2dd2ec93ed0011378816ef02066d32001610f5269ed7f7
  E25:
    record: sys_ui_policy/9916d4b967000300d358bb2d07415a42
    how: read Hide Latest AQI field until an AQI has been performed on the article
    result: applies while latest_aqi is empty
    hash: 2b2c4c7116fbedf73b93b758c1e085ac3f0265ceb4ef32e51306f36b0f9a8290
---
## The records {label=NEW}

| Table | What it holds |
|---|---|
| `kb_quality_checklist` | a checklist; pdi2 has *Default AQI Survey* [E01] |
| `kb_checklist_question` | its questions, each with an order and a weight; ten of weight 10 [E02] |
| `kb_knowledge_base.checklist` | the checklist a knowledge base uses [E03]; only *KCS Knowledge Base (demo data)* has one [E04] [Q08] |
| `kb_article_checklist_summary` | one review: article, reviewer, version author, state, AQI score, comments [E05] |
| `kb_article_checklist_answer` | one answer per question, with its weighted score [E05] [E07] |

All in `global`. The Knowledge Center (`sn_km_center`) adds the *Article Quality Index* list
group. [E24]

## 1. Who can review {label=NEW}

`canPerformAqi`: the article's knowledge base has a checklist, the user can read the article,
holds `knowledge_domain_expert`, `knowledge_coach` or `knowledge_admin`, and the article's state
is in `glide.knowman.aqi.article_workflow_states`. [E05] That property has no value in the mirror;
the code's default is draft, review and published. [E14] [Q28] Creating a review needs the same roles.
[E19] Both reviewer roles contain `knowledge`. [E23] [Q31]

## 2. A review, step by step {label=NEW}

1. **Perform AQI** (classic form only) creates the summary, In Progress, and one answer per
   question. [E05] [E06] [Q32]
2. Ticking an answer sets its weighted score to the question's weight. [E07]
3. **Submit AQI** (reviewer or `knowledge_admin`) sets Submitted. [E05] [E06]
4. *Calculate AQI Score* sums the weighted scores into `aqi_score`, sets the article's
   `latest_aqi`, and queues `km.notify_about_article_aqied`. [E05] [E08]
5. *KM: AQI on Article* emails the reviser, or the author, with the author in copy; *Passed*
   from 70. [E13] [E15] [E16] The ownership group variant is active but ownership groups are off.
   [E17] [E18]

**Continue AQI** reopens the user's pending review; **Discard AQI** deletes it on an outdated
version. [E06] A copy of an article starts without a Latest AQI [E09], and the field stays hidden
until there is one. [E25]

## 3. Changing a checklist {label=NEW}

- Only `knowledge_admin` creates checklists and questions. [E22]
- Questions can't be changed while the checklist is attached to a knowledge base or has pending
  reviews; weights can't be negative or total more than 100. [E10] [E22]
- A knowledge base accepts a checklist only if its weights total exactly 100, and can't switch
  while its reviews are pending. [E11]
- Checklist names are unique. [E12]

To change *Default AQI Survey*: finish or discard pending reviews, detach it from the KCS
knowledge base, edit, then attach it again. [E10] [E11]

## 4. Who sees results {label=NEW}

| Operation | Who |
|---|---|
| Read | AQI roles, the article's author or reviser, the knowledge base's owner and managers [E20] |
| Write | `knowledge_admin` or the reviewer, until submitted [E21] |
| Delete | `knowledge_admin`, or the reviewer until submitted [E21] |

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `glide.knowman.aqi_pass_score` | 70 | Passed at or above [E13] |
| `glide.knowman.aqi.article_workflow_states` | no value in the mirror | states that can be reviewed [E14] |
| `glide.knowman.ownership_group.enabled` | false | the ownership group email is not used [E18] |
