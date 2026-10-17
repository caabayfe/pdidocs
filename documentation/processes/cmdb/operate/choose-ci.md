---
title: Choose the right configuration item
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_dictionary_override/2444e707872f00100e3dd61e36cb0b67
    how: read incident.cmdb_ci
    result: reference qualifier TaskUtils().getConfigurationItemFilter
    hash: c4eb29bae60db0a7fad1d94f1dc2955e6c27c8e50a49d41b413e61831eacd5ae
  E02:
    record: sys_dictionary/5121b6f78c5103100a22deb6dd2b4e75
    how: read task.cmdb_ci
    result: Configuration item; icons for the map and the related records
    hash: 3c62a858f7ba4572962aa74ea9c1bc35392e01b55bf84a4010a7c5e6d872b548
  E03:
    record: sys_script/27453ac6b73610102d2fbc16de11a937
    field: script
    how: read Populate Assignment Group based on CI/SO
    result: fills an empty assignment group from the CI's support group (change group on changes)
    hash: 0e3a958914d0876724533ef5bbe26decbf83e5305e020f9e5a2edcf725aa487c
  E04:
    record: sys_dictionary_override/6469b202533370108b91ddeeff7b123f
    how: read incident.service_offering
    result: offerings of the incident's service
    hash: 6b5ca3cb6ea59e697ffb75636b4078b6a2b01817e704731e20955d3c7aec4f44
  E05:
    record: sys_script_client/af269fbf878010100e3dd61e36cb0b39
    how: read Clear Offering on changing Service
    result: changing the service clears the offering
    hash: 6823a05a9daf6f06c7ecf8114d3b8ff18a8f32f0db4b5d521bd991ecaa5234c2
  E06:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Configuration Items list'
    how: 'filtered on the groups'
    result: '37 CIs have a Support group; none has a Change Group'
---
## On a ticket

Set the **Configuration item** to the thing that fails (a server, an application), and the
**Service** and **Service offering** to what people can't use. [E01] [E02] [E04] Changing the
service clears the offering. [E05] Retired or non-operational CIs aren't offered on incidents and
problems.

## Let it route the work

If the ticket has no assignment group yet, choosing a CI fills it from the CI's **Support group**
(on a change, its **Change Group**). [E03] On pdi2 few CIs have one and none has a change group, so
check the group and set it yourself when it stays empty. [E06]

The icons beside the field open the CI's map and its other open tickets. [E02]
