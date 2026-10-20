---
title: Closing and reopening - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/bbddb6bbc0a8016400c56236de22441a
    how: read Close (action close_incident)
    result: condition IncidentUtils().canCloseIncident(current); sets state 7
    hash: 764e91a4fe4697cbf9b08461496e666ed89e9a80d39708e642b250c47ad63314
  E02:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read canCloseIncident and canReopenIncident
    result: close needs Resolved and itil_admin, or the caller; for an accepted major incident (MIM plugin active), only the caller if they have any role, or major_incident_manager; reopen needs Resolved, not an accepted major incident, and itil, sn_incident_write, caller or opener
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
  E03:
    record: sys_script_client/38c58af84657628200aeb11d8295f42c
    how: read (BP) Hide Choice - Closed
    result: removes Closed from the state choices unless the user has itil_admin
    hash: 8afba61fe6018d86a82730eeeeea10cafe534ffea30378fabc4da9da97918dc4
  E04:
    record: sys_ui_action/d2d9d8110a0a3c7401bbadabed9b91db
    how: read Reopen (action reopen_incident)
    result: comment mandatory; sets state 2; "{0} has been reopened"
    hash: cb3c25612802b851af11edff99ef8db3de7fee5a38dfe691684cc940724eb571
  E05:
    record: sys_script/96061c55677032004792adab9485efe1
    how: read Clear Resolve fields
    result: on reopen clears resolved_by, resolved_at, close_code, close_notes
    hash: 32b215e4440f4322bc608f6fe80b6373f34c1d091ea96a29be873f0025d50eaf
  E06:
    record: sys_script/92309a1c0a00070472ceaf8cbaf681c1
    how: read Reopen Count
    result: increments reopen_count
    hash: e5eea3403611f8bb8d3c97c485abec11a9f1000b8ee03e260d0f21b6f6dde223
  E07:
    record: sys_script/d67b8d9ec0a80118008cd8f0f7f92fae
    field: script
    how: read incident autoclose (callable after rule)
    result: closes Resolved incidents not updated for glide.ui.autoclose.time days (or since resolved_at); skips accepted major incidents; closed_by = resolved_by; adds no comment
    hash: 54d54951a42d85a974696cd991135cef209ada6af489c3a68d529148066f69de
  E08:
    record: sys_properties/d5c62446c0a8011800cdf450892cec2d
    how: read glide.ui.autoclose.time and its value
    result: value 7; integer days, 0 disables; read and write role incident_manager
    hash: 725d4f6c5c070aeeeeb21e1c2c0e6fed5512550900291b3eabd95b2a5014acf9
  E09:
    record: sys_script/bf3f8917c0a8016400a867dc0794e8ad
    how: read mark_closed
    result: active false; closed_by and closed_at filled
    hash: fa168af0225b639f29b0eec65c17da21d632a07f8f3e85bf4a1329414b36506c
  E10:
    record: sys_script/d36040b7871b030055c9d61e36cb0b78
    how: read Cascade closure of Incident Tasks
    result: closes open incident tasks when com.snc.incident.incident_task.closure is true (value redacted)
    hash: 7b4474b790a11c51477dee1e70e11d0ac29d533c0dc2efdf7d05efa3af79200e
  E11:
    record: sysevent_email_action/5b82abc767a630105f74e8a331b73092
    how: read Incident closed
    result: to the caller when state is 7
    hash: cba7ed515e158d791bb4e913f0b8830a2c042abac92927daeef24f92ab4ab704
  E12:
    record: sys_script_include/9bca43944f1f02001f6eac118110c7a6
    field: script
    how: read IncidentSNC.reopen (email path)
    result: Resolved → In Progress with a work note; Closed → a new incident cloned for the sender
    hash: f941f9b9d0b7125a163b79f9dbeb850bdb35f6c9ee396538deeabd67519c8d58
  E13:
    record: sys_security_acl/a3128bf78c5143100a22deb6dd2b4eaf
    how: read the incident delete ACL and its role (sys_security_acl_role af128bf78c5143100a22deb6dd2b4eaf)
    result: allow delete, role itil_admin, admin overrides
    hash: 7a76bf6f75c55edf13a5207fb8b503c8edb82762bcdceb5d3b79ada8f37967f6
  E14:
    record: sys_security_acl/f519b31a9d330210f877faf15ee3ece8
    how: read the second incident delete ACL
    result: deny delete unless the user satisfies the security attribute UserIsAuthenticated
    hash: e872fea85a0c26aff6763cacc55879d5846f15c4b1effa6040b350bb0a35bfbe
  E15:
    record: sys_security_acl/80a7a096c0a8016662c872762163bbdc
    how: read the incident create ACL, its description and script
    result: allow create for role snc_internal when the script returns true; with the MIM plugin, an incident whose major_incident_state is accepted can only be created by major_incident_manager
    hash: fadee1d960d2279a7fe706cf8973e668f9b4076590a60be4c90e642ec494ec1c
  E16:
    record: sys_security_acl/bf877f969d330210f877faf15ee3ec15
    how: read the second incident create ACL
    result: deny create unless the user satisfies the security attribute UserIsAuthenticated
    hash: e98e6546bd5dd3d1dbda1b7b146d43b07e0f4b12eddf60202f02ec7a0faf92c4
---
## Permissions

| Action | Allowed when | Record |
|---|---|---|
| Close | Resolved, and the user has `itil_admin` or is the caller | [E01] [E02] |
| Close, accepted major incident | the caller only if they have any role, or `major_incident_manager` (or `itil_admin`) | [E02] |
| *Closed* in the state list | `itil_admin` only | [E03] |
| Reopen | Resolved, not an accepted major incident; `itil`, `sn_incident_write`, the caller or the opener | [E04] [E02] |

So resolvers with `itil` can resolve and reopen another caller's incident but not close it; that's
deliberate in the platform. [Q18]

## Effects

| Event | Effect | Record |
|---|---|---|
| Reopen | resolution fields cleared, reopen count +1 | [E05] [E06] |
| Close | inactive, closed by and at | [E09] |
| Close | open incident tasks closed (if the property is on) | [E10] |
| Close | caller emailed | [E11] |
| Email "please reopen" | resolved: reopened; closed: new incident | [E12] |

## Auto close

The auto close rule [E07] closes resolved incidents not updated for `glide.ui.autoclose.time`
days [E08]: **7**. Only `incident_manager` can read or change the property. [E08] The scheduled
job that runs the rule isn't in the configuration snagentic reads, so how often it runs is still
unknown.

## Create and delete (ACLs)

| Operation | Who | Record |
|---|---|---|
| Create | role `snc_internal` (any internal user); an incident already in *accepted* major incident state only by `major_incident_manager` | [E15] |
| Create | denied unless the user is authenticated | [E16] |
| Delete | role `itil_admin` only (admins override) | [E13] |
| Delete | denied unless the user is authenticated | [E14] |

Nobody with only `itil` can delete an incident: resolve it as *Duplicate* instead.
