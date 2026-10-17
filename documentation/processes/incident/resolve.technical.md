---
title: Resolving an incident - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/38c073d7465762820116c37c3353540f
    how: read Resolve (form button, client, action resolve_incident)
    result: condition IncidentUtils().canResolveIncident(current); client sets state 6 and resolved_by
    hash: 104a1abc88fed62719f58700b3686e2b9fcdba582481a241c9b90c7f1b8e25e4
  E02:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read IncidentUtilsSNC canResolveIncident, canCloseIncident, canReopenIncident
    result: resolve — itil, itil_admin, sn_incident_write or the caller (not an accepted major incident); close — itil_admin or the caller; reopen — itil, sn_incident_write, caller or opener
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
  E03:
    record: sys_script_client/5f254623c0a8016600c9b86f18b348f0
    how: read the onSubmit client script
    result: for resolve_incident and close_incident, close_code and close_notes are shown, mandatory, and block the submit
    hash: 3a62a4350d4687f3cdfd924963b80ddd018948facce606509fc0baf8a98f36e0
  E04:
    record: sys_script_client/5f322592c0a801660058515b2c2074e2
    how: read (BP) Hide Close Notes and Code
    result: mandatory when the state is Resolved or Closed
    hash: f9c41bc04144bd7d46c049336c759899bb5d1d38daff1b6155cf7445ef7112da
  E05:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    how: read close_code choices
    result: Duplicate, Known error, No resolution provided, Resolved by caller, Resolved by change, Resolved by problem, Resolved by request, Solution provided, Workaround provided, User error
    hash: bb73c1002bb30dd75f1fff3a219ddd7c08ebc3d39bd65efdb8f63595ed73f743
  E06:
    record: sys_script/74dc2340533230108b91ddeeff7b1230
    how: read Check if Known error article required
    result: aborts "Please attach a Known error article, before resolving the record as known error"
    hash: e27275eebab1118ed7bc6b59494707f84a8433c708c486560690b17827aa4ac3
  E07:
    record: sys_script/d3b21f640a0a3c7400f6acab7de3f5f8
    how: read mark_resolved
    result: fills resolved_by and resolved_at, computes business and calendar durations
    hash: 682f97da369ebaaa58964cbb5afa68b33313cda2d77c9dba3e1bfc60b9446706
  E08:
    record: sys_script/28beab035f201000b12e3572f2b477ed
    how: read Caller Close
    result: caller resolving → defaults Resolved by caller / Closed by Caller
    hash: 527f35a8727133dd4c175328b497004453f9045b2d6fc88adbd1bd6a3b50818c
  E09:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: incident_state changes to 6 → caller, "${task_effective_number} was resolved"
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
---
## Who can resolve

Resolve button [E01] and the permission logic [E02].

## Mandatory resolution fields

On submit [E03] and on load [E04]. Codes [E05]; the known error check [E06]. On resolve,
`resolved_by` and `resolved_at` are filled and the durations computed [E07]; a caller who
resolves gets default values [E08]; the caller is notified [E09].

## Label mismatch {label=OPEN-QUESTION}

The dictionary labels are *Close code* and *Close notes*; the guide uses *Resolution code* and
*Resolution notes*, the usual incident form labels (from `sys_documentation`, not mirrored).
Check the labels on the form.
