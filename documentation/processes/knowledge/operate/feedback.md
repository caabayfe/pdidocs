---
title: Work feedback and knowledge gaps
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_script/3cf9004d67101300d358bb2d07415a62
    field: script
    how: read Knowledge Feedback Task Creation (after insert on kb_feedback, when a reason is given)
    result: 'creates a knowledge feedback task linked to the feedback; description: the reader''s comment, or "… was marked as not helpful", or "… was rated low"; type Internal feedback for a flag, User feedback otherwise'
    hash: b4734df90fd9e2ecabf5959b14c8a2e170e693ea27d499624270ac5bc19b4b3c
  E02:
    record: sys_properties/4945254453723300db47ddeeff7b122f
    field: value
    how: read glide.knowman.feedback.enable_actionable_feedback_for_flag, with KBAjaxSNC.kbWriteCommentWithParams (sys_script_include/eed75435eb7121007128a5fc5206fe93)
    result: 'true: a flag is saved with the reason Other, so every flag creates a task'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E03:
    record: sys_properties/a7cc6dfa53730300cc376512a2dc34ac
    field: value
    how: read glide.knowman.feedback.enable_actionable_feedback_for_helpful, and glide.knowman.feedback.enable_actionable_feedback_for_rating (sys_properties/b9bde13e53730300cc376512a2dc34bb)
    result: 'false and empty: a No or a low rating asks the reader for no reason, so it creates no task'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E04:
    record: sysrule_assignment/18708c8567030300d358bb2d07415a64
    field: script
    how: read Knowledge Feedback Task Assignment (Knowledge Management Advanced Installer is active)
    result: 'a new task about an article goes to the article''s author; to its reviser when it has one; to its ownership group and the group''s manager when it has one'
    hash: 0305a5ed6b18e5a93dc2aae3ee80444747f5a3b9c5baf2b06f356ab697c283b0
  E05:
    record: sys_db_object/31453eff8c5503100a22deb6dd2b4ef2
    children: sys_choice
    how: read the kb_feedback_task state, type and resolution code choices
    result: 'New, Work in progress, Awaiting information, Resolved, Closed; User feedback, Internal feedback, Knowledge gap, Knowledge gap - manual, Unsuccessful search, Other; Updated article, Created article, Updated search configuration, No action, Others'
    hash: bf650de90a21cd8aad7f362f3ae25a28c01cdfbd9da86aaed0389c444869e443
  E06:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Knowledge Center (/now/knowledge-center › Knowledge Hub)
    how: opened the Knowledge Center
    result: '"Knowledge Center — Set up, manage, and monitor your knowledge bases"; Requires attention › My Article Optimization; Actions: Create an article, Manage groups; Knowledge features cards: Knowledge analytics dashboard, Your articles, Article quality index, Your approvals'
  E07:
    record: sys_ux_list_category/62baed21fff92210e9c3ffffffffff02
    how: read the Feedback Management lists of the Knowledge Center (sys_ux_list 53cae161fff92210e9c3ffffffffff5e, 8ba4f5edff3d2210e9c3fffffffffff8, 4e25bd21ff7d2210e9c3ffffffffffd5, 0a4575edff3d2210e9c3ffffffffffef, 26967965ff7d2210e9c3ffffffffff4d, 02f6f561ff7d2210e9c3ffffffffff08, 1b17b9a5ff7d2210e9c3ffffffffff6f)
    result: 'Feedback (on knowledge bases you own or manage), My Flagged (flagged articles you wrote or revised), My Submitted Tasks, My Assigned Tasks (yours, your groups'' or groups you manage, not Closed), My Closed Tasks, All Open Tasks, All Closed Tasks'
    hash: 13ebc7d81efa8effca9ed114cff111a64d073c87063d3d3ef1dd1a089b855056
  E08:
    record: sys_ux_list/bf503f49533330105264ddeeff7b1285
    how: read Your feedback tasks, and Your tasks - flagged (sys_ux_list/449fab524330a110e3548772d9b8f2b1), in the Service Operations Workspace's Knowledge lists
    result: 'open tasks assigned to you, your groups or groups you manage; flags (Internal feedback) in their own list'
    hash: b9da13aa73bcca02d867a717c38ef58efeb743f94bba00dab284d999ca4efe29
  E09:
    record: sys_ui_action/0b28954967101300d358bb2d07415af4
    field: condition
    how: read Edit Article (kb_feedback_task) and KBFeedbackTaskSNC.canEditArticle (sys_script_include/f708f3b167630300d358bb2d07415a18)
    result: 'shown while the task isn''t Closed and is about an article that isn''t external, to its assignee if they can contribute to the knowledge base, and to knowledge administrators and the knowledge base''s owner and managers; opens the article'
    hash: 5e2337b397e39d2cf06a90fda513c8f927e24070c2d3fada1ceb555dac0eea7d
  E10:
    record: sys_ui_action/0c1be8c75333330016e9ddeeff7b123a
    field: script
    how: read Create Article (sn_ui_knowledge, kb_feedback_task), with the variant without templates (sys_ui_action/ba6f184c5300001016e9ddeeff7b1245)
    result: 'shown on an active task to its assignee or anyone with elevated access who can create articles; opens a Create Article dialog to pick a template when templates apply, otherwise a new article whose source is the task'
    hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  E11:
    record: sys_ui_policy/ca02bf0b67330300d358bb2d07415ae7
    how: read Marking Resolution Notes Mandatory when state is changed to Resolved, with Make outcome field Mandatory (sys_ui_policy/d36d449a67201300d358bb2d07415a9f) and Make Resolution Code Read Only (sys_ui_policy/1ce88ee653301300cc376512a2dc34ea)
    result: 'Resolved needs a Resolution Code and resolution notes; Created article needs the Outcome (the new article); the code can be set only in Resolved'
    hash: b3f067446797c17106983333808b095666222ea6a8e7e138e21de156f73142ef
  E12:
    record: sys_script_client/1fca333b53701300cc376512a2dc34dd
    field: script
    how: read Make Additional comments mandatory, with Show Additional Info Message (sys_script_client/6c4e489a67201300d358bb2d07415a9f)
    result: 'Awaiting information makes Additional comments mandatory and shows "Please add customer visible comments"'
    hash: b6abda8ce56044a734d8c53b0b7530e53be38a235792d6d155e2fe99d9f63a47
  E13:
    record: sys_ui_action/92c3f74b67330300d358bb2d07415af3
    field: script
    how: read Accept and Reject (sys_ui_action/b8043b4b67330300d358bb2d07415ac0)
    result: 'shown only to whoever opened a Resolved task about an article; Accept sets Closed, Reject sets Work in progress; each queues an event that emails the assignee'
    hash: 41c18994980c457f8b1dc7b5ad98e097c1e26375fb5b88efd456c2559a076f62
  E14:
    record: sys_security_acl/8c8ca05767430300d358bb2d07415a49
    field: script
    how: read the write ACL on kb_feedback_task.state, with the ones on assigned_to (sys_security_acl/2079c15c67330300d358bb2d07415a70) and on the task (sys_security_acl/b95e5c0d67030300d358bb2d07415af0)
    result: 'the state can be changed by the assignee and by those with elevated access; the assignee by the assignee, elevated access or the ownership group; the task is writable by them and by whoever opened it'
    hash: 4516a6e1a8c24926cb698d052c234cd6f5d3134aea1c66cafdf908c6eb7ba3d3
  E15:
    record: sys_script_include/f708f3b167630300d358bb2d07415a18
    field: script
    how: read KBFeedbackTaskSNC.hasElevatedAccess
    result: 'knowledge administrators, the knowledge base''s owner and managers; for a gap reported from a task, knowledge_manager and knowledge_domain_expert'
    hash: 20989cd204b4d911235de56f10968c668684390fc8998bb91eb665469901ea35
  E16:
    record: sys_security_acl/2caf904d67030300d358bb2d07415aaf
    field: script
    how: read the read ACL on kb_feedback_task
    result: 'the assignee, whoever opened it, anyone who can contribute to the article''s knowledge base, and, for a gap, anyone who can read the parent task'
    hash: 5a07ba477debf43129d68b103cc91edf0542d8285d8d6b71460eea28d52b832f
  E17:
    record: sysevent_email_action/a5ab8a3d67330300d358bb2d07415a73
    how: 'read KM Feedback Task: Created, with its mail script (sys_script_email/abd6523167730300d358bb2d07415a90)'
    result: '"Feedback Task … has been assigned to you": "A new feedback requires your action …", with the article, its title, the reason and the description; only when the task is about an article'
    hash: 9a872ee3096335b10f9249add8912b62c993157dcbe8e1b643797828064e2102
  E18:
    record: sysevent_email_action/8938a6bd67730300d358bb2d07415a34
    how: 'read KM Feedback Task: Reassigned, fired by Notifications on knowledge Feedback Task (sys_script/e9c9023d67330300d358bb2d07415a58)'
    result: '"Feedback Task … has been reassigned to you", with "Assigned by:", to the new assignee; not for gaps from a task'
    hash: dc3779a81b558039f95890412f0e81ceca06bf04101ab40e8371a8ca9aea23d3
  E19:
    record: sysevent_email_action/91d2072e67001300d358bb2d07415a07
    how: 'read KM Feedback Task: Commented'
    result: '"Feedback Task … has been updated", to the assignee, when additional comments are added to a task about an article'
    hash: a6fbec0287f1e2c348a74c58918f81af39a0a0e2717df968b9361a9d49904308
  E20:
    record: sysevent_email_action/0a0e1b2867101300d358bb2d07415a7b
    how: 'read KM Feedback Task: Info from Submitter and KM Feedback Task: Resolved (sysevent_email_action/0178bf8b67330300d358bb2d07415adc)'
    result: '"Feedback Task … has been updated" when it becomes Awaiting information, and "Your Feedback Task … has been resolved" when it becomes Resolved, to whoever opened it'
    hash: 9c0a041947463cde6e87800297f355749fe0b04a5cae86729d704836a913828c
  E21:
    record: sysevent_email_action/4811e1d667001300d358bb2d07415a63
    how: 'read KM Feedback Task: Resolution Accepted and Resolution Rejected (sysevent_email_action/dcb165d667001300d358bb2d07415a5d)'
    result: '"Your resolution to the Feedback Task … has been accepted" or "… rejected", to the assignee'
    hash: d0c91ee3b9f53d4e6af8164b1110181d80749c617ae657f99b644345532dce3e
  E22:
    record: sys_ui_action/4c1cfa36c611227501e6728036d9723b
    field: condition
    how: read Assign to me (task)
    result: shown to anyone who can write the task
    hash: c0228661c47236953696c6cc53ffa9a2f0e03a0d040f89938ace56cd4d9930b9
  E23:
    record: sys_properties/58b7a716db103200a042f278f0b8f585
    field: value
    how: read glide.knowman.versioning.enabled
    result: true; published articles are changed through new versions
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## When a feedback task reaches you

A reader who **flags** an article creates a **knowledge feedback task** for it, with their
comment as its description. [E01] [E02] On pdi2 that is the only feedback that creates work: a
*No* to *Helpful?* or a low star rating is counted but creates no task. [E03] [Q02]

The task goes to the article's **author**, or to its **reviser** when someone revised it. [E04] [Q19]
You get *"Feedback Task … has been assigned to you"*. [E17]

Gaps reported from incidents are feedback tasks too, without an article and without an assignee:
the knowledge managers pick them up. [E04] [E15] [Q05] See
[Create and link knowledge from an incident](see:incident/share-knowledge).

| Type | Comes from |
|---|---|
| **Internal feedback** | a reader's flag [E01] |
| **User feedback** | a rating or *No* with a reason (not asked for on pdi2) [E01] [E03] |
| **Knowledge gap** | a gap reported from an incident [E05] |

[E05]

## Find your tasks

Open the **Knowledge Center** (navigator › **Knowledge Center**). [E06] Its **Feedback
Management** lists are:

| List | Shows |
|---|---|
| **Feedback** | all feedback on the knowledge bases you own or manage |
| **My Flagged** | flagged articles you wrote or revised |
| **My Assigned Tasks** | open tasks assigned to you, your groups, or groups you manage |
| **My Submitted Tasks** | tasks you raised |
| **My Closed Tasks** | your closed tasks |
| **All Open Tasks** / **All Closed Tasks** | every task you may read |

[E07] [Q37]

In the **Service Operations Workspace**, the **Knowledge** lists have **Your feedback tasks** and,
separately, **Your tasks - flagged**. [E08]

## Work a feedback task

{{animation:kbfeedback}}

1. Open the task from the email or from **My Assigned Tasks**. Read the description: it is the
   reader's comment. [E01] [E07] [E17]
2. Set the state to **Work in progress**. [E05]
3. If you need more from the reader, set **Awaiting information** and write your question in
   **Additional comments**: it is mandatory in that state, and the reader is emailed. [E12] [E20]
4. Fix it:
   - **Edit Article** opens the article. Versioning is on, so change a published article through
     a new version: see [Update a published article](see:update). [E09] [E23]
   - **Create Article** starts a new article from the task, when the answer belongs in an article
     of its own. [E10]
5. Set the state to **Resolved**, choose the **Resolution Code** and write the resolution notes.
   With **Created article**, fill **Outcome** with the new article.
   [E11]

The reader is emailed *"Your Feedback Task … has been resolved"* and asked to accept. [E20]

### Resolution codes

| Code | Use when |
|---|---|
| **Updated article** | you corrected the article |
| **Created article** | you wrote a new one (set **Outcome**) |
| **Updated search configuration** | the article was right but hard to find |
| **No action** | the feedback doesn't need a change |
| **Others** | anything else; say what in the notes |

[E05] [E11]

## Hand it on

If someone else should do it, change **Assigned to**; the new assignee is emailed *"Feedback
Task … has been reassigned to you"*. [E14] [E18] A knowledge base's owner or manager can take
any task on it with **Assign to me**. [E15] [E22]

## After you resolve it

Only the reader who raised the task sees **Accept** and **Reject**. [E13]

| They choose | The task | You get |
|---|---|---|
| **Accept** | Closed | *"Your resolution to the Feedback Task … has been accepted"* [E13] [E21] |
| **Reject** | back to Work in progress | *"… has been rejected"*: look at their comments and try again [E13] [E21] |

If they do neither, the task stays **Resolved**: no job, rule or flow in the mirror closes it.
[E13] [Q01]

## Who sees what

- You can open a task if it is assigned to you, you raised it, or you may contribute to the
  article's knowledge base. [E16]
- Only the assignee, knowledge administrators and the knowledge base's owner and managers can
  change its state. [E14] [E15]
- Comments on the task (**Additional comments**) reach the reader; the assignee is emailed when
  someone adds one. [E19] [E20]

## Tips

- Answer the reader in **Additional comments**, in plain words: they see it, not your work notes.
- Resolve with **No action** when the article is right, and say why: the reader can still reject.
- Check **My Flagged** in the Knowledge Center now and then: an article stays flagged while it
  has open flags. [E07]
