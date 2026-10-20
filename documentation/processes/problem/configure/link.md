---
title: Linking incidents - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_related_list/cf9c6e17877300100e3dd61e36cb0b42
    how: read the problem form's related lists (Default view)
    result: incident.problem_id first, then task_ci, offerings, problem tasks, changes, duplicates, outages, knowledge
    hash: bf3cf963946bbf176024af023b81f0f1adf92219868cabcb6fc4092f1dfb98ee
  E02:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic problem form, PRB0007601'
    how: 'read the related list tabs'
    result: 'no Incidents list (Affected CIs, Problem Tasks, Change Requests, Outages, Attached Knowledge)'
  E03:
    record: sys_properties/7992583e870023005087af1e36cb0b11
    how: read com.snc.incident.link_to_task.problem
    result: value not in the mirror; it names the incident field the Add button uses
    hash: 1c2d65c3e452fdcaee4a8dc239317d4c10f7c526a0b4e062efa0190421012715
  E04:
    record: sys_script/8e8cab430a0a3c7401c47494518a481a
    field: script
    how: read Update Problem Incident Count (incident, after insert, update and delete, order 100, when problem_id changes)
    result: recounts the incidents of the new and the previous problem into problem.related_incidents
    hash: aa495d8ad4db7f3a88c979aa85d4fa3c5f8344bde319a923210b8f07068de9b7
  E05:
    record: sys_security_acl/a21542c7ffe47210549fffffffffffca
    how: read incident.problem_id write for closed incidents
    result: problem_coordinator only
    hash: 6c2a444b032725a2fed8f5ea0660cb1c3219b255979970c876db2721c93d8fb0
  E06:
    record: sys_script/12267f44537630108b91ddeeff7b12b7
    field: script
    how: read Update incident from known error
    result: attaching a KE article links the incident to its source problem
    hash: fb476ee0d519f1be58a3bb92529a48b354c67e88f0b92e35559d4d5e363e1ac1
  E07:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    field: script
    how: read Update Incident when Problem closes
    result: fires on problem.state_change when the resolution code is fix_applied or risk_accepted
    hash: 05ad6dee5b208584f1f5ea888e7cb64d0efa10da0a9cb80903a7db107fb633dd
---
## The missing Incidents list

The Default view lists `incident.problem_id` first [E01], but the form shows no Incidents list on
screen. [E02] Its *Add* button depends on `com.snc.incident.link_to_task.problem`, whose value
is readable only by problem admins; its value was withheld from the records read. [E03] Without
the list, the coordinator can't see the linked incidents from the problem; why it is missing has
not been checked yet. [Q10]

## How links behave

`related_incidents` counts the links [E04]; only coordinators can link closed incidents [E05];
attaching a known error article links too. [E06] When the problem closes with *Fix Applied* or
*Risk Accepted*, the script action acts on linked incidents **On Hold - Awaiting Problem** only.
[E07]
