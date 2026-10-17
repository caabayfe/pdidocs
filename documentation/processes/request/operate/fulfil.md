---
title: Fulfil catalog tasks
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ux_list/b92df1a5530230104a06ddeeff7b12a4
    how: read Catalog tasks › Assigned to you
    result: your active catalog tasks
    hash: a9f05e72769cb7dd57a1c53ddd531aa84c936e239617a1b12300dd81422b7a62
  E02:
    record: sys_ux_list/558db5a5530230104a06ddeeff7b120c
    how: read Catalog tasks › Assigned to your groups
    result: your groups' active tasks, not assigned to you
    hash: 8d44a6e3e659430bab8ed227347c72783e2de0959cd314e2f3b7d284b074f413
  E03:
    record: sys_ui_section/2da34abfc74230105a06a1e603c260ec
    children: sys_ui_element
    how: read the workspace catalog task form
    result: number, assigned to, assignment group, CI; approval, priority, state, requested item, requested for; the item's answers, short description, description, work notes
    hash: caff87e42921fe8b516b876056e49b591d1a81444b0ef0ce9f0f56a9049ead62
  E04:
    record: sys_ui_action/5bb04c2487001300e3010cf888cb0b5f
    how: read Close Task (workspace)
    result: when the task is open and not waiting for approval
    hash: b35cf26922a2ce18a508f4b43d8099d615ff4a481a2f5030fe67d24aad8bf559
  E05:
    record: sys_ui_section/8687fbccc611229100727249a775cc31
    children: sys_ui_element
    how: read the classic catalog task form
    result: no assignment group field
    hash: aa2de1fba589054b38c32d8d8cd22d75fa4b51ab73addc0ff84c1e6109018b7b
  E06:
    record: sys_script/74d38bd0c611227d0151ca6b62ae87e6
    how: read Close Ticket
    result: closing a task makes it inactive and stamps the end
    hash: 893eebf6d4b0bf77ba43f00a57a1a2b766c99b34efc478a9b07e6d685545c641
  E07:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Groups list'
    how: 'looked up the fulfilment groups'
    result: 'Procurement (ordering catalog items) and Field Services'
  E08:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    how: read Service Catalog item request
    result: 'tasks "Please fulfill this order" (Procurement) and "Please deploy item to the user" (Field Services); a backorder path'
    hash: 7e4c924ae8f9da3ea0457d090b77e53a58e495b1cc6bbb64ef9f043b7d32201b
---
## Find your work

In the Service Operations Workspace, open **Catalog tasks › Assigned to you**, or **Assigned to
your groups** to pick up your team's. [E01] [E02] Most hardware goes first to **Procurement**
(*"Please fulfill this order"*), then to **Field Services** (*"Please deploy item to the user"*).
[E07] [E08]

## Work a task

The task shows the requested item, who it's for, and the requester's answers to the item's
questions. [E03] Record progress in **Work notes**. When it's done, press **Close Task**. [E04]
[E06] Closing the last task lets the item complete.

*Classic form:* the catalog task form has no **Assignment group** field: reassign from the
workspace. [E05]
