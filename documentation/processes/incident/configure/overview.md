---
title: Incident management configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    how: read the incident table's state and incident_state choices (children sys_choice)
    result: 1 New, 2 In Progress, 3 On Hold, 6 Resolved, 7 Closed, 8 Canceled; incident_state has the same values
    hash: bb73c1002bb30dd75f1fff3a219ddd7c08ebc3d39bd65efdb8f63595ed73f743
  E02:
    record: sys_dictionary_override/73da1af73b10130050bec9bb34efc494
    how: read the state override on incident
    result: close_states=7;8, default_work_state=2, default_close_state=7
    hash: b081fd2cd4faea1a9aba8e40bc94ec497c3985cf2c817b34992920ac774a0095
  E03:
    record: sys_script/85946b1b5f221000b12e3572f2b47719
    how: read Copy State to Incident State (template incident_stateSAMEASstate)
    result: state and incident_state are kept identical
    hash: 5c723fe073c7a63640dd56d2a74a94d65088f6c3d40c257bd15d52e192e6eb3d
  E04:
    record: sys_app_application/dead1309c611228701e2bda7b4252474
    how: read the Incident application menu
    result: roles itil, sn_incident_read; order 200
    hash: 74c534b5e9f71aca880f1ef69e87cd243576092e352644a8a91f71474f0a5e4b
  E05:
    record: sys_user_role/282bf1fac6112285017366cb5f867469
    how: read role itil
    result: standard helpdesk technician; contains sn_incident_write, sn_problem_write, sn_change_write, sn_request_write
    hash: 1529726d3ffcd2a6513cf81757d071549fd4eec88ccb11dd7bb1c963fa3b3cdf
  E06:
    record: sys_user_role/28322f3cc611228500e20459e33eef34
    how: read role itil_admin
    result: more privileges than itil, intended for team leads
    hash: bf9e8a163ef76bdc549431d0d41291753a01f9a1cc5c12d805403213e2ed3128
  E07:
    record: sys_user_role/415f09c10bb63200ecfd818393673af1
    how: read role incident_manager
    result: administers incident properties and major incident trigger rules; contains itil
    hash: e49ec106bfbdf226ac5d17a40d5963a37b0c535eaeac8aaff57d82e231d381e8
  E08:
    record: sys_user_role/8b88f99687480300b4ae6c5837cb0b08
    how: read role major_incident_manager (scope sn_major_inc_mgmt)
    result: accountable for the major incident response; contains itil
    hash: dd4494f284d69487b3e09192c4dfc3f6b03c618a8a44c073ca3828e287773a91
  E09:
    record: contract_sla/2ca94b74c3143200b6dcdfdc64d3ae93
    how: read Priority 1 response (15 minutes)
    result: 15 minutes, no schedule; starts active, priority 1, group set; stops when not New and assignee set
    hash: 432d40f389fdbc967319820583344ed835a7d679dfdf051283a5642e5940c691
  E10:
    record: contract_sla/35420982d732220035ae23c7ce610393
    how: read Priority 1 resolution (1 hour)
    result: 1 hour, no schedule; stops at state 7; pauses on hold awaiting caller or resolved
    hash: 6157ef1df804d16a5907062d37e4c485a8acec29cf19eaeb923f59159f793aa9
---
## Roles

| Role in the guide | Platform role | Notes |
|---|---|---|
| Caller | none (any signed-in user) | Rights come from checks on the caller field, not a role |
| Service desk agent, resolver | `itil` [E05] | Contains `sn_incident_write` |
| Team lead | `itil_admin` [E06] | Can close any resolved incident and pick *Closed* in the state list |
| Process owner | `incident_manager` [E07] | Incident properties, major incident trigger rules |
| Major incident manager | `major_incident_manager` [E08] | Promote, reject, demote major incidents |

The Incident menu needs `itil` or `sn_incident_read`. [E04] User and group records are not
mirrored, so the support teams named in assignment rules and OLAs can't be named here [Q54],
nor the major incident management group. [Q52]

## Lifecycle

States and their values [E01]: 1 New, 2 In Progress, 3 On Hold, 6 Resolved, 7 Closed, 8 Canceled.
Closed and Canceled are the close states; In Progress is the default working state. [E02] The
legacy field `incident_state` mirrors `state` both ways. [E03]

## SLA model

Response SLAs start when a group is assigned and stop when the incident has an assignee and has
left New; they do not pause. [E09] Resolution SLAs stop only at Closed and pause while On Hold -
Awaiting Caller or Resolved. [E10] [Q37] The full table is on the
[work configuration page](work.html).
