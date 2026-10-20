---
title: Reporting an incident - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sc_cat_item_producer/3f1dd0320a0a0b99000a53f7604a2ef9
    field: script
    how: read the script of the Create Incident record producer
    result: contact_type self-service; caller_id the user (or parent's requested-for); short description = first 80 characters of comments; full text to description
    hash: 0d3205d7c198e6d0c63d66a339c76830657601670ebfe67c44c06c67f9511aed
  E02:
    record: sc_cat_item_producer/3f1dd0320a0a0b99000a53f7604a2ef9
    how: read the producer record
    result: table incident, Service Catalog, category Can We Help You?, view ess, available on both interfaces
    hash: b5eafb4f7f71e6a85026f47dc581a0a5162d194d150f51e5a8fcc06844f99df0
  E03:
    record: sp_instance_link/96c7d0b2cb20120000f8d856634c9c98
    how: read the Get Help tile on the Service Portal
    result: links to the sc_category page for Can We Help You?
    hash: 3a664154def6b391b927cd56b0a2b08449327914261d110bc910e2f332f75902
  E04:
    record: sp_portal/70cd9f3b734b13001fdae9c54cf6a72f
    how: read the Employee Center portal
    result: default true, url suffix esc
    hash: 6a7a0d38d3dd84f850cb567aca0c0fe0e8c7af07e6cf73508e14eb5b93ac6d48
  E05:
    record: sys_ui_action/c9ce66b4d703120060faef637e610334
    field: script
    how: read the classic New button on incident
    result: users without itil or sn_incident_write are redirected to the Create Incident producer
    hash: 38d6548641257d7872df128541ebc7817987d73e79e7b8d60e27448f03ca36a7
  E06:
    record: sysevent_in_email_action/3ccfeff5c611227a0180144333c87af9
    field: script
    how: read the inbound action Create Incident (type new, order 100)
    result: caller = sender; comments "received from:" + body; category inquiry; contact type email; "assign:" line sets assigned_to; high importance sets impact and urgency 1
    hash: b1e9915d2c85acdfcc5a9a1e74bd8edc1506790b564ecb508e7ad28cd23614e7
  E07:
    record: sysevent_in_email_action/5e53d645c0a8006400b4b0a49f2139ba
    how: read Create Incident (Forwarded), type forward
    result: same as Create Incident, comment prefixed "forwarded by:"
    hash: e2c0922a783f481cb1b6bfd7c8d4c5afd7549315a4a20a5110b502500e814e75
  E08:
    record: sysevent_in_email_action/498e10410a0a0b4b007c8c7f63531747
    field: script
    how: read Update Incident (BP), type reply
    result: adds the reply as a comment; "please reopen" in the subject calls Incident().reopen; assign and priority lines applied only for itil or sn_incident_write
    hash: 8e6863543e48e8bdba481e801b87f9f3d346d80fa323cb928defc05b6a453e89
  E09:
    record: sysevent_email_action/58e3c1d45322301001b2ddeeff7b1266
    how: read Incident was opened
    result: on insert, active and not part of a universal request; to the caller
    hash: 80ac39ae2b82c263b97fb8d3e2d8522c761db8d0eb641f20bfd7ddbb44481821
  E10:
    record: sc_cat_item_producer/38c1fc840a0a0b2700285921c2bf5fc8
    how: read the Report Outage producer (scope sn_ect)
    result: active, creates an incident, category Can We Help You?
    hash: 5448af60b7251fec431e98abbac90029b4397a330eceb19c570244a907eaaeac
  E11:
    record: dl_definition/302849102b031000de0aba36a3fd5631
    how: read Priority Lookup
    result: the priority is looked up from impact and urgency, on the form and on save
    hash: 9ce013173c49e78eb1f7963690a52ff2fc96c9a822f4ab3bf778ab32b7c91735
---
## Entry points

| Channel | Record | Behaviour |
|---|---|---|
| Portal and classic catalog | Create Incident producer [E02] | Urgency and description mandatory; contact type self-service; title from the first 80 characters [E01] |
| Service Portal tile | Get Help [E03] | Opens the *Can We Help You?* category |
| Employee Center | default portal, suffix `esc` [E04] | *Get support* menu; seen on screen, see [Report an incident](see:incident/use/report) |
| Classic New button | New [E05] | Non-agents are sent to the producer |
| Email, new | Create Incident [E06] | Caller = sender, category *inquiry*, contact type email; see the security notes below |
| Email, forwarded | Create Incident (Forwarded) [E07] | As above |
| Email, reply | Update Incident (BP) [E08] | Comment on the existing incident; "please reopen" reopens |
| Other producers | Report Outage [E10], Report Performance Problem, Password Reset | Ask a Question is inactive |

The caller is emailed when the incident is created. [E09]

The cards of Employee Center's *Get support* window come from tables snagentic doesn't read, so
what employees see was checked on screen. Which mailbox address receives incident email is
instance configuration (email accounts), not mirrored. [shared/Q18]

## Email behaviours with security impact

The inbound action *Create Incident* reads keywords and headers from any sender it accepts [E06]:

| Input | Effect | Check |
|---|---|---|
| a line `assign: <user>` in the body | sets **Assigned to** on the new incident | none: any sender can choose the assignee [E06] |
| email importance **High** | sets impact 1 and urgency 1, so priority **1 - Critical** | none: any sender can raise the highest priority [E06] [E11] |

For replies, *Update Incident (BP)* applies `assign:` and `priority:` only when the sender has
`itil` or `sn_incident_write`. [E08] Consider the same check on the new-email action, or removing
these lines, so that a P1 can't be raised and an agent can't be targeted by anyone with mail
access.
