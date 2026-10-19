---
title: Who is told what
reviewed: 2026-10-19
evidence:
  E01:
    record: sysevent_email_action/0ffccf9ac3ed821049b29e0f0501319a
    how: read Knowledge article email (sn_ex_sp, event sn_ex_sp.knowledge.send_email)
    result: '"Article: <short description>", to the person named in the event'
    hash: 5cf72b75135c46db9e0b434ac4527218e2733029387065e96ed4beca98df95ca
  E02:
    record: sysevent_email_action/0178bf8b67330300d358bb2d07415adc
    how: 'read KM Feedback Task: Resolved'
    result: '"Your Feedback Task … has been resolved", to whoever opened it, when a task about an article becomes Resolved'
    hash: eb7e4eb810fd59126ddcf4d578b87219ffb958269db873adb5eca5a2ac4d58de
  E03:
    record: sysevent_email_action/0a0e1b2867101300d358bb2d07415a7b
    how: 'read KM Feedback Task: Info from Submitter'
    result: '"Feedback Task … has been updated", to whoever opened it, when a task about an article becomes Awaiting information'
    hash: 9c0a041947463cde6e87800297f355749fe0b04a5cae86729d704836a913828c
  E04:
    record: sysevent_email_action/a5ab8a3d67330300d358bb2d07415a73
    how: 'read KM Feedback Task: Created'
    result: '"Feedback Task … has been assigned to you", to the assignee, only when the feedback is about an article'
    hash: 9a872ee3096335b10f9249add8912b62c993157dcbe8e1b643797828064e2102
  E05:
    record: sysrule_assignment/18708c8567030300d358bb2d07415a64
    field: script
    how: read Knowledge Feedback Task Assignment
    result: a new task about an article goes to the article's author (to the ownership group and its manager, or the reviser, when the article has them)
    hash: 0305a5ed6b18e5a93dc2aae3ee80444747f5a3b9c5baf2b06f356ab697c283b0
  E06:
    record: sysevent_email_action/8938a6bd67730300d358bb2d07415a34
    how: 'read KM Feedback Task: Reassigned, fired by Notifications on knowledge Feedback Task (sys_script/e9c9023d67330300d358bb2d07415a58) when the assignee changes'
    result: '"Feedback Task … has been reassigned to you", to the new assignee'
    hash: dc3779a81b558039f95890412f0e81ceca06bf04101ab40e8371a8ca9aea23d3
  E07:
    record: sysevent_email_action/91d2072e67001300d358bb2d07415a07
    how: 'read KM Feedback Task: Commented'
    result: '"Feedback Task … has been updated", to the assignee, when a comment is added to a task about an article'
    hash: a6fbec0287f1e2c348a74c58918f81af39a0a0e2717df968b9361a9d49904308
  E08:
    record: sysevent_email_action/4811e1d667001300d358bb2d07415a63
    how: 'read KM Feedback Task: Resolution Accepted and Resolution Rejected (sysevent_email_action/dcb165d667001300d358bb2d07415a5d), queued by Accept and Reject'
    result: '"Your resolution to the Feedback Task … has been accepted" or "… rejected", to the assignee'
    hash: d0c91ee3b9f53d4e6af8164b1110181d80749c617ae657f99b644345532dce3e
  E09:
    record: sysevent_email_action/8d4c2145b7312300bc1308a9ee11a96d
    how: 'read KM: Approve article for publishing (sysapproval_approver), with the mail script km_approval (sys_script_email/658df9c6b7122300bc1308a9ee11a9c4)'
    result: '"<number> is awaiting approval.", to each approver of an article or template'
    hash: bb1ca1df2e6bb1dd942f7c8be9e6c9c2bc248d77c4b73bf331e4df52e807e211
  E10:
    record: sysevent_email_action/298b8301b7403300343f08a9ee11a99f
    how: 'read KM: Article approved for publish, with the mail script km_approved (sys_script_email/d2e7f439b7122300bc1308a9ee11a939)'
    result: '"<number> is approved.", to the person named in the event; sent only while glide.knowman.enable_approval_notification is true'
    hash: cca5c3d1bb594113618faa1299994ccf0bf0efa8733302b6665b3e153e8d195c
  E11:
    record: sysevent_email_action/d859653dcb403300343f582df8076d62
    how: 'read KM: Article rejected for publish, with the mail script km_rejected (sys_script_email/44f4bd7db7522300bc1308a9ee11a933)'
    result: '"<number> is rejected.", to the person named in the event; same property'
    hash: 5801342eba8fa658524626d4aac7180c267537e158fea17eaccbe817c0381f09
  E12:
    record: sys_properties/0d8e2767b7122300bc1308a9ee11a9bf
    field: value
    how: read glide.knowman.enable_approval_notification
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E13:
    record: sys_hub_flow/6701501859882210f877a8ba01addd41
    children: sys_hub_action_instance_v2
    how: read the events Knowledge - Approval Publish queues
    result: 'knowledge.approval.approved with no person named; knowledge.approval.rejected naming the article''s reviser'
    hash: 40ba56aba36db2222e78a4de710f8e5509a671af41117837f97bb82aacc5e2fa
  E14:
    record: sysevent_email_action/b41210e9cba200101b6b1a2df8076d92
    how: 'read KM: Article Expiry Warning, sent by the job Notification for Article Expiry Warning (sysauto_script/5df51be7cb2600101b6b1a2df8076def)'
    result: '"Knowledge articles expiring next month", monthly, to authors, revisers, owners and managers; the job runs only while glide.knowman.enable_article_expiry_notification is true'
    hash: 04d6c0e77e0c6efc033096f722e41dd73dabf886fc3d58938201c6aa5168b71b
  E15:
    record: sys_properties/477c4b4ecba600101b6b1a2df8076df9
    field: value
    how: read glide.knowman.enable_article_expiry_notification
    result: false; nobody is warned about expiring articles
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E16:
    record: sysevent_email_action/dff03ef567133200d358bb2d07415a83
    how: 'read KM: AQI on Article, queued by KBAQIHelper (sys_script_include/33e50eb667223200d358bb2d07415a20) when a checklist is submitted'
    result: the score, Passed or Failed against glide.knowman.aqi_pass_score (70), and the reviewer's comments, to the reviser or else the author; KM AQI on Ownership Group Article (30c1541b67102300dbfdbb2d07415aa1) copies the ownership group
    hash: 0529f691a51b1fd76dd2fb4d438ee1c674dcd77277d0883336d6fc8d1895224f
  E17:
    record: sysevent_email_action/f84c5f3d0a0a0a6f0080d70c42561b2a
    how: read Knowledge Closed Created, Knowledge Closed Duplicate (f87242010a0a0a6f003a9d0701a1c714) and Knowledge Closed Invalid (f87279880a0a0a6f00a7d258170bfe5f)
    result: '"Your KB Submission … was closed after one or more articles were created", "… as a duplicate entry", "… as an invalid", to the submitter'
    hash: fedd7bcfcf1dabc900c84ad2d3af3061ca4cb5acbec50e6e5c88769e667e93ed
  E18:
    record: sys_script/ce68d00d67203200d358bb2d07415a3f
    field: script
    how: read Notify about article's checkout, with glide.knowman.enable_km_subscription (sys_properties/7948c79367583200d358bb2d07415aa0) true
    result: a checkout is posted as an activity to the article's subscribers; Auto subscribe author,reviser & kb owner (sys_script/0edcef8367003200d358bb2d07415a05) subscribes them
    hash: 06fe569f4a1f1db35106891ad4bc9272cb4647dc5565f88d3f6274abcfd6e37f
---
## What reaches you {for=user}

| When | Email |
|---|---|
| You send an article to yourself from Employee Center | *"Article: …"* with the article [E01] |
| The authors need more from you about your feedback | *"Feedback Task … has been updated"* [E03] |
| The authors have acted on your feedback | *"Your Feedback Task … has been resolved"* [E02] |

## Emails at each step {for=operator}

| When | Who | Email |
|---|---|---|
| An article goes for approval | each approver | *"… is awaiting approval."* [E09] |
| The approvers approve it | the person the flow names | *"… is approved."* [E10] [E12] [E13] |
| The approvers reject it | the article's reviser | *"… is rejected."* [E11] [E12] [E13] |
| A reader's feedback creates a task | the assignee (normally the article's author) | *"Feedback Task … has been assigned to you"* [E04] [E05] |
| The task is reassigned | the new assignee | *"Feedback Task … has been reassigned to you"* [E06] |
| Someone comments on the task | the assignee | *"Feedback Task … has been updated"* [E07] |
| The assignee asks for more information | whoever raised it | *"Feedback Task … has been updated"* [E03] |
| The assignee resolves it | whoever raised it | *"Your Feedback Task … has been resolved"* [E02] |
| They accept or reject the resolution | the assignee | *"Your resolution … has been accepted"* or *"… rejected"* [E08] |
| A quality checklist is submitted | the reviser, or the author | the score and *Passed* or *Failed* [E16] |
| A knowledge submission is closed | the submitter | *"Your KB Submission … was closed …"* [E17] |
| An article is checked out | the article's subscribers (author, reviser, knowledge base owner) | an activity, not an email [E18] |

### What is not sent {for=operator}

- **Expiry warnings are off**: nobody is told when an article's Valid to date is near. Watch the
  Knowledge Center's *Expiring Articles* list instead. [E14] [E15]
- A **gap reported from an incident** sends no email: the *assigned to you* email is only for
  feedback about an existing article. [E04] See
  [Create and link knowledge from an incident](see:incident/share-knowledge).
- The approval flow names nobody for *"… is approved."*, and names the article's reviser for *"… is
  rejected."*: whether the author of a first version is told either way still needs checking. [E13]
