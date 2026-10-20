---
title: Publish an article
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_declarative_action_assignment/333db22a371322109fce1f0964924b4c
    how: 'read Publish (sn_km_center), and the second Publish (sys_declarative_action_assignment/cbb12c58ff6322109fcecf437d931f0d) "through modal flow"'
    result: 'a Publish button in the Knowledge Center editor on a saved draft, for someone who may publish it; the second is used when the article may be read by guests, and asks for confirmation first'
    hash: d218adf770cbcf305f24d75f309e21a68648bd6d6fbedd4fdf8214b93dc69ae8
  E02:
    record: sys_ui_page/d15a1ab577210110dc25a5ed5b5a9957
    field: client_script
    how: read the confirm_publish dialog
    result: '"This article may be visible to unauthenticated users after it is published. Do you still want to proceed?", Cancel, Publish'
    hash: 3f9b2e83a033460da84e871959cd6ff3e68d865b1fb4505e0e3fd17fb9fb29cd
  E03:
    record: sys_script_include/53f2247bb712230026778d78ee11a971
    field: script
    how: read KnowledgeUIActionSNC.publish and showPublishModals
    result: 'starts the knowledge base''s publish flow and shows the new state; the confirmation is shown when guests can read the article'
    hash: fa4acf54f065d62c01e15ef2f854f07a492b75174862714dc74aa1cb129b2ce7
  E04:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canPublish and canRecall
    result: 'Publish: a draft, by the knowledge base owner, a knowledge admin, or its author or reviser while they may contribute; Recall: an article in Review or Scheduled for publish, by the same people'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E05:
    record: sys_script/07c35286fc05ae10f877d15605e71613
    field: script
    how: read Populate Default Flows if Empty
    result: a knowledge base without flows gets Knowledge - Instant Publish and Knowledge - Instant Retire
    hash: 7d81775b8d139b4c5fdc6fb4c3b5e6604001d314faea5004caf6f08da2fb8346
  E06:
    record: sys_hub_flow/2222030614f75210f8779da9137d35b3
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Instant Publish
    result: 'for a draft: with a scheduled publish date, waits for it, then publishes; otherwise publishes at once'
    hash: 706f5745a9d2cf91d4b051f76133b9bd790b016d280bf619af5c0346ac35afdd
  E07:
    record: sys_hub_flow/6701501859882210f877a8ba01addd41
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Approval Publish
    result: 'asks for approval; approved: publishes, on the scheduled date when there is one; rejected: tells the reviser'
    hash: 2961a40817838ff4b3c84de390367935622b602b926c95abc50e3a4bcd7ffb3e
  E08:
    record: sys_script_include/a659e923c30321000096dfdc64d3ae33
    field: script
    how: read KBWorkflowSNC.getApprovers
    result: the knowledge base's owner (if active) and its active managers; ownership group members only when ownership groups are on
    hash: 25c0f0e7da5e3fe9a5d385c225dfd3ade8ba2d0ea08ba2c53ccd270920afc36c
  E09:
    record: sys_properties/d20ff8ab53012300cc376512a2dc3483
    field: value
    how: read glide.knowman.ownership_group.enabled
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E10:
    record: sys_script/369f358f43a211107d9bbe243bb8f244
    field: script
    how: read Validate Scheduled publish date
    result: '"The Scheduled Publish Date must be set at least 24 hr after the current date." and the change is not saved'
    hash: f8fa15481b7a1547cfb9c02c42b2cfebd65ed300648bca335bc4db18ea102ffc
  E11:
    record: sys_script_include/39e84ab2d72121004792a1737e610306
    field: script
    how: read KBCommonSNC.getStateMessage
    result: '"This knowledge article has been published", "This knowledge item is in review", "Article is approved and will be published on Scheduled Date"'
    hash: 1c1915ccac83f5eed04b63b52c45f9cd68c7dc8bf3995326bb6e091dbd5a85d5
  E12:
    record: sys_ux_list/066fe853ff922610e9c3ffffffffff12
    field: condition
    how: read the Knowledge Center list My Approvals
    result: approvals waiting for you (state Requested) on articles, article templates and knowledge blocks
    hash: 01c3e68ff67f3e289b69f76da9ffed539978faccac243b51758e2b11d714cb73
  E13:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Knowledge Center (/now/knowledge-center), Knowledge Hub › Knowledge features
    how: looked at the Knowledge features cards
    result: Knowledge analytics dashboard, Your articles, Article quality index, Your approvals
  E14:
    record: sys_declarative_action_assignment/a7b8c778ff123210e49cffffffffff4a
    field: script_condition
    how: read Approve (sn_km_uib, on sysapproval_approver)
    result: 'shown on a requested approval of an article to its approver (or a delegate, or approval_admin); sets it Approved'
    hash: 53237e03a40349f657b19b29b1daa91ebed7d6ecae595156bb8cc4e6c56a222b
  E15:
    record: sys_declarative_action_assignment/82a98b3cff123210e49cffffffffff64
    how: read Reject (sn_km_uib) and its server script
    result: '"Comments are required when rejecting an approval"; with a comment, sets it Rejected'
    hash: a1767c686ea562f11a3ad9055de10af1a79abb1847855643ef884c990260a703
  E16:
    record: sysevent_email_action/8d4c2145b7312300bc1308a9ee11a96d
    how: 'read KM: Approve article for publishing'
    result: '"<number> is awaiting approval.", to each approver'
    hash: bb1ca1df2e6bb1dd942f7c8be9e6c9c2bc248d77c4b73bf331e4df52e807e211
  E17:
    record: sysevent_email_action/298b8301b7403300343f08a9ee11a99f
    how: 'read KM: Article approved for publish and KM: Article rejected for publish (sysevent_email_action/d859653dcb403300343f582df8076d62)'
    result: '"<number> is approved." and "<number> is rejected.", to the person named in the event'
    hash: cca5c3d1bb594113618faa1299994ccf0bf0efa8733302b6665b3e153e8d195c
  E18:
    record: sys_hub_flow/6701501859882210f877a8ba01addd41
    children: sys_hub_action_instance_v2
    how: read the events Knowledge - Approval Publish queues
    result: 'knowledge.approval.approved with no person named; knowledge.approval.rejected naming the article''s reviser'
    hash: 40ba56aba36db2222e78a4de710f8e5509a671af41117837f97bb82aacc5e2fa
  E19:
    record: sys_properties/0d8e2767b7122300bc1308a9ee11a9bf
    field: value
    how: read glide.knowman.enable_approval_notification
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E20:
    record: sys_script/42c4c2c40b23120099f1ab5c37673a7a
    field: script
    how: read Ensure published date is set
    result: the Published date is set to today when an article becomes published
    hash: 8cb6abade27db022051428fa9783715a0739e02ce883b2466d559c362ae0a0fe
  E21:
    record: sys_declarative_action_assignment/6272a5f2ff2322109fcecf437d931f89
    how: read Republish (sn_km_center), with KBCommonSNC.canRepublishKnowledge
    result: offered on a retired article, latest version, to knowledge admins
    hash: 5a841c67cd4ced4a2e60a021d942da2415d547f1f89a7ba86c61eb0ca4190037
---
## Two ways to publish {label=NEW}

Each knowledge base chooses its **publish flow**. As delivered, a knowledge base without one gets
**Knowledge - Instant Publish**. [E05]

| Publish flow | What happens when you choose Publish |
|---|---|
| **Instant Publish** (the default) | the article is published at once [E06] |
| **Approval Publish** | the article goes to **Review**, the approvers are asked, and it is published once approved [E07] |

Which flow each of pdi2's knowledge bases uses is not in the mirror; unless it was changed, it is
Instant Publish. [E05] [Q24]

## Publish your draft {label=NEW}

{{animation:kbauthor}}

1. Open the draft in the Knowledge Center and save your last changes.
2. Choose **Publish**. You see it on a saved draft when you may publish it: you are its author or
   reviser and may contribute to the knowledge base, or you own the knowledge base. [E01] [E04] [Q38]
3. If guests (people who haven't logged in) can read the article, you are asked: *"This article
   may be visible to unauthenticated users after it is published. Do you still want to
   proceed?"* Choose **Publish** or **Cancel**. [E01] [E02] [E03] [Q25]
4. The message tells you where it went: *"This knowledge article has been published"*, *"This
   knowledge item is in review"* (waiting for approval), or *"Article is approved and will be
   published on Scheduled Date"*. [E11]

When it is published, its **Published** date is set to today. [E20]

## Publish on a set date {label=NEW}

Fill in **Scheduled publish date** before you choose Publish. The article waits as **Scheduled
for publish** and is published on that date; with Approval Publish, it waits for the approvers
first. [E06] [E07]

The date must be **at least 24 hours ahead**, or the change is refused with *"The Scheduled
Publish Date must be set at least 24 hr after the current date."* [E10]

## Take it back {label=NEW}

While the article is in **Review** or **Scheduled for publish**, **Recall** brings it back to
draft, so you can change it. Pending approvals are cancelled. [E04] See
[Update a published article](see:update) for the steps.

## Approve or reject {label=NEW}

If a knowledge base uses Approval Publish, its **owner** and **managers** approve its articles.
Ownership groups are off on pdi2, so nobody else is asked. [E08] [E09]

1. You receive *"<number> is awaiting approval."* [E16]
2. In the Knowledge Center, open the **Your approvals** card. It lists the approvals waiting for
   you on articles. [E12] [E13]
3. Open the approval, read the article, and choose **Approve** or **Reject**. [E14] [E15]
4. To reject, write a comment first: *"Comments are required when rejecting an approval"*. [E15]

An approved article is published at once, or on its scheduled date. [E07]

## Who is told {label=NEW}

| When | Who | Email |
|---|---|---|
| The article goes for approval | each approver | *"… is awaiting approval."* [E16] |
| It is approved | the person the flow names | *"… is approved."* [E17] [E18] [Q07] |
| It is rejected | the article's reviser | *"… is rejected."* [E17] [E18] |

These emails are switched on for pdi2. [E19] With Instant Publish nobody is emailed.

## Republish a retired article {label=NEW}

A retired article can be put back: **Republish** is offered to knowledge admins on the latest
version of a retired article. [E21]

## Tips

- Check the knowledge base before you publish: an article in a public knowledge base can be read
  without logging in. The confirmation tells you so. [E02]
- Set a scheduled date when an article must appear with a change or a release, not before.
  Remember the 24-hour minimum. [E10]
- The approvers are people, not a group: if the owner and managers are away, the article waits.
  [E08]
