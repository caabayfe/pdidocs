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
    how: read Problem Tasks closed
    result: the coordinator is emailed when the last task is done
    hash: 8ba83cc1e3fb0608e4784ae23fc1d9600dd1a6930177a937d6221722324bd23d
---
## Assess

A new problem with an assignee is already in **Assess**; otherwise press **Assess**. [E01] Check
it is a real problem: does it recur, how many incidents, what impact? Then press **Confirm** to
start the root cause analysis. [E02] If it isn't one, see
[Accept the risk, cancel or reopen](see:close).

## Find the cause

Record what you learn in the **Analysis Information** section: **Cause notes** and, as soon as you
have one, the **Workaround**. [E03]

Split the work into **problem tasks** from the **Problem Tasks** list's **New**. [E04] Choose the
type: *Root Cause Analysis* for the analysis itself, *General* for other work. Only problem task
analysts can be assigned. [E05] [E06]

A task moves **Assess → Work in Progress → Closed** with **Assess**, **Start Work** and
**Complete**. Completing a root cause analysis asks for the **Cause code**, **Cause notes**, the
proposed **Fix notes** and any **Workaround**. [E07] When the last task closes, the coordinator is
emailed. [E08]
