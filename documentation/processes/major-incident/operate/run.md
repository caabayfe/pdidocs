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
  E08:
    record: sys_ui_page/7b4bd5635f380300f51ca184ff466650
    field: html
    how: read the workbench page's Conference tab
    result: the Conference tab shows only when the Notify conference call table exists (notifyInstalled)
    hash: b5e33025e2dc3ba9739d42076bbc91b9f5d601efd4a5ee281fb478a3c26372bb
  E09:
    record: sys_properties/5a6d11fb87e833000e3dd61e36cb0b5c
    field: value
    how: read com.snc.iam.enable_notify
    result: false
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E10:
    record: sys_script_include/bfcef2985310130009170ef5d5dc3453
    field: script
    how: read CommunicationManagementChannelConferenceConfigSNC
    result: the conference channel is available only when Notify is enabled or a Notify number is set
    hash: e069a049351676773dd8029cf3ca3da570c99189a6a7630da2a51c7ae6237d07
  E11:
    record: sysevent_email_action/06a3a735d7111200a9addd173e24d435
    how: read Service Outage Start
    result: to people subscribed to a service, when an outage of it begins
    hash: 53184edbbbf0545d5ce49d46fd627aafc1e6aebf0d192dfdf9422493af7a490e
  E12:
    record: sp_widget/1e699082d7001200a9addd173e24d4e3
    field: script
    how: read the Employee Center Current Status widget
    result: lists current outages from cmdb_ci_outage, with the viewer's read access
    hash: 519b9b6a000ec5dc6d72c595906a3fb588ffa38452e962c5b860f6e09f27187a
---
## Find your major incidents

**Major Incidents › Open** (classic navigator) lists the active major incidents. [E03] On the
classic form, the **Major Incident** section shows its state, who proposed and promoted it, and
when; it also holds the **Business impact** and the cause. [E04] The workspace form has the same
section without those two fields. [E05]

## Open the workbench

{{animation:mimrun}}

1. Open the major incident on the **classic form** and press **View Workbench**. [E01] In the
   workspace the action is switched off. [E06]
2. The workbench opens. It brings the response together: the **Summary**, **Communication**,
   **Participants**, **Child Incidents**, **Affected CIs** and **Impacted Services/CIs**,
   **Create Outage**, the **Email Log**, **Activity** and **Notes**. [E02]

Links in major incident emails open the classic workbench too. [E07]

## The conference bridge

The workbench shows a **Conference** tab only when Notify conference calls are installed [E08],
and Notify is switched off here [E09], so the conference channel isn't offered either. [E10] Hold
the bridge in your usual meeting tool and post how to join in the **Work notes**.

## Keep the record useful

- Keep **Business impact** current: it is what managers read first.
- Log decisions and findings in **Work notes**; write to affected users in **Additional
  comments**, which reach every linked incident (see [Link the other reports](see:link)).
- Record outages of services with **Create Outage**. An outage record emails the service's
  subscribers when it starts [E11] and appears on Employee Center's status page for those who can
  read it [E12] (see [Follow an outage](see:follow)).

## What happens next

Keep people informed with [Communicate](see:communicate), and when the fix is confirmed,
[Resolve, demote and review](see:review).

### The workbench on screen {label=OPEN-QUESTION}

No major incident exists yet, so nobody has checked on screen which workbench opens and how it
looks. Platform team: open one on a test major incident and confirm the tabs listed above.
