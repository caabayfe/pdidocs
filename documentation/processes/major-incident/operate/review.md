---
title: Resolve, demote and review
reviewed: 2026-10-17
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
resolved [E08], to be published within **24 hours**. [E09]

## What happens next

Share the report with the people who took part, and raise a problem if the cause still needs
removing (see [Raise a problem](see:problem/raise)).
