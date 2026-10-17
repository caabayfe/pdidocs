---
title: Report an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sn_ex_sp_portal_extensible_navigation_item/d3488bc9c8087250f877a26e237175c6
    how: read the Employee Center side navigation
    result: the menu item "Help center", with the topic "Technology services" under it
    hash: 94d5b82ba7812b6c317744d1507d6078f52279bcfb5f6a8debfd8880cab06298
  E02:
    record: topic/06d3df67c3053010069aec4b7d40dd70
    how: read the topic Technology services
    result: 'described as "Technical support for your personal devices and shared workplace equipment"; holds Create Incident, Report Outage, Report Performance Problem'
    hash: 87ccae2566e5f3f410b17ff5768ae116b3974a1af159a6655210436017bcfea1
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
  E14:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center › Get support'
    how: 'opened the Get support window'
    result: 'cards Request password reset, and Contact us +1-200-120-2020 (Available 9am to 5pm PST)'
  E15:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center › chat button › Show me everything'
    how: 'opened the chat window and listed its topics'
    result: 'Now Support (Virtual Agent) offers one topic, Live Agent Support'
---
## Before you start

- Is it an incident? Something that used to work and doesn't, or gets in your way. To ask for
  something new (access, software, equipment), use the catalog instead.
- Have the details ready: what you were doing, what you expected, what happened, any error
  message (a screenshot helps), and since when.

## In Employee Center (recommended)

1. In the search box at the top of Employee Center, search for **Create Incident**, and open it.
   [E13] (It belongs to the topic *Technology services* under **Help center** [E01] [E02], but
   the topic page doesn't list it; search finds it.)
2. The form **Create Incident** opens. [E03]
3. Answer **Urgency**: how much this stops you working right now. [E04]
4. Describe the issue in **Please describe your issue below**. Start with a short summary: the
   first 80 characters become the incident's title, for example *"Outlook crashes when I open
   attachments"*. [E05] [E03]
5. Attach screenshots under **Add attachments** if you have them, and press **Submit**. (**Save
   as Draft** keeps it for later.)

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
| **Password Reset** (under *Access issues*) | you are locked out of an application | whose password, which application, how to send the new one [E08] |

### Get support {label=NEW}

The menu's **Get support** opens a window with two options [E12] [E14]:

- **Request password reset**, when you are locked out;
- **Contact us**: the service desk's phone, **+1-200-120-2020**, available 9am to 5pm PST.

### Chat {label=NEW}

The chat button at the bottom right opens **Now Support**, the virtual agent. On this portal it
offers one topic, *Live Agent Support*: use it to reach a person. [E15] It doesn't report incidents
for you; use *Create Incident* for that.

## By email

Write to the service desk mailbox. The **subject** becomes the incident's title and the **body**
its first message; you are the caller. Mark the email **high importance** only when you really
can't work: it makes the incident as urgent as it can be. [E09]

To add to an incident you already have, **reply** to one of its emails. Your reply lands on the
same incident instead of creating a new one. [E10]

## By phone or in person

Call the service desk on **+1-200-120-2020** (9am to 5pm PST) [E14], or visit it. The agent logs the incident with you and gives you the number.

## What happens next

- The service desk sorts your incident and sends it to a support team.
- You're told when someone writes to you, when it is resolved and when it is closed (see *Who is
  told what*).
- How fast depends on its priority (see *Priority and deadlines*).

## Tips

- One issue per incident. Two problems in one incident slow both down.
- Report it even if colleagues have the same problem: the number of people affected matters.
