---
title: Follow your incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sp_page_route_map/a661b335ff302210ac09ffffffffffa7
    how: read the redirect from My Requests to the new requests page
    result: inactive, so Employee Center shows the classic My Requests page
    hash: aafb1943baa3962e2b4c4a3d072879394f4065bf58d2f8c4cf1a390ce24938a4
  E02:
    record: request_filter/e3f9f9b3871023000f220cf888cb0bf4
    how: read the Incident Portal request filter
    result: lists incidents where you are the caller or opened it; shows title, number, priority and state
    hash: 9290157a76df5801a26c7fce47282129e5d43b20bfbac33dee2c79965a95d152
  E03:
    record: sp_widget/8cc0df25875023000f220cf888cb0bb5
    how: read the My Requests widget
    result: tabs Open requests and Closed requests, and a search box
    hash: 9647567e4c5abe2b5df9b2e0154ea6417c753bc9f1de80e5d42fda642b97c430
  E04:
    record: ticket_configuration/33ad80e787f10010e0ef0cf888cb0b87
    how: read the incident ticket configuration
    result: the page shows the state, caller, urgency, configuration item and who it is assigned to
    hash: 7881cdd31f9224ee69f625337c149b1ee29ced966ed47a57c97e19818f0ea831
  E05:
    record: ticket_tab_configuration/4a6a2db387310010e0ef0cf888cb0b1c
    how: read the Activity tab
    result: the incident's conversation, first tab
    hash: 36c1e9ed80c166fbaa5e0a03ee9343d9ec9a66912599b8bd35e304a76ee301e6
  E06:
    record: ticket_tab_configuration/cb7a2db387310010e0ef0cf888cb0b27
    how: read the Attachments tab
    result: the incident's attachments, second tab
    hash: 130c403a23b19e31da9430d826adcb694bbfc14936833fb672c276c8a2260e89
  E07:
    record: sp_widget/d1cfa4ea131d0810da297ad66144b091
    how: read the Standard Ticket Tab widget
    result: message box "Type your message here...", button Send
    hash: 64d8d1bb4172e104b7d0143a0a10cb8428bcc20c33488271525cd8204e0447df
  E08:
    record: sys_script/162581e087133200b4ae6c5837cb0b1a
    how: read Incident State Change to In Progress
    result: a comment from the caller while Awaiting Caller puts it back to In Progress
    hash: f4a62fc198d894d826c0208e5e0e606e78139e16118c59d6c52e02bd8be29828
  E09:
    record: sysevent_email_action/fc78e05653a6301001b2ddeeff7b128d
    how: read Comment left on incident
    result: subject "Comment added to …", with the comment and a View incident link
    hash: d097069e0b8fbd39394376644766e8aa8a70426cb0bf04e7baed8585f52a7272
  E10:
    record: std_ticket_config_action/5818ed65ff0222105146ffffffffff44
    how: read the Resolve action on the ticket page
    result: shown to the caller while the incident is open; marks it resolved
    hash: bc9550d44d6d617c490ed400a303255b1e6b591fc1426e639d06bb2b13e8ce33
  E11:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center › My Requests'
    how: 'opened the page'
    result: 'tabs Submitted requests and Drafts; View Open requests; columns Request, State, Updated'
  E12:
    record: sysevent_in_email_action/498e10410a0a0b4b007c8c7f63531747
    how: read Update Incident (BP), type reply
    result: a reply to an email about an incident is added to that incident as a comment
    hash: 92b32d15bde5bd99fae5ed3c8dd9770a585acb7d8b0f1d55ddf8db95747a6563
  E13:
    record: contract_sla/35420982d732220035ae23c7ce610393
    how: read the fix deadline's pause condition
    result: the fix deadline pauses while On Hold - Awaiting Caller
    hash: 6157ef1df804d16a5907062d37e4c485a8acec29cf19eaeb923f59159f793aa9
  E14:
    record: sysevent_email_action/0d51edbac0a80164006963b000ff644e
    how: read Incident commented for ITIL
    result: when a message is added, the people on the incident's watch list get an email
    hash: ecec6a1dd01c138dea1edebef3ec94633b3cec7d96633ce71e68d1d70de5ed25
---
See where your incident is, answer the service desk's questions and add information.

## Find your incidents

{{animation:incfollow}}

1. In Employee Center, choose **My Requests** at the top of the page. [E01]
2. Your incidents are listed under **Submitted requests** with their title, number, priority and
   state. Switch **View** from *Open requests* to *Closed requests* to see closed ones. [E11] You
   see the incidents you reported and the ones someone opened for you. [E02] [E03]
3. Choose one to open its page. It shows where it is (the state), the urgency, what it is about,
   and who is working on it. [E04]

## Answer a question or add information

1. Open the incident and choose the **Activity** tab. [E05]
2. Type in *Type your message here...* and press **Send**. [E07] Your message is added to the
   incident.
3. To add screenshots or files, use the **Attachments** tab. [E06]

You can also reply to any email about the incident: your reply is added to it. [E12]

When the service desk is waiting for you, the incident is **On Hold**. Your reply puts it back to
**In Progress** [E08], and the clock on its deadline starts again. [E13]

## Fixed it yourself?

Press **Resolve** on the incident's page. The service desk sees that you solved it. [E10]

## Keep a colleague informed

Ask the service desk to add a colleague to your incident. They then get an email each time a
message is added. [E14]

## What happens next

When the service desk writes to you, you get an email *"Comment added to …"* with their message.
[E09] When it is fixed, you get an email to confirm it: see
[Confirm the fix, or reopen](see:confirm).

## Tips

- Answer questions soon: while the service desk waits for you, your incident waits too.
- Reply in the same incident instead of reporting it again, so everything stays in one place.

## I want to…

| I want to… | Go to |
|---|---|
| report another problem | [Report an incident](see:report) |
| say whether the fix works | [Confirm the fix, or reopen](see:confirm) |
| know which emails I get | [Who is told what](see:who-is-told) |
