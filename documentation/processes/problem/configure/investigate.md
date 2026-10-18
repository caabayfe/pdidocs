---
title: Assessment and analysis - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sttrm_state_transition/784efebfb70c021041c2feb0be11a966
    how: read New to Assess
    result: condition Assigned to is not empty
    hash: 799e221e1b15eadf4e1c44bd43a595ce75d7516611184528f4dcf32046849197
  E02:
    record: sys_script/10133e13b7e002102e13bea0be11a92f
    field: script
    how: 'read Problem Model: Check State Transition'
    result: refuses a state change the model doesn't allow
    hash: 393cece060a02a331e9b518e8a434761c746489146ff4c9486cfda5de278ec12
  E03:
    record: sys_script/5e0a54b0c7715010c24ae122c7c260f1
    field: script
    how: read Update Problem State to Assess
    result: a New problem with an assignee moves to Assess on save
    hash: 71bfed01224a6eda747b1fc083b209e6ed45114fccd0ab5b57cdb7a2af040c06
  E04:
    record: prb_task_model/963be2eb43c0021041c239aaaab8f277
    how: read the problem task model Root Cause Analysis
    result: type rca
    hash: c9386f115ee5e40e3e289e4776592f57d7b7b506e8097fd406af844b96b57b7e
  E05:
    record: sys_script_include/d12653fa535b13004247ddeeff7b12cb
    field: script
    how: read ProblemTaskStateUtilsSNC
    result: Complete and Cancel need problem_task_analyst
    hash: e505a671d68078d37403ce0c4bc71565c739bad41cd0ef4c3bad277118b9bf06
  E06:
    record: sys_data_policy2/2a2b5f80536f13004247ddeeff7b1231
    how: read the RCA completion data policy
    result: a completed root cause analysis needs a cause code
    hash: f5e6186f242dad807a94da6d0657c7921aa83fb81389fd92be11b20f61ae38fe
  E07:
    record: sys_properties/7bd5071e530c23004247ddeeff7b1267
    field: value
    how: read problem.closed.can_create_tasks
    result: false
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E08:
    record: sys_script/a7e06f3b531c23004247ddeeff7b1279
    field: script
    how: read Check related Problem Task closure (problem_task, after update, order 100, active changes to false)
    result: queues problem.problem_tasks.closed when the problem has no active task left
    hash: 3f2b410f6e9f594608770791a07f767cbed70eabffe9a5e90ad6e2fc2630cfd2
  E09:
    record: sys_ui_action/2ee7ab72539b13004247ddeeff7b1288
    how: read Cancel (problem_task form button, order 600)
    result: condition canWrite and ProblemTaskStateUtils.isAllowedToCancel; closes the task with close code canceled through ptask_cancel_dialog_view
    hash: 7be3c18b342b91614b4720aa9284895d73058211213c24d03ce5e89995e4a53e
  E10:
    record: sys_ui_action/e2542b32539b13004247ddeeff7b12c4
    how: read Re-Assess (problem_task form button, order 500)
    result: condition ProblemTaskStateUtils.isAllowedToReAssess; sets the task back to Assess
    hash: 89501bb85dde0add02d4dec77c152292459197718b9929ea0521873c4ed5537d
  E11:
    record: sysevent_email_action/c02410c8532c23004247ddeeff7b1284
    how: read Problem Tasks closed
    result: 'on problem.problem_tasks.closed, to assigned_to and work_notes_list; "… problem tasks are completed or canceled"'
    hash: 8ba83cc1e3fb0608e4784ae23fc1d9600dd1a6930177a937d6221722324bd23d
---
## Transitions

The model's transitions are enforced on save [E02]; New to Assess needs an assignee [E01], and a
New problem saved with one moves to Assess by itself. [E03]

## Problem tasks

Task models are *General* and *Root Cause Analysis*. [E04] Completing or canceling a task needs
`problem_task_analyst` [E05]; a completed root cause analysis needs a cause code [E06]. No task can
be created on a closed problem. [E07]

## Task actions and closure

| Order | Record | When | Effect |
|---|---|---|---|
| 500 | Re-Assess (form button) [E10] | `isAllowedToReAssess` | back to Assess |
| 600 | Cancel (form button) [E09] | `isAllowedToCancel`: Assess or Work in Progress | Closed, close code *canceled* |
| after, 100 | Check related Problem Task closure [E08] | a task becomes inactive | when none is left, `problem.problem_tasks.closed` |

The event sends *Problem Tasks closed* to the problem's assignee and work notes list. [E11]
