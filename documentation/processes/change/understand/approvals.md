---
title: Who approves
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_decision_question/a436029db701230034d1da23ee11a989
    how: read Assess Technical Approvals (Normal Change Policy)
    result: in Assess, the technical approval
    hash: 8231467b8500725eba2e0ac3a931edcf2395bb0aa7fcd49ee6717b9bb0a41d82
  E02:
    record: sys_decision_question/88e6829db701230034d1da23ee11a9a9
    how: read Low Risk Manager approval
    result: in Authorize with low risk, the assignment group's manager, unless already approved
    hash: a3d6cc567aa1646374434af0e474e9964cb34cccd39a6e3feeef03c776a3db22
  E03:
    record: sys_decision_question/10284a9db701230034d1da23ee11a9c1
    how: read Requires CAB Approval (Normal)
    result: in Authorize with moderate, high or no risk, or a group without a manager, the CAB
    hash: 218626518664d74e741d7f64a8d163ed7e6136a2800d25f69c113cd1d4367ab9
  E04:
    record: chg_policy_approval/3c4464a7b701230034d1da23ee11a993
    how: read the Emergency Change Policy
    result: the CAB always approves an emergency change
    hash: 14e6296ed10b4ce764f2428c595267f5ac2c9d474b35fcbc1d1a17084d857e8d
  E05:
    record: sys_hub_flow/e89e3ade731310108ef62d2b04f6a744
    how: read the flow Change - Standard
    result: a standard change is approved when it is created
    hash: 447f6d4c88af36c747c6613051bc7ee6264e1df07d4c61e1afc4ae50408fc82b
  E06:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Change Approval Definition list'
    how: 'read the approval definitions'
    result: 'Assignment Group Approval (group), Assignment Group Manager Approval (user), CAB Approval (group)'
---
## Who is asked, and when

| Kind | When | Who approves |
|---|---|---|
| Normal | in Assess | the **team doing the change** (technical approval) [E01] |
| Normal, low risk | in Authorize | the **team's manager**, unless they already approved [E02] |
| Normal, moderate or high risk | in Authorize | the **CAB** [E03] |
| Emergency | in Authorize | the **CAB** [E04] |
| Standard | | nobody: pre-approved [E05] |

The approvers come from three definitions: the team, its manager, and the CAB. [E06]
A rejection sends the change back.

### If you are asked {for=user}

You're usually asked as the manager of the team making the change, or as a CAB member. See
[Approve a change](see:approve).

### How to get it approved quickly {for=operator}

Set the **Risk** right (press *Calculate Risk*), fill the planning fields, and keep the
assignment group's manager current: a group without a manager sends even low-risk changes to the
CAB. [E03] See [Get it approved](see:authorize).
