---
title: Create and link knowledge from an incident
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-18
      where: Service Operations Workspace, incident, Related records tab
    how: read the related lists
    result: Attached Knowledge is listed
  E02:
    record: sys_ux_form_action_layout_item/50c0c23ec7213010d7e818b1c7c260c3
    how: read the Create item of the workspace incident header
    result: 'a "Create" menu in the header (not in the overflow menu), built from the action group Create'
    hash: 5187e4867b596e0d0dcaa77c274d65eade7e842610957c65ed74d1ed0918d4d5
  E03:
    record: sys_ux_form_action_layout_group/99308efac7213010d7e818b1c7c26091
    how: read the action group Create
    result: its actions include Create knowledge and Edit knowledge
    hash: c8eb5d30f7c219d180377df6f16303d1eb8ec6b7ab2e83dc42d10b43c4cf057d
  E04:
    record: sys_declarative_action_assignment/410cd571a4c10210f877a35f34a93972
    how: read Create Knowledge (table incident)
    result: 'for users with itil or sn_incident_write, when SOWIncidentKnowledgeUtils.canCreateKnowledgeArticle passes; opens the knowledge interceptor page with the incident as the source'
    hash: 9a807bc1bbf749b498b1d1b46411fc70b969dbe41bf214671c7e899193ccd4c6
  E05:
    record: sys_script_include/36a55516c7623010d7e818b1c7c26025
    field: script
    how: read SOWIncidentKnowledgeUtilsSNC
    result: 'Create: only in the states of com.snc.incident.create_knowledge.multistate.enable (default 6,7: Resolved, Closed), only while no article has the incident as its source, and only for someone who can contribute to the knowledge base named in glide.knowman.task_kb; Edit: same states, and exactly one article from the incident that you can edit'
    hash: c87583f9ce0222f0a132f1937947d960fd82766ea6a5dc680e397a8fe14a74ba
  E06:
    record: sys_ux_app_route/c9687e872f2122102a76b001a03f9b85
    how: read Create new article (sn_km_center, route kb_interceptor)
    result: '"Intercepts request to create a new knowledge article with a page that enables user to choose knowledge base and template."'
    hash: ecb80c259ecc613e85bf5ea1de35bde380fd86115bf483b6939d23e96f7ab6a8
  E07:
    record: sys_ux_client_script/28663a133b2d629077a2dfd0c5e45a72
    field: script
    how: read Next button clicked
    result: closes the interceptor tab and opens a new article form, in the chosen template when you can contribute to templates, otherwise a standard article
    hash: 7e307d7f9446cd8087c8d3153a598a8c5accfb9d9a33c9fb62ffcebe78be1e38
  E08:
    record: sys_dictionary/ed453eff8c5503100a22deb6dd2b4e65
    how: read kb_knowledge.workflow_state
    result: 'label Workflow, default "draft"'
    hash: b1e304f332b66053eaefa9d9ad744a0e14b777423f21492b0e6abca3ddb361c9
  E09:
    record: sys_declarative_action_assignment/47f207ba2be83e5054f3f1ead391bfdd
    field: server_script
    how: read Edit knowledge (table incident)
    result: opens the form of the article created from the incident and returns to the incident afterwards; roles itil or sn_incident_write
    hash: 2b383b99e8dde0d9b548c97d370b3b7fe8851cffa3cfe8b41a26e7d87cdb79b8
  E10:
    record: sys_ux_form_action_layout_item/dd34894753a230104088ddeeff7b125b
    how: read Report Knowledge Gap in the workspace incident header
    result: in the overflow menu (More actions), order 600
    hash: 77c27f9f777dbadfde419c6eb09f6d6ad260a37b613ff85ed556fa80fb00aadd
  E11:
    record: sys_ui_action/d74f5f3a532230104088ddeeff7b1241
    field: client_script_v2
    how: read Report Knowledge Gap (sn_sow_inc)
    result: 'a dialog "Report a knowledge gap" with Topic (mandatory, filled with the short description) and Description, and the buttons Cancel and Submit'
    hash: bda6b4f554be3d1449f3990779ea84285208c4dd1eec9cfc677a29b245f86c50
  E12:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read IncidentUtilsSNC.canCreateKnowledgeGap
    result: offered while the incident is not Closed
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
  E13:
    record: sys_ui_action_role/4e6422c9533230104088ddeeff7b12bb
    how: read the role of Report Knowledge Gap
    result: itil
    hash: 680e301182ac6ca0e80b6f0e7314204f254ddcda9c0899e6f8b71f068b8156df
  E14:
    record: sys_ui_action_role/575422c9533230104088ddeeff7b12fb
    how: read the role of Report Knowledge Gap
    result: sn_incident_write
    hash: d64904b4255580342f76f7a1319bace5de753a9afea3a01417545785dcb65aa8
  E15:
    record: sys_script_include/5a8da383536230104088ddeeff7b1255
    field: script
    how: read SOWIncidentUtilsAjaxSNC.createKnowledgeGap
    result: 'creates a Knowledge Feedback Task with the topic, the description, the incident as parent and you as opened by; shows "Knowledge gap reported Find this record under related lists to add additional comments." with a link to it'
    hash: 6708d4abe5583876c90224579769d01a0aa02fdad140956df85e15d81591f2b9
  E16:
    record: sys_number/21d7f32467030300d358bb2d07415a63
    how: read the number of kb_feedback_task
    result: prefix KFT
    hash: 1431028ff05c5d488919da61ed87f6a5be3eabc135879c8d632f720f4918e729
  E17:
    record: sys_security_acl/2caf904d67030300d358bb2d07415aaf
    field: script
    how: read the read ACL on kb_feedback_task
    result: the assignee, the person who opened it, and anyone who can read its parent incident
    hash: 5a07ba477debf43129d68b103cc91edf0542d8285d8d6b71460eea28d52b832f
  E18:
    record: sys_script_include/f708f3b167630300d358bb2d07415a18
    field: script
    how: read KBFeedbackTaskSNC.hasElevatedAccess
    result: a feedback task from a task (no article) is handled by knowledge admins, knowledge_manager and knowledge_domain_expert
    hash: 20989cd204b4d911235de56f10968c668684390fc8998bb91eb665469901ea35
  E19:
    record: sysevent_email_action/a5ab8a3d67330300d358bb2d07415a73
    how: 'read KM Feedback Task: Created'
    result: sent only when the feedback is about an article, so not for a gap reported from an incident
    hash: 9a872ee3096335b10f9249add8912b62c993157dcbe8e1b643797828064e2102
  E20:
    record: sys_ui_related_list/fa3f3ac143e9d2108c5fa32d68b8f24b
    children: sys_ui_related_list_entry
    how: read the related lists of the workspace incident form
    result: 'includes knowledge attached to the task (m2m_kb_task), articles whose source is the incident (kb_knowledge.source), knowledge submissions (kb_submission.parent) and knowledge feedback tasks (kb_feedback_task.parent)'
    hash: 1dc5e75dcb9cb55b773b0992baca4499230041ea4b78c3d3db3162b600bf30b5
  E21:
    record: sys_ui_list/c081085ec7733010d7e818b1c7c260fe
    children: sys_ui_list_element
    how: read the workspace list of attached knowledge (m2m_kb_task on incident)
    result: 'columns: article, short description, knowledge base, published'
    hash: 279b83ec2f455340421d862a5603b93bd202a29c6cc8f1984cc652f99efa083a
  E22:
    record: sys_ui_list/06c8c816c7333010d7e818b1c7c26053
    children: sys_ui_list_element
    how: read the workspace list of articles from the incident (kb_knowledge on incident)
    result: 'columns: number, short description, knowledge base, workflow, author'
    hash: 1f85f56cd91f6904a98d1167030a4ab11191deb471b57226c9995fa675289e6e
  E23:
    record: cxs_ui_action_config/683f0d5a77300110b3771aceca5a99e2
    how: read Attach on knowledge results of Agent Assist [incident]
    result: 'action Attach, undo Unattach, badge Attached; adds the article as a link in Additional comments (attach_note_field comments, embed_link)'
    hash: d5b992b5e58c44cc8aaa26b847492fc724b2119b85f18e71a7ac51e414e5cc4e
  E24:
    record: ga_guidance/e8421a2a436f0210f81d92621ab8f2da
    how: read Attach and share article (sn_guidances)
    result: the guidance behind knowledge results in Recommendations
    hash: 27b4c01a80abf2c68ebedf9cae590c15a0ff7cb345a3542f495e62adddb1d374
  E25:
    record: sn_nb_action_search_result_ra_mapping/33b4ca9c970f311007a138fce053af48
    how: read the incident mapping of knowledge search results
    result: in the incident context, kb_knowledge results use Attach and share article
    hash: 9f593f01156a8c57ea2216b6849d2e6138d1c1773b6ae19f4ae83e75ee05b034
  E26:
    record: ga_guidance_action/1e8392aa436f0210f81d92621ab8f291
    how: read the primary action
    result: 'Attach: "Knowledge article successfully attached."'
    hash: e4508c0b35f07cfa45ef913c883929cb6464f95d600a4ebf6281d29480a34d41
  E27:
    record: ga_guidance_action/9af39aaa436f0210f81d92621ab8f2d8
    how: read a secondary action
    result: 'Attach and add link in comment: "Knowledge article successfully attached."'
    hash: bfa3f0702c3dc66d45a1b46510195726abadafdde46f62e0bcad2e8fc50503ab
  E28:
    record: ga_guidance_action/f2245eaa436f0210f81d92621ab8f293
    how: read a secondary action
    result: 'Add link in worknote: "Posted work note"'
    hash: 32ea0988eddf0d40f8aa1e34baf91f6bf9c61015a0ccda1c36f739cc348118ec
  E29:
    record: sys_script/12267f44537630108b91ddeeff7b12b7
    field: script
    how: read Update incident from known error (before insert on m2m_kb_task)
    result: attaching a known error article from a problem sets the incident's Problem, if it is empty
    hash: fb476ee0d519f1be58a3bb92529a48b354c67e88f0b92e35559d4d5e363e1ac1
---
## Three ways knowledge meets an incident {label=NEW}

| You want to | Use | When |
|---|---|---|
| Point to an article that already helps | **Attach** it | any time you find one [E23] [E26] |
| Write down how you fixed this, for next time | **Create Knowledge** | once the incident is Resolved or Closed [E05] |
| Say an article is missing, without writing it | **Report Knowledge Gap** | while the incident is not Closed [E12] |

Everything you attach or create is listed on the incident's **Related records** tab. [E01] [E20]

## Attach an article {label=NEW}

When the knowledge search in the side panel shows an article that fits, attach it to the
incident:

- In the **Agent Assist** results, choose **Attach** on the article. It is marked **Attached**,
  and **Unattach** undoes it. [E23]
- In **Recommendations**, a suggested article offers **Attach**, **Attach and add link in
  comment** and **Add link in worknote**. [E24] [E25] [E26] [E27] [E28]

What it does:

1. The article appears in the incident's **Attached Knowledge** list, with its knowledge base and
   publish date. [E01] [E21]
2. **Attach** in Agent Assist also puts a link to the article in **Additional comments**, which
   the caller can read. [E23] In Recommendations, choose **Add link in worknote** when the link is
   only for colleagues. [E28]
3. If the article is a **known error** written from a problem, and the incident has no problem
   yet, the incident's **Problem** is set to that problem. [E29]

## Create an article from the incident {label=NEW}

{{animation:inckb}}

1. Resolve the incident first. **Create Knowledge** is offered only when the incident is
   **Resolved** or **Closed**, and only once: when an article from this incident exists, it is no
   longer offered. [E05]
2. Open the header's **Create** menu and choose **Create Knowledge**. [E02] [E03] [E04]
3. A **Create new article** tab opens. Choose the **knowledge base** and, if you can use them, an
   article **template**. [E06]
4. Choose **Next**. The tab closes and a new article form opens. [E07]
5. Write the article: the issue as people describe it, and the fix. Save it.

The new article starts as a **draft**. [E08] It is published through its knowledge base, not
through the incident.

You see **Create Knowledge** only if you have the `itil` or `sn_incident_write` role and may
contribute to the knowledge base used for articles from tasks. [E04] [E05]

## Edit the article later {label=NEW}

When the incident is Resolved or Closed and has exactly one article that you can edit, the
**Create** menu offers **Edit knowledge** instead. It opens that article; when you finish, you go
back to the incident. [E05] [E09]

The incident's **Related records** tab lists the articles created from it, with their number,
knowledge base, workflow state and author. [E20] [E22]

## Report a knowledge gap {label=NEW}

Use it when you needed an article and none existed, and you aren't the one to write it.

1. In the header, open **More actions** and choose **Report Knowledge Gap**. [E10]
2. In **Report a knowledge gap**, keep or change the **Topic** (it starts as the short
   description) and add a **Description** of what the article should cover. [E11]
3. Choose **Submit**.

You see "Knowledge gap reported" with a link to the new **Knowledge Feedback Task** (KFT…). The
task records the topic, the description, the incident and you. [E15] [E16] It is a task for the
knowledge team, not a demand or an article.

Who can do it: people with `itil` or `sn_incident_write`, on any incident that isn't Closed. [E12]
[E13] [E14]

## What happens to a reported gap {label=NEW}

| Who | What |
|---|---|
| **You** | find the task under the incident's related lists and add comments to it [E15] [E20] |
| **Knowledge managers and domain experts** | can work and assign it [E18] |
| **Anyone who can read the incident** | can read the task [E17] |

Nobody is emailed when the gap is reported: the "Feedback Task assigned to you" email is only for
feedback on an existing article. [E19] Tell the knowledge team if the gap is urgent.

## Tips

- Attach before you resolve: an attached article shows the next resolver what worked. [E21]
- **Attach** in Agent Assist writes to **Additional comments**, so the caller sees the link. [E23]
  Attach only articles the caller is allowed to open, or use **Add link in worknote**. [E28]
- Have the resolution notes open while you write the article: say what was wrong and what fixed
  it, in the words a caller would search for.
- One incident, one article: Create Knowledge disappears once an article from the incident exists.
  [E05]

## Not yet seen {label=OPEN-QUESTION}

1. The **Create** menu, **Create Knowledge**, **Edit knowledge** and **Report Knowledge Gap** were
   not opened on screen; the steps follow the records. [E02] [E10] Do they show on a Resolved
   incident on pdi2?
2. Is the new article filled in from the incident (short description, description, resolution
   notes), and does it keep the incident as its source task? Edit knowledge and the incident's
   list of articles depend on that. [E05] [E07]
3. Which knowledge base is used for articles from incidents, and who may contribute to it? The
   setting `glide.knowman.task_kb` is redacted in the mirror. [E05]
4. Who in the knowledge team picks up reported gaps, and how do they find them, since no email is
   sent? [E19]
5. Should **Attach** in Agent Assist post to Additional comments (seen by the caller) or to the
   work notes? [E23]
