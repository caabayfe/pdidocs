---
title: Check article quality
reviewed: 2026-10-19
evidence:
  E01:
    record: kb_quality_checklist/15dae25667133200d358bb2d07415a39
    how: read the AQI checklist Default AQI Survey
    result: the only AQI checklist in the mirror
    hash: 1e591ebecc1396a4bc245b57dea47b45e82c5145b1c9846a458fc00accc1d96b
  E02:
    record: kb_checklist_question/97eb6fa667133200d358bb2d07415a14
    how: read the ten questions of Default AQI Survey, in order (kb_checklist_question, checklist 15dae256…)
    result: 'Is the knowledge article unique?; Is the content accurate and relevant?; Is the knowledge article complete?; Is the title appropriate?; Does the knowledge article meet readability guidelines?; Are the external links valid?; Has user criteria or security been set properly?; Are the Knowledge base and Category fields filled out accurately?; Has the proper metadata been entered in the knowledge article?; Has the knowledge article been checked for grammar and spelling?; each weight 10'
    hash: 0b07870278e865c73f9cf6a9d2a71177a47b0ce2ade926fb9f55eb38e46219af
  E03:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: classic list Knowledge Bases (kb_knowledge_base)
    how: read the Checklist column of the knowledge bases
    result: 'KCS Knowledge Base (demo data) has the checklist Default AQI Survey; Known Error, IT and Knowledge have none'
  E04:
    record: sys_script_include/33e50eb667223200d358bb2d07415a20
    field: script
    how: read KBAQIHelper.canPerformAqi and hasAqiRoles
    result: 'needs a checklist on the article''s knowledge base, read access to the article, and knowledge_domain_expert, knowledge_coach or knowledge_admin; the article must be in one of the states of glide.knowman.aqi.article_workflow_states (as delivered draft, review, published); not for external articles'
    hash: 8afc2b4fe7d9868d47d42f25eec9cb9f5e2c5dcd6b7fde6018dec41d7e59c735
  E05:
    record: sys_ui_action/12c04dd367d23200d358bb2d07415af9
    field: script
    how: read Perform AQI (kb_knowledge, classic form button)
    result: 'shown when you may perform AQI and have no review in progress on the article; creates a checklist summary with one answer per question, with you as reviewer, and opens it'
    hash: 70aaee8c9b66ceb782f0d204f32fd43d50fd8e1553d56a0d28831c79e17ec52a
  E06:
    record: sys_ui_action/b8b782f667223200d358bb2d07415ad1
    field: script
    how: read Continue AQI (kb_knowledge)
    result: shown when you have a review in progress on the article (also on an outdated version); opens it
    hash: 7c7703bd67fb6b48119441d9f1f90fb57cde6a304a602458c1ce5ee3ea757366
  E07:
    record: sys_ui_action/737df97b67433200d358bb2d07415ab8
    field: script
    how: read Discard AQI (kb_knowledge)
    result: 'shown on an outdated version with your review still in progress; deletes it: "The AQI review you had previously initiated has been discarded."'
    hash: f010279ac895769670d054b47850177d99ed15536c0c96a6cbfd51390c19eb08
  E08:
    record: sys_ui_action/5e066b4467533200d358bb2d07415a5d
    field: script
    how: read Submit AQI (kb_article_checklist_summary)
    result: shown to the reviewer or a knowledge_admin until submitted; sets the state to Submitted with the comments for the author
    hash: 26e143d655f06308a4de925436a63ddde7ec3ca075fe8447edff665b5bd48478
  E09:
    record: sys_script/f409f33167433200d358bb2d07415acb
    field: script
    how: read Calculate weighted score (kb_article_checklist_answer)
    result: a question answered yes scores its weight; otherwise 0
    hash: 4df9f9f2e16af4a5f44b83dcc28ce26f26125270b53aff94435a04dd199a14d5
  E10:
    record: sys_script/7495585267433200d358bb2d07415a96
    field: script
    how: read Calculate AQI Score (after the summary becomes Submitted), with KBAQIHelper.setAqiInChecklistSummary
    result: the AQI score is the sum of the weighted scores; it becomes the article's Latest AQI and the author is notified
    hash: 9caf77b98abe5063122644ed290e17522b43a2cbd5db7cb80e3c134cf9b4e910
  E11:
    record: sys_properties/f58ec03667133200d358bb2d07415ad4
    field: value
    how: read glide.knowman.aqi_pass_score
    result: '70: "Pass score for AQI reviews"'
    hash: ff5a1ae012afa5d4c889c50ad427aaf545d31a4fac04ffc1c4d03d403ba4250a
  E12:
    record: sys_script_email/c821f6fd67133200d358bb2d07415a64
    field: script
    how: 'read the mail script Notification: Article Aqied, used by KM: AQI on Article (sysevent_email_action/dff03ef567133200d358bb2d07415a83)'
    result: 'subject "AQI Review for <article number>"; "An AQI review was performed on an article that you created/updated."; Article, Article Title, Authored/Updated, AQI review performed on, AQI review performed by, AQI Score, Result, Comments'
    hash: 3646091e7f34df82601873888711628bb813f82751c75cc177141c8db0b277c0
  E13:
    record: sys_script_include/33e50eb667223200d358bb2d07415a20
    field: script
    how: read KBAQIHelper._notifyAuthorOrReviser
    result: 'to the article''s reviser if there is one, with the author in copy (if active and different), otherwise to the author; Result is Passed at or above glide.knowman.aqi_pass_score, else Failed; Comments "No Comments" when empty'
    hash: 8afc2b4fe7d9868d47d42f25eec9cb9f5e2c5dcd6b7fde6018dec41d7e59c735
  E14:
    record: sys_db_object/c91932738c9903100a22deb6dd2b4e1c
    children: sys_choice
    how: read the kb_article_checklist_summary state choices
    result: Draft, In Progress, Saved, Submitted
    hash: e63292b53d604f584a92fe2015983914d29a3747a79b848d924ef450b16af82d
  E15:
    record: sys_security_acl/86c6061b67323200d358bb2d07415a59
    field: script
    how: read the read ACL on kb_article_checklist_summary, with KBAQIHelper.canViewAqiFields
    result: AQI results can be read by the AQI roles, the article's author or reviser, and its knowledge base's owner and managers
    hash: b3802e531179975b4f89c403f66b26e4f672ba9034b3ce6e12ddac308d7391ec
  E16:
    record: sys_security_acl/bae6061b67323200d358bb2d07415adc
    field: script
    how: read the write ACL on kb_article_checklist_summary
    result: only the reviewer or a knowledge_admin, and only until it is submitted
    hash: 730869b54381972a91f011cef9e17fc0c9f15ca2833ce67be7085c14d3099d9d
  E17:
    record: sys_ui_policy/9916d4b967000300d358bb2d07415a42
    how: read Hide Latest AQI field until an AQI has been performed on the article
    result: the Latest AQI field shows only once a review was submitted
    hash: 2b2c4c7116fbedf73b93b758c1e085ac3f0265ceb4ef32e51306f36b0f9a8290
  E18:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Knowledge Center (/now/knowledge-center), Knowledge Hub
    how: read the Knowledge features section
    result: 'cards Knowledge analytics dashboard, Your articles, Article quality index, Your approvals'
  E19:
    record: sys_ux_list_category/a5419a25ffb16210e9c3ffffffffffdc
    how: read the Knowledge Center list group Article Quality Index and its lists (sys_ux_list b2719629…, 3c329ea9…, 6382dea9…, d1c2da2d…, 9fd4d2e1…)
    result: 'AQI Checklists; All Completed AQI Checklists; All Pending AQI Checklists; My Pending AQI Checklists; My Completed AQI Checklists (mine: reviewer is me)'
    hash: a0f44a51eea6c77a3d2dd2ec93ed0011378816ef02066d32001610f5269ed7f7
  E20:
    record: sys_user_role/1fcb1aa867033200d358bb2d07415a46
    field: description
    how: read knowledge_coach, and knowledge_domain_expert (sys_user_role/b33c9aa867033200d358bb2d07415a1a)
    result: '"Can perform AQI surveys on articles", "Can write, edit, and review knowledge management articles"; both contain knowledge'
    hash: a627fb2ed716a7a6d505a58448635006a969b3a5c13616cee2da52037ead4667
  E21:
    record: sys_properties/3e8c500e67220300d358bb2d07415a3d
    how: read glide.knowman.aqi.article_workflow_states
    result: '"List of workflow states … of the articles that can undergo AQI"; no value in the mirror'
    hash: a1a22f4c6e9903e118ad656ab663749ac90255cd611b5269764e1e3519f8fd4a
---
## What AQI is {label=NEW}

The **article quality index** (AQI) is a review of an article against a checklist of yes-or-no
questions. Each question has a weight; the weights add up to 100. The article's score is the sum
of the weights of the questions answered *yes*. [E09] [E10] A score of **70 or more passes**. [E11]

The checklist on pdi2 is **Default AQI Survey**: ten questions of weight 10 each. [E01] [E02]

| # | Question |
|---|---|
| 1 | Is the knowledge article unique? |
| 2 | Is the content accurate and relevant? |
| 3 | Is the knowledge article complete? |
| 4 | Is the title appropriate? |
| 5 | Does the knowledge article meet readability guidelines? |
| 6 | Are the external links valid? |
| 7 | Has user criteria or security been set properly? |
| 8 | Are the Knowledge base and Category fields filled out accurately? |
| 9 | Has the proper metadata been entered in the knowledge article? |
| 10 | Has the knowledge article been checked for grammar and spelling? |

[E02]

## Where you can use it {label=NEW}

Only articles in a knowledge base **with a checklist** can be reviewed. [E04] On pdi2 that is only
**KCS Knowledge Base (demo data)**; IT, Known Error and Knowledge have no checklist, so no
article there shows **Perform AQI**. [E03]

You need one of the roles **knowledge_coach**, **knowledge_domain_expert** or
**knowledge_admin**, and you must be able to read the article. [E04] [E20] As delivered, drafts,
articles in review and published articles can be reviewed. [E04] [E21]

## Review an article {label=NEW}

{{animation:kbaqi}}

1. Open the article on the **classic form** and choose **Perform AQI**. [E05]
2. A checklist opens with one line per question, and you as the reviewer. [E05] Tick each
   question the article meets. [E09]
3. Write your **Comments for Author/Version Author**. [E08]
4. Choose **Submit AQI**. [E08]

If you leave before submitting, the review stays **In Progress**: open the article again and
choose **Continue AQI**. [E06] [E14] If the article has meanwhile been replaced by a newer
version, **Discard AQI** on the old version throws your review away: *"The AQI review you had
previously initiated has been discarded."* [E07]

Perform AQI is a button of the classic form; nothing in the mirror puts it on the Knowledge
Center's article form. [E05]

## What happens when you submit {label=NEW}

- The score is calculated and becomes the article's **Latest AQI**; the field appears on the
  article only once a review is submitted. [E10] [E17]
- The **author** is emailed, or the **reviser** if the article has one, with the author in copy:
  *"AQI Review for KB…"*, *"An AQI review was performed on an article that you
  created/updated."*, with the score, **Passed** or **Failed**, your name and your comments.
  [E12] [E13]
- After submitting, nobody can change the review. [E16]

Who can see the results: the quality reviewers, the article's author and reviser, and its
knowledge base's owner and managers. [E15]

## Your lists {label=NEW}

The Knowledge Center's **Article quality index** card [E18] and the **Article Quality Index** list
group hold [E19]:

| List | Shows |
|---|---|
| **My Pending AQI Checklists** | reviews you started and haven't submitted |
| **My Completed AQI Checklists** | reviews you submitted |
| **All Pending** / **All Completed AQI Checklists** | everyone's |
| **AQI Checklists** | the checklists themselves |

## Tips

- Answer *yes* only when the article fully meets the question: every *no* costs 10 points, so
  four *no* answers fail it. [E02] [E11]
- Put what needs fixing in the comments: they are the only part of the email that tells the
  author what to change. [E12]
- Finish what you start: a review in progress blocks changes to the checklist and its
  questions for everyone. See [Set up knowledge bases](see:administer).

## Not yet seen {label=OPEN-QUESTION}

1. Perform AQI and the checklist form were not opened on screen. Are reviews meant to be done on
   the classic form, or does the Knowledge Center offer them too? [E05]
2. Is AQI meant to be used beyond the KCS demo knowledge base? IT, Known Error and Knowledge have
   no checklist. [E03]
3. Does anyone hold knowledge_coach or knowledge_domain_expert on pdi2, or do only admins
   review? Role members are not in the mirror. [E20]
4. Which article states may be reviewed? The property has no value in the mirror. [E21]
