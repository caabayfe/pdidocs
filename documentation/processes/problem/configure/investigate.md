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
  E12:
    record: sys_ui_action/f01efa3753232010e3ccddeeff7b12f6
    how: read Assign to me on problem (action task_assign_to_me, list context menu, order 100)
    result: condition problem_coordinator when com.snc.best_practice.problem.madrid is active, else itil; script refuses inactive records, no write on assigned_to, or a user outside the assignment group; sets assigned_to and updates only when it changes
    hash: de3e3e2f9bda40b39a59fecaf2c59fa9bcc1f89c634c0a5e0e605556ae040840
  E13:
    record: sys_ui_action/6e909ae2532130103a65ddeeff7b12eb
    how: read Assign to me on problem_task (action task_assign_to_me, list context menu, order 100)
    result: the same script; condition problem_task_analyst when the Madrid plugin is active, else itil; no role record
    hash: 6a52802ce4560f0f9f3852e0f326d9b9c9b845d0cb63dedb98d066f7ba6bddbc
  E14:
    record: sys_ui_action_role/5d1efa3753232010e3ccddeeff7b12c6
    how: read the role of Assign to me on problem
    result: itil
    hash: edd7eb2ad2b7e18e65a5b05c7d869623f1c45540be7c73451ffe71b23e5259d2
  E15:
    record: sys_user_role_contains/c473c1f9538823004247ddeeff7b12c5
    how: read the roles problem_coordinator contains
    result: problem_coordinator contains itil
    hash: 885dc5bb584f72becffaf375e7f82d0c2d13a6ba2b240d0bef8bbd6864517c53
  E16:
    record: sys_ui_action/4c1cfa36c611227501e6728036d9723b
    how: read Assign to me on task (action task_assign_to_me)
    result: condition current.canWrite(); sets assigned_to with no other check
    hash: c776bf87cbbc45b580ea6684606224d4dab397d490280475e461a3dad2c2be3e
  E17:
    record: sysevent_email_action/6969cd0b4a36231200ca9e4bbf405a0b
    how: read Problem assigned to me
    result: assigned_to changes to a value; to assigned_to; send_self false
    hash: 458529a0cdfb8c6a9226070e3854d1ba0bd8e24e7c0377161b3d8e179f6856a2
  E18:
    record: sysevent_email_action/698bdac84a3623120032d9c4fdc8111c
    how: read Problem Task assigned to me
    result: assigned_to changes to a value; to assigned_to; send_self false
    hash: be30a4b2c5f342e0ad9dea96c2afe181e6f727e216e260437f9158e71a876201
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

## Assign to me {label=NEW}

Problem and problem task each have their own **Assign to me** with the action name
`task_assign_to_me`, so they replace the one on task, which only checks `canWrite()`. [E12] [E13]
[E16] Both are list context menu actions (right-click on a row), not list choices, so they act on
one record at a time.

| Table | Condition | Role record |
|---|---|---|
| problem [E12] | `problem_coordinator` when `com.snc.best_practice.problem.madrid` is active, else `itil` | `itil` [E14], which `problem_coordinator` contains [E15] |
| problem_task [E13] | `problem_task_analyst` when the Madrid plugin is active, else `itil` | none |

The Madrid problem best practice plugin is active on pdi2, so the coordinator and analyst roles
apply.

The script, the same on both tables [E12] [E13]:

1. Refuses an inactive record or one where `assigned_to` can't be written: *"You do not have
   permission to update assigned to"*.
2. Refuses a user who isn't a member of a set `assignment_group`: *"Assigned to user {0} must be
   member of Assignment group {1}"*.
3. Otherwise, if the record isn't already the user's, sets `assigned_to` and updates it. Unlike the
   incident action, it never fills `assignment_group`.

It sets the field on the server, so the `assigned_to` reference qualifiers (problem coordinators,
problem task analysts) don't apply; the conditions above do the same job. The update runs the
problem's business rules, so a New problem moves to Assess. [E03] *Problem assigned to me* and
*Problem Task assigned to me* have `send_self` false, so the user who assigns themselves gets no
email. [E17] [E18]
