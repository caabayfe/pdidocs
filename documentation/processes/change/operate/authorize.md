---
title: Get it approved
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/f07eedb3cb200200d71cb9c0c24c9c3d
    how: read Request Approval (to Assess)
    result: on a Normal change in New
    hash: bf4ad0a59cebb45faccfe5d25a53288d6d02227fbee6a928db2307d513c37d08
  E02:
    record: sys_ui_action/4a296773cb100200d71cb9c0c24c9c3f
    how: read Request Approval (to Authorize)
    result: when Authorize is the next state
    hash: baa83329c5a3c39e83d8033129c995ba6a295af89b25f44d14447822b0048f64
  E03:
    record: sys_hub_flow/edcf6ed2731310108ef62d2b04f6a7eb
    how: read Change - Normal - Assess
    result: asks the technical approvers; approved moves it on; rejected waits until it is put on hold, canceled or back in New
    hash: 1b2daa9da9cf0b7127c414ef387d495aad3e08da3b97efe6ff1c017392469a94
  E04:
    record: sys_hub_flow/2f33fe56731310108ef62d2b04f6a749
    how: read Change - Normal - Authorize
    result: asks the manager or the CAB per the policy; skips the manager if they already approved
    hash: e9d3db8538cecbfd782083a3a4be59aec2e5f1c9db684fe475187bc54c6757d4
  E05:
    record: sys_hub_flow/7467365a731310108ef62d2b04f6a72a
    how: read Change - Emergency - Authorize
    result: asks the CAB
    hash: 469458ccb5b76a9120273cebcde3851bc2bfb4eb12448dc89d68ba5f86570ac1
  E06:
    record: sys_script_client/4db9cb50cb300200d71cb9c0c24c9c1c
    field: script
    how: read Show field messages
    result: '"Change is waiting for approval" in Assess and Authorize'
    hash: 27ffae5b6e7ec397a294868a0ecb75e2642fd7b954a573de377fa903548a85fb
  E07:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic change form, CHG0000036, related lists'
    how: 'read the related list tabs'
    result: 'Affected CIs, Impacted Services/CIs, Approvers, Change Tasks, Problems, Task SLAs, Outages'
---
## Request it

{{animation:chgauth}}

When the plan is complete, press **Request Approval**. [E01] A normal change goes to **Assess**:
its technical approvers are asked. [E03] When they approve, press **Request Approval** again if it
shows: it goes to **Authorize** for the manager or the CAB. [E02] [E04] An emergency change goes
straight to **Authorize** and the CAB. [E05] Who is asked depends on the risk (see
[Who approves](see:approvals)).

While it waits, the form says *"Change is waiting for approval"*. [E06] The **Approvers** list
shows who has been asked and what they answered. [E07]

## If it is rejected

Read the approvers' comments. Fix the plan, then send it back with **Revert to New** (form menu)
and request approval again (see [Review, close or cancel](see:close)).
