---
title: Write an article
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Knowledge Center (/now/knowledge-center), Knowledge Hub
    how: opened the Knowledge Center home page
    result: '"Knowledge Center — Set up, manage, and monitor your knowledge bases", Search for an article; Actions: Create an article, Manage groups; Quick view › Knowledge bases (4): IT, KCS Knowledge Base (demo data), Knowledge, Known Error; Knowledge features cards: Knowledge analytics dashboard, Your articles, Article quality index, Your approvals'
  E02:
    record: sys_security_acl/3fe580ef9f635210ecf142a4ba0a1c23
    how: read the read ACL on now.knowledge-center.* and its sys_security_acl_role records
    result: roles knowledge, knowledge_manager and knowledge_admin
    hash: 6a02b65ea34d5c8933d98842aeced291890aef89f314ca277a69dcb58e7c6c9b
  E03:
    record: sys_ux_app_route/c9687e872f2122102a76b001a03f9b85
    how: read the Knowledge Center route Create new article
    result: '"Intercepts request to create a new knowledge article with a page that enables user to choose knowledge base and template."'
    hash: ecb80c259ecc613e85bf5ea1de35bde380fd86115bf483b6939d23e96f7ab6a8
  E04:
    record: sys_ux_lib_component/c80896b41656ad926130c04c4f5aab59
    field: required_translation_keys
    how: read the labels of the article template selector (sn-article-template-selector)
    result: '"What type of article do you want to create?", Knowledge Base, "Select a knowledge base", Article Template, Create Article, Cancel'
    hash: 46ee5323adbb1bc28520258aadbd5b8a0ce809a8be5cb9d2c1315bfec46c6d2b
  E05:
    record: kb_article_template/478034d4870023000e3dd61e36cb0b56
    how: read the article templates (kb_article_template)
    result: 'Known Error article is active; KCS Article (4f77e8140b0103003c328ffe15673a60), What Is (3f9820540b0103003c328ffe15673a15), How to (3c1924540b0103003c328ffe15673a26) and FAQ (615820540b0103003c328ffe15673a11) are inactive'
    hash: cf7b94820c1810cb63fb7e0597bf329536e3ce369e2c066463ecba33142d7325
  E06:
    record: kb_article_template_definition/8cfdd3a4875023000e3dd61e36cb0b33
    how: read the fields of the Known Error article template, with Workaround (28b074d4870023000e3dd61e36cb0b93) and Cause (f0d0b4d4870023000e3dd61e36cb0b8b)
    result: Description, Workaround, Cause, in that order, none mandatory
    hash: abeb7ff66842de892b19d108b4173c623dd38c7e2c4bc14be7abe29857d127f0
  E07:
    record: sys_script_include/b3f2647bb712230026778d78ee11a915
    field: script
    how: read ArticleTemplateUtilSNC.canContributeToTemplates
    result: true when you can contribute to a knowledge base and at least one article template is active
    hash: 663d79fa7cf007bdb588a8c074481f21230bdf92e965ce0124ef928f59699cfc
  E08:
    record: sys_script_include/da5a4ab2d72121004792a1737e6103c5
    field: script
    how: read KBKnowledgeSNC.canCreate and canRead
    result: 'you can create an article when there is at least one active knowledge base you can contribute to; a draft is readable by knowledge admins, the knowledge base owner and managers, and its author or reviser'
    hash: ea7fa785fad6dfc913579342763268a2f81308385059c001d4ca27ca00c8ea83
  E09:
    record: sys_script/f2307605c3313100bde4beae82d3ae35
    field: script
    how: read Check User CanContribute To Kb (before insert on kb_knowledge)
    result: '"You do not have permission to contribute to this knowledge base." and the article is not saved'
    hash: 83f02a789a52087e807f802ac7544a7e9edcde3e97f98a0271f39faf9670d7a2
  E10:
    record: sys_script/70a80903d731310013ab49547e6103f9
    field: script
    how: read Set article in draft state on insert
    result: a new article in a current-style knowledge base is saved as a draft
    hash: ff2c6d44720dbce39bfdd1b7dbabb4b5861fc31572e20d7018ffaaaf98523b83
  E11:
    record: sys_script/8a3855129f1112003be01050a57fcf4f
    field: script
    how: read Populate Default KB if Empty
    result: an article saved without a knowledge base is put in a fixed default knowledge base
    hash: 03de0129e37da35f5db95db20a70c00eed497c3bb6afb3328bdd4c859a8bcd97
  E12:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canWrite and canDelete
    result: 'a draft can be edited and deleted by the knowledge base owner, a knowledge admin, or its author or reviser while they may contribute to the knowledge base'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E13:
    record: sys_ux_list/4d7327bdffda2210e9c3ffffffffff7e
    field: condition
    how: read the Knowledge Center list My Articles
    result: articles you authored that are active and not retired or outdated
    hash: c61c669e82529fb854b613cea400b5297d44702169fc4d02b769b6b2c1ffd9f2
  E14:
    record: sys_ux_list/cdd099edfff52210e9c3ffffffffff9e
    field: condition
    how: read the Knowledge Center list Unpublished
    result: articles in Draft or Review
    hash: 1cb7aac4a42d7208a02b72cc695f73c66e811b5e3ca62ed028a9f31b90c3a0bb
  E15:
    record: sys_processor/cd2ad1ee87132300420e5cdac5cb0b63
    field: script
    how: read KnowledgeCreateLauncher (knowledge_create.do)
    result: 'sends you to the Knowledge Center to create the article when the redirect applies, and you start from nothing or from a feedback task; otherwise to the classic form (kb_knowledge_create.do with templates, kb_knowledge.do without)'
    hash: 99a70659fefec6b11aa82f9f078d2fe7b35b9cb405dcb9e12373f3ee0668c832
  E16:
    record: sys_script_include/39e84ab2d72121004792a1737e610306
    field: script
    how: read KBCommonSNC.shouldRedirectToKnowledgeCenter
    result: the redirect applies when the Knowledge Center plugin is active, its two properties are true, and you have knowledge, knowledge_manager or knowledge_admin
    hash: 1c1915ccac83f5eed04b63b52c45f9cd68c7dc8bf3995326bb6e091dbd5a85d5
  E17:
    record: sys_app_module/d78ed921ff4221009b20ffffffffffdf
    how: read the Knowledge › Create New module
    result: 'opens knowledge_create.do; roles knowledge_admin, knowledge_manager, knowledge'
    hash: 2a2b1fc3259fbc9f546655a090925144f78bbbbc16c9a601c43a6bcbe612e86b
  E18:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: classic UI, kb_knowledge.do?sys_id=-1 (new article, not saved)
    how: opened the classic new-article form by its address
    result: 'the classic form opened, not the Knowledge Center: Number, Knowledge base*, Category, Scheduled publish date, Valid to, Version, Article type (HTML), Workflow (Draft), Source task, Attachment link, Display attachments, Short description*, Article body; header Submit, Search for Duplicates'
  E19:
    record: sys_ui_action/600e6f730a0a0b520138ee854545d45c
    how: read Search for Duplicates
    result: 'on a draft or in review, for itil or knowledge: searches existing articles for the short description, in a new tab'
    hash: 125ee542f9f2b9f68c33c5245019f12834d34d76e6924bfbe065a6f0ca9e64e6
  E20:
    record: sys_declarative_action_assignment/6f03a4abff112210e9c3ffffffffffe2
    how: read New on kb_knowledge (sn_km_center)
    result: 'in the Knowledge Center, New on an article list opens a new record page instead of the template chooser pop-up; only when templates can be used'
    hash: 942f291d6f1c9e17d982f0edcfef1f10b1fc9c769d296e60c24042c7d1492375
---
## Where to write {label=NEW}

Write articles in the **Knowledge Center** (`/now/knowledge-center`). Its home page, the
**Knowledge Hub**, has **Create an article** under *Actions*, the knowledge bases with their
article counts, and the cards **Your articles** and **Your approvals**. [E01]

You need the `knowledge`, `knowledge_manager` or `knowledge_admin` role to open it. [E02] To
create an article you must also be allowed to contribute to at least one active knowledge base;
each knowledge base decides who may. [E08] [Q26]

pdi2 has four knowledge bases: **IT**, **KCS Knowledge Base (demo data)**, **Knowledge** and
**Known Error**. [E01]

## Create a draft {label=NEW}

{{animation:kbauthor}}

1. In the Knowledge Center, choose **Create an article**. [E01]
2. A page asks *"What type of article do you want to create?"*. Choose the **Knowledge Base**
   and the **Article Template**. [E03] [E04] [Q41]
3. Choose **Create Article**. The article opens in the editor. [E04]
4. Fill in the **short description** (the title readers search for) and the body. Choose a
   **category** of that knowledge base.
5. Save. The article is saved as a **draft**: only you and the knowledge base's owner and
   managers see it. [E08] [E10]

If you choose a knowledge base you can't contribute to, saving fails with *"You do not have
permission to contribute to this knowledge base."* [E09]

## Templates {label=NEW}

Only one template is switched on for pdi2: **Known Error article**, with the sections
**Description**, **Workaround** and **Cause**. [E05] [E06] The KCS, What Is, How to and FAQ
templates are off. [E05]

| You are writing | Choose |
|---|---|
| a known problem with a workaround | **Known Error article** [Q18] |
| anything else | the standard article (no template) |

The template chooser appears because at least one template is active; if none were, you would go
straight to a blank article. [E07]

## Find your drafts {label=NEW}

| List | Shows |
|---|---|
| **Your articles** card (My Articles) | articles you authored that aren't retired or outdated [E01] [E13] |
| **Unpublished** | articles in Draft or Review [E14] |

You can keep editing a draft, or delete it, while it is a draft. [E12] When it is ready,
[publish it](see:publish).

## From the classic UI {label=NEW}

Some ways into knowledge from the classic UI take you to the Knowledge Center, and some don't:

| You open | You get |
|---|---|
| **Knowledge › Create New** in the navigator | the Knowledge Center's create page [E15] [E16] [E17] |
| **New** on a list of articles in the Knowledge Center | a new article page [E20] |
| `kb_knowledge.do?sys_id=-1` typed or bookmarked | the **classic form**, not the Knowledge Center [E18] |

The redirect only works through the Knowledge launchers (`knowledge_create.do` and the module
that uses it), and only for people with a knowledge role. [E15] [E16] Opening the article
form by its address stays on the classic form, with **Submit** and **Search for Duplicates** in
the header and **Knowledge base** and **Short description** mandatory. [E18] Use the Knowledge
Center instead, so that you get the template chooser and the same actions as everyone else. [Q11]

## Tips

- Search before you write: the article may already exist. On the classic form, **Search for
  Duplicates** searches for the short description in a new tab. [E19]
- Write the short description in the words people use when they search.
- An article written from a resolved incident starts the same way. See
  [Create and link knowledge from an incident](see:incident/share-knowledge).
- An article saved without a knowledge base goes to a default one; always choose it yourself.
  [E11]
