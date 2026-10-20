---
title: Report an incident
reviewed: 2026-10-17
evidence:
  E03:
    record: sc_cat_item_producer/3f1dd0320a0a0b99000a53f7604a2ef9
    how: read the Create Incident record producer, its script and redirect
    result: active; you are the caller; the first 80 characters of your description become the title; after submitting you land on the new incident
    hash: b5eafb4f7f71e6a85026f47dc581a0a5162d194d150f51e5a8fcc06844f99df0
  E04:
    record: item_option_new/5a33d0ef0a0a0b9b007b906f6c589c57
    how: read the question Urgency
    result: mandatory select box, with help text
    hash: 094d21ea65ea1d85d607bf96fab23164080689a0c77577888503920dc1c01390
  E05:
    record: item_option_new/3f272c500a0a0b990059c24380a2bc02
    how: read the question Please describe your issue below
    result: mandatory multi-line text
    hash: 19e2cf48f1538b9f859709778248cde5445d1d9716fa8a7c5484d12590f3766f
  E06:
    record: sc_cat_item_producer/38c1fc840a0a0b2700285921c2bf5fc8
    how: read Report Outage and its questions
    result: active; asks what application is down (mandatory), since when, the nature of the outage, the error message
    hash: 5448af60b7251fec431e98abbac90029b4397a330eceb19c570244a907eaaeac
  E07:
    record: sc_cat_item_producer/382676790a0a0b27003223f15c84b1d2
    how: read Report Performance Problem and its questions
    result: active; asks which application is slow (mandatory), whether everything or specific transactions are slow
    hash: 770667aad33ea5b3ca7935bdbe785ac370cabf3ddc10efea5e850501da83abca
  E08:
    record: sc_cat_item_producer/29a39e830a0a0b27007d1e200ad52253
    how: read Password Reset and its questions
    result: active, under the topic Access issues; asks whose password, which application (mandatory), and how to send the new one
    hash: 6f2ab0f06c1e9f4c403e4671faa7ab8f0cdfdc0f70fb786acace63f93cf1fdcb
  E09:
    record: sysevent_in_email_action/3ccfeff5c611227a0180144333c87af9
    how: read the inbound action Create Incident
    result: a new email creates an incident; subject → title, body → first comment, sender → caller; Importance high → urgency and impact high
    hash: 27f0b8303d67d7aad6b56b6680e28a3a4722c1c446358db6bff7ce5ab9b65baa
  E10:
    record: sysevent_in_email_action/498e10410a0a0b4b007c8c7f63531747
    how: read Update Incident (BP)
    result: a reply to an incident's email is added to that incident as a comment
    hash: 92b32d15bde5bd99fae5ed3c8dd9770a585acb7d8b0f1d55ddf8db95747a6563
  E11:
    record: sysevent_email_action/58e3c1d45322301001b2ddeeff7b1266
    how: read Incident was opened
    result: subject "Incident … was created", with a View incident link
    hash: 80ac39ae2b82c263b97fb8d3e2d8522c761db8d0eb641f20bfd7ddbb44481821
  E12:
    record: sn_ex_sp_portal_extensible_navigation_item/1c949c2dc844f250f877a26e237175b4
    how: read the Get support menu item
    result: opens a Get support window; its cards come from tables the mirror doesn't hold
    hash: 4ade72acc06b81e460411173a603af7f6e08b0c4bb6a797108e8439bb58c199d
  E13:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center › search'
    how: 'searched Employee Center for Create Incident'
    result: 'the search finds Create Incident; the Technology services topic page does not list it'
  E15:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center › chat button › Show me everything'
    how: 'opened the chat window and listed its topics'
    result: 'Now Support (Virtual Agent) offers one topic, Live Agent Support'
  E16:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › Get support'
    how: 'opened Get support as an employee'
    result: 'Contact us: +1-200-120-2020 (Available 9am to 5pm PST)'
  E17:
    record: sys_cs_live_agent_setup/f0acbc4c5f091300e6333654de7313c8
    how: read Chat Setup
    result: 'live agent chat enabled, but no queue for IT, HR, customer service or global; when nobody is free it says "There are no agents available at the moment."'
    hash: 63495161dd36f00ef81d59a5e3bc0fc53291b3cfd1e251908710f0d4f1ebbe51
  E18:
    record: sc_cat_item_producer/3f1dd0320a0a0b99000a53f7604a2ef9
    field: no_attachment_v2
    how: read whether Create Incident hides attachments
    result: false; attachments can be added
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E19:
    record: sc_cat_item_producer/3f1dd0320a0a0b99000a53f7604a2ef9
    field: no_save_as_draft
    how: read whether Create Incident hides Save as Draft
    result: false; the form can be saved as a draft
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E20:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    children: sys_choice
    how: read the incident's Channel choices
    result: Phone, Email, Walk-in, Chat, Self-service and Virtual Agent can be recorded
    hash: 438604df7c0701185679ccf5f78a95effda35ae621060096b2ab78a53ec5cac2
  E21:
    record: sysevent_email_action/fc78e05653a6301001b2ddeeff7b128d
    how: read Comment left on incident
    result: when the service desk writes to the caller, the caller gets an email "Comment added to …"
    hash: d097069e0b8fbd39394376644766e8aa8a70426cb0bf04e7baed8585f52a7272
  E22:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: the caller gets an email "… was resolved"
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E23:
    record: sc_cat_item_user_criteria_mtom/ff642d5c7361230039517a5454f6a790
    how: read who the Password Reset form is available for
    result: Users with 'cmdb_read' Role only, a role IT staff have and employees don't
    hash: 1e50b259aaa2a5e81dfd9de365ba49a6a7a990c79b38f0a0f3820d540f201086
---
Report something that used to work and doesn't, or gets in your way. You get a number starting
with **INC** and an email, and you follow it in **My Requests**.

## Before you start

- Is it an incident? Something that used to work and doesn't, or gets in your way. To ask for
  something new (access, software, equipment), use the catalog instead: see
  [Find what you need](see:request/find).
- Have the details ready: what you were doing, what you expected, what happened, any error
  message (a screenshot helps), and since when.

## In Employee Center (recommended)

1. In the search box at the top of Employee Center, search for **Create Incident**, and open it.
   It doesn't appear when you browse the topics; search finds it. [E13]
2. The form **Create Incident** opens. [E03]
3. Answer **Urgency**: how much this stops you working right now. [E04]
4. Describe the issue in **Please describe your issue below**. Start with a short summary: the
   first 80 characters become the incident's title, for example *"Outlook crashes when I open
   attachments"*. [E05] [E03]
5. Attach screenshots if you have them. [E18] Press **Submit**. (**Save as Draft** keeps it for
   later. [E19])

You land on your new incident, with its number (it starts with **INC**), and you get an email
*"Incident … was created"* with a link back to it. [E03] [E11]

{{animation:increport}}

### Pick the form that fits

There are also forms with questions tailored to the case; search for them by name. They create
an incident too.

| Form | Use it when | It asks |
|---|---|---|
| **Report Outage** | an application or service is down for you | which application, since when, what you see [E06] |
| **Report Performance Problem** | an application is slow | which application, and whether everything or one task is slow [E07] |

When a form asks which application you mean, see
[Say which service is affected](see:cmdb/pick-service).

The **Password Reset** form (under *Access issues*) asks whose password, which application and
how to send the new one [E08], but only IT staff can open it. [E23] To reset your own password,
see [Reset or change your password](see:getting-help/password).

### Get support

**Get support** in the menu on the left shows the service desk's phone number,
**+1-200-120-2020**, available 9am to 5pm PST. [E12] [E16] [Q40]

### Chat

The chat button at the bottom right opens **Now Support**, the Virtual Agent. It answers
questions, but it doesn't report incidents for you, and nobody from the service desk answers
chats yet. [E15] [E17] [shared/Q14] Use **Create Incident** to report a problem.

## By email

Write to the service desk. [shared/Q18] The **subject** becomes the incident's title and the **body** its first
message, and the incident is yours. Mark the email **high importance** only when you really can't
work: it makes the incident as urgent as it can be. [E09]

To add to an incident you already have, **reply** to one of its emails. Your reply lands on the
same incident instead of creating a new one. [E10]

## By phone

Call the service desk on **+1-200-120-2020** (9am to 5pm PST). [E16] The person who answers
records the incident while you talk [E20], and you get the same email *"Incident … was created"*
with its number. [E11]

## What happens next

- A support team works on your incident. When they need something from you, or have news, you
  get an email with their message. [E21]
- When it is fixed, you get an email saying it was resolved, and you confirm the fix or reopen it.
  [E22]
- How fast depends on how urgent it is: see [Priority and deadlines](see:priority-and-deadlines).
  Which emails you get is in [Who is told what](see:who-is-told).

## Tips

- One issue per incident. Two problems in one incident slow both down.
- Report it even if colleagues have the same problem: the number of people affected matters.
- Already reported it? Reply to its emails or add to it in **My Requests** instead of reporting it
  again.

## I want to…

| I want to… | Go to |
|---|---|
| see where my incident is, or add information | [Follow your incident](see:follow) |
| say whether the fix works | [Confirm the fix, or reopen](see:confirm) |
| ask for something new | [Find what you need](see:request/find) |
| choose another way to contact IT | [Ways to get help](see:getting-help/channels) |
