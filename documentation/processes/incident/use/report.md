---
title: Report an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sc_cat_item_producer/3f1dd0320a0a0b99000a53f7604a2ef9
    how: read the Create Incident record producer and its variables
    result: Urgency and "Please describe your issue below" are mandatory; contact type self-service; caller is you
    hash: b5eafb4f7f71e6a85026f47dc581a0a5162d194d150f51e5a8fcc06844f99df0
  E02:
    record: sysevent_in_email_action/3ccfeff5c611227a0180144333c87af9
    how: read the inbound action Create Incident
    result: subject becomes the short description; sender is the caller; high importance sets impact and urgency 1
    hash: 27f0b8303d67d7aad6b56b6680e28a3a4722c1c446358db6bff7ce5ab9b65baa
  E03:
    record: sysevent_email_action/58e3c1d45322301001b2ddeeff7b1266
    how: read the notification Incident was opened
    result: emails the caller "Incident <number> was created" on insert
    hash: 80ac39ae2b82c263b97fb8d3e2d8522c761db8d0eb641f20bfd7ddbb44481821
---
## Before you start

- Check whether it is really an incident: something that used to work and doesn't, or is
  getting in your way. To ask for something new, use the service catalog instead.
- Have the details at hand: what you were doing, what you expected, what happened, any error
  message (a screenshot helps), and since when.

## From the portal (recommended)

1. Open the self-service portal and choose **Get Help**, then **Create Incident** (in the
   classic interface: **Service Catalog › Can We Help You? › Create Incident**).
2. Choose the **Urgency**: how much it stops you working right now. [E01]
3. Describe the issue in **Please describe your issue below**. The first 80 characters become
   the incident's title, so start with a clear summary, for example *"Outlook crashes when I open
   attachments"*. [E01]
4. Attach screenshots if you have them, then submit.

You get the incident number on screen, and an email confirms it was created. [E03]

{{animation:increport}}

## By email

Write to the service desk mailbox. The **subject** becomes the incident's title and the **body**
its first comment; you are the caller. Mark the email as **high importance** only when you
really can't work: it raises the urgency and the impact to their highest level. [E02]

To add to an incident you already have, **reply** to one of its emails instead of writing a new
one, so your message lands on the same incident.

## By phone or in person

Call or visit the service desk. The agent logs the incident with you and gives you the number.

## Other forms on the portal

The portal also offers **Report Outage**, **Report Performance Problem** and **Password Reset**.
They create an incident too, with questions tailored to that case.

## What happens next

- The incident is **New** and goes to a support team.
- The deadline for a first response starts once a team has it (see *Deadlines at a glance* on
  the process page).
- You are emailed when someone writes to you, when it is resolved and when it is closed.

## Tips

- One issue per incident. Two problems in one incident slow both down.
- Report it even if colleagues have the same problem: the service desk links the reports, and
  the number of people affected matters.
