---
title: Follow an outage
reviewed: 2026-10-17
evidence:
  E01:
    record: ticket_configuration/33ad80e787f10010e0ef0cf888cb0b87
    how: read the incident ticket configuration in Employee Center
    result: the page shows caller, urgency, configuration item and assignee, not the major incident
    hash: 7881cdd31f9224ee69f625337c149b1ee29ced966ed47a57c97e19818f0ea831
  E02:
    record: sys_script/8f61f1b00a0a3c7401aac471d27a2718
    field: script
    how: read Update Child Incidents
    result: 'comments copied as "Comment copied from Parent Incident: …"; on resolution "Resolved based on resolution of Parent Incident."'
    hash: 917e3d1c68b281ba6c81a50742086ef60a396d924b925e0c51b7051932a9e261
  E03:
    record: sysevent_email_action/fc78e05653a6301001b2ddeeff7b128d
    how: read Comment left on incident
    result: subject "Comment added to …"
    hash: d097069e0b8fbd39394376644766e8aa8a70426cb0bf04e7baed8585f52a7272
  E04:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: subject "… was resolved"
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E05:
    record: sp_page/6fc96a42d7330200a9addd173e24d46a
    how: read the System Status page and its widgets
    result: Current Status, Planned Maintenance, Business Services Status, Service Status Legend
    hash: 53de5433a0f9e75acfda6a58ccdd8aa45224cf4adabb6f5133c34e3142275c6e
  E06:
    record: sys_security_acl/a7c490eb0a0a0bbb00358a9ad19d348d
    how: read the read ACLs on cmdb_ci_outage
    result: every one needs a role (itil, service_viewer, …)
    hash: 6444165c305e8a87ac90330bafe3758886f3af15afb3fb053e8ee6c279463a14
  E07:
    record: sys_properties/f4202de587dea110de52a64d0ebb35c3
    field: value
    how: read com.snc.iam.default_email_recipient_field
    result: bcc
    hash: a9b8efc5a481ac393e6fad94441247d18cc508a740ea59b83fc31cae7db4eb48
  E08:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center home › System status quick link'
    how: 'followed the link'
    result: 'opens ?id=services_status: Current Status, Planned Maintenance, Status History'
---
## When many people have the same problem

Report it as usual, even if colleagues already have (see [Report an incident](see:incident/report)).
When the service desk sees one failure behind many reports, it runs a **major incident** and
links the reports to it. Nothing changes on your side: you keep your own incident number.

## What you see on your incident

Your incident's page in Employee Center looks the same: it doesn't name the major incident. [E01]
In its **Activity** tab you see updates the team posts for everyone affected, starting with
*"Comment copied from Parent Incident:"*, and you get an email *"Comment added to …"* for each. [E02]
[E03]

When the failure is fixed, your incident is resolved with it: the activity says *"Resolved based
on resolution of Parent Incident."* and you get the usual *"… was resolved"* email. [E02] [E04]
If it still doesn't work for you, reopen it as usual (see
[Confirm the fix, or reopen](see:incident/confirm)).

## System status {label=OPEN-QUESTION}

Employee Center's quick link **System status** opens a page with the **Current Status** of
services, **Planned Maintenance** for the next five days and the **Status History**. [E05] [E08] On pdi2 the outage data behind it is readable only with a
support role [E06], so as an employee you may see *"No system is reporting an issue"* even during
an outage. Check this as an employee before relying on the page.

## Announcements to all users

During a major incident the team may also send a communication to users; it comes by email, with
recipients in blind copy. [E07]
