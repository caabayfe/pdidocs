---
title: Assess and find the root cause
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/74ed0b50876313000e3dd61e36cb0bbf
    how: read Assess
    result: moves to Assess; asks for the assignee if missing
    hash: e9fe6ff3fde7b35c21e8699f35a292d568feddb8926117f61f55342987fe9816
  E02:
    record: sys_ui_action/50e9a756871313000e3dd61e36cb0b69
    how: read Confirm
    result: from Assess to Root Cause Analysis
    hash: e95892e526f39b6400a662d8d3e30963b6eafff00b13e309fc2b5581cd572cf3
  E03:
    record: sys_ui_section/15385fb5875823000e3dd61e36cb0ba5
    children: sys_ui_element
    how: read the Analysis Information section
    result: primary known error article, workaround, cause notes
    hash: 6ced5b49a8ebd38c4384d63264f79cff93491cbf55842d1b47659dc7afb5df12
  E04:
    record: sys_ui_action/4fa0838bb71c821041c2feb0be11a991
    how: read New on the Problem Tasks list
    result: creates a problem task from the problem form
    hash: 43f896f7d043065973783325a01a7be9a149b7171f3521cb23a05288188753f4
  E05:
    record: sys_dictionary_override/43e37efd534823004247ddeeff7b1274
    how: read the problem task Assigned to override
    result: only users with problem_task_analyst can be chosen
    hash: 621aa4cf42df1f1004a0c3b5279c045a911a0cebe1bc5f316d62fb6d75ebed52
  E06:
    record: sys_db_object/0e16bafb8c9503100a22deb6dd2b4e19
    children: sys_choice
    how: read the problem task choices
    result: states New, Assess, Work in Progress, Closed; types General, Root Cause Analysis; cause codes
    hash: eb39e8b6a8d13e7a731464608f4e2b052e41fb05f3d7b816fe3ef10269d1e5db
  E07:
    record: sys_ui_action/582d1f7e535b13004247ddeeff7b128a
    how: read Complete on a problem task
    result: for a root cause analysis asks the cause code, cause notes, fix notes and workaround
    hash: d790cb9b496c76e3ef3cc097b76a24cd7b10a2183f03d18f5d89fe6e2df43c24
  E08:
    record: sysevent_email_action/c02410c8532c23004247ddeeff7b1284
    how: read Problem Tasks closed (on problem.problem_tasks.closed)
    result: '"… problem tasks are completed or canceled", to the problem''s assignee and work notes list'
    hash: 8ba83cc1e3fb0608e4784ae23fc1d9600dd1a6930177a937d6221722324bd23d
  E09:
    record: sys_dictionary_override/57b3fafd534823004247ddeeff7b12d3
    how: read the problem Assigned to override
    result: only users with problem_coordinator can be chosen
    hash: c97ac6c31436fff661daae7a75741054f3a8c05f1a71c9f62a56e3ee299e664d
  E10:
    record: sys_script/7d6621d8532c0010833addeeff7b12ca
    field: script
    how: read Abort changes on group (problem, before, order 100, when the group changes and an assignee is set)
    result: 'refuses the save with "Assigned to user … must be member of Assignment group …"'
    hash: 5a48e9f39bd64918737d38b6c497ab4c988806639c8ef3c73af06b8d5c430aa9
  E11:
    record: sysevent_email_action/6969cd0b4a36231200ca9e4bbf405a0b
    how: read Problem assigned to me
    result: '"Problem … has been assigned to you", to the new assignee'
    hash: 458529a0cdfb8c6a9226070e3854d1ba0bd8e24e7c0377161b3d8e179f6856a2
  E12:
    record: sysevent_email_action/696ad0f24a36231200dcf0baf81eaf93
    how: read Problem assigned to my group
    result: '"Problem … has been assigned to group …", to the group when nobody is assigned'
    hash: c5431f24584a9d49e49f23a1c4264bc512f1c7f93dddee4b6322bc1782d65ddb
  E13:
    record: sys_ui_action/2ee7ab72539b13004247ddeeff7b1288
    how: read Cancel (problem task form button)
    result: from Assess or Work in Progress; closes the task with close code canceled, asking the close notes if missing
    hash: 7be3c18b342b91614b4720aa9284895d73058211213c24d03ce5e89995e4a53e
  E14:
    record: sys_ui_action/e2542b32539b13004247ddeeff7b12c4
    how: read Re-Assess (problem task form button)
    result: sends the task back to Assess; from Work in Progress for problem task analysts, from Closed for the role in the reassess property
    hash: 89501bb85dde0add02d4dec77c152292459197718b9929ea0521873c4ed5537d
  E15:
    record: sys_script/a7e06f3b531c23004247ddeeff7b1279
    field: script
    how: read Check related Problem Task closure (problem_task, after update, when active changes to false)
    result: queues problem.problem_tasks.closed when no active task is left on the problem
    hash: 3f2b410f6e9f594608770791a07f767cbed70eabffe9a5e90ad6e2fc2630cfd2
  E16:
    record: sys_ui_action/f01efa3753232010e3ccddeeff7b12f6
    field: script
    how: read Assign to me (problem list, right-click menu)
    result: for problem coordinators; refuses a closed problem, no write access to Assigned to, or a user outside the group; does nothing if already yours
    hash: 93b8f9b081b5aca599a05cb978c3447ab375199c7b55f3650855c737648b9f2e
  E17:
    record: sys_ui_action/6e909ae2532130103a65ddeeff7b12eb
    field: script
    how: read Assign to me (problem task list, right-click menu)
    result: the same checks, for problem task analysts
    hash: 93b8f9b081b5aca599a05cb978c3447ab375199c7b55f3650855c737648b9f2e
  E18:
    record: sys_script/5e0a54b0c7715010c24ae122c7c260f1
    field: script
    how: read Update Problem State to Assess (problem, before insert and update)
    result: a New problem that has what the Assess dialog asks for, such as the assignee, moves to Assess
    hash: 71bfed01224a6eda747b1fc083b209e6ed45114fccd0ab5b57cdb7a2af040c06
  E19:
    record: sysevent_email_action/6969cd0b4a36231200ca9e4bbf405a0b
    field: send_self
    how: read Problem assigned to me
    result: 'false: not sent to the person who made the change'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E20:
    record: sysevent_email_action/698bdac84a3623120032d9c4fdc8111c
    field: send_self
    how: read Problem Task assigned to me
    result: 'false: not sent to the person who made the change'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E21:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Service Operations Workspace › problem (New), opened by its address
    how: opened a problem in the workspace by its address, read-only
    result: header Save; More actions › Create Outage, Delete; Related records › Affected CIs, Problem Tasks, Change Requests, Outages, Attached Knowledge
---
All of this happens on the **classic problem form**. A problem opened in the Service Operations
Workspace by its address shows only **Save**, **More actions › Create Outage, Delete** and its
related records [E21]; whether problems are to be worked there is not decided yet. [shared/Q04]

## Assess

{{animation:prbinv}}

1. A new problem with an assignee is already in **Assess**; otherwise press **Assess**, and give
   the assignee if it asks. [E01]
2. Check it is a real problem: does it recur, how many incidents, what impact? If it isn't one,
   see [Accept the risk, cancel or reopen](see:close).
3. Press **Confirm**. The problem moves to **Root Cause Analysis**. [E02]

## Take it yourself {label=NEW}

To take a problem or a problem task without opening it, use the list.

1. Open the classic **Problems** list (or the **Problem Tasks** list).
2. Right-click the row and choose **Assign to me**. It works on one row at a time. [E16] [E17] [Q11]

You are put in **Assigned to** and the record is saved. [E16] A **New** problem then moves to
**Assess**. [E18]

- **Who sees it:** problem coordinators on problems, problem task analysts on problem tasks.
  [E16] [E17]
- **When it is refused:** *"You do not have permission to update assigned to"* if the record is
  closed or you can't change **Assigned to**; *"Assigned to user … must be member of Assignment
  group …"* if the record has a group you don't belong to. [E16] [E17]
- Unlike on [incidents](see:incident/assign), it doesn't fill in a group for you: with no group, you are assigned with
  none. Set the **Assignment group** on the form if your team needs to see it. [E16]
- You get no *assigned to you* email, because you made the change yourself. [E19] [E20]

## Hand it over

To give the problem to someone else, change **Assignment group** and **Assigned to** and save.
Only problem coordinators can be chosen [E09], and they must belong to the group: otherwise the
save is refused with *"Assigned to user … must be member of Assignment group …"*. [E10] The new
assignee gets *"Problem … has been assigned to you"*; with no assignee, the group gets *"Problem …
has been assigned to group …"*. [E11] [E12]

## Find the cause

Record what you learn in the **Analysis Information** section: **Cause notes** and, as soon as you
have one, the **Workaround**. [E03]

## Split the work into tasks

1. On the **Problem Tasks** related list, press **New**. [E04]
2. Choose the type: *Root Cause Analysis* for the analysis itself, *General* for other work. [E06]
3. In **Assigned to**, choose a problem task analyst: only they can be chosen. [E05] To hand a task
   over, change its **Assigned to** the same way.

The task moves **Assess → Work in Progress → Closed** with **Assess**, **Start Work** and
**Complete**. Completing a root cause analysis asks for the **Cause code**, **Cause notes**, the
proposed **Fix notes** and any **Workaround**. [E07]

**Cancel** closes a task that is no longer needed, from *Assess* or *Work in Progress*, asking for
the close notes. **Re-Assess** sends a task in progress back to *Assess*. [E13] [E14]

## What happens next

When the last task closes, the problem's assignee and work notes list get *"… problem tasks are
completed or canceled"*. [E08] [E15] Then share the
workaround ([Share a workaround and known error](see:workaround)) and plan the fix
([Fix and resolve](see:fix)).

