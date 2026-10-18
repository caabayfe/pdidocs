---
title: Who is told what
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_email_action/58e3c1d45322301001b2ddeeff7b1266
    how: read Incident was opened
    result: on insert, to the caller
    hash: 80ac39ae2b82c263b97fb8d3e2d8522c761db8d0eb641f20bfd7ddbb44481821
  E02:
    record: sysevent_email_action/fc78e05653a6301001b2ddeeff7b128d
    how: read Comment left on incident
    result: additional comments email the caller
    hash: d097069e0b8fbd39394376644766e8aa8a70426cb0bf04e7baed8585f52a7272
  E03:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: to the caller when the incident is resolved
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E04:
    record: sysevent_email_action/5b82abc767a630105f74e8a331b73092
    how: read Incident closed
    result: to the caller when the incident is closed
    hash: cba7ed515e158d791bb4e913f0b8830a2c042abac92927daeef24f92ab4ab704
  E05:
    record: sysevent_email_action/56ae47dfc611227501b04310882ac2ab
    how: read Incident assigned to my group
    result: the group changes and nobody is assigned → to the group
    hash: b1e4ea7171ffc1c665de4a37cf4d6f807fbd94e0bfd7e02bf342ccdda7ceb2bc
  E06:
    record: sysevent_email_action/5d078413c0a801640144dc7bc70871ce
    how: read Incident assigned to me
    result: the assignee changes → to the assignee
    hash: c80145f344db955bcd848fed4dc03d2167d399b643afa4478bdc735d18c44011
  E07:
    record: sysevent_email_action/0d51edbac0a80164006963b000ff644e
    how: read Incident commented for ITIL
    result: additional comments → the assignee and the watch list
    hash: ecec6a1dd01c138dea1edebef3ec94633b3cec7d96633ce71e68d1d70de5ed25
  E08:
    record: sysevent_email_action/fc468017536270108b91ddeeff7b128d
    how: read Incident worknoted for ITIL
    result: work notes → the assignee and the work notes list only
    hash: 7480890492550ade5fcb96ba179c7a9753739b39f07ee8247fa380021a364ac9
  E09:
    record: sysevent_email_action/e3d6fce487d73200b4ae6c5837cb0b21
    how: read Incident commented and state changed
    result: a caller's reply that takes it off hold → the assignee and the watch list
    hash: 0d32e7b45891a29ca9f2a1509bd8dd25662672d8642c5fdb4203493a68230628
  E10:
    record: sysevent_email_action/6269c7cec3c103009f93dfdc64d3aefd
    how: read Major Incident Candidate Assigned
    result: proposed as a major incident → the assignment group
    hash: b2af98605566a97a63d5496aa44f7589c9e7d7c1920d015fcf3701287a4b3dde
---
## Emails you get {for=user}

| When | The email you get |
|---|---|
| Your incident is created | *"Incident … was created"* [E01] |
| The service desk writes to you | their message, *"Comment added to …"* [E02] |
| It is resolved | that it was resolved, so you can confirm or reopen [E03] |
| It is closed | that it was closed [E04] |

### Which messages you see

You see everything the service desk writes **to you**, by email and on the incident's page in
Employee Center. [E02] The support team also keeps internal notes you don't see; they are about
the investigation, not about you. [E08]

Colleagues you ask the service desk to add to your incident get an email each time a message is
added. [E07]

## Emails at each step {for=operator}

| When | The caller | The support team |
|---|---|---|
| The incident is created | "Incident … was created" [E01] | |
| It reaches a team with nobody assigned | | the whole team [E05] |
| Someone is assigned | | the assignee [E06] |
| The service desk writes to the caller | the message [E02] | the assignee and the watch list [E07] |
| The caller replies while it is on hold | | the assignee and the watch list [E09] |
| It is resolved | that it was resolved [E03] | |
| It is closed | that it was closed [E04] | |
| It is proposed as a major incident | | the team [E10] |

### Which messages the caller sees

| Field | Who sees it |
|---|---|
| **Additional comments** | the caller (emailed) and the watch list [E02] [E07] |
| **Work notes** | the assignee and the work notes list only; never the caller [E08] |

Write to the caller in *Additional comments*, in plain words. Keep findings, what you tried and
hand-over notes in *Work notes*. See [Work on an incident](see:work).
