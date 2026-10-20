---
title: Ratings, flags and feedback tasks - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sp_widget/5f599c490be432004ce28ffe15673a5b
    field: script
    how: read Knowledge Article Helpful (sn_km_portal) on esc_kb_article_view
    result: 'Yes/No through KBPortalService.saveUsefulWithParams; stars through submitRating; a reason dialog only when glide.knowman.feedback.enable_actionable_feedback_for_helpful is true (No) or the rating is at or below glide.knowman.feedback.enable_actionable_feedback_for_rating'
    hash: 95b5b0d15385d0edad25bfac3dabdb10b5eff82cf28de5da70b5180e1286f3a1
  E02:
    record: sp_widget/a47ea1cb0b9432004ce28ffe15673a5b
    field: script
    how: read Knowledge Article Content, its flag dialog (sp_ng_template/b092dada0b4132004ce28ffe15673a35) and its reason dialog (sp_ng_template/e215143f53330300cc376512a2dc3414)
    result: 'Flag Article opens a comment-only dialog (saveFlagComment), hidden when the article has disable_suggesting; the reason dialog (reasons from kb_feedback.reason) opens only for an actionable No or rating'
    hash: ade57e9bff48b006aab67cdeca19f7a33211e8f5ac8baffadd0920e4c3def7f8
  E03:
    record: sys_script_include/eed75435eb7121007128a5fc5206fe93
    field: script
    how: read KBAjaxSNC.saveUsefulWithParams, saveStarRatingWithParams and kbWriteCommentWithParams
    result: 'each checks the show_* property, its .roles and read access to the article, then inserts kb_feedback with GlideRecordSecure; a flag gets reason 4 (Other) while glide.knowman.feedback.enable_actionable_feedback_for_flag is true'
    hash: ea2fff4ac1ec64ff66ffc465d7dc5198898089146cc2e1f1dc45ff84b622f33a
  E04:
    record: sys_script_include/bc65e4c1db30320099f93691f0b8f58b
    field: script
    how: read KBPortalServiceImpl.addComment, submitRating, deleteComment and likeComment
    result: 'comments and ratings insert kb_feedback for readers who can read the article; a comment can be deleted by its writer, a knowledge admin or the knowledge base owner; likes go to m2m_kb_feedback_likes'
    hash: 29702fdc4bc81003541ff80cbcfd527362e01f8999a4547a4873d50a84acc698
  E05:
    record: sys_db_object/9e45beff8c5503100a22deb6dd2b4e10
    children: sys_choice
    how: read the kb_feedback reason and useful choices
    result: 'reasons The article is incomplete (1), … contains incorrect information (2), … is unclear (3), Other (4); useful Yes, No'
    hash: 647b49c50e63ce7f5b215f8cfe2ca24fe53dbef8ddbe1916ef6f0b13def6f0a8
  E06:
    record: sys_script/0f3266ff733023008bbc1c86fbf6a78c
    how: 'read the before rules on kb_feedback: Abort ratings insert when out of bounds, Set SessionID and User for Flag (3c9e7058c3c01300e2fd5cb981d3ae8c), HTML Sanitizer on kb feedback (d76f23daff000310428fffffffffffce), Update Article Summary (4ad406d2db013200a042f278f0b8f525), Set Resolved Checkbox (79c8fca10a0a0b34016e42f41e9dd7af)'
    result: 'a rating outside 1–5 is refused; session and user are filled; comments are sanitised; the article summary is copied; clearing a flag sets Resolved'
    hash: bfb9717927e65296659b58a3d194a6fb0ef60c96493a5f1eb166647ec0c4b111
  E07:
    record: sys_script/f955ee0fc0a8016601b9685f55f4ccf4
    field: script
    how: read Set Flagged Status (after insert, update, delete)
    result: the article is flagged while any of its feedback is flagged
    hash: af805858b08d72a1b474f7f473cd04c6561442fedbf05373d6919b9c45a85558
  E08:
    record: sys_script/9e86eb3d0a0a0b4101e402ebc4111862
    how: 'read Calculate Article Rating (async), Calculate Rating on Delete (sys_script/676d3d4a53433300db47ddeeff7b12a9) and Populate Helpful Count (sys_script/f06b361dc71230108ad4010703c26044, async_always)'
    result: 'KBCommon.updateRating recalculates the article rating; a deleted rating queues kb_feedback.rating.deleted; helpful Yes votes are counted across versions'
    hash: 29be806cde7b54a11e3a5ba44bd13270350e37241c0591bfb6971dad1baa7f40
  E09:
    record: sys_script/3cf9004d67101300d358bb2d07415a62
    field: script
    how: 'read Knowledge Feedback Task Creation (after insert on kb_feedback, filter reason is not empty, condition KBFeedbackTask().canCreateFeedbackTask)'
    result: 'inserts kb_feedback_task with feedback, description (comment, "… was marked as not helpful" or "… was rated low") and type 2 Internal feedback when flagged, 1 User feedback otherwise'
    hash: b4734df90fd9e2ecabf5959b14c8a2e170e693ea27d499624270ac5bc19b4b3c
  E10:
    record: sys_script_include/f708f3b167630300d358bb2d07415a18
    field: script
    how: read KBFeedbackTaskSNC
    result: 'canCreateFeedbackTask: with glide.knowman.feedback.enable_explicit_feedback true, reason Other needs a comment, otherwise always; hasElevatedAccess: knowledge admin, KB owner, KB managers, or for a task-parented gap knowledge_manager and knowledge_domain_expert; canEditArticle: not Closed, an internal article, elevated or the assignee who can contribute'
    hash: 20989cd204b4d911235de56f10968c668684390fc8998bb91eb665469901ea35
  E11:
    record: sysrule_assignment/18708c8567030300d358bb2d07415a64
    field: script
    how: read Knowledge Feedback Task Assignment (condition feedback.article is not empty)
    result: 'on insert without parent: the article''s author; with External Content Integration and an external article, the KB owner; with KM Advanced Installer, the ownership group and its manager, else the reviser'
    hash: 0305a5ed6b18e5a93dc2aae3ee80444747f5a3b9c5baf2b06f356ab697c283b0
  E12:
    record: sys_ui_policy/ca02bf0b67330300d358bb2d07415ae7
    how: 'read the UI policies on kb_feedback_task: Marking Resolution Notes Mandatory when state is changed to Resolved, Make outcome field Mandatory (d36d449a67201300d358bb2d07415a9f), Make Resolution Code Read Only (1ce88ee653301300cc376512a2dc34ea)'
    result: 'Resolved: resolution_code and close_notes mandatory; resolution_code 2 (Created article): outcome mandatory; resolution_code read-only outside Resolved'
    hash: b3f067446797c17106983333808b095666222ea6a8e7e138e21de156f73142ef
  E13:
    record: sys_script_client/1fca333b53701300cc376512a2dc34dd
    field: script
    how: read Make Additional comments mandatory and Show Additional Info Message (sys_script_client/6c4e489a67201300d358bb2d07415a9f), onChange of state
    result: 'Awaiting information (-3): comments mandatory, "Please add customer visible comments"'
    hash: b6abda8ce56044a734d8c53b0b7530e53be38a235792d6d155e2fe99d9f63a47
  E14:
    record: sys_ui_action/92c3f74b67330300d358bb2d07415af3
    field: script
    how: read Accept and Reject (sys_ui_action/b8043b4b67330300d358bb2d07415ac0), form buttons on kb_feedback_task, also in the Knowledge Center (sys_ux_form_action/a7df915ef5a31410f877c83250b893c5, b820a55ef5a31410f877c83250b8936c)
    result: 'condition state 6, opened_by is you, feedback set; Accept: state 3 and event kb_feedback_task.resolution_accepted; Reject: state 2 and kb_feedback_task.resolution_rejected; both to the assignee'
    hash: 41c18994980c457f8b1dc7b5ad98e097c1e26375fb5b88efd456c2559a076f62
  E15:
    record: sys_ui_action/0b28954967101300d358bb2d07415af4
    how: read Edit Article and Create Article (sys_ui_action/87774c1a67201300d358bb2d07415aee; sn_ui_knowledge 0c1be8c75333330016e9ddeeff7b123a and ba6f184c5300001016e9ddeeff7b1245), with the Knowledge Center form actions (sys_ux_form_action/f03fb934cd1f1010f877013634250036, b6ee3534cd1f1010f87701363425000b)
    result: 'Edit Article: canEditArticle, opens the article (classic kb_knowledge.do, workspace form mode); Create Article: active, assignee or elevated, KBKnowledge.canCreate; the template dialog when KnowledgeUIAction.showTemplateSelector, else a new article with source the task'
    hash: fe5f3820472f6a5f4fa99d47bb43cea476a69df132035ce340a12e18a98fdb73
  E16:
    record: sys_security_acl/2caf904d67030300d358bb2d07415aaf
    field: script
    how: 'read the kb_feedback_task ACLs: read (2caf904d…), write (b95e5c0d67030300d358bb2d07415af0), state (8c8ca05767430300d358bb2d07415a49), assigned_to (2079c15c67330300d358bb2d07415a70), comments (5ff7491c67330300d358bb2d07415a49), create (ce1c940d67030300d358bb2d07415a48)'
    result: 'read: assignee, opener, contributors of the article''s KB, readers of the parent task; write (active): assignee, opener, elevated or ownership group; state: elevated or assignee; assigned_to: assignee, elevated or ownership group; comments: also the article''s author and reviser; create: anyone, or readers of the parent task'
    hash: 5a07ba477debf43129d68b103cc91edf0542d8285d8d6b71460eea28d52b832f
  E17:
    record: sys_script/e9c9023d67330300d358bb2d07415a58
    field: script
    how: read Notifications on knowledge Feedback Task (after update, assigned_to changes, parent is empty)
    result: queues kb_feedback_task.reassigned for the new assignee, with who assigned it
    hash: 23db49301dde033539c51cf1ff5c40943e74348b9526cd6c67d9446a0d8cc869
  E18:
    record: sysevent_email_action/a5ab8a3d67330300d358bb2d07415a73
    how: 'read the seven KM Feedback Task notifications: Created, Reassigned (8938a6bd67730300d358bb2d07415a34), Commented (91d2072e67001300d358bb2d07415a07), Info from Submitter (0a0e1b2867101300d358bb2d07415a7b), Resolved (0178bf8b67330300d358bb2d07415adc), Resolution Accepted (4811e1d667001300d358bb2d07415a63), Resolution Rejected (dcb165d667001300d358bb2d07415a5d)'
    result: all active; the record-triggered ones require feedback.article, so tasks for gaps send none
    hash: 9a872ee3096335b10f9249add8912b62c993157dcbe8e1b643797828064e2102
  E19:
    record: sys_script_email/abd6523167730300d358bb2d07415a90
    field: script
    how: read the mail scripts Notification Feedback Task Created, Reassigned (70b86abd67730300d358bb2d07415a45), Info from Submitter (a05e9b2867101300d358bb2d07415a2e) and Resolved (1fa9b3cb67330300d358bb2d07415a43)
    result: 'assignee emails link to kb_feedback_task.do and kb_knowledge.do; reader emails link to <portal>?id=form&table=kb_feedback_task, the portal from sn_km_portal.glide.knowman.serviceportal.portal_url, default kb'
    hash: 6bfcd3ad9675aa3c4a49a701173e60e782cb90e7df49dcf9e09fd4fffb00e8f4
  E20:
    record: sys_ux_list_category/62baed21fff92210e9c3ffffffffff02
    how: read Feedback Management in the Knowledge Center (sn_km_center) and its seven lists
    result: 'Feedback (kb_feedback on KBs you own or manage), My Flagged (kb_knowledge), My Submitted Tasks, My Assigned Tasks, My Closed Tasks, All Open Tasks, All Closed Tasks; no roles on the lists'
    hash: 13ebc7d81efa8effca9ed114cff111a64d073c87063d3d3ef1dd1a089b855056
  E21:
    record: sys_ux_list/bf503f49533330105264ddeeff7b1285
    how: read Your feedback tasks and Your tasks - flagged (sys_ux_list/449fab524330a110e3548772d9b8f2b1) in the Service Operations Workspace's Knowledge category
    result: 'open tasks for you, your groups or groups you manage, split by feedback_task_type 2'
    hash: b9da13aa73bcca02d867a717c38ef58efeb743f94bba00dab284d999ca4efe29
  E22:
    record: sys_app_module/e372718967030300d358bb2d07415ac9
    how: read the classic Knowledge modules My Assigned Tasks and All Open Tasks (sys_app_module/ac87f10d67030300d358bb2d07415abe)
    result: 'My Assigned Tasks for knowledge; All Open Tasks for knowledge_admin and knowledge_manager'
    hash: 67ee986acf7806d19eef1c2670056c041bb6aad5d2d91da99538943be0174ff1
  E23:
    record: sys_properties/4945254453723300db47ddeeff7b122f
    field: value
    how: read glide.knowman.feedback.enable_actionable_feedback_for_flag
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E24:
    record: sys_properties/a7cc6dfa53730300cc376512a2dc34ac
    field: value
    how: read glide.knowman.feedback.enable_actionable_feedback_for_helpful
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E25:
    record: sys_properties/b9bde13e53730300cc376512a2dc34bb
    field: value
    how: read glide.knowman.feedback.enable_actionable_feedback_for_rating
    result: empty
    hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  E26:
    record: sys_properties/2f15529253123010733addeeff7b1278
    field: value
    how: read glide.knowman.feedback.enable_explicit_feedback
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E27:
    record: sys_properties/7663c1afc0a8016600ccdd268ae454e0
    field: value
    how: 'read glide.knowman.show_flag, show_star_rating (7661977ac0a8016600640eb8e4202624), show_yn_rating (765fd337c0a801660112da440e7de925), show_rating_options (765cb953c0a801660135d3daaad648a8), and their .roles properties'
    result: all true, with no roles
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E28:
    record: sys_properties/c9b357af0a0a0b82008cba97a078daca
    field: value
    how: read glide.knowman.show_user_feedback, with glide.knowman.feedback.display_threshold (sys_properties/c8c8021f0a0a0b8201d984bd7cbdab7e) and glide.knowman.max_comments_per_user_daily (sys_properties/5187fa7dd7612200efc000285e610385)
    result: 'onload; 5 comments shown before Show More; no daily limit set'
    hash: 6ac7d5df1133633bd7e8ba8472e3c0e0c99a0a0be8db3aaf2924c269723b13ba
  E29:
    record: sys_properties/33cef466db41320002533691f0b8f50b
    how: read sn_km_portal.glide.knowman.serviceportal.portal_url (no value in the mirror)
    result: empty
    hash: af98430605f0dc622c24d3b3877e4dd20add12c48df3935b2044a334803837bc
---
## The applications {label=NEW}

| Scope | What it gives |
|---|---|
| `global` (Knowledge Management, KM Advanced) | `kb_feedback` and `kb_feedback_task`, their rules, the assignment rule, ACLs, the classic form, the seven notifications |
| `sn_km_portal` | the article page's widgets in Employee Center and the Knowledge Portal: Helpful, rating, flag, comments |
| `sn_km_center`, `sn_km_uib` | the Knowledge Center's Feedback Management lists and the task's form actions |
| `sn_sow`, `sn_ui_knowledge` | the Service Operations Workspace's Knowledge lists and its Create Article action |

Readers' pages: [Rate an article or say what is wrong](see:rate). Authors' and managers' page:
[Work feedback and knowledge gaps](see:feedback).

## 1. What a reader can send {label=NEW}

| Reader action | Widget call | Record | Asks for a reason |
|---|---|---|---|
| Helpful? Yes / No | `saveUsefulWithParams` [E01] | `kb_feedback.useful` [E03] | No only if `…for_helpful` is true: **false** [E01] [E24] |
| Rate this article | `submitRating` [E01] | `kb_feedback.rating`, 1–5 [E04] [E06] | only at or below `…for_rating`: **empty** [E01] [E25] |
| Actions › Flag Article | `saveFlagComment` [E02] | `kb_feedback.flagged`, comment mandatory | no; reason **Other** is set while `…for_flag` is true [E03] [E23] |
| Post a comment | `addComment` [E04] | `kb_feedback.comments` | no |

Every call checks the matching `glide.knowman.show_*` property and its `.roles`, and read access
to the article. [E03] All are on, for everyone. [E27] [E28] The reasons offered, when the reason
dialog is used, are the `kb_feedback.reason` choices. [E02] [E05] Flag Article is hidden on
articles with **Disable suggesting**, which can be inherited from the knowledge base. [E02] [Q29]

So on pdi2 **only flags reach the tasks**: helpful and rating votes, and comments, never carry a
reason. [E09] [Q02]

## 2. What the feedback record does {label=NEW}

In order:

1. **Before**: a rating outside 1–5 is refused; session and user are filled; the comment is
   sanitised; the article summary is copied; clearing a flag ticks Resolved. [E06]
2. **After**: *Set Flagged Status* flags the article while it has flagged feedback. [E07]
3. **After insert**, with a reason: *Knowledge Feedback Task Creation* creates the task. [E09]
   `canCreateFeedbackTask` lets everything through while
   `glide.knowman.feedback.enable_explicit_feedback` is false. [E10] [E26]
4. **Async**: the article's rating and helpful count are recalculated. [E08]

## 3. Assignment {label=NEW}

*Knowledge Feedback Task Assignment* runs for tasks about an article, on insert, without a parent
[E11]:

1. the article's **author**;
2. KM Advanced Installer is active, so: the article's **ownership group** and its manager when
   it has one, otherwise its **reviser** when it has one. [Q19]

Gaps reported from a task (incident) have a parent, so they stay unassigned and are worked by
knowledge admins, `knowledge_manager` and `knowledge_domain_expert`. [E10] [E11] With no assignee, they send no email. [E18] [Q05]

## 4. The task's form {label=NEW}

| Rule | Effect |
|---|---|
| Awaiting information | Additional comments mandatory, *"Please add customer visible comments"* [E13] |
| Resolved | Resolution Code and resolution notes mandatory [E12] |
| Created article | Outcome mandatory [E12] |
| Not Resolved | Resolution Code read-only [E12] |

| Action | Shown to | Does |
|---|---|---|
| **Edit Article** | assignee who can contribute, or elevated; not Closed; internal article [E10] [E15] | opens the article |
| **Create Article** | assignee or elevated, who can create articles; active task [E15] | template dialog, or a new article sourced from the task |
| **Accept** / **Reject** | the opener, on Resolved [E14] | Closed / Work in progress, and an email to the assignee |

Classic buttons and the Knowledge Center form actions are the same UI actions. [E14] [E15]
Nothing closes a Resolved task the reader never accepts. [E14] [Q01]

## 5. Who can read and change a task {label=NEW}

[E16]

| Access | Who |
|---|---|
| Read | the assignee, the opener, anyone who can contribute to the article's knowledge base, readers of the parent task |
| Write (active tasks) | the assignee, the opener, elevated users, the ownership group |
| State | the assignee and elevated users |
| Assigned to | the assignee, elevated users, the ownership group |
| Additional comments | also the article's author and reviser |

Elevated: knowledge admins, the knowledge base's owner and managers. [E10]

## 6. Notifications {label=NEW}

| Notification | Trigger | To |
|---|---|---|
| KM Feedback Task: Created | insert, about an article | assignee |
| KM Feedback Task: Reassigned | event from *Notifications on knowledge Feedback Task* [E17] | new assignee |
| KM Feedback Task: Commented | comments change, about an article | assignee |
| KM Feedback Task: Info from Submitter | state → Awaiting information | opener |
| KM Feedback Task: Resolved | state → Resolved | opener |
| KM Feedback Task: Resolution Accepted | event from **Accept** [E14] | assignee |
| KM Feedback Task: Resolution Rejected | event from **Reject** [E14] | assignee |

[E18] The assignee's emails link to the classic forms; the reader's to a portal form page, the
portal named by `sn_km_portal.glide.knowman.serviceportal.portal_url`, empty on pdi2, so `kb`.
[E19] [E29] [Q04]

## 7. Where tasks are listed {label=NEW}

- **Knowledge Center › Feedback Management**: seven lists, no roles on them. [E20]
- **Service Operations Workspace › Knowledge**: *Your feedback tasks* and *Your tasks -
  flagged*. [E21]
- **Classic › Knowledge**: *My Assigned Tasks* (`knowledge`), *All Open Tasks*
  (`knowledge_admin`, `knowledge_manager`). [E22]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `glide.knowman.feedback.enable_actionable_feedback_for_flag` | true | flags carry reason Other, so they create tasks [E23] |
| `glide.knowman.feedback.enable_actionable_feedback_for_helpful` | false | No asks no reason, creates no task [E24] |
| `glide.knowman.feedback.enable_actionable_feedback_for_rating` | empty | no rating threshold, no task [E25] |
| `glide.knowman.feedback.enable_explicit_feedback` | false | reason Other without a comment still creates a task [E26] |
| `glide.knowman.show_flag`, `show_star_rating`, `show_yn_rating`, `show_rating_options` | true, no roles | all reader options on [E27] |
| `glide.knowman.show_user_feedback` | onload | comments shown [E28] |
| `glide.knowman.feedback.display_threshold` | 5 | comments shown before *Show More* [E28] |
| `glide.knowman.max_comments_per_user_daily` | empty | no daily limit [E28] |
| `sn_km_portal.glide.knowman.serviceportal.portal_url` | empty | readers' email links use `kb` [E29] |
