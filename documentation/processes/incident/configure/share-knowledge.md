---
title: Knowledge from incidents - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_declarative_action_assignment/410cd571a4c10210f877a35f34a93972
    how: read Create Knowledge (sn_sow_inc, table incident)
    result: 'uxf client action Open Interceptor from Knowledge Center - ITSM; payload route=kb_interceptor, interceptorExtraParams=source/{{table}}/source-id/{{sysId}}; required_user_role_names itil,sn_incident_write; script condition SOWIncidentKnowledgeUtils().canCreateKnowledgeArticle(current)'
    hash: 9a807bc1bbf749b498b1d1b46411fc70b969dbe41bf214671c7e899193ccd4c6
  E02:
    record: sys_declarative_action_payload_definition/fcc2c2092f6c32105dfff12bcfa4e34a
    how: read Open Interceptor from Knowledge Center - ITSM
    result: action key OPEN_INTERCEPTOR, route kb_interceptor
    hash: bf9c3bca865be44bc161a32c1813f85868b88c62dca83f674c250415334e2d38
  E03:
    record: sys_ux_form_action/d78c91b1a4c10210f877a35f34a93978
    how: read Create knowledge (declarative_action)
    result: active, points to the Create Knowledge declarative action
    hash: 0938eb8fd553f8725599f5042c8a9126389a619721205dfc6a80d29acad02ee0
  E04:
    record: sys_ux_form_action/d7b4d7ddc7163010d7e818b1c7c26040
    how: read Create knowledge (ui_action)
    result: active, points to the UI action Create Knowledge
    hash: caed4776d5f2e4bfbe68c90e0e47934e746968c9a6f543f09889a82b8b785f8e
  E05:
    record: sys_ui_action/9d52535dc7163010d7e818b1c7c260b0
    field: script
    how: read the UI action Create Knowledge (sn_sow_inc)
    result: 'inactive; would open a Now Assist article (sn_itsm_gen_ai), or the KCS article when com.snc.incident.knowledge is active, or else insert a draft kb_knowledge (or a kb_submission when the submission workflow is on) with the description as Issue and the resolution notes as Resolution'
    hash: 2f6b30d31dab1e8a6ee1695beb168d10ae52d32adcaca6685e4c0c19151813f0
  E06:
    record: sys_ux_form_action_layout_group/99308efac7213010d7e818b1c7c26091
    how: read the action group Create (incident)
    result: lists both Create knowledge form actions and Edit knowledge, with the other Create actions
    hash: c8eb5d30f7c219d180377df6f16303d1eb8ec6b7ab2e83dc42d10b43c4cf057d
  E07:
    record: sys_ux_form_action_layout_item/50c0c23ec7213010d7e818b1c7c260c3
    how: read the Create item
    result: a group item "Create" in the layout Incident (Incident Related Actions), not in the overflow
    hash: 5187e4867b596e0d0dcaa77c274d65eade7e842610957c65ed74d1ed0918d4d5
  E08:
    record: sys_script_include/36a55516c7623010d7e818b1c7c26025
    field: script
    how: read SOWIncidentKnowledgeUtilsSNC
    result: 'canCreateKnowledgeArticle: state in com.snc.incident.create_knowledge.multistate.enable (default "6,7"), no kb_knowledge with source = the incident, then KBKnowledge.canCreate when KCS is active, else KnowledgeAccess.contributorRight on the knowledge base in glide.knowman.task_kb when the submission workflow is off, else true; canEditKnowledgeArticle: same states and exactly one writable article with that source (GlideRecordSecure); getEditKnowledgeArticleLink: kb_knowledge.do?sys_id=…'
    hash: c87583f9ce0222f0a132f1937947d960fd82766ea6a5dc680e397a8fe14a74ba
  E09:
    record: sys_properties/50aef493ff4131003f07ffffffffffd3
    how: read glide.knowman.task_kb
    result: '"The sys_id of the knowledge base when creating knowledge from task records"; the value is redacted in the mirror'
    hash: fdda7a8ca8fc2ea71eb1ec11c9094dae239eded5fd4706ccd36f715b7736e43b
  E10:
    record: sys_properties/f76c441fc0a8001500e13055be5b1919
    field: value
    how: read glide.knowman.submission.workflow
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E11:
    record: sys_properties/8ef3d7cc3bca12106c64b72916e45af1
    field: value
    how: read sn_sow_inc.enable_kb_template
    result: 'false; read only in the condition of the inactive UI action'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E12:
    record: sys_ux_app_route/c9687e872f2122102a76b001a03f9b85
    how: read Create new article (sn_km_center)
    result: 'route kb_interceptor, optional parameters gapsSysIds and interceptorExtraParams; a page to choose the knowledge base and template'
    hash: ecb80c259ecc613e85bf5ea1de35bde380fd86115bf483b6939d23e96f7ab6a8
  E13:
    record: sys_ux_interoperable_route/c755cb5e0c232210f8777f2baff77878
    how: read KB interceptor for SOW workspace
    result: active; makes the Knowledge Center route available in Service Operations Workspace
    hash: bb50f81e1f14825ff2875496880e9e9843d503cf24f8f6cf48294e4bca8a3843
  E14:
    record: sys_ux_data_broker_transform/f156970793a032103c57fe589503d695
    field: script
    how: read KB Processor
    result: 'templates need com.snc.knowledge_advanced and ArticleTemplateUtil.canContributeToTemplates; the submission flow applies to incidents only when the submission workflow is on and KCS is off; the KCS flow only when KCS is on'
    hash: 39a45da0013225439cdd2ce2503f5db6e1b095346160056ae96b537bf418c3cf
  E15:
    record: sys_script_include/eed75435eb7121007128a5fc5206fe93
    field: script
    how: read KBAjaxSNC.generateQueryAndTableNameFromSorceParam and getTableMappingAsQueryWithParams
    result: 'without KCS, the new article''s values come from the table map between the source and the target table (CSMTableMapUtil), when a target table is passed'
    hash: ea2fff4ac1ec64ff66ffc465d7dc5198898089146cc2e1f1dc45ff84b622f33a
  E16:
    record: csm_table_map/68e3dd4d2fe432105dfff12bcfa4e301
    how: read Incident Standard Article
    result: active, incident → kb_knowledge; its mapping script is empty, and its field maps are not in the mirror
    hash: dca631500563995c1de98f2fdec8a5183de3ba4525db3495c293d3fcbe682d6e
  E17:
    record: sys_ux_client_script/28663a133b2d629077a2dfd0c5e45a72
    field: script
    how: read Next button clicked (sn_km_center)
    result: 'opens the record route for the chosen template table, or kb_knowledge, with sys_id -1 and the processor''s query; the KCS template table only in the KCS flow'
    hash: 7e307d7f9446cd8087c8d3153a598a8c5accfb9d9a33c9fb62ffcebe78be1e38
  E18:
    record: sys_dictionary/ed453eff8c5503100a22deb6dd2b4e65
    how: read kb_knowledge.workflow_state
    result: default draft
    hash: b1e304f332b66053eaefa9d9ad744a0e14b777423f21492b0e6abca3ddb361c9
  E19:
    record: sys_dictionary/65453eff8c5503100a22deb6dd2b4e71
    how: read kb_knowledge.source
    result: label Source task
    hash: 31dbed2a47edbbe94e5503fadb5a9071062b9b765f2dcb7d5e54bf775b144339
  E20:
    record: sys_declarative_action_assignment/47f207ba2be83e5054f3f1ead391bfdd
    how: read Edit knowledge (sn_sow_inc, table incident)
    result: 'server script action; required roles itil and sn_incident_write (either); condition canEditKnowledgeArticle; redirects to the article form and returns to the incident'
    hash: 9733e3d8ad8bfb76560659fefb74160d05f617fe1cc49f344be498e7c90f2b9a
  E21:
    record: sys_ux_form_action/64d243ba2be83e5054f3f1ead391bf1e
    how: read Edit knowledge
    result: active form action for the declarative action, added in 2025-10
    hash: 5647e7ea8d667359902b6acdaad00b4eb336962a936258160d13975dc39e7f98
  E22:
    record: sys_declarative_action_assignment/e13d646ac7333010d7e818b1c7c260ff
    how: read create-new-uxf (table kb_knowledge, Service Operations Workspace view)
    result: 'a New button on the articles related list of an incident when KCS is inactive; opens a new kb_knowledge form (payload Create New Knowledge From Incident)'
    hash: 5be726a36f89676812e40fb1e75a52ad463dee94c69ca5b28ff6e2f242eb369a
  E23:
    record: sys_ui_action/d74f5f3a532230104088ddeeff7b1241
    how: read Report Knowledge Gap (sn_sow_inc)
    result: 'active, client, workspace menu button; condition IncidentUtils().canCreateKnowledgeGap(current); roles itil, sn_incident_write; view Service Operations Workspace'
    hash: 50dff2e786bf0c7461a0a8e3214f8056909dd53e6ae6d1c336811c84ba25ff7b
  E24:
    record: sys_ux_m2m_action_layout_item/01c4418753a230104088ddeeff7b12db
    how: read the layout link of Report Knowledge Gap
    result: the item is in the layout Incident; the item is in the overflow, order 600
    hash: bdfb9a63d835a97661f6914925a0024b9cb0f5b7d8c1d128ca9502ab5a0d23d6
  E25:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read IncidentUtilsSNC.canCreateKnowledgeGap
    result: incident_state is not Closed
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
  E26:
    record: sys_script_include/5a8da383536230104088ddeeff7b1255
    field: script
    how: read SOWIncidentUtilsAjaxSNC.ajaxFunction_createKnowledgeGap
    result: 'inserts kb_feedback_task with short_description = topic, description, parent = incident, opened_by = the user, with GlideRecord (no ACL check), and returns the info message with a link'
    hash: 6708d4abe5583876c90224579769d01a0aa02fdad140956df85e15d81591f2b9
  E27:
    record: sys_ui_action/586f83550fa23300f9b1cb6afa767ef6
    how: read Report Knowledge Gap (global)
    result: 'the Agent Workspace version: active, condition gs.hasRole("itil", "sn_incident_write") and not Closed'
    hash: ab713baae82a35ebf1ca7ab65a3c0c228f9878d55cffb05c49ebe7c340db681a
  E28:
    record: sys_security_acl/669bf3270f663300f9b1cb6afa767e12
    field: script
    how: read a create ACL on kb_feedback_task
    result: gs.hasRole("itil", "sn_incident_write")
    hash: 581f2a27335fb7ee8bb9c18ef954c5330fbf64892328a53f725fb630e7226bd0
  E29:
    record: sys_security_acl/2caf904d67030300d358bb2d07415aaf
    field: script
    how: read the read ACL on kb_feedback_task
    result: the assignee or opener; for feedback on an article, its contributors; otherwise whoever can read the parent task
    hash: 5a07ba477debf43129d68b103cc91edf0542d8285d8d6b71460eea28d52b832f
  E30:
    record: sys_security_acl/b95e5c0d67030300d358bb2d07415af0
    field: script
    how: read the write ACL on kb_feedback_task (active tasks)
    result: the assignee, the opener, or elevated access (KBFeedbackTask.hasElevatedAccessForOwnershipGroup)
    hash: d7b65e35511fe1e204ac5ecfd032e1e18511b6f3c159ea15fc5337eb8e9905d9
  E31:
    record: sys_script_include/f708f3b167630300d358bb2d07415a18
    field: script
    how: read KBFeedbackTaskSNC.hasElevatedAccess
    result: 'without an article: knowledge admins; with a parent task: knowledge_manager or knowledge_domain_expert'
    hash: 20989cd204b4d911235de56f10968c668684390fc8998bb91eb665469901ea35
  E32:
    record: sys_number/21d7f32467030300d358bb2d07415a63
    how: read the kb_feedback_task number
    result: prefix KFT
    hash: 1431028ff05c5d488919da61ed87f6a5be3eabc135879c8d632f720f4918e729
  E33:
    record: sysevent_email_action/a5ab8a3d67330300d358bb2d07415a73
    how: 'read KM Feedback Task: Created'
    result: 'active, on insert, to assigned_to, condition feedback.article is not empty: not sent for gaps from incidents'
    hash: 9a872ee3096335b10f9249add8912b62c993157dcbe8e1b643797828064e2102
  E34:
    record: sys_script/e9c9023d67330300d358bb2d07415a58
    field: script
    how: read Notifications on knowledge Feedback Task
    result: 'after update when assigned_to changes, filter parent is empty; fires kb_feedback_task.reassigned: so not for gaps from incidents'
    hash: 23db49301dde033539c51cf1ff5c40943e74348b9526cd6c67d9446a0d8cc869
  E35:
    record: sysevent_email_action/8938a6bd67730300d358bb2d07415a34
    how: 'read KM Feedback Task: Reassigned'
    result: 'active, on event kb_feedback_task.reassigned, "Feedback Task ${number} has been reassigned to you"'
    hash: dc3779a81b558039f95890412f0e81ceca06bf04101ab40e8371a8ca9aea23d3
  E36:
    record: sys_declarative_action_assignment/58bf574ef03ba210f87778580d123bc1
    how: read Create Article interceptor (sn_sow, table kb_feedback_task)
    result: 'Create Article on an active feedback task, for its assignee or someone with elevated access, when the template selector is on and KBKnowledge.canCreate'
    hash: f3a6b8114e51d0ed6e798452028d850f867332f537edfca4ee29e58bf94ccbbd
  E37:
    record: sys_script/245748ecc61122aa016c02dffbff7464
    field: script
    how: read Incident Create Knowledge (global, after insert and update)
    result: 'when the incident changes to Closed with Knowledge ticked and KCS inactive: a draft kb_knowledge in glide.knowman.task_kb with the short description and the additional comments as text (or a kb_submission when the submission workflow is on), and the message "Knowledge Article created: …"'
    hash: 6533f827f8ab97e17534929e7cfee3569ec1e880952db0a6fe620e77cdb85366
  E38:
    record: sys_dictionary/e521b6f78c5103100a22deb6dd2b4e9a
    how: read task.knowledge
    result: label Knowledge, default false
    hash: 47f48a50d6a0b25e20228014830b42ac39ef45a8bec617ef320eb8d23346a02a
  E39:
    record: sys_ui_section/4c59739977453010dc2c885d9f5a9911
    children: sys_ui_element
    how: read the workspace Resolution section of incident
    result: close_code and close_notes; no Knowledge field
    hash: 0685d2fc46cd1538f1402eb16029334905424d0eae0f6079bc7c932dc805bdc0
  E40:
    record: sys_ui_related_list/fa3f3ac143e9d2108c5fa32d68b8f24b
    children: sys_ui_related_list_entry
    how: read Incident - Service Operations Workspace related lists
    result: 'm2m_kb_task.task (position 8), kb_knowledge.source (9), kb_submission.parent (10), kb_feedback_task.parent (7), among 16'
    hash: 1dc5e75dcb9cb55b773b0992baca4499230041ea4b78c3d3db3162b600bf30b5
  E41:
    record: sys_db_object/02457eff8c5503100a22deb6dd2b4ed6
    how: read m2m_kb_task
    result: label Knowledge Applied to Tasks
    hash: 469e1f4d3177fac7c465f6a1383e53d04de81004bac696ff557a1df8334a2f27
  E42:
    record: sys_ui_list/c081085ec7733010d7e818b1c7c260fe
    children: sys_ui_list_element
    how: read m2m_kb_task on incident, workspace view
    result: kb_knowledge, short description, knowledge base, published
    hash: 279b83ec2f455340421d862a5603b93bd202a29c6cc8f1984cc652f99efa083a
  E43:
    record: sys_ui_list/06c8c816c7333010d7e818b1c7c26053
    children: sys_ui_list_element
    how: read kb_knowledge on incident, workspace view
    result: number, short description, knowledge base, workflow state, author
    hash: 1f85f56cd91f6904a98d1167030a4ab11191deb471b57226c9995fa675289e6e
  E44:
    record: cxs_table_config/b41ff94577300110b3771aceca5a992e
    how: read Agent Assist [incident] (sn_sow_inc)
    result: 'workspace contextual search on incident, context Incident Deflection (SOW)'
    hash: 54dd96e1e5f1d86e72423611a6991831a610b8d5a88aa4216a9a7833d39bab3f
  E45:
    record: cxs_ui_action_config/683f0d5a77300110b3771aceca5a99e2
    how: read Attach (knowledge search resource)
    result: 'Attach / Unattach, badge Attached, attach_note_field comments, attachment_type embed_link'
    hash: d5b992b5e58c44cc8aaa26b847492fc724b2119b85f18e71a7ac51e414e5cc4e
  E46:
    record: cxs_ui_action_config/114f7d4577300110b3771aceca5a99be
    how: read Attach (pinned article search resource)
    result: the same settings for pinned articles
    hash: d0e1fd5c22bb7949b75230df29c1b1c7a7616bcea73bd1e3c59888dc8df8e8e9
  E47:
    record: sn_nb_action_search_result_ra_mapping/33b4ca9c970f311007a138fce053af48
    how: read the kb_knowledge mapping in Incident context
    result: active; knowledge results in Recommendations use the guidance Attach and share article
    hash: 9f593f01156a8c57ea2216b6849d2e6138d1c1773b6ae19f4ae83e75ee05b034
  E48:
    record: ga_guidance/e8421a2a436f0210f81d92621ab8f2da
    how: read Attach and share article (sn_guidances)
    result: 'actions Attach, Attach and add link in comment, Add link in worknote'
    hash: 27b4c01a80abf2c68ebedf9cae590c15a0ff7cb345a3542f495e62adddb1d374
  E49:
    record: sys_script/12267f44537630108b91ddeeff7b12b7
    field: script
    how: read Update incident from known error (before insert on m2m_kb_task)
    result: 'for an incident and a known error article (kb_template_known_error_article) whose source is a problem: sets problem_id when empty'
    hash: fb476ee0d519f1be58a3bb92529a48b354c67e88f0b92e35559d4d5e363e1ac1
  E50:
    record: sys_script/7ccec013ef22210066fc36caa5c0fb57
    field: script
    how: read Check and remove cxs_rel_doc_details rec (after delete on m2m_kb_task)
    result: removing an attachment also removes its "attach" relevance record from contextual search
    hash: 49c0ae4e8f89c7cd9c13041129baaeb7976136dbe981b81a1880432b8a6773f6
  E51:
    record: sys_properties/58b7a716db103200a042f278f0b8f585
    field: value
    how: read glide.knowman.versioning.enabled
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## The applications {label=NEW}

| Scope | What it gives incident management |
|---|---|
| `sn_sow_inc` | the workspace actions Create Knowledge, Edit knowledge and Report Knowledge Gap, the related lists, the Agent Assist configuration for incident |
| `sn_km_center` | Knowledge Center: the **Create new article** page that Create Knowledge opens |
| `global` | Knowledge Management, the feedback task table, its ACLs and notifications, the close rule *Incident Create Knowledge* |
| `sn_guidances` | the attach actions on knowledge in **Recommendations** |

The mirror's plugin list shows *KCS Integration for Incident Management*
(`com.snc.incident.knowledge`) **inactive** and *Knowledge Management Advanced*
(`com.snc.knowledge_advanced`) active. The Now Assist for ITSM scope (`sn_itsm_gen_ai`) is not in
the mirror. So every KCS and Now Assist branch below is off on pdi2.

## 1. Create Knowledge {label=NEW}

In execution order:

1. **Header.** The layout *Incident* has a **Create** menu [E07] built from the group *Create*,
   which lists two *Create knowledge* form actions and *Edit knowledge*. [E06] One is the
   declarative action [E03]; the other is the UI action [E04], which is inactive. [E05] [Q50]
2. **Who and when.** The declarative action requires `itil` or `sn_incident_write` [E01] and
   `canCreateKnowledgeArticle` [E08]:

   | Check | pdi2 |
   |---|---|
   | state in `com.snc.incident.create_knowledge.multistate.enable` | the property is not in the mirror, so the default `6,7`: Resolved and Closed [E08] |
   | no article with *Source task* = the incident | one article per incident [E08] [E19] |
   | KCS active → `KBKnowledge.canCreate` | not used: KCS is inactive |
   | submission workflow off → contributor right on `glide.knowman.task_kb` | applies: the workflow is off [E10]; the knowledge base is redacted in the mirror [E09] [Q10] |

3. **Interceptor.** The action opens the route `kb_interceptor` with
   `source/incident/source-id/<sys_id>` [E01] [E02]: Knowledge Center's *Create new article*
   page, interoperable in Service Operations Workspace. [E12] [E13]
4. **Knowledge base and template.** The *KB Processor* offers templates when Knowledge Advanced is
   active and the user can contribute to templates; the submission and KCS flows are off for
   incidents on pdi2. [E14] [E10] Versioning is on. [E51]
5. **Next.** The page closes and opens a new record of the chosen template table, or
   `kb_knowledge`. [E17] Its values come from the table map between incident and the target
   table, when a target is passed [E15]; the map *Incident Standard Article* is active, but its
   field maps are not in the mirror. [E16] [Q84]
6. **The article** starts in workflow state *draft*. [E18] Publishing follows the knowledge
   base's workflow, outside incident management.

*Inactive:* the UI action *Create Knowledge* would have built the article itself: Issue from the
description and Resolution from the resolution notes, in `glide.knowman.task_kb`. [E05]
`sn_sow_inc.enable_kb_template` (false) is read only by that UI action. [E11]

## 2. Edit knowledge {label=NEW}

A server-script declarative action for `itil` or `sn_incident_write` [E20] [E21], shown when
`canEditKnowledgeArticle` passes: Resolved or Closed, and exactly one article with the incident as
*Source task* that the user can write. It redirects to `kb_knowledge.do` for that article and
returns to the incident. [E08] [E20]

On the incident's articles related list, *New* (`create-new-uxf`) opens a blank article form when
KCS is inactive. [E22]

## 3. Report Knowledge Gap {label=NEW}

1. **Header.** The workspace UI action is in the overflow menu of the layout *Incident*, order
   600. [E23] [E24] Roles `itil`, `sn_incident_write`; condition: not Closed. [E23] [E25]
2. **Dialog.** Topic (mandatory, from the short description) and Description; Submit calls
   `SOWIncidentUtilsAjax.createKnowledgeGap`. [E23]
3. **Record.** A `kb_feedback_task` (KFT…) with the topic, description, the incident as parent
   and the user as opener. [E26] [E32] The insert skips ACLs; the create ACL would also require
   `itil` or `sn_incident_write`. [E26] [E28]

The global UI action of the same name is the Agent Workspace version. [E27]

**Afterwards:**

| | |
|---|---|
| Read | the assignee, the opener, anyone who can read the incident [E29] |
| Write | the assignee, the opener, elevated users [E30] |
| Elevated | knowledge admins; `knowledge_manager`, `knowledge_domain_expert` for tasks with a parent [E31] |
| Turn into an article | *Create Article* on the feedback task, for its assignee or an elevated user [E36] |
| Notify | nothing: *KM Feedback Task: Created* needs an article [E33], and the reassignment rule skips tasks with a parent [E34] [E35] [shared/Q06] |

## 4. Knowledge at closure (classic form) {label=NEW}

The business rule *Incident Create Knowledge* creates a draft article in `glide.knowman.task_kb`
when an incident changes to Closed with **Knowledge** ticked, text from the additional comments.
[E37] The field defaults to false [E38] and isn't on the workspace Resolution section [E39], so it
works only where the classic form shows it. [Q32]

## 5. Attaching articles {label=NEW}

| Where | Records | Effect |
|---|---|---|
| Agent Assist, knowledge and pinned results | `cxs_ui_action_config` *Attach* on *Agent Assist [incident]* [E44] [E45] [E46] | `m2m_kb_task` row, a link in **Additional comments** (`attach_note_field` comments, `embed_link`) [Q12] |
| Recommendations | mapping in *Incident context* → *Attach and share article* [E47] [E48] | Attach; Attach and add link in comment; Add link in worknote |

On `m2m_kb_task` (*Knowledge Applied to Tasks*) [E41]: attaching a known error article from a
problem fills the incident's Problem when empty [E49]; removing one deletes its contextual search
relevance record. [E50]

## 6. Related lists {label=NEW}

The workspace form lists [E40]:

| Related list | Columns |
|---|---|
| `m2m_kb_task.task`, shown as Attached Knowledge | article, short description, knowledge base, published [E42] |
| `kb_knowledge.source` (articles from the incident) | number, short description, knowledge base, workflow state, author [E43] |
| `kb_feedback_task.parent` | reported gaps |
| `kb_submission.parent` | empty while the submission workflow is off [E10] |

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `glide.knowman.task_kb` | redacted | knowledge base for articles from tasks [E09] |
| `glide.knowman.submission.workflow` | false | articles, not submissions [E10] |
| `com.snc.incident.create_knowledge.multistate.enable` | not in the mirror (default 6,7) | states that offer Create and Edit [E08] |
| `sn_sow_inc.enable_kb_template` | false | only the inactive UI action [E11] |
| `glide.knowman.versioning.enabled` | true | article versioning [E51] |
