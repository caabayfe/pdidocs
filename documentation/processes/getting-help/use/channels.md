---
title: Ways to get help
reviewed: 2026-10-17
evidence:
  E01:
    record: sp_portal/70cd9f3b734b13001fdae9c54cf6a72f
    field: inactive
    how: read the Employee Center portal
    result: active, the default portal, at /esc
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E02:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › Get support'
    how: 'opened Get support in the left bar'
    result: 'Contact us: +1-200-120-2020 (Available 9am to 5pm PST)'
  E03:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center, chat button at the bottom right'
    how: 'opened the chat window, sent nothing'
    result: 'Now Support: "Hi, I''m your Virtual Agent. Let me know how I can help you today." then "What''s your issue or request? Or take a look at what I can help with." and a Show me everything button'
  E04:
    record: sys_cs_live_agent_setup/f0acbc4c5f091300e6333654de7313c8
    how: read Chat Setup
    result: 'live agent chat enabled, agents would answer in the Service Operations Workspace, but no queue is set for IT, HR, customer service or global; when nobody is free it says "There are no agents available at the moment."'
    hash: 63495161dd36f00ef81d59a5e3bc0fc53291b3cfd1e251908710f0d4f1ebbe51
  E05:
    record: sys_properties/39aba1d1531301101fdbddeeff7b125e
    field: value
    how: read com.glide.cs.live_agent_only
    result: false; the Virtual Agent answers first
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E06:
    record: sysevent_in_email_action/3ccfeff5c611227a0180144333c87af9
    how: read the inbound email action Create Incident
    result: a new email becomes an incident with the sender as caller, the subject as its title and the body as its first comment; High importance sets the highest impact and urgency
    hash: 27f0b8303d67d7aad6b56b6680e28a3a4722c1c446358db6bff7ce5ab9b65baa
  E07:
    record: sysevent_in_email_action/5e53d645c0a8006400b4b0a49f2139ba
    how: read Create Incident (Forwarded)
    result: a forwarded email becomes an incident with the person who forwarded it as caller
    hash: e2c0922a783f481cb1b6bfd7c8d4c5afd7549315a4a20a5110b502500e814e75
  E08:
    record: sysevent_in_email_action/498e10410a0a0b4b007c8c7f63531747
    how: read Update Incident (BP)
    result: a reply is added to the incident as a comment; please reopen in the subject reopens it
    hash: 92b32d15bde5bd99fae5ed3c8dd9770a585acb7d8b0f1d55ddf8db95747a6563
  E09:
    record: sysevent_in_email_action/1e33e31f0a0a3c74015b770ccb3467c4
    how: read Update Request Item
    result: a reply about a requested item is added to it as a comment
    hash: d1183bb7bde9798ac83373312bfca466a612dee3164cdf79c8a7f165255690fe
  E10:
    record: sys_properties/0c0a2c8dc61122760122be0bdab6e90c
    field: value
    how: read glide.pop3readerjob.create_caller
    result: false; email from an address IT doesn't know creates no account
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E12:
    record: sysevent_email_action/58e3c1d45322301001b2ddeeff7b1266
    field: subject
    how: read the notification Incident was opened
    result: 'sent to the caller: Incident ${task_effective_number} was created'
    hash: b8e700e304b357ef17ed9c2c4496b8a1b0338ae990d581a5df142791ad85dae8
  E13:
    record: sysevent_email_action/0b4ae8c0b462b410f87755e926c386c2
    field: subject
    how: read the notification Request was opened
    result: 'Request ${number} was created'
    hash: 4408ae146a1e8b21286997ce05f2cb00d464b2dca9d0da3366db9443acdd7a09
  E15:
    record: sys_cs_channel/8ca0544053d110102f40ddeeff7b12be
    how: read the Teams channel
    result: no provider set up for it; Slack and SMS (sys_cs_channel 37263ba673b210104049dec2c4f6a77d, 5ae1b3e3771700105d7b3882a91061bd) have none either
    hash: 1b79e17f5021b2402f6df8685d81baedd0e622c3f168e60cc8fb7a4a1aed3307
---
You can reach IT in four ways: **Employee Center**, **chat**, **email** and **phone**.
Whichever you use, you get the same thing back: a numbered ticket, an email confirming it, and
the same place to follow it, **My Requests** in Employee Center.

{{animation:helpways}}

## At a glance

| Way | Use it when | How | What you get back |
|---|---|---|---|
| **Employee Center** | almost always: something isn't working, you need something, you want to see where things stand | open Employee Center [E01], search or choose a topic | an INC or REQ number on screen, and an email [E12] [E13] |
| **Chat** | you have a quick question | the chat button at the bottom right of every Employee Center page [E03] | answers from the Virtual Agent, Now Support [E05] |
| **Email** | you are away from Employee Center | send an email to the IT service desk [Q09] | an incident from your email, and an email with its number [E06] [E12] |
| **Phone** | you can't work at all and it's urgent | **+1-200-120-2020**, 9am to 5pm PST [E02] | the service desk logs it with you on the call; you get the same email |

There's no walk-up desk to visit: **Get support** lists only the phone. [E02] [Q10] Teams, Slack and
text messages aren't set up. [E15]

## Employee Center

Employee Center is where most help starts and where all of it is followed. Search for what you
need, or browse a topic, then report a problem or order something. See [Using Employee
Center](see:employee-center) for a tour, [Report an incident](see:incident/report) and [Find what
you need](see:request/find).

## Chat with Now Support

1. Press the round chat button at the bottom right of any Employee Center page.
2. **Now Support** opens and greets you: *"Hi, I'm your Virtual Agent. Let me know how I can help
   you today."* [E03]
3. Type your question in your own words, or press **Show me everything** to see what it can help
   with.

The Virtual Agent answers your questions. [E05] Nobody from the service desk answers chats yet,
so the chat can't put you through to a person. [E04] [Q02] To report a problem or ask for something,
use Employee Center or the phone.

## Email

- **A new email becomes an incident.** Your subject becomes its title and your message its first
  comment, and the incident is yours. [E06] Write the subject as you would a title: *"VPN
  disconnects every 5 minutes"*.
- **Forwarding works too.** Forward an error message you received; the incident is yours. [E07]
- **Reply instead of writing again.** Replying to an email about your incident or request adds
  your reply to it. [E08] [E09] A new email starts a new incident.
- **High importance means "I can't work".** It sets the highest impact and urgency, so the
  incident is treated as the most urgent. [E06] Use it only when that is true.
- **Write from your work address.** Email from an address IT doesn't know doesn't create an
  account for you. [E10]

## Phone

Call **+1-200-120-2020**, 9am to 5pm PST. [E02] [Q06] The service desk agent logs an incident while you
talk, and you get the same *"Incident … was created"* email as from Employee Center. [E12] Keep
the number it gives you, and follow it in My Requests.

## What happens next

Every way leads to the same ticket. You follow it in **My Requests**, answer questions in its
**Activity**, and get an email at each step: see [Follow your incident](see:incident/follow) and
[Your request's statuses and emails](see:request/statuses).

## Tips

- One problem, one ticket. If you already reported it, reply to its emails or add to it in My
  Requests instead of reporting it again.
- Not sure whether it's broken or something new? Search Employee Center: the results show both
  the forms to report problems and the items you can order.

## I want to…

| I want to… | Go to |
|---|---|
| report something that isn't working | [Report an incident](see:incident/report) |
| ask for something new | [Find what you need](see:request/find) |
| see where my ticket is | [Follow your incident](see:incident/follow) |
| find my way around Employee Center | [Using Employee Center](see:employee-center) |
