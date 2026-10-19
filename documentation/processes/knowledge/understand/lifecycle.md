---
title: The life of an article
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_db_object/6d453eff8c5503100a22deb6dd2b4e51
    children: sys_choice
    how: read the kb_knowledge workflow choices
    result: Draft, Review, Scheduled for publish, Published, Pending retirement, Retired, Outdated
    hash: 0a6263ea0352cc39e7ea40f6a7e9d6a093486a2efe598b2d6370856d4dc19aa8
  E02:
    record: sys_dictionary/ed453eff8c5503100a22deb6dd2b4e65
    how: read kb_knowledge.workflow_state
    result: 'label Workflow, default "draft"'
    hash: b1e304f332b66053eaefa9d9ad744a0e14b777423f21492b0e6abca3ddb361c9
  E03:
    record: sys_script/07c35286fc05ae10f877d15605e71613
    field: script
    how: read Populate Default Flows if Empty
    result: a knowledge base without flows gets Knowledge - Instant Publish and Knowledge - Instant Retire
    hash: 7d81775b8d139b4c5fdc6fb4c3b5e6604001d314faea5004caf6f08da2fb8346
  E04:
    record: sys_hub_flow/2222030614f75210f8779da9137d35b3
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Instant Publish
    result: 'for a draft: with versioning, publishes it or, with a scheduled publish date, waits for that date; without versioning, publishes it'
    hash: 706f5745a9d2cf91d4b051f76133b9bd790b016d280bf619af5c0346ac35afdd
  E05:
    record: sys_hub_flow/6701501859882210f877a8ba01addd41
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Approval Publish
    result: 'asks for approval; approved: queues knowledge.approval.approved and publishes, on the scheduled date when there is one; rejected: queues knowledge.approval.rejected for the reviser'
    hash: 2961a40817838ff4b3c84de390367935622b602b926c95abc50e3a4bcd7ffb3e
  E06:
    record: sys_script_include/a659e923c30321000096dfdc64d3ae33
    field: script
    how: read KBWorkflowSNC.getApprovers
    result: the ownership group members when ownership groups are on, otherwise the knowledge base's owner (if active) and managers
    hash: 25c0f0e7da5e3fe9a5d385c225dfd3ade8ba2d0ea08ba2c53ccd270920afc36c
  E07:
    record: sys_properties/d20ff8ab53012300cc376512a2dc3483
    field: value
    how: read glide.knowman.ownership_group.enabled
    result: false
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E08:
    record: sys_script/369f358f43a211107d9bbe243bb8f244
    field: script
    how: read Validate Scheduled publish date
    result: '"The Scheduled Publish Date must be set at least 24 hr after the current date."'
    hash: f8fa15481b7a1547cfb9c02c42b2cfebd65ed300648bca335bc4db18ea102ffc
  E09:
    record: sys_properties/58b7a716db103200a042f278f0b8f585
    field: value
    how: read glide.knowman.versioning.enabled
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E10:
    record: sys_hub_flow/6a151635c416f610f8775e5cc901a819
    how: read Knowledge - Outdate Article (changed by the 2026-10-12 upgrade)
    result: '"updates a knowledge article''s stage to Outdated when a newer version is published"'
    hash: 7692b306b1cb7668b18bdf95c3a50c545cd2b56b9bf630e159f83a19c6b9d8bf
  E11:
    record: sys_hub_flow/8b24579a5984ea10f877a8ba01addd14
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Approval Retire
    result: 'asks for approval; approved: retires the article; rejected: moves it back to the state it had'
    hash: e3edddf92545c0426d86f9dc59872c8f47b406a07c7f91c80402b34c8c07a38f
  E12:
    record: sys_hub_flow/ea32fac859c02210f877a8ba01addda2
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Instant Retire
    result: retires a published article at once
    hash: 3ad2f74fcc4be9d5281cc2994cd6916a2f418385df09ed277eba68f063650288
  E13:
    record: sys_properties/711dad9fc3110110c92609c77d40dd2e
    field: value
    how: read glide.knowman.enable_article_replacement_on_retire
    result: true; a replacement article can be named when retiring
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E14:
    record: sys_ux_list/9b5a59ca53026210e9c3e40b10e5e662
    field: condition
    how: read the Expiring Articles list of the Knowledge Center
    result: articles whose Valid to date falls in the next 90 days, not retired or outdated
    hash: fe5641341c2948535a7ec5d630d9abbc514c6c35ed5748fcbbbccb79a7004871
  E15:
    record: sys_db_object/31453eff8c5503100a22deb6dd2b4ef2
    children: sys_choice
    how: read the kb_feedback_task state, type and resolution code choices
    result: 'New, Work in progress, Awaiting information, Resolved, Closed; User feedback, Internal feedback, Knowledge gap, Knowledge gap - manual, Unsuccessful search, Other; Updated article, Created article, Updated search configuration, No action, Others'
    hash: bf650de90a21cd8aad7f362f3ae25a28c01cdfbd9da86aaed0389c444869e443
  E16:
    record: sys_ui_action/92c3f74b67330300d358bb2d07415af3
    field: script
    how: 'read Accept (kb_feedback_task), and Reject (sys_ui_action/b8043b4b67330300d358bb2d07415ac0)'
    result: 'shown to whoever opened a Resolved feedback task about an article; Accept closes it, Reject sends it back to Work in progress'
    hash: 41c18994980c457f8b1dc7b5ad98e097c1e26375fb5b88efd456c2559a076f62
---
## The states

An article is written as a draft, published for readers, replaced by newer versions, and
eventually retired.

### Each state {for=operator}

| State | What it means |
|---|---|
| **Draft** | being written; readers don't see it [E02] |
| **Review** | waiting for the knowledge base's approvers |
| **Scheduled for publish** | approved; published on its scheduled date |
| **Published** | readers can find it |
| **Pending retirement** | waiting for approval to retire |
| **Retired** | withdrawn; readers no longer find it |
| **Outdated** | an older version, replaced by a newer published one [E10] |

[E01]

### What you notice {for=user}

You only ever see **published** articles. When an article is updated, you see the newest version;
when it is retired, it no longer appears in search. If you followed a link to an article that was
replaced, you may be pointed to the new one. [E13]

### What moves it on {for=operator}

Each knowledge base names a **publish flow** and a **retire flow**. As delivered, a knowledge base
without them gets the *instant* flows, so nobody approves. [E03]

| From | To | How | With the instant flows | With the approval flows |
|---|---|---|---|---|
| Draft | Published | **Publish** | at once [E04] | after approval [E05] |
| Draft | Scheduled for publish | **Publish** with a scheduled publish date | waits for the date [E04] | after approval, waits for the date [E05] |
| Published | Pending retirement, Retired | **Retire** | at once [E12] | after approval; rejected, it stays published [E11] |
| Published | Outdated | a newer version is published | automatic [E10] | automatic [E10] |

- The approvers are the knowledge base's **owner and managers**; ownership groups are off on
  pdi2. [E06] [E07]
- A scheduled publish date must be at least 24 hours ahead: *"The Scheduled Publish Date must be
  set at least 24 hr after the current date."* [E08]
- Versioning is on: to change a published article you check out a new version, which starts as a
  draft. [E09]
- When retiring, you can name a **replacement article**. [E13]
- An article's **Valid to** date marks when it should be reviewed; the Knowledge Center lists
  those expiring in the next 90 days. [E14]

## Feedback tasks {for=operator}

Feedback from readers, and gaps reported from incidents, become **knowledge feedback tasks**. [E15]

| State | What it means |
|---|---|
| **New** | raised; nobody has acted on it yet |
| **Work in progress** | the assignee is working on it |
| **Awaiting information** | the assignee asked the person who raised it for more |
| **Resolved** | the assignee says it is done; the person who raised it can accept or reject |
| **Closed** | finished |

When it is resolved, the person who gave the feedback can **Accept** (it closes) or **Reject** (it
goes back to Work in progress). [E16] Its **resolution code** says what was done: *Updated
article*, *Created article*, *Updated search configuration*, *No action* or *Others*. [E15]

See [Work feedback and knowledge gaps](see:feedback).
