---
title: Finding and reading articles - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sp_portal/70cd9f3b734b13001fdae9c54cf6a72f
    how: read Employee Center
    result: 'default portal, suffix esc; kb_knowledge_page esc_knowledge_home (sp_page/f8b574a0b7202300d0ac9277ee11a91d); kb_knowledge_base empty, so every readable knowledge base'
    hash: 6a7a0d38d3dd84f850cb567aca0c0fe0e8c7af07e6cf73508e14eb5b93ac6d48
  E02:
    record: sp_instance/c9b538a0b7202300d0ac9277ee11a9be
    how: 'read the widgets of esc_knowledge_home: KB Knowledge Bases, KB Categories - KBv3 (sp_instance/0b08bce0b7202300d0ac9277ee11a956), KB Top Rated (11b538a0b7202300d0ac9277ee11a9d1), KB Most Viewed (91b538a0b7202300d0ac9277ee11a9d3), breadcrumbs'
    result: no roles on any instance; the page is not public
    hash: b7b62c86c1d7f824d2e2fe1af532c048bccb291bfe4cbf0640ef82ad0a7f6c34
  E03:
    record: sp_page/4501c1e4b7202300d0ac9277ee11a947
    how: read esc_kb_category
    result: 'KB Knowledge Bases, KB Categories - KBv3, KB Category Page; roles snc_internal, sn_asc.alumni'
    hash: e8f76ad9f5cb33a065cc781d733086b1605013b5d92e8ded0a4b2dfc39604c8b
  E04:
    record: sp_page_route_map/728c5ce2231033007e45ff5e17bf651f
    how: read KB Article View (sn_hr_sp)
    result: in Employee Center, kb_article_view (sn_km_portal) is routed to esc_kb_article_view (sp_page/72b673c2239033007e45ff5e17bf6546; roles snc_internal, snc_external)
    hash: c98808ac8a7e067456157f9095549409b48357004a8c8c013665859e6a80c943
  E05:
    record: sp_instance/7eb67706239033007e45ff5e17bf65ef
    field: widget_parameters
    how: read the widgets of esc_kb_article_view and the options of Knowledge Article Content
    result: 'HRM Back Button; Knowledge Article Content (show_create_incident_action false, show_version_info false, redirect_latest true); Knowledge Attachments; Knowledge Article Helpful; Knowledge Article Comments; Related Catalog Item; Send to self actions; Knowledge MostViewed, MostUseful and Related Articles; Knowledge Notification Entry'
    hash: 7d60822310fbbc7ba474edcdd26c47662ebdd5e4db1b4764209c39073dd2f004
  E06:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Employee Center, a knowledge article (esc?id=kb_article_view)
    how: opened a published article
    result: 'favourite, Subscribe, Actions › Flag Article, Edit Article; author, age, views, star rating; Copy Permalink; Helpful? Yes / No; Rate this article; Post a comment…; Most Viewed; Most Useful ("No content to display"); no Send to myself panel recorded'
  E07:
    record: sp_widget/a47ea1cb0b9432004ce28ffe15673a5b
    field: script
    how: read Knowledge Article Content
    result: 'KBViewModel decides access, editability, flag and subscription; ec_favorite for the heart; logs a KB Article View statistic; a retired article with a replacement shows "The article … has been retired and replaced with the current article."'
    hash: ade57e9bff48b006aab67cdeca19f7a33211e8f5ac8baffadd0920e4c3def7f8
  E08:
    record: sys_script_include/bc65e4c1db30320099f93691f0b8f58b
    field: script
    how: read KBPortalServiceImpl.canSubscribe
    result: 'signed in, com.snc.knowledge_advanced active, glide.knowman.enable_km_subscription not false, and the roles in glide.knowman.enable_km_subscription.roles if any'
    hash: 29702fdc4bc81003541ff80cbcfd527362e01f8999a4547a4873d50a84acc698
  E09:
    record: sys_properties/7948c79367583200d358bb2d07415aa0
    field: value
    how: read glide.knowman.enable_km_subscription, with glide.knowman.enable_km_subscription.roles (sys_properties/a342576067e03200d358bb2d07415aeb)
    result: true, no roles
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E10:
    record: sys_script_include/8ed9d11d777d0210972839bd1e5a992f
    field: script
    how: read SendToSelfUtilSNC.getSendToSelfConfigRecord, used by Send to self actions (sp_widget/87024c7c77310210972839bd1e5a9906)
    result: the panel shows only when an active sn_ex_sp_send_self_configuration exists for the portal; its send channel chooses email, SMS (Twilio Direct) or both
    hash: 7fce1da131dce54c94f87a06d55b90f0a644b0d82dbf59f7fa35802ec91d0be1
  E11:
    record: sysevent_email_action/0ffccf9ac3ed821049b29e0f0501319a
    how: read Knowledge article email (sn_ex_sp)
    result: 'event sn_ex_sp.knowledge.send_email, recipient in parm2, send to self; subject "Article: ${short_description}", the article text and View the article links'
    hash: 5cf72b75135c46db9e0b434ac4527218e2733029387065e96ed4beca98df95ca
  E12:
    record: sp_portal/45d6680fdb52220099f93691f0b8f5ad
    how: read the Knowledge Portal (sn_km_portal, Knowledge Management - Service Portal plugin active)
    result: 'title Knowledge Portal, suffix kb, home kb_home, not default'
    hash: fb5d597eb18e882f59ade427a010079b582776545bc6fdaed2077ae4d9e248a2
  E13:
    record: sys_properties/58ae7466db41320002533691f0b8f590
    field: value
    how: read sn_km_portal.glide.knowman.serviceportal.enable_redirect
    result: false; classic article links are not redirected to a portal
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E14:
    record: sys_script/6c8ec5147711111016f35c207b5a9969
    field: script
    how: read Restrict guest user to knowledge base (after insert, kb_knowledge_base)
    result: 'a new knowledge base gets Any User as can read, "Has atleast one role apart from snc_internal KB" as can contribute, and Guest User as cannot read and cannot contribute; "By default knowledge base would be readable by all logged in users and contributable by users with atleast one role. Please configure user criterias to limit access."'
    hash: dbe06a3a07f8543d7e75bf0c20768cecabef4b820d2faad232e25b4ed3fe4830
  E15:
    record: sys_script/9cd6f1035f331000b12e3572f2b4778b
    how: read Public Info (before display, kb_knowledge)
    result: 'only when the kb_view UI page is public: "The kb_view UI page is public - Users are not required to log in to view knowledge articles"'
    hash: b9415c03fd0d96083c08008526ad4716acb491c335c65c6cf5204befe53428ea
  E16:
    record: sys_properties/9819d6319f3012003be01050a57fcfd5
    field: value
    how: 'read the classic search properties: glide.knowman.search.apply_acls, articles_per_page (7d65e57d9f722100d8f8700c267fcfd6), show_view_count (2dba1d22c3013100bde4beae82d3ae72), show_rating (a910fb180b1322005775aabcb4673ad6), show_author (4fde3283d713210013ab49547e6103a9)'
    result: 'false; 20; true; true; true'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E17:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Employee Center, search "password"
    how: searched Employee Center
    result: catalog item first, then knowledge articles
  E18:
    record: sys_script/d8a8e67eb5c21610f877b4cb38cd43f0
    field: script
    how: read Update content display in topic mapping (after, kb_knowledge, versioning on)
    result: keeps an article's entry in Employee Center topics (m2m_connected_content) pointing at its current version
    hash: 65e747c572ee536df6a90fbc3e54f3d48c8aa731f7f1be27ed8453b9a525933e
  E19:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: classic Knowledge Bases list
    how: opened the list
    result: 4 knowledge bases (IT, Known Error, Knowledge, and a KCS demo knowledge base)
---
## The applications {label=NEW}

| Scope | What it gives |
|---|---|
| `sn_hr_sp` | Employee Center: the portal, its Knowledge pages and the route to its article page [E01] [E04] |
| `sn_km_portal` | the article and knowledge widgets, and the Knowledge Portal `/kb` [E05] [E12] |
| `sn_ex_sp` | *Send to self actions* and the *Knowledge article email*; topics [E10] [E11] |
| `global` | access (user criteria), versioning, subscriptions, guest restriction [E08] [E14] |

Readers' page: [Find and read an article](see:find).

## 1. Pages {label=NEW}

| Page | Widgets | Access |
|---|---|---|
| `esc_knowledge_home` (Knowledge) | Knowledge Bases, Categories, Top Rated, Most Viewed [E02] | signed-in users [E02] |
| `esc_kb_category` | Knowledge Bases, Categories, Category Page [E03] | `snc_internal`, `sn_asc.alumni` [E03] |
| `esc_kb_article_view` | content, attachments, helpful, comments, related catalog item, send to self, most viewed, most useful, related [E05] | `snc_internal`, `snc_external` [E04] |

Links to `kb_article_view` inside Employee Center land on `esc_kb_article_view`. [E04] The
article content widget hides *Create Incident* and the version information, and always shows the
latest version. [E05] Seen as admin, matching the widgets; *Send to myself* did not show. [E06]

## 2. What each reader sees {label=NEW}

- **Articles**: what the reader's user criteria allow on each knowledge base; Employee Center
  names no knowledge base, so all readable ones. [E01] A new knowledge base starts readable by
  every signed-in user, writable by anyone with a role, and closed to guests, until its user
  criteria are changed. [E14] The classic `kb_view` page is public only if made so. [E15]
- **Edit Article** and **Flag Article** in *Actions*: decided by `KBViewModel` (contribute
  rights; `glide.knowman.show_flag`). [E07] See [Ratings, flags and feedback tasks -
  configuration](see:feedback) for the feedback options.
- **Subscribe**: everyone signed in. [E08] [E09]
- **Send to myself**: only with a send-to-self configuration for Employee Center, which the
  mirror doesn't hold. [E10]

## 3. Search {label=NEW}

Employee Center's search returned the catalog item first, then knowledge articles, for
*password*. [E17] The classic knowledge search settings apply to the Knowledge Portal and the
classic UI: 20 articles a page, with views, rating and author shown, and
`glide.knowman.search.apply_acls` false. [E16]

## 4. Emails and topics {label=NEW}

- *Send to myself* queues `sn_ex_sp.knowledge.send_email` for the reader; *Knowledge article
  email* sends *"Article: …"*. [E10] [E11]
- Articles placed in Employee Center topics follow their newest version. [E18]

## The Knowledge Portal {label=NEW}

`/kb` is active but not the default portal, and classic links are not redirected to it. [E12]
[E13] The feedback emails to readers link to it. See [Ratings, flags and feedback tasks -
configuration](see:feedback).

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `glide.knowman.enable_km_subscription` | true, no roles | Subscribe for everyone [E09] |
| `sn_km_portal.glide.knowman.serviceportal.enable_redirect` | false | no redirect to a portal [E13] |
| `glide.knowman.search.apply_acls` | false | classic search setting [E16] |
| `glide.knowman.search.articles_per_page` | 20 | classic search page size [E16] |

## Open questions {label=OPEN-QUESTION}

1. Is there a send-to-self configuration for Employee Center (`sn_ex_sp_send_self_configuration`)?
   It isn't mirrored, and the panel wasn't seen. [E06] [E10]
2. Should the Knowledge Portal stay active, now that Employee Center is the default and the
   reader emails are the only links into it? [E12]
3. Which knowledge bases can employees read? User criteria and knowledge bases are not in the
   mirror; four knowledge bases were seen in the classic list. [E19]
4. Which Employee Center search sources and AI Search profile return knowledge? Only the result
   order was seen. [E17]
