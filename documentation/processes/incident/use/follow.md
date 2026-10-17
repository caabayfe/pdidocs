---
title: Follow your incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_script/2bc2f9b1c0a801640199f9eb0067326e
    how: read the incident query rule
    result: users without itil see incidents where they are caller, opener or on the watch list
    hash: 30b79550f2b7e486402d94bc5d5ce5212d27bda2b29e590c82af87b8945eb1a3
  E02:
    record: sys_script/162581e087133200b4ae6c5837cb0b1a
    how: read Incident State Change to In Progress
    result: a comment by the caller on an incident On Hold - Awaiting Caller moves it to In Progress
    hash: f4a62fc198d894d826c0208e5e0e606e78139e16118c59d6c52e02bd8be29828
  E03:
    record: ticket_configuration/33ad80e787f10010e0ef0cf888cb0b87
    how: read the portal ticket configuration for incident
    result: shows caller, urgency, configuration item, assigned to; actions Resolve, Reopen, Close
    hash: 7881cdd31f9224ee69f625337c149b1ee29ced966ed47a57c97e19818f0ea831
---
## Where to find your incidents

- On the portal, open **My Requests** (or **My Tickets**), then the incident.
- In the classic interface, use **Self-Service › Incidents**; **Watched Incidents** lists the
  ones you were added to.
- You see the incidents you reported, the ones opened on your behalf, and the ones you watch. [E01]

The incident page shows its state, urgency, the configuration item and who is working on it. [E03]

## Add information or answer a question

Write in the comments box on the incident page, or reply to any email about the incident.
Everything you write is visible to the support team, and they are notified.

When the team is waiting for you, the incident shows **On Hold - Awaiting Caller**. Your reply
puts it back to **In Progress** automatically, and the deadline starts counting again. [E02]

## Add a colleague

Ask the service desk to add a colleague to the **watch list** so they get the same updates.

## When it is resolved

You get an email saying the incident was resolved, with what was done.

- **If it works:** there's nothing to do. You can also press **Close** on the incident page.
- **If it doesn't:** press **Reopen** on the incident page, or reply to the email with
  *please reopen* in the subject, and say what is still wrong. [E03]

Once an incident is **Closed** it can't be reopened. If the problem comes back, report a new
incident and mention the old number.

## Fixed it yourself?

Open the incident and press **Resolve**. Your note is recorded as *Resolved by caller*. [E03]

## After closing

You may receive a short survey (one question, with faces). It takes ten seconds and helps the
service desk improve.
