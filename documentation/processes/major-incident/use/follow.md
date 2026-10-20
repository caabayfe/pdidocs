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
  E08:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center home › System status quick link'
    how: 'followed the link'
    result: 'opens ?id=services_status: Current Status, Planned Maintenance, Status History'
  E09:
    record: sp_widget/065ce522d7001200a9addd173e24d46a
    field: template
    how: read the Planned Maintenance widget
    result: 'planned outages "over the next 5 days"; "No service maintenance is planned over the next 5 days" when there are none'
    hash: bd6e2ad98253e2966adc0c5788cfc71ccade65eb6b65b16e4cf8300e314b586b
---
## When many people have the same problem

{{animation:mimfollow}}

When a failure stops many people at once, such as email down for everyone or an application
nobody can open, the service desk runs one response for all of them, called a **major incident**.
This page says what you see while that response lasts.

## Before you start

- Report the problem as usual, even if colleagues already have (see
  [Report an incident](see:incident/report)). Each report helps the team see how wide the
  failure is.
- Keep your own incident number: nothing changes on your side when your report becomes part of
  the bigger response.

## Follow it

1. Open your incident in Employee Center. Its page looks the same as before: it doesn't name the
   bigger response. [E01]
2. Read its **Activity** tab. The team's updates for everyone affected appear there, starting with
   *"Comment copied from Parent Incident:"*. [E02]
3. Check your email: for each update you get *"Comment added to …"* with your incident number.
   [E03]
4. For news about services, open the **System status** quick link on the Employee Center home
   page. It shows the **Current Status** of services, the **Planned Maintenance** over the next
   5 days and the **Status History**. [E05] [E08] [E09]

## What happens next

When the failure is fixed, your incident is resolved with it. Its activity says *"Resolved based
on resolution of Parent Incident."* and you get the usual *"… was resolved"* email. [E02] [E04]

## Emails you get

| When | Email |
|---|---|
| The team posts an update for everyone affected | *"Comment added to …"* [E03] |
| The failure is fixed and your incident is resolved | *"… was resolved"* [E04] |

## Tips

- Don't report the same failure twice: add what you see to your existing incident's
  **Activity** instead.
- If it still doesn't work for you after the fix, reopen your incident (see
  [Confirm the fix, or reopen](see:incident/confirm)).
- If the System status page says nothing is wrong while you still can't work, follow your
  incident's updates: they come from the team working on the failure. [Q12] [Q05]

## I want to…

| I want to… | Go to |
|---|---|
| report the problem | [Report an incident](see:incident/report) |
| follow my own incident | [Follow your incident](see:incident/follow) |
| reopen it after the fix | [Confirm the fix, or reopen](see:incident/confirm) |
| reach IT another way | [Ways to get help](see:getting-help/channels) |
