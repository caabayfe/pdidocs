---
title: Find and read an article
reviewed: 2026-10-19
evidence:
  E01:
    record: sp_portal/70cd9f3b734b13001fdae9c54cf6a72f
    field: kb_knowledge_page
    how: read the knowledge page of Employee Center
    result: esc_knowledge_home (sp_page/f8b574a0b7202300d0ac9277ee11a91d), titled Knowledge
    hash: b811059cafaa345071147e3897c0b915de8a292188ed9d0230504f6a75dd4d17
  E02:
    record: sp_instance/c9b538a0b7202300d0ac9277ee11a9be
    how: read the widgets of esc_knowledge_home, with Categories (sp_instance/0b08bce0b7202300d0ac9277ee11a956), Top Rated Articles (sp_instance/11b538a0b7202300d0ac9277ee11a9d1) and Most Viewed Articles (sp_instance/91b538a0b7202300d0ac9277ee11a9d3)
    result: 'Knowledge Bases, Categories, Top Rated Articles and Most Viewed Articles'
    hash: b7b62c86c1d7f824d2e2fe1af532c048bccb291bfe4cbf0640ef82ad0a7f6c34
  E03:
    record: sp_page/4501c1e4b7202300d0ac9277ee11a947
    how: read esc_kb_category
    result: 'a category page with the knowledge bases, the categories and the articles of the category'
    hash: e8f76ad9f5cb33a065cc781d733086b1605013b5d92e8ded0a4b2dfc39604c8b
  E04:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Employee Center, search "password"
    how: searched Employee Center for password
    result: the catalog item Password Reset first, then knowledge articles
  E05:
    record: sp_page_route_map/728c5ce2231033007e45ff5e17bf651f
    how: read the KB Article View route of Employee Center
    result: an article opened in Employee Center is shown on esc_kb_article_view (sp_page/72b673c2239033007e45ff5e17bf6546)
    hash: c98808ac8a7e067456157f9095549409b48357004a8c8c013665859e6a80c943
  E06:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Employee Center, a knowledge article (esc?id=kb_article_view)
    how: opened a published article
    result: 'header: favourite (heart), Subscribe, Actions › Flag Article, Edit Article; author, age, views, star rating. Footer: Copy Permalink; Helpful? Yes / No; Rate this article (5 stars); Post a comment…. Side: Most Viewed; Most Useful ("No content to display"). Opening the article adds a view'
  E07:
    record: sp_widget/a47ea1cb0b9432004ce28ffe15673a5b
    field: script
    how: read Knowledge Article Content
    result: '"You are now subscribed to {0}. You will be notified of any new activity according to your notification settings."; "Permalink copied successfully"; "The article {0} has been retired and replaced with the current article."; "This knowledge item has expired"; "You do not have sufficient privileges to access this knowledge item"'
    hash: ade57e9bff48b006aab67cdeca19f7a33211e8f5ac8baffadd0920e4c3def7f8
  E08:
    record: sp_instance/7eb67706239033007e45ff5e17bf65ef
    field: widget_parameters
    how: read the article content widget's options on esc_kb_article_view
    result: show_create_incident_action false; redirect_latest true
    hash: 7d60822310fbbc7ba474edcdd26c47662ebdd5e4db1b4764209c39073dd2f004
  E09:
    record: sys_script_include/bc65e4c1db30320099f93691f0b8f58b
    field: script
    how: read KBPortalServiceImpl.canSubscribe
    result: signed-in users may subscribe while Knowledge Management Advanced is active and glide.knowman.enable_km_subscription is not false; no role is required when glide.knowman.enable_km_subscription.roles is empty
    hash: 29702fdc4bc81003541ff80cbcfd527362e01f8999a4547a4873d50a84acc698
  E10:
    record: sys_properties/7948c79367583200d358bb2d07415aa0
    field: value
    how: read glide.knowman.enable_km_subscription
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E11:
    record: sp_widget/87024c7c77310210972839bd1e5a9906
    field: script
    how: read Send to self actions on the article page
    result: '"Send this article to yourself to read later"; Email to myself sends the event sn_ex_sp.knowledge.send_email; "Email sent successfully. If you don''t receive it within the next hour, talk to your manager for help."; shown only when the portal has an active send-to-self configuration (sn_ex_sp_send_self_configuration)'
    hash: 907b7c7162195e9edb11ba2399a048bdb6767504aa3e196707520a21e93af944
  E12:
    record: sysevent_email_action/0ffccf9ac3ed821049b29e0f0501319a
    how: read Knowledge article email
    result: 'active; subject "Article: <short description>"; the article''s text with a View the article link; sent to you'
    hash: 5cf72b75135c46db9e0b434ac4527218e2733029387065e96ed4beca98df95ca
  E13:
    record: sp_portal/45d6680fdb52220099f93691f0b8f5ad
    how: read the Knowledge Portal
    result: 'title Knowledge Portal, URL suffix kb, home page kb_home'
    hash: fb5d597eb18e882f59ade427a010079b582776545bc6fdaed2077ae4d9e248a2
  E14:
    record: sp_widget/4111d56cdb68320099f93691f0b8f52f
    how: read Knowledge MostUseful Articles, with Knowledge MostViewed Articles (sp_widget/d4f0d56cdb68320099f93691f0b8f502) and Knowledge Related Articles (sp_widget/a8874e5bdb18330076e757a0cf961939)
    result: the side of the article page lists the most useful, most viewed and related articles
    hash: bdb8d20d7e51261ad9ee58ac225232af1ee9d238b522178259a97e16ff6ba6e3
  E15:
    record: sys_script/ce68d00d67203200d358bb2d07415a3f
    field: script
    how: read Notify about article's checkout
    result: a checkout is posted as an activity to the article's subscribers
    hash: 06fe569f4a1f1db35106891ad4bc9272cb4647dc5565f88d3f6274abcfd6e37f
---
Knowledge articles answer common questions and explain how to fix common problems. Look for one
before you ask for help: it is often quicker.

## Before you start

- You only see the articles you are allowed to read. If a colleague's link says you can't open
  it, the article is in a knowledge base you can't read. [E07]
- Search with two or three words that describe the problem, as you would say it, for example
  *password* or *VPN slow*.

## Search

1. Type your words in the search box at the top of Employee Center. [E04]
2. The results show what matches, the catalog items you can order first, then knowledge
   articles. [E04]
3. Open an article to read it. [E05]

{{animation:kbfeedback}}

## Browse

1. Open the **Knowledge** page of Employee Center. [E01]
2. It shows the **Knowledge Bases** you can read, their **Categories**, the **Top Rated
   Articles** and the **Most Viewed Articles**. [E02]
3. Choose a knowledge base or a category to see its articles. [E03]

## Read an article

The article page shows, at the top, who wrote it, how old it is, how many times it was viewed and
its average star rating. Opening it counts as a view. [E06]

| Where | What you can do |
|---|---|
| Top | mark it as a **favourite** (the heart), **Subscribe** to it, and open **Actions** to flag it [E06] |
| Bottom | **Copy Permalink**, answer **Helpful?**, **Rate this article** and **Post a comment** [E06] |
| Side | the **Most Viewed**, **Most Useful** and related articles [E06] [E14] |

- **Copy Permalink** copies a link that always opens the article: *"Permalink copied
  successfully"*. [E07]
- If an article was **retired and replaced**, you are shown the new one with *"The article … has
  been retired and replaced with the current article."* [E07]
- An article past its review date shows *"This knowledge item has expired"*. [E07]
- You always see the latest published version of an article. [E08]

To say whether it helped, or that it is wrong, see
[Rate an article or say what is wrong](see:rate).

## Keep it for later

- **Favourite**: the heart at the top keeps the article in your favourites. [E06]
- **Subscribe**: you are told about changes to the article: *"You are now subscribed to …. You will
  be notified of any new activity according to your notification settings."* [E07] [E09] [E10]
- **Send it to yourself**: where the page offers it, *Send this article to yourself to read
  later* emails you the article, with the subject *"Article: …"* and a **View the article**
  link. [E11] [E12]

## The Knowledge Portal

The older **Knowledge Portal** is still switched on, at `/kb`. It shows the same articles; use
Employee Center. [E13]

## Tips

- No result? Try fewer words, or another word for the same thing.
- If an article nearly answers your question, say what is missing: the authors are told. See
  [Rate an article or say what is wrong](see:rate).
- Still stuck? [Report an incident](see:incident/report).

## I want to…

| I want to… | Go to |
|---|---|
| say an article helped, or is wrong | [Rate an article or say what is wrong](see:rate) |
| ask IT for help | [Report an incident](see:incident/report) |
| choose another way to contact IT | [Ways to get help](see:getting-help/channels) |

## Not yet seen {label=OPEN-QUESTION}

1. The **Knowledge** page (knowledge bases, categories, top rated) and a category page were not
   opened on screen; the steps follow the page's widgets. [E02] [E03] How do employees reach the
   Knowledge page from Employee Center's menu?
2. **Send to myself** was not on the article page during the walk. [E06] It shows only when
   Employee Center has a send-to-self configuration, which the mirror doesn't hold. [E11] Should
   employees be able to email an article to themselves?
3. Which emails does a subscriber get when a subscribed article changes? The mirror shows that a
   checkout is posted as an activity to subscribers, but not what reaches their inbox. [E15]
4. The walk was done as an administrator. Does an employee see the same header, with **Actions ›
   Flag Article** and without **Edit Article**?
