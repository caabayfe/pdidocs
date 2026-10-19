---
title: How knowledge management works
reviewed: 2026-10-19
evidence:
  E01:
    record: sp_portal/70cd9f3b734b13001fdae9c54cf6a72f
    field: kb_knowledge_page
    how: read the knowledge page of Employee Center
    result: esc_knowledge_home (sp_page/f8b574a0b7202300d0ac9277ee11a91d, title Knowledge)
    hash: b811059cafaa345071147e3897c0b915de8a292188ed9d0230504f6a75dd4d17
  E02:
    record: sp_portal/45d6680fdb52220099f93691f0b8f5ad
    how: read the Knowledge Portal
    result: 'title Knowledge Portal, URL suffix kb, home page kb_home'
    hash: fb5d597eb18e882f59ade427a010079b582776545bc6fdaed2077ae4d9e248a2
  E03:
    record: sys_ux_page_registry/8317ecbf9f6b5210ecf142a4ba0a1c72
    how: read the Knowledge Center experience (sn_km_center)
    result: 'active, path knowledge-center, as delivered on this instance'
    hash: 5326f6e99371e98dac0d2e2dff58510321dce86abcd14b689e8441614f9379d2
  E04:
    record: sys_properties/0e671b0aff43e2107a91ffffffffff33
    field: value
    how: read sn_km_center.glide.knowman.enable
    result: true; the Knowledge Center experience is on system wide
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E05:
    record: sys_script_include/39e84ab2d72121004792a1737e610306
    field: script
    how: read KBCommonSNC.shouldRedirectToKnowledgeCenter, with sn_km_center.glide.knowman.redirect.enable (sys_properties/b9a06742ff83e2107a91ffffffffffdc) true
    result: 'for people with knowledge, knowledge_manager or knowledge_admin, the classic launchers that create, edit and list articles (sys_processor knowledgecreatelauncher, knowledgeeditlauncher, knowledgelistlauncher) open the Knowledge Center instead'
    hash: 1c1915ccac83f5eed04b63b52c45f9cd68c7dc8bf3995326bb6e091dbd5a85d5
  E06:
    record: sys_app_module/e9eb8e3e9f082210ecf142a4ba0a1c9b
    how: read the Knowledge Center module
    result: 'opens now/knowledge-center; roles knowledge_admin, knowledge_manager, knowledge_coach, knowledge'
    hash: 2b75501fb728b053378b665d59627cee99e89868ac4d6d3a07f1980f8fa01993
  E07:
    record: sys_ux_list_category/726c4121fff52210e9c3ffffffffffbb
    how: read the list categories of the Knowledge Center (with ownership-groups f67c8121fff52210e9c3ffffffffff97, feedback-management 62baed21fff92210e9c3ffffffffff02, administration 647bf525ffbd2210e9c3ffffffffffad, article-quality-index a5419a25ffb16210e9c3ffffffffffdc, article-optimization 6b710fbaff7a2a900710a7fe063bf138)
    result: Articles, Ownership Groups, Feedback Management, Administration, Article Quality Index, Article Optimization
    hash: 3f90a9c131f97964daad7ae0268906d5477093891668a59dcd261468e212d557
  E08:
    record: sys_ux_list_category/8a9e2709533330105264ddeeff7b1297
    how: read the Knowledge list category of the Service Operations Workspace
    result: 'lists All articles, Your published articles, Your unpublished articles, Your feedback tasks, Your tasks - flagged'
    hash: 86b46c7926d15933376bb109184e42a801f2411249f5ffa6c054996e0bb6d5b4
  E09:
    record: sys_script/07c35286fc05ae10f877d15605e71613
    field: script
    how: read Populate Default Flows if Empty (before, kb_knowledge_base)
    result: a knowledge base without flows gets Knowledge - Instant Publish and Knowledge - Instant Retire
    hash: 7d81775b8d139b4c5fdc6fb4c3b5e6604001d314faea5004caf6f08da2fb8346
  E10:
    record: sys_script_include/a659e923c30321000096dfdc64d3ae33
    field: script
    how: read KBWorkflowSNC.getApprovers
    result: the approvers are the ownership group members when ownership groups are on, otherwise the knowledge base's owner and managers
    hash: 25c0f0e7da5e3fe9a5d385c225dfd3ade8ba2d0ea08ba2c53ccd270920afc36c
  E11:
    record: sys_properties/d20ff8ab53012300cc376512a2dc3483
    field: value
    how: read glide.knowman.ownership_group.enabled
    result: false; ownership groups are off
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E12:
    record: sys_user_role/1f26da36c0a8016b000c7f06a1ce7e14
    how: read the knowledge role
    result: '"Can write, edit, and review knowledge management articles"'
    hash: 6288bbbaed9a96b165aa5f02445c4a4a4e5fb38d91d2dc26cfa7ebcd8e9d33fe
  E13:
    record: sys_script/ff215a229f112100a04d7e50d67fcf0a
    field: script
    how: read Update knowledge_manager roles (kb_knowledge_base)
    result: the owner and managers of a knowledge base are given knowledge_manager, and lose it when removed
    hash: bbaccee9860cee6ca279c63fd4911546974673360dc5b0300ea2ee501a4fd912
  E14:
    record: sys_script/f2307605c3313100bde4beae82d3ae35
    field: script
    how: read Check User CanContribute To Kb
    result: '"You do not have permission to contribute to this knowledge base." and the save is stopped'
    hash: 83f02a789a52087e807f802ac7544a7e9edcde3e97f98a0271f39faf9670d7a2
  E15:
    record: sys_properties/58b7a716db103200a042f278f0b8f585
    field: value
    how: read glide.knowman.versioning.enabled
    result: true; published articles are changed through new versions
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E16:
    record: sys_script/3cf9004d67101300d358bb2d07415a62
    field: script
    how: read Knowledge Feedback Task Creation (after insert, kb_feedback, when a reason is given)
    result: feedback with a reason creates a knowledge feedback task; on pdi2 only a flag carries a reason (actionable feedback is on for flags, off for helpful and ratings)
    hash: b4734df90fd9e2ecabf5959b14c8a2e170e693ea27d499624270ac5bc19b4b3c
---
## Articles and knowledge bases

A **knowledge article** answers a question or explains how to fix something. Articles live in
**knowledge bases**: each knowledge base has an owner and managers, and decides who can read its
articles and who can write them. [E10] [E14]

Readers find articles, rate them and say when one is wrong; authors write and update them; the
knowledge base's managers keep them right and, where the knowledge base asks for it, approve them
before they are published or retired. [E10] [E16]

### What it means for you {for=user}

You find articles in **Employee Center**, under **Knowledge**, or by searching. [E01] You only see
the articles you are allowed to read. When one helps, or doesn't, say so on the article: the
authors are told. [E16] See [Find and read an article](see:find) and
[Rate an article or say what is wrong](see:rate).

## How it goes {for=operator}

1. An **author** writes a **draft** in a knowledge base they may contribute to. [E12] [E14]
2. The author **publishes** it. Each knowledge base has a publish flow: as delivered, articles are
   published at once; with an approval flow, the knowledge base's owner and managers approve it
   first. Ownership groups are off on pdi2. [E09] [E10] [E11]
3. Readers **rate** it and **flag** problems; on pdi2 only a flag becomes a **feedback task**
   for the article's author. [E16]
4. To change a published article, the author makes a **new version**; the old one becomes
   outdated when the new one is published. [E15]
5. When an article is no longer right, it is **retired**, at once or after approval, and readers
   can be pointed to a replacement. [E09]

The owner and managers of a knowledge base get the `knowledge_manager` role automatically. [E13]

Support agents write articles from resolved incidents and report missing ones: see
[Create and link knowledge from an incident](see:incident/share-knowledge).

### Where you start {for=operator}

Knowledge is worked in the **Knowledge Center** (`/now/knowledge-center`), under **Knowledge
Center** in the navigator, for people with `knowledge`, `knowledge_coach`, `knowledge_manager` or
`knowledge_admin`. [E03] [E04] [E06] Its lists are grouped as Articles, Ownership Groups, Feedback
Management, Administration, Article Quality Index and Article Optimization. [E07] Creating,
editing or listing articles from the classic navigator takes people with `knowledge`,
`knowledge_manager` or `knowledge_admin` to the Knowledge Center too. [E05]

The **Service Operations Workspace** also has a **Knowledge** list group (all articles, your
published and unpublished articles, your feedback tasks), for support agents who write
articles. [E08]

Readers use **Employee Center**; the older **Knowledge Portal** (`/kb`) is still active. [E01] [E02]
Start with [Write an article](see:write).
