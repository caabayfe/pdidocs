---
title: What the CMDB is
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/ee02f67b8c9103100a22deb6dd2b4ef2
    how: read the configuration item table
    result: Configuration Item, the base of every class
    hash: e0a2d6da07d0841f3347c537f4990fc27a9674315052dd473a38975cf3ebf5a7
  E02:
    record: sys_db_object/2322323f8c9103100a22deb6dd2b4e2d
    how: read the Service table
    result: services, with business services, technology management services and offerings below
    hash: c4e0402511b218ad9dc375f81a55ef9b349a59ccba36fa20cd1461aeeb660360
  E03:
    record: sys_ux_list_category/b895f74d533330105264ddeeff7b12d4
    how: read the workspace list category CMDB
    result: Applications, Cloud, Databases, Devices, Infrastructure gear, Others, PC, Servers, Services
    hash: 9eea76aaf91aa530e4d2f3e6e25eb0a73597adacd40eb13c303893f89a4038a5
  E04:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'CMDB Workspace home'
    how: 'opened the workspace'
    result: 'tabs Home, My Work, CMDB 360, Insights, Management; Intelligent search; My work; CMDB Health'
  E05:
    record: sys_db_object/e6d2baf78cd103100a22deb6dd2b4e1a
    how: read CI Relationship
    result: how configuration items depend on each other
    hash: e4566f108533014dfd3d88c071a8c597c7b31e99fd5c52771608ecebed2a25d7
---
## What it is {for=user}

IT keeps a record of what it runs: the services you use (email, payroll), the applications behind
them, and the computers and network they run on. [E01] [E02] When you report a problem, you may be asked
which application or service is affected: see [Say which service is affected](see:pick-service).

## Configuration items {for=operator}

The CMDB is the record of what IT runs. Each thing in it is a **CI** [E01]: a
**service** people use (email, payroll) [E02], the **applications** behind it, the **servers**,
**databases** and **network gear** they run on, and the **devices** people work with. CIs are
linked by **relationships**: an application runs on a server, a service depends on an application.
[E05]

### Where you start

In the Service Operations Workspace, **CMDB** lists Applications, Cloud, Databases, Devices,
Infrastructure gear, PC, Servers, Services and Others. [E03] The **CMDB Workspace** is for working on
the data itself: search, your work, health and management. [E04]
