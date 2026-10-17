---
title: Confirm the fix, or reopen
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved and its message
    result: subject "… was resolved"; offers to reopen; says the incident will close automatically after a set time
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E02:
    record: std_ticket_config_action/b18865a5ff0222105146ffffffffffed
    how: read the Close action on the ticket page
    result: shown to the caller on a resolved incident; closes it, no dialog
    hash: 88e2d4dbe4527ab41724b97f5524422f328da337960e24baa3cda40a5b8a0ccd
  E03:
    record: std_ticket_config_action/e17865a5ff0222105146ffffffffffdd
    how: read the Reopen action on the ticket page
    result: shown on a resolved incident to the caller or the person who opened it; back to In Progress; message "Request reopened"
    hash: f5c6c6461de898689181036900c6bd47b5a9e1f6fa1a0eb619a7d41551843dca
  E04:
    record: sysevent_in_email_action/498e10410a0a0b4b007c8c7f63531747
    how: read Update Incident (BP)
    result: a reply whose subject contains "please reopen" reopens the incident
    hash: 92b32d15bde5bd99fae5ed3c8dd9770a585acb7d8b0f1d55ddf8db95747a6563
  E05:
    record: sys_script_include/9bca43944f1f02001f6eac118110c7a6
    field: script
    how: read IncidentSNC reopen
    result: a resolved incident goes back to In Progress; a closed one is copied into a new incident
    hash: f941f9b9d0b7125a163b79f9dbeb850bdb35f6c9ee396538deeabd67519c8d58
  E06:
    record: sysevent_email_action/5b82abc767a630105f74e8a331b73092
    how: read Incident closed
    result: subject "Incident … was closed", with a link to report another incident
    hash: cba7ed515e158d791bb4e913f0b8830a2c042abac92927daeef24f92ab4ab704
  E07:
    record: asmt_condition/249e70b0875013005d90bba826cb0bbf
    how: read the survey trigger ITSM Demo Survey
    result: active; every incident that is closed sends the caller a survey
    hash: 56d602bed36bac7aac90a4b4aa914cd5f9ff5ebf9f4b34a6d20708364b88eb7a
  E08:
    record: asmt_metric_type/99471f319f0312006371f84bc42e70f1
    how: read the survey and its questions
    result: 'asks "How satisfied are you with the service provided by IT?" (Very Dissatisfied to Very Satisfied) and an open question'
    hash: dd4654a96eed275a2e4a4d910d135060d3ed48501dccad02b5ce8ad55f96c71c
  E09:
    record: sysevent_email_action/b2b3e70b67a630105f74e8a331b73044
    how: read Incident Survey
    result: subject "Feedback makes us better", link "Take the survey"
    hash: 7d52fea0b1e316032f733376b228611ab414ed82d414aea4dc616903426f4550
  E10:
    record: sys_properties/d5c62446c0a8011800cdf450892cec2d
    field: value
    how: 'read glide.ui.autoclose.time'
    result: '7 days'
    hash: 7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451
---
## When it is resolved

{{animation:incconf}}

You get an email *"… was resolved"* saying what was done. [E01] Try it: does it work again?

### It works

Open the incident in Employee Center (**My Requests**) and press **Close**. [E02] If you do
nothing, the incident closes by itself after **7 days**. [E01] [E10]

### It doesn't work

Open the incident and press **Reopen**. It goes back to the support team, **In Progress**, and you
see *"Request reopened"*. [E03] Then say what is still wrong in the **Activity** tab, so the team
doesn't start from zero.

You can also reply to the resolution email with **please reopen** in the subject, and say what is
still wrong in the message. [E04] [E05]

## Once it is closed

You get an email *"Incident … was closed"*. [E06] A closed incident can't be reopened. If the
problem comes back, report a new incident and mention the old number. (Replying *please reopen* to
a closed incident's email does that for you: it creates a new incident. [E05])

## The short survey

Every closed incident sends you a short survey by email, *"Feedback makes us better"*: how
satisfied you are, on a scale of faces, and anything you'd like to tell IT. [E07] [E08] [E09] It
takes a minute.
