---
title: Promote or reject a candidate
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/d40103f13b10030050bec9bb34efc4d5
    how: read Promote to Major Incident (role major_incident_manager)
    result: on the classic form's menu; shown when the creation mode is promote
    hash: 14eec9407c051830a0511c05d1da1232c8329e97289303b17016aa70b4429086
  E02:
    record: sys_ui_page/510bcd3073401300cab854eb7df6a74a
    field: client_script
    how: read the Promote to Major Incident dialog
    result: 'Work notes required, Business Impact optional, buttons Cancel and Promote; writes "Promoted to a major incident" and your text'
    hash: 5e7b708c3b0da0fa0005acc6354f3dd966d4e0751a2664bdbc2ddbe2d130978c
  E03:
    record: sys_ui_action/629afe040b2003005775aabcb4673a34
    how: read Reject Major Incident Candidate (form)
    result: on a candidate, for major incident managers; asks for a reason
    hash: 300f492e1ae5ee5a84c38bd9faddcb362d6a8649b332e6f1f91bd4b4c0d8ec76
  E04:
    record: sys_ui_action/af862b3353b81300fc91ddeeff7b12ee
    how: read Reject Major  Incident Candidate (list)
    result: rejects the selected candidates with one reason
    hash: 04008665b3fbb94b55949cc3f07c6b8860dc354825fa1df88d0f4555bc41d88c
  E05:
    record: sysevent_email_action/3d9a3ecac3c103009f93dfdc64d3aed8
    how: read Major Incident Candidate Rejected
    result: emails the assignee and the person who proposed it
    hash: 0e8597aae8396f1c3a853d887d7443b5db7eeae4aba3c82413d5324d936fe00e
  E06:
    record: sys_script/b8b68e5453701300d6fdddeeff7b1292
    field: script
    how: read Major incident assignment
    result: on promotion, assigns the major incident group (when the property names one)
    hash: d5c97f31b69c19de14bbb35a114d91b23b69e8f7c2c426e58df4597051a54741
  E07:
    record: sys_properties/3f2f9db80b2003005775aabcb4673a52
    field: value
    how: read the creation mode
    result: promote
    hash: 363256bd153813bc7b3e4e1cb8a7e65b4a9c269ed27b1823925bd408833d6883
  E08:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'System Properties, filtered to sn_major_inc_mgmt'
    how: 'read the property values'
    result: 'major_incident_management_group has no value; create.copy.attributes starts short_description,impact,urgency,categor…'
---
## Review the candidates

{{animation:mimdecide}}

Open **Major Incidents › Candidates** and the candidate. Read the work notes: who is affected, what
fails, since when. Check for other reports of the same failure.

## Promote it

1. On the classic form's menu, choose **Promote to Major Incident**. [E01]
2. In the dialog, write in **Work notes** why it is a major incident and what happens next; add
   or correct the **Business Impact**. Press **Promote**. [E02]

The candidate itself becomes the major incident (on pdi2 the creation mode is *promote*, so
*Create Major Incident* never shows). [E07] No team is set for major incidents on pdi2, so promotion doesn't reassign it: set the
**Assignment group** and **Assigned to** yourself. [E06] [E08] Then
link the other reports ([Link the other reports](see:link)) and start the response
([Run the response](see:run)).

## Reject it

Choose **Reject Major Incident Candidate** and give the reason. [E03] It goes back to being an
ordinary incident; its assignee and the person who proposed it are emailed. [E05] In the
**Candidates** list you can reject several at once with the list action. [E04]

A rejected incident can be proposed again if the situation changes.
