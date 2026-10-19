---
title: Retire or replace an article
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_declarative_action_assignment/2f1f9ac5c3030110c92609c77d40dd7c
    how: read the Knowledge Center's Retire action on kb_knowledge (sn_km_uib)
    result: 'a primary button "Retire" in the action bar, "Shows a detailed confirmation dialog for retiring a knowledge article", shown when the user can retire the article and replacements are allowed; it opens the Retire Confirmation modal'
    hash: 37fab669ddbdac84d9686ab86c974543fe6943e3f67cb02704777700a7fd0d30
  E02:
    record: sys_ux_macroponent/6209718dc3030110c92609c77d40dd4d
    field: required_translations
    how: read the labels of the Retire Confirmation Modal (sn_km_uib)
    result: 'Retire Confirmation; "Do you want to replace the current article with another existing article?" with Yes and No; Select Article, "Search with article number or short description"; Retire Article, Cancel'
    hash: 8ff8a75bf7a2f714b504255fa8197353135b8bff43fb7bab3164265811684fc3
  E03:
    record: sys_ux_macroponent/6209718dc3030110c92609c77d40dd4d
    field: data
    how: read the article picker's query in the Retire Confirmation Modal
    result: lists published articles other than the one being retired, in knowledge bases of the same application, found by number or short description
    hash: eff0ebcbf8c0007c607b98226b61052423666cf20de6722f9d3e80a909277d6b
  E04:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canRetire and hasAnyElevatedAccess (versioning is on)
    result: only the latest version of a published article can be retired; by an admin, the knowledge base's owner or a manager, or by the author or reviser if they may contribute to the knowledge base
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E05:
    record: sys_properties/58b7a716db103200a042f278f0b8f585
    field: value
    how: read glide.knowman.versioning.enabled
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E06:
    record: sys_properties/711dad9fc3110110c92609c77d40dd2e
    field: value
    how: read glide.knowman.enable_article_replacement_on_retire
    result: "true: a replacement article can be named when retiring"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E07:
    record: sys_ui_action/f21d1087f034c510f877bdce65680991
    field: script
    how: read Retire (retire_replacement) on the classic kb_knowledge form
    result: 'opens a "Retire Confirmation" dialog, then retires the article, with the replacement chosen in the dialog if there is one; shown when replacements are allowed'
    hash: 11108ae088faff3358cbb8b1ed7303f813d4c832a228d3c3bd480965c36f0478
  E08:
    record: sys_script_include/da5a4ab2d72121004792a1737e6103c5
    field: script
    how: read KBKnowledgeSNC.retireKnowledge and retireKnowledgeWithReplacement
    result: 'starts the knowledge base''s retire flow; a replacement must be published, readable and not the article itself; then shows "The knowledge article {0} is {1} and replaced with article {3}."'
    hash: ea7fa785fad6dfc913579342763268a2f81308385059c001d4ca27ca00c8ea83
  E09:
    record: sys_hub_flow/ea32fac859c02210f877a8ba01addda2
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Instant Retire
    result: retires a published article at once, without approval
    hash: 3ad2f74fcc4be9d5281cc2994cd6916a2f418385df09ed277eba68f063650288
  E10:
    record: sys_hub_flow/8b24579a5984ea10f877a8ba01addd14
    children: sys_hub_flow_logic_instance_v2
    how: read Knowledge - Approval Retire
    result: 'stages Pending retirement and Retired; asks for approval; approved: retires the article; rejected: moves it back to the state it had'
    hash: e3edddf92545c0426d86f9dc59872c8f47b406a07c7f91c80402b34c8c07a38f
  E11:
    record: sys_script_include/a659e923c30321000096dfdc64d3ae33
    field: script
    how: read KBWorkflowSNC.getApprovers
    result: the ownership group members when ownership groups are on, otherwise the knowledge base's owner (if active) and managers
    hash: 25c0f0e7da5e3fe9a5d385c225dfd3ade8ba2d0ea08ba2c53ccd270920afc36c
  E12:
    record: sys_properties/d20ff8ab53012300cc376512a2dc3483
    field: value
    how: read glide.knowman.ownership_group.enabled
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E13:
    record: sysevent_email_action/8d4c2145b7312300bc1308a9ee11a96d
    how: 'read KM: Approve article for publishing, with the mail script km_approval (sys_script_email/658df9c6b7122300bc1308a9ee11a9c4)'
    result: 'for any approval requested on a kb_knowledge record: "<number> is awaiting approval.", with the article title and an Approve/Reject link, to each approver'
    hash: bb1ca1df2e6bb1dd942f7c8be9e6c9c2bc248d77c4b73bf331e4df52e807e211
  E14:
    record: sys_script_include/39e84ab2d72121004792a1737e610306
    field: script
    how: read KBCommonSNC.getStateMessage
    result: '"This knowledge item is pending retirement"; "This knowledge item has been retired"'
    hash: 1c1915ccac83f5eed04b63b52c45f9cd68c7dc8bf3995326bb6e091dbd5a85d5
  E15:
    record: sys_script/65c8e098db872200a042f278f0b8f543
    field: script
    how: 'read Versioning : Retire all versions (after an article''s state changes to Retired)'
    result: every other version of the same article is retired too
    hash: 724cd8b3285bcf796b38973fa9ebfdaa8510ca63e55b4c1c14bae09194521951
  E16:
    record: sp_widget/a47ea1cb0b9432004ce28ffe15673a5b
    field: script
    how: read the portal widget Knowledge Article Content (sn_km_portal)
    result: 'a retired article with a replacement takes the reader to the latest version of the replacement, following a chain of replacements, with "The article {0} has been retired and replaced with the current article."'
    hash: ade57e9bff48b006aab67cdeca19f7a33211e8f5ac8baffadd0920e4c3def7f8
  E17:
    record: sys_script_include/aef116f1d73221004792a1737e6103a4
    field: script
    how: read KBViewModelSNC.canAccessRetiredArticle
    result: a retired article can be opened only by a knowledge administrator, or by anyone allowed to read it when it has a replacement
    hash: d5d8ffdf8f3716dc3c10868cf3f3093714ff42f5b485cce4a8b16d962c3c41c1
  E18:
    record: sys_script_include/da5a4ab2d72121004792a1737e6103c5
    field: script
    how: read KBKnowledgeSNC.getKnowledgeEncodedQuery
    result: readers' article lists take only published, active articles whose Valid to is after yesterday, in knowledge bases they may read
    hash: ea7fa785fad6dfc913579342763268a2f81308385059c001d4ca27ca00c8ea83
  E19:
    record: sys_ui_action/8ac310c2531033008bd7ddeeff7b121b
    field: script
    how: read Republish (kb_knowledge), and the Knowledge Center's Republish (sys_declarative_action_assignment/6272a5f2ff2322109fcecf437d931f89)
    result: shown on the latest version of a retired article to knowledge administrators; publishes it again, and the older retired versions become Outdated
    hash: 3216f00266e722d848bf1522c28fabc4809092c08a904c4385373f559843ac6f
  E20:
    record: sys_script/3378ee5dc32d0110c92609c77d40dd71
    field: script
    how: read Update Replacement Article References
    result: when a retired or pending-retirement article is published again, its replacement is cleared
    hash: 89a4555ccf4022b181e40d0a196e7f5256ef9ddedd57a2b06ac86b161385a6e5
  E21:
    record: sys_dictionary/ed453eff8c5503100a22deb6dd2b4e58
    field: default_value
    how: read kb_knowledge.valid_to, with KBCommonSNC.getDefaultValidToDateFromDate
    result: 'Valid to defaults to today plus the knowledge base''s Article Validity (days); without it, 2100-01-01'
    hash: 9245f75a758aed7ddc7cc78807ce80b50b26569e0b3c9a2b0b831b81a4dfe243
  E22:
    record: sys_ux_list/9b5a59ca53026210e9c3e40b10e5e662
    field: condition
    how: read the Knowledge Center's Expiring Articles list (Articles group)
    result: active articles whose Valid to falls between today and 90 days ahead, not retired or outdated
    hash: fe5641341c2948535a7ec5d630d9abbc514c6c35ed5748fcbbbccb79a7004871
  E23:
    record: sys_ux_list/a2af012dfff52210e9c3ffffffffff38
    field: condition
    how: read the Knowledge Center's Retired list (Articles group)
    result: retired articles (not knowledge blocks)
    hash: 453ea195f57980ca406d1f6e28a48c8e9c5a0978b76ba28dbee115d401942003
  E24:
    record: sys_properties/477c4b4ecba600101b6b1a2df8076df9
    field: value
    how: read glide.knowman.enable_article_expiry_notification
    result: 'false: "Send email notifications on the first day of each month for articles expiring in the next month" is off'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E25:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: classic form kb_knowledge.do?sys_id=-1 (new article, not saved)
    how: opened the classic new-article form
    result: fields include Knowledge base, Category, Scheduled publish date, Valid to, Version, Workflow (Draft)
  E26:
    record: sys_ui_action/bf63c426c30031000096dfdc64d3ae2c
    field: condition
    how: read Retire (retire), the plain retire button
    result: shown only when replacements are not allowed, so hidden on pdi2
    hash: c5153518898e503c5137acb8af1bad73f23f8d8b7fbbe16d36584f9b21eac4c0
---
## When to retire {label=NEW}

Retire an article when what it says is no longer true and can't be fixed by an update: the
product or service is gone, the procedure no longer exists, or another article now covers it.
When it is only out of date, [update it](see:update) instead; retiring takes it away from readers.
[E18]

If another article now answers the same question, name it as the **replacement** when you
retire: readers who follow an old link land on the new one. Replacements are switched on for
pdi2. [E06] [E16]

## Who can retire {label=NEW}

You can retire the **latest version** of a **published** article if you are [E04] [E05]:

- its **author** or **reviser**, and you may contribute to its knowledge base; or
- the knowledge base's **owner** or one of its **managers**, or an admin.

Drafts and older versions show no Retire button. [E04]

## Retire an article {label=NEW}

{{animation:kbretire}}

1. Open the article in the **Knowledge Center** and choose **Retire** in the action bar. [E01]
2. The **Retire Confirmation** dialog asks: *"Do you want to replace the current article with
   another existing article?"* [E02]
3. Choose **No** to retire it without a replacement, or **Yes** and then **Select Article**: search
   by article number or short description. Only published articles, in knowledge bases of the
   same application, are offered. [E02] [E03]
4. Choose **Retire Article**. [E02]

On the classic form, **Retire** opens the same *Retire Confirmation* question. [E07] The plain
Retire button without the question appears only when replacements are switched off, so you won't
see it on pdi2. [E26]

## What happens next {label=NEW}

The knowledge base's **retire flow** decides. [E08]

| Retire flow | What happens | What you see |
|---|---|---|
| *Knowledge - Instant Retire* | retired at once [E09] | *"This knowledge item has been retired"* [E14] |
| *Knowledge - Approval Retire* | **Pending retirement** until the approvers decide; approved, it is retired; rejected, it goes back to the state it had [E10] | *"This knowledge item is pending retirement"* [E14] |

- The approvers are the knowledge base's **owner and managers**; ownership groups are off on
  pdi2. [E11] [E12] Each gets *"KB… is awaiting approval."* with an **Approve/Reject** link, the
  same email as for publishing. [E13]
- With a replacement, the message reads *"The knowledge article KB… is retired and replaced with
  article KB…"*. [E08]
- **Every version** of the article is retired, not only the one you had open. [E15]

## What readers see {label=NEW}

| The article | A reader who opens it, or follows an old link |
|---|---|
| Retired **with** a replacement | is taken to the latest version of the replacement, with *"The article KB… has been retired and replaced with the current article."* [E16] |
| Retired **without** a replacement | can't open it; only knowledge administrators can [E17] |
| Retired, either way | no longer appears in search or in knowledge lists [E18] |

If the replacement is itself retired later with a replacement of its own, readers are taken
along the chain to the newest one. [E16]

## Bring an article back {label=NEW}

Knowledge administrators see **Republish** on the latest version of a retired article. It is
published again, and its older versions become outdated. [E19] Its replacement is cleared, so
readers stop being redirected. [E20]

## Valid to and expiring articles {label=NEW}

Every article has a **Valid to** date. [E25] For a new article it is filled from the knowledge
base's *Article Validity* (a number of days); a knowledge base without one gives 1 January 2100.
[E21]

- After its Valid to date an article drops out of readers' lists and search, even though it is
  still published. [E18]
- The Knowledge Center lists articles due within 90 days under **Articles › Expiring Articles**,
  and retired ones under **Articles › Retired**. [E22] [E23]
- **Nobody is warned by email**: the monthly expiry warning is switched off on pdi2. Check the
  Expiring Articles list yourself. [E24]

For an expiring article, either update it and move its Valid to date on, or retire it.

## Tips

- Prefer a replacement whenever one exists: links in old incidents, emails and bookmarks keep
  working. [E16]
- Before retiring, check the article isn't the replacement of other retired articles: they would
  stop redirecting anywhere useful. [E16] [E17]
- If an article only needs a correction, check out a new version rather than retiring it. See
  [Update a published article](see:update).

## Not yet seen {label=OPEN-QUESTION}

1. The Retire button and the Retire Confirmation dialog were not opened on screen; the steps
   follow the dialog's labels. [E02] Does the Knowledge Center show them as described?
2. Which retire flow does each knowledge base (IT, Known Error, Knowledge, KCS demo) use? The
   knowledge base records are not in the mirror. Is retiring meant to need approval anywhere?
3. Who counts as a knowledge administrator for opening retired articles and for Republish? The
   check is in the platform, not in a script the mirror holds. [E17] [E19]
4. Should authors and managers be warned before Valid to, now that expiry emails are off, or is the
   Expiring Articles list enough? [E22] [E24]
