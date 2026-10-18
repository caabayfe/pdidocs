---
title: How major incidents work
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_properties/3f2f9db80b2003005775aabcb4673a52
    field: value
    how: read sn_major_inc_mgmt…major_incident_creation
    result: promote, so a candidate itself becomes the major incident
    hash: 363256bd153813bc7b3e4e1cb8a7e65b4a9c269ed27b1823925bd408833d6883
  E02:
    record: sys_script/8f61f1b00a0a3c7401aac471d27a2718
    field: script
    how: read Update Child Incidents
    result: when the parent is resolved, its active children are resolved with it
    hash: 917e3d1c68b281ba6c81a50742086ef60a396d924b925e0c51b7051932a9e261
  E03:
    record: sys_user_role/8b88f99687480300b4ae6c5837cb0b08
    how: read the role major_incident_manager
    result: "Has the overall accountability of organizing the Major Incident Response Team to resolve a major incident."
    hash: dd4494f284d69487b3e09192c4dfc3f6b03c618a8a44c073ca3828e287773a91
---
## What a major incident is

A **major incident** is one failure hitting many people or a critical service: email is down for
everyone, the network fails at a site, an application everyone needs is unavailable. Instead of
many teams working many reports, one response is led by a **major incident manager**. [E03]

### What it means for you {for=user}

You don't have to do anything different. Report the problem as usual (see
[Report an incident](see:incident/report)). When many people report the same failure, the service
desk connects your report to the one response: you get its updates on your own incident, and your
incident is resolved when the failure is fixed. [E02] See [Follow an outage](see:follow).

## How it goes {for=operator}

1. Someone on the service desk sees that an incident is bigger than one person, and **proposes**
   it. It becomes a **candidate**.
2. A major incident manager **promotes** it to a major incident, or **rejects** it. Here the
   creation mode is *promote*: the candidate itself becomes the major incident. [E01]
3. The other reports of the same failure are **linked** to it as child incidents.
4. The response runs from the **workbench**; stakeholders are kept informed with communications.
5. When the major incident is **resolved**, its child incidents are resolved with it. [E02] A
   **post-incident review** records what happened and what to change.

### Where you start {for=operator}

Propose from the incident on the **classic form** (the Service Operations Workspace doesn't offer
it): see [Propose a major incident](see:propose). Major incident managers work from the
**Major Incidents** menu (*Candidates*, *Open*, *All*) and the **workbench**.
