---
title: Resolution and review - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read IncidentUtilsSNC canResolveIncident, canCloseIncident, canReopenIncident
    result: the caller can't resolve their own major incident; closing needs the caller with roles or a major incident manager; never reopened
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
  E02:
    record: sys_ui_action/ad2f0767871203003582af1e36cb0b14
    how: read Demote Major Incident
    result: canDemoteMI; writes "Demoted from major incident" and the reason
    hash: 3de4700a2d6b8031519dee8186a0ceb31c349d39577b8dd090c960e2603c16ac
  E03:
    record: sys_ui_policy/76021c8473811300cab854eb7df6a783
    how: read the Post Incident Report policy
    result: section shown when state is Resolved or Closed and the major incident is accepted
    hash: 1c068ad33751d6b5c32e4d36fc47b0509d4fe3558e0e69f4d4cb03109a4c986e
  E04:
    record: sys_script/2bfa10500b8113004034478d83673ae5
    field: script
    how: read Generate timeline
    result: fills timeline once from ConsolidatedIncidentTimeline
    hash: 6d6405c13a77c9eb2c5929da0670316992a8c8aeffe1596991e15f6934eaf1c3
  E05:
    record: sys_script/8ec114a043ce3110f509038dd9b8f2d6
    field: script
    how: read Insert PIR Records On Resolved
    result: creates the draft sn_sow_inc_post_incident_review and its timeline events
    hash: eded2d3444e5e79346daa6bc7c052363589b8e9c8fc03805112f6209a34fa76d
  E06:
    record: sys_db_object/fb769607833b8310292aca75eeaad3de
    how: read sn_sow_inc_post_incident_review
    result: states Draft and Published; co-authors; report draft
    hash: 78a16edc6d57cca089fcae8a5164d6b681301b657a450b2989310f6b5d516e2b
  E07:
    record: sys_properties/d20b09bd43657110f509038dd9b8f29c
    field: value
    how: read sn_sow_inc.pir.publish.hours
    result: 24
    hash: c2356069e9d1e79ca924378153cfbbfb4d4416b1f99d41a2940bfdb66c5319db
  E08:
    record: sys_ux_screen/2f223c8843313110f509038dd9b8f294
    how: read Post Incident Report SNC (screen type Post Incident Report, route type post-incident-report)
    result: active; renders the page Post Incident Report SNC in the record page's tabs
    hash: 9632cb39a569375c5961d4dc8f26da89e7231df0a30e44e47f162777be783ad3
  E09:
    record: sys_ux_screen_condition/8d0c4d2d43463110f509038dd9b8f28d
    field: script
    how: read checkPIRTabVisiblity
    result: 'incident only; the user can read it; major_incident_state accepted; state 6 or 7; a sn_sow_inc_post_incident_review row exists for it'
    hash: a13e2bc726ca3dcd66e3ed64a2d243fa53f6d718c13752da14b5e580b8e531bc
  E10:
    record: sys_ux_macroponent/23223c8843313110f509038dd9b8f292
    field: required_translations
    how: read the labels of Post Incident Report SNC
    result: Incident summary, Edit Report, Save Report, Incident response timings, Related records, Contributors, Edit Co-contributors, Timeline, Edit Timeline, Refresh Timeline, Add Timeline Event, Settings, Preview, SLA Breached!
    hash: 295d999093bd68d7182a025d2be27c129ca7a8d995fff7bfd453c921e6c72059
  E11:
    record: sys_script/8ec114a043ce3110f509038dd9b8f2d6
    how: read Insert PIR Records On Resolved
    result: 'after update on incident, filter state=6 and major_incident_state=accepted, no "changes to": inserts the review once, then rebuilds its system events on each later update while resolved'
    hash: 9860fdf15d7e7d3d865a7347894742223be45d2af457f3f1c6cd913f56fe0bf9
  E12:
    record: sys_script_include/9fa1e83393733110121e0658548918f5
    field: script
    how: read PostMajorIncidentSummarySNC
    result: report_draft = HTML headings Summary, Impact, Resolution from short_description, description, business_impact, close_notes; run only on insert
    hash: 562737111a16439c5078c875035a3b866b0c682a94fb291a626e6231c95b9d98
  E13:
    record: sys_script_include/27300d9993713110aa760658548918a3
    field: script
    how: read PIRManagerSNC.createTimeLineEvents and _getIncidentTasksByIncidentSysId
    result: 'system events from the incident''s milestones, flagged sys_activity_supplemental rows and incident tasks; the incident task query has setLimit(1), so only one task is read; timeline_settings are set from the admin defaults on insert'
    hash: 97e422680bc894e8727d4885b4ad51431f3e023f2333ec03344e801bf009186f
  E14:
    record: sys_script/bc0c8a6b53f742104a6eddeeff7b1205
    how: read Add/Remove flagged events to PIR
    result: after insert, update or delete on sys_activity_supplemental with a payload; adds or removes a flagged-entry event
    hash: 8402f45d9158dd5033b1fdefd65e2f59cac8989ec5bfd82ff67640a9a45ebb72
  E15:
    record: sys_script/3126b8b4937e3110aa760658548918d8
    how: read Update pir data - Incident task
    result: after insert, update or delete on incident_task of an accepted major incident in state 6 or 7; rebuilds the system events
    hash: 530ce70fc7dea1243fc44ad72e62c7849bbfdefcbb17881ba5855f98d21f1d87
  E16:
    record: sn_sow_cfg_stg/3dfde9a4c37002106a4e40d83c40dd6a
    field: value
    how: read timeline_settings (sn_sow_itsm_admin)
    result: 'orderOfEvents desc; grouping on, 5 Mins (300 s); eventSources milestones and activityStream true; dateFormat, timeFormat and timeZone set'
    hash: 426f04183bd1dd2c2b00089f5512afc1d3fbb96d555e549ea64944cebeb808ad
  E17:
    record: sys_script_include/27300d9993713110aa760658548918a3
    field: script
    how: read PIRManagerSNC.getPermissionsForUser
    result: 'full rights for major_incident_manager, a co-author or the assignee (canEditContributors = can read sys_user_has_role); canWrite on the incident: timeline and preview; canRead: timeline only'
    hash: 97e422680bc894e8727d4885b4ad51431f3e023f2333ec03344e801bf009186f
  E18:
    record: sys_ux_data_broker_transform/dede52d7932a3110aa7606585489182b
    field: script
    how: read Update PIR State, Save Co Authors for Post Incident Report, Refresh Incident Summary, Update PIR Timeline Settings and Create PIR Custom Event
    result: each checks getPermissionsForUser (canPublish, canEditContributors, canEditSummary, canEditTimeline, canAddTimelineEvent) and then writes with GlideRecord, so the table ACLs don't apply
    hash: 3fb8697c2b72988d9a2c0667d20b347b0631a20d558431d94d54fd2383f52bc2
  E19:
    record: sys_security_acl/fafe96d7932a3110aa760658548918bb
    how: read the execute ACLs of the PIR data brokers and their roles
    result: itil and sn_incident_read (Fetch PIR Timeline Data also checks the user is logged in)
    hash: 182ce7dfb284edfae8b8484e6cf9a2ee0ba00481f0830b359aac5ca13765ef87
  E20:
    record: sys_security_acl/eb41a18d43fef510f509038dd9b8f2df
    how: read the read ACL on sn_sow_inc_post_incident_review and its roles
    result: itil, sn_incident_read
    hash: 829a447d209e411109624ce2ce1c55b0ad12968e8fdbc86e04c24bd83f0c1941
  E21:
    record: sys_security_acl/9b6931d543b2b910f509038dd9b8f213
    field: script
    how: read the create ACL
    result: itil (or sn_incident_write with com.snc.itsm.roles), the incident's assignee, or major_incident_manager
    hash: cae2d215c760e393a2766995e295bbfc1a555f864c5a16c520773c3498527898
  E22:
    record: sys_security_acl/ba1e5d8943bef510f509038dd9b8f21f
    field: script
    how: read the write ACL
    result: major_incident_manager, the assignee, itil (or sn_incident_write), or a co-author
    hash: 1dc5d1f273df72d2b446792e362d9b2e866f994a6631c8a43f7c9ae14d91f4ee
  E23:
    record: sys_security_acl/627ff852ffa22610ed76ffffffffff55
    field: script
    how: read the write ACL on report_draft (admin overrides off)
    result: major_incident_manager, the incident's assignee or a co-author only
    hash: fe541e73208f57c5e6760ef86f29765f1d2e106ee4d2d7ce79d03983e4f7b80b
  E24:
    record: sys_security_acl/fb89351943b2b910f509038dd9b8f220
    how: read the delete ACL and its role
    result: role nobody, admin overrides on
    hash: c28a2e786b2ff1914eecb821dc0a2aae4867ec77942fffbabb3c8b7ba4148279
  E25:
    record: sys_security_acl/786c3a3f53d142101478ddeeff7b1292
    how: read the report_view ACL and its role
    result: admin
    hash: f6d42795523e2459f872d3cbdb489a86eae28f3c42c31d60a1b8657a68ceba49
  E26:
    record: sys_script_include/27300d9993713110aa760658548918a3
    field: script
    how: read PIRManagerSNC.getUsersWithResponsiblity and saveCoAuthorsForPIR
    result: 'candidates are active users with role itil, or sn_incident_write when com.snc.itsm.roles is active, each given id = user_name; save writes the given ids into co_authors and reports success only if update() returns the incident''s sys_id'
    hash: 97e422680bc894e8727d4885b4ad51431f3e023f2333ec03344e801bf009186f
  E27:
    record: sys_dictionary/bf76d607833b8310292aca75eeaad305
    how: read co_authors
    result: glide_list of sys_user
    hash: 5f0bb2fc666599eff7a0279a4536377968d8fc34d2be9d8d13e3aceb3310d367
  E28:
    record: sys_script_include/27300d9993713110aa760658548918a3
    field: script
    how: read PIRManagerSNC.fetchIncidentRelatedData
    result: 'publish by = resolved_at + sn_sow_inc.pir.publish.hours; shown in hours up to 72, else in days; no deadline when the property is empty or 0; alert info, warning above 70 %, critical from 100 %'
    hash: 97e422680bc894e8727d4885b4ad51431f3e023f2333ec03344e801bf009186f
  E29:
    record: sys_properties/7353f04c53944210121e86f230e5e604
    how: read sn_sow_inc.pir_pdf_preview_sow_page
    result: the page the Preview iframe opens; read roles itil; its value is redacted in the mirror
    hash: 728a8dac89db2eb4a72489583cc8e74cc938f52d3561a4ac5fafa93e8d0b6070
  E30:
    record: sys_ui_page/c0585f0b93a23110aa7606585489180c
    field: html
    how: read post_incident_report (endpoint sn_sow_inc_post_incident_report.do)
    result: reads the review with GlideRecordSecure and PIRManager; shows the timeline only when showTimelineInFinalReport; Download exports a PDF (A4 portrait)
    hash: 4a6198f4610af3b5f1ca043fac6b52770df92a8f657dc93174412d7a4552778d
  E31:
    record: sys_security_acl/04f8634b93e23110aa760658548918e6
    how: read the ui_page ACL and its roles
    result: itil, sn_incident_read
    hash: fd602e61b76ce7508a442df9d7b709475f7fac7121257d8e3f588f8b9877f0fa
  E32:
    record: sys_ux_app_route/8097dbcb93623110aa76065854891838
    how: read Post Incident Report (Service Operations Workspace route)
    result: the preview page, route type post-incident-report, macroponent Default with an iframe
    hash: cf3c60d2d1618a6a0601bbf43bf4f8b8ee72258425a5e0d99a9b98ea8e4a1a3f
  E33:
    record: sys_properties/d20b09bd43657110f509038dd9b8f29c
    how: read sn_sow_inc.pir.publish.hours (read and write roles)
    result: incident_manager
    hash: 55a676714ddda39d3e36b1a35f8b24ccd782f5d1d3d20ecef6f4f1c677b453a8
  E34:
    record: sys_db_object/fb769607833b8310292aca75eeaad3de
    how: searched the mirror for notifications, scheduled jobs and flows on the table or the deadline
    result: none
    hash: 78a16edc6d57cca089fcae8a5164d6b681301b657a450b2989310f6b5d516e2b
---
## Resolving and closing

`IncidentUtilsSNC` keeps a caller from resolving their own major incident, limits closing to the
caller with roles or a major incident manager, and never offers *Reopen*. [E01] **Demote Major
Incident** sets the state to canceled with the reason in the work notes. [E02]

## Post-incident review

The classic section shows for resolved or closed accepted major incidents [E03]; the timeline is
generated once on resolution [E04]. In the workspace, a draft review record [E06] is created on
resolution [E05], to be published within the configured 24 hours. [E07] Whether both reviews
stay is not decided yet. [Q01]

## The workspace review, in execution order {label=NEW}

| # | Record | What it does |
|---|---|---|
| 1 | Business rule *Insert PIR Records On Resolved* (`sn_sow_inc`) | when an accepted major incident is updated in Resolved, inserts a `sn_sow_inc_post_incident_review` in state Draft, builds the timeline and fills the draft; on every later update while Resolved it rebuilds the system events [E11] [E12] [E13] |
| 2 | Business rules *Add/Remove flagged events to PIR* and *Update pir data - Incident task* | keep the timeline in step with flagged activity entries and incident tasks [E14] [E15] |
| 3 | Screen *Post Incident Report SNC* and its condition | the record page tab, for readable accepted major incidents in Resolved or Closed that have a review [E08] [E09] |
| 4 | Page *Post Incident Report SNC* and its data brokers | summary, timings, related records, contributors, timeline, settings, publish [E10] [E18] |
| 5 | Route *Post Incident Report* and UI page `post_incident_report` | the preview, in an iframe, and the PDF download [E32] [E29] [E30] |

The review is created only on **Resolved** (state 6): a major incident closed without being
resolved gets none. The tab's condition also accepts Closed. [E11] [E09]

## The review record {label=NEW}

`sn_sow_inc_post_incident_review` holds one row per major incident (`incident_ref`), with
`state` Draft or Published, `report_draft` (HTML), `co_authors` (users), `timeline_events` and
`timeline_settings` (JSON). [E06] [E27] The draft is filled once, on insert, with *Summary*,
*Impact* and *Resolution* from the incident's short description, description, business impact
and resolution notes. [E12]

## Timeline {label=NEW}

| Source | Events |
|---|---|
| The incident | created, proposed, accepted as major incident, resolved, closed [E13] |
| `sys_activity_supplemental` | journal entries flagged in the activity stream [E13] [E14] |
| `incident_task` | created and closed (Closed Complete, Closed Incomplete, Closed Skipped) [E13] |
| Authors | custom events, kept across rebuilds [E13] |

Each review starts with the defaults in the admin setting `timeline_settings`
(`sn_sow_cfg_stg`, scope `sn_sow_itsm_admin`): newest first, grouped within 5 minutes,
milestones shown. [E16] [E13] Changing the defaults affects only reviews created afterwards; the
date, time and time zone in that setting are not read by this code. [E13]

The incident task query is limited to **one row**, so only one task of the major incident reaches
the timeline. [E13] [Q15] This looks like a defect in the base code; report it rather than change it.

## Who can do what {label=NEW}

The page asks `PIRManagerSNC.getPermissionsForUser` [E17], and the data brokers check it again
before writing. [E18]

| User | Rights |
|---|---|
| `major_incident_manager`, the incident's assignee, a co-author | all: summary, related records, custom events, timeline, preview and download, publish, deadline banner; co-authors only if they can read `sys_user_has_role` [E17] [Q16] |
| can write the incident | timeline settings, preview and download [E17] |
| can read the incident | timeline settings [E17] [Q04] |

The brokers write with `GlideRecord`, so the table's ACLs don't limit them. [E18] Those ACLs
still govern the record in lists, forms and the API:

| Operation | Allowed | |
|---|---|---|
| read | `itil`, `sn_incident_read` | [E20] |
| create | `itil` (or `sn_incident_write`), the assignee, `major_incident_manager` | [E21] |
| write | `major_incident_manager`, the assignee, `itil` (or `sn_incident_write`), co-authors | [E22] |
| write `report_draft` | `major_incident_manager`, the assignee, co-authors (no admin override) | [E23] |
| delete | nobody (admin overrides) | [E24] |
| report_view | `admin` | [E25] |
| the brokers, the preview page | `itil`, `sn_incident_read` | [E19] [E31] |

## Co-authors {label=NEW}

Candidates are active users with `itil`, or `sn_incident_write` when the ITSM roles plugin is
active, labelled with their responsibility from the major incident's communication plan
contacts. [E26] [Q17] `co_authors` references users. [E27]

Read as written, the candidate list identifies users by user name and the save stores what it is
given, and the save reports *"Failed to Save Co-authors"* unless the update returns the
incident's sys_id, which an update of the review never does. [E26] Check on screen that co-authors
are saved and then get their rights before relying on them. [Q09]

## Deadline and preview {label=NEW}

`sn_sow_inc.pir.publish.hours` (24 on pdi2 [E07]; read and write role `incident_manager` [E33])
sets **publish by** = resolution time + the hours. Up to 72 hours it is shown in hours, beyond in
days; empty or 0 removes the deadline. The banner turns to warning after 70 % and critical at
100 %. [E28] Only the banner tells: no notification, job or flow watches the deadline. [E34] [Q02]

**Preview** opens the page named in `sn_sow_inc.pir_pdf_preview_sow_page` (value redacted in the
mirror) in an iframe [E29] [E32]; the UI page `post_incident_report` renders the report, shows the
timeline only when *Show timeline events in final report* is on, and exports the PDF. [E30]
