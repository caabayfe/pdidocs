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
---
## Transitions

The model's transitions are enforced on save [E02]; New to Assess needs an assignee [E01], and a
New problem saved with one moves to Assess by itself. [E03]

## Problem tasks

Task models are *General* and *Root Cause Analysis*. [E04] Completing or canceling a task needs
`problem_task_analyst` [E05]; a completed root cause analysis needs a cause code [E06]. No task can
be created on a closed problem. [E07]
