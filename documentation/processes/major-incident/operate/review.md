---
title: Resolve, demote and review
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_script/8f61f1b00a0a3c7401aac471d27a2718
    field: script
    how: read Update Child Incidents
    result: 'resolving the parent resolves its active children with the same code; notes "… copied from Parent Incident"'
    hash: 917e3d1c68b281ba6c81a50742086ef60a396d924b925e0c51b7051932a9e261
  E02:
    record: sys_ui_action/ad2f0767871203003582af1e36cb0b14
    how: read Demote Major Incident (classic form context menu)
    result: 'major incident managers, on an active major incident; dialog "Demote Major Incident" asks for a reason; then "… is no longer a major incident"'
    hash: 3de4700a2d6b8031519dee8186a0ceb31c349d39577b8dd090c960e2603c16ac
  E03:
    record: sys_ui_policy/76021c8473811300cab854eb7df6a783
    how: read Show Post Incident Report Section
    result: shown when a major incident is resolved or closed
    hash: 1c068ad33751d6b5c32e4d36fc47b0509d4fe3558e0e69f4d4cb03109a4c986e
  E04:
    record: sys_ui_section/3e8e73f373b01300cab854eb7df6a748
    children: sys_ui_element
    how: read the Post Incident Report section
    result: overview, lessons learned (Findings), timeline
    hash: 72dc4454b45983e480b5410b7a71af8c86df8ef866c32da864b9fa979bed7a59
  E05:
    record: sys_script/2bfa10500b8113004034478d83673ae5
    field: script
    how: read Generate timeline
    result: fills the timeline from the journal when the major incident is resolved
    hash: 6d6405c13a77c9eb2c5929da0670316992a8c8aeffe1596991e15f6934eaf1c3
  E06:
    record: sys_ui_action/95e143e25b701300e3cc8e6541f91a29
    how: read Regenerate PIR Timeline (classic form related link)
    result: 'major incident managers, on a resolved major incident; "Timeline has been regenerated"'
    hash: 24da63a36fa471e8538739d91450cd641c8db00d92df96a66f55ee3a29db2e65
  E07:
    record: sys_ui_action/5d4a759f0b3013004034478d83673a43
    how: read Preview PIR (classic form related link)
    result: opens the post incident report, with Download Report PDF
    hash: 660bab0e7a2e9cf0147c84fcb945690349122fd64b3bb6cb3e9593e736770e70
  E08:
    record: sys_script/8ec114a043ce3110f509038dd9b8f2d6
    field: script
    how: read Insert PIR Records On Resolved (workspace)
    result: creates a draft post-incident review when the major incident is resolved
    hash: eded2d3444e5e79346daa6bc7c052363589b8e9c8fc03805112f6209a34fa76d
  E09:
    record: sys_properties/d20b09bd43657110f509038dd9b8f29c
    field: value
    how: read sn_sow_inc.pir.publish.hours
    result: 24
    hash: c2356069e9d1e79ca924378153cfbbfb4d4416b1f99d41a2940bfdb66c5319db
  E10:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read IncidentUtilsSNC (canResolveIncident, canCloseIncident, canReopenIncident)
    result: the caller can't resolve their own major incident; it can't be reopened
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
  E11:
    record: sys_ux_screen_condition/8d0c4d2d43463110f509038dd9b8f28d
    field: script
    how: read the condition of the Post Incident Report SNC screen
    result: the tab shows on an incident you can read that is an accepted major incident, Resolved or Closed, and has a review record
    hash: a13e2bc726ca3dcd66e3ed64a2d243fa53f6d718c13752da14b5e580b8e531bc
  E12:
    record: sys_embedded_tour_step/1ea6bb8ac3ee4610af3a59deb0013105
    field: content
    how: read the step of the guided tour Working with incident record page
    result: '"Use the Post incident report tab to generate, configure, publish, and export a post incident report for a major incident after it''s resolved."'
    hash: 71bf6322aa7390491faf2d49781e8e092a3b5997009bec2193be309f3678f5e7
  E13:
    record: sys_ux_macroponent/23223c8843313110f509038dd9b8f292
    field: required_translations
    how: read the labels of the Post Incident Report SNC page
    result: 'Post incident report, Incident summary, Edit Report, Save Report, Incident response timings, Related records, Contributors, Edit Co-contributors, Timeline, Edit Timeline, Refresh Timeline, Add Timeline Event, Settings, Order of events, Event grouping, Group events within … of each other, Visibility settings, Show hidden events in edit view, Show timeline events in final report, Date & time format, Reset settings, Save Settings, Preview, SLA Breached!'
    hash: 295d999093bd68d7182a025d2be27c129ca7a8d995fff7bfd453c921e6c72059
  E14:
    record: sys_script_include/27300d9993713110aa760658548918a3
    field: script
    how: read PIRManagerSNC.getPermissionsForUser
    result: 'major incident managers, the assignee and co-authors can do everything (contributors only if they can read user roles); others who can edit the incident can change timeline settings and preview; others who can read it can only change timeline settings'
    hash: 97e422680bc894e8727d4885b4ad51431f3e023f2333ec03344e801bf009186f
  E15:
    record: sys_script_include/9fa1e83393733110121e0658548918f5
    field: script
    how: read PostMajorIncidentSummarySNC.syncIncidentSummary
    result: 'the draft starts with Summary (short description and description), Impact (business impact) and Resolution (resolution notes), "--" where empty'
    hash: 562737111a16439c5078c875035a3b866b0c682a94fb291a626e6231c95b9d98
  E16:
    record: sys_script_include/27300d9993713110aa760658548918a3
    field: script
    how: read PIRManagerSNC.fetchIncidentRelatedData
    result: 'Time to identify (opened to proposed, or promoted if never proposed), Time to respond (to promoted), Time to resolve (to resolved); related problem, change request and caused-by change; publish by = resolved + sn_sow_inc.pir.publish.hours; warning after 70 % of the time, critical at 100 %'
    hash: 97e422680bc894e8727d4885b4ad51431f3e023f2333ec03344e801bf009186f
  E17:
    record: sys_ux_client_script/ec92ce9843393110f509038dd9b8f247
    field: script
    how: read alert_1/content
    result: '"Publish post incident report by {0}.", then "PIR SLA {0} is approaching. Publish post incident report by {1}.", then "Publish post incident report as soon as possible."'
    hash: 454b666b6119a1ed6c6c611cc73ce336f49bebcf3214da6b4cb148db40e9321b
  E18:
    record: sys_ux_client_script/67d2645243148a5061ef038dd9b8f215
    field: script
    how: read alert_banner/isHidden
    result: the deadline banner shows only to those with every permission (canViewPirSlaBanner)
    hash: 903c533a3daff8fc2a864e13aaf273f67fa0385175017b5a8ee22bb960e29522
  E19:
    record: sys_script_include/27300d9993713110aa760658548918a3
    field: script
    how: read PIRManagerSNC.createTimeLineEvents
    result: 'events: incident created, proposed, accepted as major incident, resolved, closed; incident task created and closed; flagged activity entries; hand-added events are kept when the timeline is rebuilt, and so is each event''s hidden setting'
    hash: 97e422680bc894e8727d4885b4ad51431f3e023f2333ec03344e801bf009186f
  E20:
    record: sys_script/bc0c8a6b53f742104a6eddeeff7b1205
    field: script
    how: read Add/Remove flagged events to PIR (sys_activity_supplemental)
    result: 'flagging a work note or comment adds "{field}: {text} flagged by {name}" to the timeline; removing the flag removes it'
    hash: f4250cae5390154b80d12e9d1305e006f8b6d00362942d9acaa9c6db96adfcd5
  E21:
    record: sys_ux_client_script/27dbc7bf53cc0210121e86f230e5e6ff
    field: script
    how: read button_iconic_9/isHidden
    result: only hand-added events can be edited or deleted, by an author, while the report is a draft
    hash: 84f26a45b1f00557ad26aadf209ef1ba0937d7e4461df800907b8aae823bbf34
  E22:
    record: sys_script_include/27300d9993713110aa760658548918a3
    field: script
    how: read PIRManagerSNC.getUsersWithResponsiblity
    result: 'co-authors are chosen from active users with itil (sn_incident_write when the ITSM roles plugin is active), shown with their responsibility as a contact of the major incident''s communication plans'
    hash: 97e422680bc894e8727d4885b4ad51431f3e023f2333ec03344e801bf009186f
  E23:
    record: sys_ux_client_script/f4c57edf936a3110aa7606585489189b
    field: script
    how: read mark_published/label
    result: '"Mark published" on a draft, "Unpublish" once published'
    hash: 910a797a9659dde9d872969e1e298c115455d4456be7b8d219604eca68f0fdbc
  E24:
    record: sys_script_include/27300d9993713110aa760658548918a3
    field: script
    how: read PIRManagerSNC.markPublish
    result: '"Post incident report has been marked published." / "Post incident report has been marked unpublished."'
    hash: 97e422680bc894e8727d4885b4ad51431f3e023f2333ec03344e801bf009186f
  E25:
    record: sys_ux_client_script/40daf29793aa3110aa7606585489182e
    field: script
    how: read edit_button/disabled
    result: editing is switched off while the report is published
    hash: 0cd89fb5e921b66f710c8bd0ec1ced6323a8ecaa64b424e0ba131ad0b82a7309
  E26:
    record: sys_ui_page/c0585f0b93a23110aa7606585489180c
    field: html
    how: read the labels of the post_incident_report page
    result: 'Post Incident Report, PIR Status:, Incident ID, Priority, Opened, Resolved, Responder, Contributors, Incident summary, Incident response timings, Related Records, Timeline (only if "Show timeline events in final report"), All times in, Timezone:, Download'
    hash: 4a6198f4610af3b5f1ca043fac6b52770df92a8f657dc93174412d7a4552778d
  E27:
    record: sys_ui_page/c0585f0b93a23110aa7606585489180c
    field: client_script
    how: read exportPDF
    result: Download saves the report as a PDF, A4 portrait
    hash: 94e4b1322b18a0fc2052fbb8fc693046604c58735a923b2abaaaa3f4601db458
  E28:
    record: sys_security_acl/04f8634b93e23110aa760658548918e6
    how: read the ui_page ACL sn_sow_inc_post_incident_report and its roles
    result: the preview page opens for itil and sn_incident_read
    hash: fd602e61b76ce7508a442df9d7b709475f7fac7121257d8e3f588f8b9877f0fa
  E29:
    record: sn_sow_cfg_stg/3dfde9a4c37002106a4e40d83c40dd6a
    field: value
    how: read the default timeline settings (sn_sow_itsm_admin)
    result: newest first, events within 5 minutes grouped, milestones shown
    hash: 426f04183bd1dd2c2b00089f5512afc1d3fbb96d555e549ea64944cebeb808ad
  E30:
    record: sys_db_object/fb769607833b8310292aca75eeaad3de
    how: searched the mirror for notifications, scheduled jobs and flows on sn_sow_inc_post_incident_review or the publish deadline
    result: none; nobody is reminded by email
    hash: 78a16edc6d57cca089fcae8a5164d6b681301b657a450b2989310f6b5d516e2b
  E31:
    record: sys_script/3126b8b4937e3110aa760658548918d8
    field: script
    how: read Update pir data - Incident task
    result: when an incident task of a resolved or closed major incident changes, the timeline is rebuilt
    hash: f342eb574ecd6eabd8cb3acaf8327e7ff1b16ce4aece42c9654888f537e2c3df
---
## Resolve it

{{animation:mimreview}}

Resolve the major incident as any incident (see [Resolve an incident](see:incident/resolve)),
with a resolution code and notes written for everyone affected. Every linked incident that is
still open is resolved with it, with the same code and your notes. [E01] A major incident can't be
reopened afterwards, so resolve it when the fix is confirmed. [E10]

## Demote it

If it turns out not to be a major incident:

1. On the **classic form**, open the form's menu (☰ next to the title) and choose **Demote Major
   Incident**. [E02]
2. In the dialog **Demote Major Incident**, give the reason. You see *"… is no longer a major
   incident"*. [E02]

It becomes an ordinary incident again, and is worked as usual.

## The post-incident review (classic form)

1. Once the major incident is resolved, the classic form shows the **Post Incident Report**
   section: **Overview**, **Findings** (what you learned) and **Timeline**. [E03] [E04]
2. The timeline is filled from the activity when it is resolved. [E05] If it is incomplete,
   choose the related link **Regenerate PIR Timeline**: you see *"Timeline has been
   regenerated"*. [E06]
3. Choose the related link **Preview PIR** to open the report; **Download Report PDF** saves it.
   [E07]

## The review in the workspace

In the Service Operations Workspace a **draft review** is created when the major incident is
resolved [E08], to be published within **24 hours**. [E09] Whether this review or the classic
section is the one of record is not decided yet. [Q01]

## The Post incident report tab {label=NEW}

{{animation:mimpir}}

Use the **Post incident report** tab of the major incident to write the review, build its
timeline, preview and download it, and publish it. [E12] The tab appears only when the major
incident is **Resolved** or **Closed** and its draft review exists. [E11] On pdi2 there is no
major incident yet, so nobody has seen this tab here. [Q13]

The tab has four parts: **Incident summary**, **Incident response timings**, **Related records**
with **Contributors**, and the **Timeline**. [E13]

## Who can do what {label=NEW}

| Who | Can |
|---|---|
| **Major incident managers**, the major incident's **assignee** and its **co-authors** | edit the summary and the related records, add events, change the timeline, preview and download, publish; they also see the deadline banner [E14] [E18] |
| Others who can edit the incident | change the timeline settings, preview and download [E14] |
| Others who can only read the incident | change the timeline settings [E14] |

Adding co-authors also needs the right to read users' roles. [E14] Ask a major incident manager
if **Edit Co-contributors** is greyed out.

## Write the report {label=NEW}

1. Open the major incident in the workspace and choose the **Post incident report** tab. [E11]
2. Read the banner: *"Publish post incident report by …"*. When 70 % of the time has gone it
   becomes *"PIR SLA 24 hours is approaching …"*, and after the deadline *"Publish post incident
   report as soon as possible."* [E16] [E17]
3. Under **Incident summary**, choose **Edit Report**. The draft already holds three headings
   taken from the incident: **Summary** (short description and description), **Impact**
   (business impact) and **Resolution** (resolution notes). [E15] Complete them with what
   happened, why, and what is being done so it doesn't happen again, and choose **Save Report**.
   [E13]
4. Check **Incident response timings**: how long it took to recognise the major incident, to
   accept it, and to resolve it. [E16]
5. Check **Related records**: the problem, the change that fixed it and the change that caused
   it, as set on the incident. [E16]
6. Under **Contributors**, choose **Edit Co-contributors** to add the people who help write the
   report. You choose from support agents; anyone who was a contact on the communication plans
   is shown with their responsibility. [E13] [E22] [Q09] Co-authors get the same rights as you. [E14]

The summary copies the incident only when the draft is created: later changes to the incident's
resolution notes are not copied into it. [E15]

## Build the timeline {label=NEW}

The timeline is built for you from [E19]:

- the milestones: incident created, proposed, accepted as a major incident, resolved, closed;
- incident tasks created and closed;
- entries of the activity stream that someone **flagged**: flag a work note while you work the
  major incident and it appears here as *"Work notes: … flagged by …"*. [E20] [Q14]

Then, with **Edit Timeline**: [E13]

1. **Hide** events that don't help the reader, or **Show** them again.
2. **Add Timeline Event** for something the records don't show (a call, a decision): choose the
   date and time and write a short description. Only these added events can be edited or
   deleted, and only while the report is a draft. [E21]
3. **Refresh Timeline** after late changes; your hidden events stay hidden and your added events
   stay. [E19] The timeline is also refreshed when the incident or its tasks change. [E31]
4. **Settings**: order of events, **Group events within** a few minutes **of each other**,
   whether hidden or added events show while editing, **Show timeline events in final report**,
   and the date and time format. **Reset settings** goes back to the defaults. [E13] On pdi2 the
   defaults are newest first, grouped within 5 minutes. [E29]

## Preview, download and publish {label=NEW}

1. Choose **Preview**: the report opens as it will be shared, with its status, the incident's
   number, priority, opened and resolved times, the responder, the contributors, the summary,
   the timings, the related records and the timeline. [E13] [E26]
2. Choose **Download** to save it as a PDF (A4). [E27] Support agents can open the preview.
   [E28]
3. When it is complete, choose **Mark published**. You see *"Post incident report has been marked
   published."* [E23] [E24] The report can't be edited while it is published. [E25]
4. To correct it, choose **Unpublish** (*"… marked unpublished."*), edit, and publish again.
   [E23] [E24]

Nobody is reminded by email: the deadline shows only in the tab's banner. [E30] [E18] [Q02]

## What happens next

Share the report with the people who took part, and raise a problem if the cause still needs
removing (see [Raise a problem](see:problem/raise)).
