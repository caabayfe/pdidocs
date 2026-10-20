---
title: Fulfil catalog tasks
reviewed: 2026-10-19
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
    result: 'tasks "Please fulfill this order" (Procurement, "Pull from Stock or Order from Vendor if required. If the item has to be ordered, make sure to check the Backordered flag and specify the Estimated Delivery date.") and "Please deploy item to the user" (Field Services); when the item is backordered, stage Backordered and a task "Please close this task once the backordered item arrives"'
    hash: 7e4c924ae8f9da3ea0457d090b77e53a58e495b1cc6bbb64ef9f043b7d32201b
  E09:
    record: sys_db_object/1521b6f78c5103100a22deb6dd2b4e61
    children: sys_choice
    how: read the task state choices
    result: Pending, Open, Work in Progress, Closed Complete, Closed Incomplete, Closed Skipped
    hash: c114aabe62fc6262de0d9c018a6e23f242770950fa16a38a91f30ebc21fe3f7a
  E10:
    record: sys_ui_action/5bb04c2487001300e3010cf888cb0b5f
    field: client_script_v2
    how: read Close Task (workspace)
    result: sets the state to Closed Complete (3) and saves
    hash: 78c8d3230b85cbe6b948e4a491136999f4ecaefcbd9500a140b47d53377b1e6d
  E11:
    record: sys_ui_action/8513fcd0773b301027aae297cd5a9968
    how: read Assign to me (sn_sow_itsm_common, table task) and its two sys_ui_action_view records
    result: 'a workspace form button, shown on new and saved records, in the Service Operations Workspace views only; condition SOWITSMCommonUtils.canAssignToMe(current)'
    hash: 1013cca37d22631f0ae734115f526063ee178a8df4ff7496cf05302af64e66bc
  E12:
    record: sys_script_include/31903c09c7f13010d7e818b1c7c2603d
    field: script
    how: read SOWITSMCommonUtilsSNC.canAssignToMe and _checkRolesForAssignment
    result: 'on sc_task: the task is active (or new), you have itil or sn_request_write, you can write Assigned to, Assigned to is empty, and the assignment group is empty or you are a member of it'
    hash: 65116c33f05808534f0e490b4a150f944c6317f8ca8130bfef5664310e40685f
  E13:
    record: sys_ui_action/8513fcd0773b301027aae297cd5a9968
    field: client_script_v2
    how: read what the button does
    result: 'when the assignment group is empty and you belong to exactly one group, sets that group; then sets Assigned to to you and saves; a "Select Assignment Group" dialog appears only when the group is mandatory, empty and you belong to several groups'
    hash: 37ee29255e26fd3b455b269904d2191825dbcf28efe396ec559ab135080479b0
  E14:
    record: sys_script_include/83d911b17763301027aae297cd5a993c
    field: script
    how: read SOWITSMCommonClientUtilsSNC.getMemberGroups
    result: 'your active groups with no type or the itil type; with Workforce Optimization active and several groups, only your primary group'
    hash: b5f2af9f1a8a652f524502ea9cc25038a03526b621df41259daf33b15b9501b0
  E15:
    record: sys_script_include/31903c09c7f13010d7e818b1c7c2603d
    field: script
    how: read SOWITSMCommonUtilsSNC.canAssignToMeOnList, the condition of the workspace list action Assign to me (sys_declarative_action_assignment a9d63636ff30011027aaf9a7cddcbdc8)
    result: 'only problem, incident and change_request: workspace lists of catalog tasks have no Assign to me'
    hash: 65116c33f05808534f0e490b4a150f944c6317f8ca8130bfef5664310e40685f
  E16:
    record: sysevent_email_action/039c7466c0a80102004f66ab6aa3e757
    how: read Email assigned to (sc_task)
    result: 'active; "Task ${number} has been assigned to you" to Assigned to when it changes; send to self off'
    hash: b18dc7f294008300b75f2f40c17d6251fbe73d31686cf63fe4c499a36261fb30
  E17:
    record: sys_ui_action/4c1cfa36c611227501e6728036d9723b
    how: read Assign to me (global, table task)
    result: 'classic list context menu, condition current.canWrite(); sets Assigned to to you and saves, without checking the group'
    hash: c776bf87cbbc45b580ea6684606224d4dab397d490280475e461a3dad2c2be3e
  E18:
    record: sys_script/c676425665596610f87741223d56ea09
    field: script
    how: read Abort changes on group (sc_task, before insert and update, when the group changes and Assigned to is set)
    result: 'refuses the save with "Assigned to user … must be member of Assignment group …" when the assignee is not in the group'
    hash: 05175f6e6c2af9f3689fe18e10b14921e9fbe6c7910fdd97c3fd2a28a6260a01
---
## Find your work

{{animation:reqfulfil}}

In the Service Operations Workspace, open **Catalog tasks › Assigned to you**, or **Assigned to
your groups** to pick up your team's. [E01] [E02] Most hardware goes first to **Procurement**
(*"Please fulfill this order"*), then to **Field Services** (*"Please deploy item to the user"*).
[E07] [E08]

## Take a task: Assign to me {label=NEW}

Before you start, make the task yours, so nobody works it twice.

1. Open the catalog task in the workspace. **Assign to me** shows in the header while the task is
   open, nobody is assigned to it, and its assignment group is empty or one of yours. You need
   the `itil` or `sn_request_write` role. [E11] [E12] [Q19]
2. Press **Assign to me**. **Assigned to** becomes you and the task is saved. [E13]
3. If the task had no assignment group and you belong to one group only, that group is set too.
   If you belong to several, the group stays empty: set it yourself. [E13] [E14]

What follows: nobody is emailed. The *"Task … has been assigned to you"* email isn't sent when
you assign yourself. [E16]

| Where | Assign to me |
|---|---|
| catalog task header, workspace | yes, as above [E11] |
| catalog task lists, workspace | no: the list action covers incidents, problems and changes only [E15] |
| classic list, right-click menu | yes, for anyone who can edit the task; it doesn't check the group [E17] [Q06] |

The membership check on save runs only when the group changes [E18], so from the classic list
you can end up assigned to a task of a group you're not in. Use the workspace header instead.

## Work a task

1. Open the task from the list. It shows the requested item, who it's for, and the requester's
   answers to the item's questions. [E03]
2. Set **State** to *Work in Progress* and record progress in **Work notes**. [E09] [E03]
3. Finish it one of three ways:

| You | How | The task becomes |
|---|---|---|
| did the work | press **Close Task** [E04] | *Closed Complete* [E10] [E06] |
| can't do it | set **State** to *Closed Incomplete*, say why in **Work notes**, save | *Closed Incomplete* [E09] |
| it isn't needed | set **State** to *Closed Skipped*, save | *Closed Skipped* [E09] |

**Close Task** shows only while the task is open and not waiting for approval. [E04] Closing the
last task lets the item complete. What the item does when a task closes *Incomplete* or
*Skipped* isn't verified yet. [Q20]

## Reassign it

Change **Assignment group** (and clear **Assigned to**) in the workspace form, then save. [E03]
*Classic form:* the catalog task form has no **Assignment group** field: reassign from the
workspace. [E05]

## When the item is out of stock

On the Procurement task (*"Please fulfill this order"*), pull the item from stock or order it from
the vendor. If it has to be ordered, open the requested item, tick **Backordered** and set the
**Estimated Delivery** date, as the task's description says. [E08] The item then shows
*Backordered*, and a task *"Please close this task once the backordered item arrives"* waits for
you: close it when the item arrives. [E08]

## What happens next

When Procurement closes its task, Field Services gets *"Please deploy item to the user"*. [E08]
When the last task is closed, the item completes and the request closes after its items (see [The
life of a request](see:lifecycle)).

## Tips

- Pick from **Assigned to your groups** and press **Assign to me** on the task before you start,
  so nobody works it twice. [E02] [E11]
- To work a task out with colleagues in real time, start a discussion (see
  [Discuss a request with colleagues](see:request/discuss)).
- Read the requester's answers before you order: they say which options to add. [E03]
- Problem with what was delivered? Ask them to report an incident (see
  [Report an incident](see:incident/report)).
