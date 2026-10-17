---
title: Propose a major incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/13c7a3a9dbc403004d27b31be0b8f5db
    how: read Propose Major Incident (form context menu, roles itil and sn_incident_write)
    result: shown when the incident is active, not a child, and not already a candidate or major incident
    hash: d82e618b437518fc55604f920ecf5655cc551f7ab57ab1caf1bad8ddcbd8b752
  E02:
    record: sys_ui_page/3c02c808873013000e3dd61e36cb0b71
    field: client_script
    how: read the Propose Major Incident dialog
    result: 'Work notes required, Business Impact optional, buttons Cancel and Propose; writes "Proposed as major incident candidate" and your text'
    hash: 05644bbd6491c3dbea3548d769b831250753c1221ade24e94316890ef98e9b80
  E03:
    record: sys_ux_form_action_layout/e28e161b534130108b91ddeeff7b1229
    how: read the workspace's incident header layout
    result: no item for Propose or Promote
    hash: 6aaac5eb90654c413ff7e6240b5d2c0fd67d8cc7973321754589141411f3b7a0
  E04:
    record: sysevent_email_action/6269c7cec3c103009f93dfdc64d3aefd
    how: read Major Incident Candidate Assigned
    result: emails the incident's assignment group that the candidate is for review
    hash: b2af98605566a97a63d5496aa44f7589c9e7d7c1920d015fcf3701287a4b3dde
  E05:
    record: sys_app_module/f51712373b00030050bec9bb34efc441
    how: read the module Major Incidents › Candidates
    result: active incidents in state Proposed
    hash: 8b418af87c5902324af678ee81776579dc78c7b08076cf425ea1c7f9c96c437a
  E06:
    record: sys_app_module/92a0c5740b2003005775aabcb4673a33
    how: read the module Create Major Incident Candidate
    result: a new incident from the template Major Incident Candidate
    hash: 09ae53f3b96a521207052223e615cb1b321765441d7e352e34221532dc8017ba
---
## When to propose

Propose when one failure is hurting many people or a critical service: several reports about the
same thing, a site or an application everyone uses down, or a security event. Don't wait to be
sure; the major incident manager decides.

## Propose it

1. Open the incident **on the classic form**. The Service Operations Workspace doesn't offer
   *Propose*. [E03]
2. Open the form's menu (☰ next to the title) and choose **Propose Major Incident**. [E01]
3. In the dialog, write in **Work notes** why: who is affected, what doesn't work, since when.
   Add the **Business Impact** if you know it. Press **Propose**. [E02]

The incident becomes a **candidate**: its work notes start with *"Proposed as major incident
candidate"*, and its assignment group is emailed. [E02] [E04] It appears under **Major Incidents ›
Candidates** for the major incident managers. [E05]

To start from scratch, **Major Incidents › Create Major Incident Candidate** opens a new incident
already marked as a candidate. [E06]

## What you can't propose

A child incident (it's already part of something bigger), a resolved or closed incident, or one
that is already a candidate or a major incident. [E01] Link a child to the major incident instead:
[Link the other reports](see:link).
