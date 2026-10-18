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
    how: read Reject Major Incident Candidate (form context menu)
    result: 'on a candidate, for major incident managers; dialog "Reject Major Incident Candidate" asks for a reason; then "Major incident candidate … has been rejected."'
    hash: 300f492e1ae5ee5a84c38bd9faddcb362d6a8649b332e6f1f91bd4b4c0d8ec76
  E04:
    record: sys_ui_action/af862b3353b81300fc91ddeeff7b12ee
    how: read Reject Major  Incident Candidate (list action)
    result: 'dialog "Rejection Reason"; rejects the selected candidates with one reason; "Major Incident candidate … has been rejected" for each'
    hash: 04008665b3fbb94b55949cc3f07c6b8860dc354825fa1df88d0f4555bc41d88c
  E05:
    record: sysevent_email_action/3d9a3ecac3c103009f93dfdc64d3aed8
    how: read Major Incident Candidate Rejected
    result: emails the assignee and the person who proposed it
    hash: 0e8597aae8396f1c3a853d887d7443b5db7eeae4aba3c82413d5324d936fe00e
  E06:
    record: sys_script/b8b68e5453701300d6fdddeeff7b1292
    field: script
    how: read Major incident assignment (before, order 1050)
    result: 'on promotion, sets the group the property names (if any); then, if you belong to the incident''s group, makes you the assignee: "Incident has been reassigned to … from … group"'
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
  E09:
    record: sys_script_include/58ab10353b333200fe02c9bb34efc421
    field: script
    how: read MajorIncidentTriggerRulesSNC canProposeMIC
    result: an incident whose major incident state is Rejected or Canceled can be proposed again
    hash: d88ba8b95a56f4824f7514af503b25a188d0ae191a42a0a8f985f904d4a25536
  E10:
    record: sys_ux_form_action_layout/e28e161b534130108b91ddeeff7b1229
    how: read the workspace's incident header layout
    result: no item for Propose or Promote
    hash: 6aaac5eb90654c413ff7e6240b5d2c0fd67d8cc7973321754589141411f3b7a0
  E11:
    record: sys_script/38615e59b7720010cfb8c556ee11a90d
    field: script
    how: read Major Incident assignment changed
    result: the reassignment emails are queued only when the major incident group property has a value
    hash: 9950972f9c9202a0ac567065d752891c8105a8f13cecb1b781ae20944f292d42
  E12:
    record: sys_ui_page/782d4ba3871a030055c9d61e36cb0b55
    field: client_script
    how: read the rejection reason dialog
    result: 'Work notes required, button Reject; writes "Major incident candidate rejected" and your reason'
    hash: baebcff11bffc5c286b81d8aca4bfbaded3fc2242213de4cacb428609286600d
---
## Review the candidates

{{animation:mimdecide}}

These actions are on the **classic** list and form; the Service Operations Workspace header has no
item to promote. [E10]

1. Open **Major Incidents › Candidates**.
2. Open a candidate. Read its work notes: who is affected, what fails, since when.
3. Check for other reports of the same failure before you decide.

## Promote it

1. On the classic form, open the form's menu (☰ next to the title) and choose **Promote to Major
   Incident**. [E01] The dialog **Promote to Major Incident** opens.
2. In **Work notes**, write why it is a major incident and what happens next (required). Add or
   correct the **Business Impact**. [E02]
3. Press **Promote**. The form reloads; its work notes start with *"Promoted to a major
   incident"* followed by your text. [E02]

The candidate itself becomes the major incident: the creation mode is *promote*, so *Create Major
Incident* never shows. [E07]

No major incident group is set [E08], so promotion keeps the **Assignment group**. If you belong
to that group, you become **Assigned to**, and if someone else was assigned you see *"Incident has
been reassigned to … from … group"*. [E06] Otherwise set the group and the assignee yourself.
Nobody is emailed about the hand-over. [E11]

## Reject it

1. On the classic form's menu, choose **Reject Major Incident Candidate**. [E03]
2. In the dialog **Reject Major Incident Candidate**, write the reason in **Work notes** and press
   **Reject**. [E12] You see *"Major incident candidate … has been rejected."*, and the work notes
   start with *"Major incident candidate rejected"* followed by your reason. [E03] [E12]

It goes back to being an ordinary incident; its assignee and the person who proposed it get the
email *"Major Incident Candidate … has been rejected"*. [E05]

To reject several at once, select them in **Major Incidents › Candidates** and choose **Reject
Major Incident Candidate** in the list's actions. The **Rejection Reason** dialog takes one reason
for all of them, and you see *"Major Incident candidate … has been rejected"* for each. [E04]

## What happens next

- Promoted: link the other reports ([Link the other reports](see:link)) and start the response
  ([Run the response](see:run)).
- Rejected: the incident is worked as usual (see [Work on an incident](see:incident/work)). If the
  situation changes, it can be proposed again. [E09]
