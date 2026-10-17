---
title: Run the response
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/728d59a35f380300f51ca184ff4666b0
    how: read View Workbench (roles itil and sn_incident_read)
    result: on candidates and major incidents; opens the major incident workbench
    hash: e18e648e017ae65ec45475f0be88dc81367d73b1de331e8cab40e610eb6096b5
  E02:
    record: sys_ui_page/7b4bd5635f380300f51ca184ff466650
    field: html
    how: read the workbench page's labels
    result: Summary, Communication, Conference, Participants, Child Incidents, Affected CIs, Impacted Services/CIs, Create Outage, Email Log, Activity, Notes
    hash: b5e33025e2dc3ba9739d42076bbc91b9f5d601efd4a5ee281fb478a3c26372bb
  E03:
    record: sys_app_module/aa97d2373b00030050bec9bb34efc480
    how: read the module Major Incidents › Open
    result: active major incidents
    hash: d39400132225fb29bde8e87c7c446f611c0a73dee30a67cda1555cfd052625c2
  E04:
    record: sys_ui_section/d8e9b4e553d403006725ddeeff7b1266
    children: sys_ui_element
    how: read the classic form's Major Incident section
    result: major incident state, proposed by, promoted by, proposed, promoted, business impact, cause
    hash: 20f4585443d024f96165013bd820e5cb8d3190e882a6d0acd7b17da9b2783421
  E05:
    record: sys_ui_section/47df099653533010ae50ddeeff7b1225
    children: sys_ui_element
    how: read the workspace form's Major Incident section
    result: major incident state, proposed by, promoted by, proposed, promoted
    hash: 30e15ae3be423b5b79fbf95edc09ce0ae9c6026a2304ca68b124da718c30876e
  E06:
    record: sys_ux_form_action/9c5afbe753123010ae50ddeeff7b12e8
    how: read the workspace's View Workbench form action
    result: inactive
    hash: e033d119525a90c1528c9a1d5d3f4d8be0f7195c76843afcf2c8cd15d276df24
  E07:
    record: sys_properties/b928dda07754021024ad78dabd5a99d9
    field: value
    how: read sow_email_notification_redirect
    result: false, so links in major incident emails open the classic workbench
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
---
## Find your major incidents

**Major Incidents › Open** lists the active major incidents. [E03] On the form, the **Major
Incident** section shows its state and who proposed and promoted it, and when. [E04] The
workspace form has the same section. [E05]

## The workbench

{{animation:mimrun}}

Press **View Workbench** on the major incident. [E01] It brings the response together: the
**Summary**, **Communication**, a **Conference** bridge, **Participants**, **Child Incidents**,
**Affected CIs** and **Impacted Services/CIs**, **Create Outage**, the **Email Log**, **Activity**
and **Notes**. [E02] Links in major incident emails open it too. [E07]

### From the workspace {label=OPEN-QUESTION}

In the Service Operations Workspace the workbench action is switched off, so open the workbench
from the classic form. [E06] pdi2 has no major incident yet, so how the workbench looks there
hasn't been checked on screen.

## Keep the record useful

- Keep **Business impact** current: it is what managers read first.
- Log decisions and findings in **Work notes**; write to affected users in **Additional
  comments**, which reach every linked incident (see [Link the other reports](see:link)).
- Record outages of services with **Create Outage**, so the status page and subscribers know
  (see [Follow an outage](see:follow)).
