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
    result: close needs Resolved and itil_admin or the caller (major incident manager for accepted major incidents); reopen needs Resolved, not an accepted major incident, and itil, sn_incident_write, caller or opener
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
    how: read glide.ui.autoclose.time
    result: integer days, 0 disables; write role incident_manager; value redacted in the mirror
    hash: 26febda22fec55dde41f78d16ec1bbac711448eb6b681ad4e2a612099d67e0da
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
---
## Permissions

Close [E01] [E02]; only `itil_admin` sees *Closed* in the state list [E03]; reopen [E04] [E02].

## Effects

| Event | Effect | Record |
|---|---|---|
| Reopen | resolution fields cleared, reopen count +1 | [E05] [E06] |
| Close | inactive, closed by and at | [E09] |
| Close | open incident tasks closed (if the property is on) | [E10] |
| Close | caller emailed | [E11] |
| Email "please reopen" | resolved: reopened; closed: new incident | [E12] |

## Auto close {label=OPEN-QUESTION}

The auto close rule [E07] reads `glide.ui.autoclose.time` [E08], whose value is redacted in the
mirror, and runs from a scheduled job the mirror doesn't hold. Confirm the number of days and the
job's schedule, then replace "a set number of days" in the guide with the value.

## Finding {label=OPEN-QUESTION}

Resolvers with `itil` can resolve and reopen but not close another caller's incident. That's
deliberate in the platform. Confirm it matches how the service desk expects to work.
