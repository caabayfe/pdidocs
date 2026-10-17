---
title: Who is told what
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_email_action/6269c7cec3c103009f93dfdc64d3aefd
    how: read Major Incident Candidate Assigned
    result: on proposal, to the incident's assignment group
    hash: b2af98605566a97a63d5496aa44f7589c9e7d7c1920d015fcf3701287a4b3dde
  E02:
    record: sysevent_email_action/3d9a3ecac3c103009f93dfdc64d3aed8
    how: read Major Incident Candidate Rejected
    result: to the assignee and the person who proposed it
    hash: 0e8597aae8396f1c3a853d887d7443b5db7eeae4aba3c82413d5324d936fe00e
  E03:
    record: sysevent_email_action/3de6765853b01300d6fdddeeff7b1268
    how: read Notify Assigned To
    result: when promotion reassigns it, to the previous assignee
    hash: e9d6f0920e684d5582305fa21855a064e3eefd9ccbd79c59493bc0b0edd9ed99
  E04:
    record: sysevent_email_action/b9673a5853b01300d6fdddeeff7b12a7
    how: read Notify Assignment Group
    result: when promotion reassigns it, to the previous group
    hash: 6720431fb27ba98651b7cbf3416b288cd899de1d6e55e6cb7bfab246ad8e79f9
  E05:
    record: sysevent_email_action/fc78e05653a6301001b2ddeeff7b128d
    how: read Comment left on incident
    result: a comment on a caller's incident, including one copied from the parent, emails the caller
    hash: d097069e0b8fbd39394376644766e8aa8a70426cb0bf04e7baed8585f52a7272
  E06:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: to the caller when their incident is resolved
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E07:
    record: sysevent_email_action/06a3a735d7111200a9addd173e24d435
    how: read Service Outage Start
    result: to people subscribed to a service, when an outage of it begins
    hash: 53184edbbbf0545d5ce49d46fd627aafc1e6aebf0d192dfdf9422493af7a490e
---
## Emails at each step

| When | The support team | Affected employees |
|---|---|---|
| An incident is proposed | the incident's team [E01] | |
| A candidate is rejected | the assignee and whoever proposed it [E02] | |
| Promotion moves it to the major incident team | the previous assignee and team [E03] [E04] | |
| The major incident team posts an update for callers | | callers of linked incidents, as a comment on their incident [E05] |
| The major incident is resolved | | callers of linked incidents, as "… was resolved" [E06] |
| A service outage starts (outage record) | | subscribers of that service [E07] |

Nothing emails anyone when a candidate is promoted or demoted.

### What reaches you {for=user}

If your incident is linked to the major incident, you get the updates the team posts for callers
as comments on your incident, and an email when it is resolved. Subscribing to a service's status
needs a role most employees don't have, so don't count on outage emails.

### What you send {for=operator}

Write to affected users on the major incident as **Additional comments**: they are copied to every
linked incident and emailed to its caller (see [Link the other reports](see:link)). Planned
communication to stakeholders goes through communication plans (see
[Communicate](see:communicate)).
