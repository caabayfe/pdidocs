---
title: Priority and deadlines
reviewed: 2026-10-17
evidence:
  E01:
    record: dl_definition/302849102b031000de0aba36a3fd5631
    how: read Priority Lookup
    result: the priority is looked up from impact and urgency, on the form and on save
    hash: 9ce013173c49e78eb1f7963690a52ff2fc96c9a822f4ab3bf778ab32b7c91735
  E02:
    record: sys_db_object/1521b6f78c5103100a22deb6dd2b4e61
    how: read the task choices for impact, urgency and priority
    result: impact and urgency 1 High, 2 Medium, 3 Low; priority 1 Critical, 2 High, 3 Moderate, 4 Low
    hash: 343f7b08c3068250e834d709bd7429dc20030077b328e63fe0b068e83704b68c
  E03:
    record: contract_sla/2ca94b74c3143200b6dcdfdc64d3ae93
    how: read Priority 1 response (15 minutes)
    result: 15 minutes, around the clock
    hash: 432d40f389fdbc967319820583344ed835a7d679dfdf051283a5642e5940c691
  E04:
    record: contract_sla/752bcf74c3143200b6dcdfdc64d3aeeb
    how: read Priority 2 response (1 hour)
    result: 1 hour on weekdays 8:00 to 17:00
    hash: 933e26eadf78b9aaa6a9718a5a23074e1153ed3c6d5700f0baf7a75bbbad59ef
  E05:
    record: contract_sla/35c213b4c3143200b6dcdfdc64d3ae21
    how: read Priority 3 response (4 hours)
    result: 4 hours on weekdays 8:00 to 17:00
    hash: a3e9b15c038ac67ffee3181c3e8c946f7d102d0556a4fab0fe686ebe3ed930c5
  E06:
    record: contract_sla/375397f4c3143200b6dcdfdc64d3ae60
    how: read Priority 4 response (8 hours)
    result: 8 hours on weekdays 8:00 to 17:00
    hash: 87115b6ddc06347258591c4ab6544a72a2a84edcfcd5222ef4daf5ff5784bc74
  E07:
    record: contract_sla/35420982d732220035ae23c7ce610393
    how: read Priority 1 resolution (1 hour)
    result: 1 hour, around the clock; pauses while waiting for the caller or resolved
    hash: 6157ef1df804d16a5907062d37e4c485a8acec29cf19eaeb923f59159f793aa9
  E08:
    record: contract_sla/af420982d732220035ae23c7ce6103f3
    how: read Priority 2 resolution (8 hour)
    result: 8 hours on weekdays 8:00 to 17:00
    hash: ba3b71bf3cc64e7874c3ae915948ff14401c75daebc5b851f0907cb26fd6c07f
  E09:
    record: contract_sla/d1524982d732220035ae23c7ce61035d
    how: read Priority 3 resolution (1 day)
    result: 24 hours counted on the 8-5 weekdays schedule, about 3 working days; in the caller's time zone
    hash: e9682237f5365dd36c949d758a2fa0f6040699b162d339f23814bc2e34f2b710
  E10:
    record: contract_sla/b12a37e0d7322200f2d224837e6103ea
    how: read Priority 4 resolution (2 day)
    result: 48 hours counted on the 8-5 weekdays schedule, about 5 to 6 working days; in the caller's time zone
    hash: d4c1db0aa4ada94efcaf85a61c26499799f2468f7f34828c6ebd44f0981435db
  E11:
    record: sc_cat_item_producer/3f1dd0320a0a0b99000a53f7604a2ef9
    how: read the Create Incident record producer's questions
    result: the person reporting chooses the urgency; there is no impact question
    hash: b5eafb4f7f71e6a85026f47dc581a0a5162d194d150f51e5a8fcc06844f99df0
  E12:
    record: sys_script_client/ed5392f3c3122200b6dcdfdc64d3ae96
    how: read Worknotes mandatory onChange of priority
    result: work notes are mandatory when the priority changes on an existing incident
    hash: 85e1e0ad4eb9c3abd45d92b342ccb970bc5edae319c7179f8ac28b106d849498
  E13:
    record: sysevent_in_email_action/3ccfeff5c611227a0180144333c87af9
    field: script
    how: read the inbound action Create Incident
    result: an email with High importance sets impact 1 and urgency 1
    hash: b1e9915d2c85acdfcc5a9a1e74bd8edc1506790b564ecb508e7ad28cd23614e7
---
## How urgent is it?

Every incident gets a **priority**, from **1 - Critical** to **4 - Low**. Nobody types it in: it
follows from two answers. [E01] [E02]

- **Impact**: how many people, or how much of the business, is affected.
- **Urgency**: how soon it hurts. *High* means work has stopped; *Low* means it can wait.

| Impact ↓ Urgency → | High | Medium | Low |
|---|---|---|---|
| **High** | 1 - Critical | 2 - High | 3 - Moderate |
| **Medium** | 2 - High | 3 - Moderate | 4 - Low |
| **Low** | 3 - Moderate | 4 - Low | 4 - Low |

### What you choose {for=user}

When you report an incident you choose only the **urgency**: how much it stops you working right
now. [E11] The service desk judges the impact, for example when many colleagues report the same
thing. Choose *High* only when you really can't work; it moves your incident ahead of others.

By email it works differently: an email marked **High importance** sets both the impact and the
urgency to the highest, so the incident becomes **1 - Critical**. [E13] Use it only when that is
true.

### What you choose {for=operator}

You set both **Impact** and **Urgency**; the **Priority** field fills in and is read-only. A caller
on the portal sets only the urgency, so check the impact when you pick the incident up. An email
marked **High importance** sets both to *High*, so it arrives as **1 - Critical**: check that it
really is. [E13] When you
change the priority of an existing incident, a work note saying why is required. [E12]

{{animation:incprio}}

## The deadlines

The priority sets two deadlines: a **first response** (someone has taken the incident) and a
**fix**.

| Priority | First response within | Fixed within | Hours that count |
|---|---|---|---|
| 1 - Critical | 15 minutes [E03] | 1 hour [E07] | around the clock |
| 2 - High | 1 hour [E04] | 8 hours [E08] | weekdays 8:00 to 17:00 |
| 3 - Moderate | 4 hours [E05] | 24 working hours, about 3 working days [E09] | weekdays 8:00 to 17:00 |
| 4 - Low | 8 hours [E06] | 48 working hours, about 5 to 6 working days [E10] | weekdays 8:00 to 17:00 |

The fix deadline stops counting while the service desk is waiting for the person who reported
it, and while the incident is resolved waiting for confirmation. [E07]

### What this means for you {for=user}

If the service desk asks you something, answer soon: the clock is stopped until you do, and your
incident waits too.

### What this means for you {for=operator}

The incident's deadlines are in its **Task SLAs** list. Working hours are counted in the caller's
time zone. [E09] [E10] Waiting for a change, a problem or a vendor
does **not** stop the fix deadline; only waiting for the caller, and being resolved, do. [E07] The full list of SLA
definitions, including group OLAs, is on [Working an incident - configuration](see:incident/configure/work).
