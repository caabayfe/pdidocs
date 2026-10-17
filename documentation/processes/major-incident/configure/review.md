---
title: Resolution and review - configuration
reviewed: 2026-10-17
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
---
## Resolving and closing

`IncidentUtilsSNC` keeps a caller from resolving their own major incident, limits closing to the
caller with roles or a major incident manager, and never offers *Reopen*. [E01] **Demote Major
Incident** sets the state to canceled with the reason in the work notes. [E02]

## Post-incident review

The classic section shows for resolved or closed accepted major incidents [E03]; the timeline is
generated once on resolution [E04]. In the workspace, a draft review record [E06] is created on
resolution [E05], to be published within the configured 24 hours. [E07]
