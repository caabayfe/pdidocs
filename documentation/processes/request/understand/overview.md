---
title: How requests work
reviewed: 2026-10-17
evidence:
  E01:
    record: sp_page/c0728d1373675300c629e1e54cf6a7b3
    how: read the Employee Center catalog item page
    result: the page every catalog item opens in
    hash: 2dff735f36cbb61eadc54aacf33feea944c351dafcb29981252dbdc392676e2e
  E02:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    how: read the flow Service Catalog item request
    result: manager approval, department head approval, then catalog tasks for Procurement and Field Services
    hash: 7e4c924ae8f9da3ea0457d090b77e53a58e495b1cc6bbb64ef9f043b7d32201b
  E03:
    record: sys_ux_list_category/fa5c3965530230104a06ddeeff7b1240
    how: read the workspace list category Catalog tasks
    result: Assigned to you, Assigned to your groups
    hash: 297d7758daad34d6f7b3cd24f32aa7209bd04b3f8c6ff17a262a98ecc4c88abc
---
## Request, not incident

A **request** is for something new: a laptop, software, access, a service. If something that
worked is broken, that's an incident (see [Report an incident](see:incident/report)).

## How it goes

1. You **order** an item from the catalog. You get a **request** (REQ…) listing each thing you
   ordered (RITM…).
2. Some items need **approval**, usually from the manager of the person it's for. [E02]
3. The IT teams prepare and deliver it.
4. When everything is delivered, the request closes.

### What it means for you {for=user}

Order from Employee Center (see [Order something](see:order)), then follow it under **My
Requests** (see [Follow your request](see:follow)). [E01]

### Where you start {for=operator}

Most hardware and many access items follow *Service Catalog item request*: manager approval,
department head approval, then **catalog tasks** for Procurement and Field Services. [E02]
Fulfillers work in the Service Operations Workspace, **Catalog tasks › Assigned to you** or
**Assigned to your groups**. [E03] See [Fulfil catalog tasks](see:fulfil).
