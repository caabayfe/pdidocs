---
title: Approvals - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_properties/9df356470a0a0b884e76f3c78fdee5b3
    field: value
    how: read glide.approval_engine.change_request
    result: 'off: approvals come from flows'
    hash: b4dc66dde806261bdda8607d8707aa727d308cd80272381a5583f63899918467
  E02:
    record: sys_hub_flow/edcf6ed2731310108ef62d2b04f6a7eb
    how: read Change - Normal - Assess
    result: applies Normal Change Policy in Assess
    hash: 1b2daa9da9cf0b7127c414ef387d495aad3e08da3b97efe6ff1c017392469a94
  E03:
    record: sys_hub_flow/2f33fe56731310108ef62d2b04f6a749
    how: read Change - Normal - Authorize
    result: checks for a prior manager approval, then applies Normal Change Policy
    hash: e9d3db8538cecbfd782083a3a4be59aec2e5f1c9db684fe475187bc54c6757d4
  E04:
    record: chg_policy_approval/5b06ce5db701230034d1da23ee11a965
    how: read Normal Change Policy
    result: questions Assess Technical Approvals, Low Risk Manager approval, Requires CAB Approval
    hash: 79fb3d09af464ff613848136e501b85398c18dca177db5360d4b82c06e63354d
  E05:
    record: chg_policy_approval/3c4464a7b701230034d1da23ee11a993
    how: read Emergency Change Policy
    result: CAB approval in Authorize
    hash: 14e6296ed10b4ce764f2428c595267f5ac2c9d474b35fcbc1d1a17084d857e8d
  E06:
    record: sys_decision_question/10284a9db701230034d1da23ee11a9c1
    how: read Requires CAB Approval
    result: risk moderate, high or empty, or the group has no manager
    hash: 218626518664d74e741d7f64a8d163ed7e6136a2800d25f69c113cd1d4367ab9
  E07:
    record: sysevent_in_email_action/b43ef438c611227100a9aa83fe121dda
    field: script
    how: read Update Approval Request
    result: approve or reject from the reply subject
    hash: e0cd4afae7104bafe04a27e16d4f4992a5ec28c7604f1773498fc99e4ea2f901
  E08:
    record: sys_properties/856303e90a0a0bc50164129959388444
    how: read glide.email.smtp.active
    result: value not in the mirror
    hash: 9192a88ca18c64e94f94ed3b6ca9119bee211fb1af926411830d5713a829b4a4
  E09:
    record: sys_security_acl/1cbf65965f011000b12e3572f2b4776e
    field: script
    how: read the approver read ACL on change_request
    result: approvers without itil read the change only from their approval
    hash: 204381808f784893770069b34e35fa66a9687e9cbccd9f405a46dc407dac40eb
---
## Engine

The legacy approval engine is off [E01]; the Normal flows apply **Normal Change Policy** in Assess
and Authorize [E02] [E03] [E04], and emergency changes **Emergency Change Policy**. [E05] A group
without a manager sends even low-risk changes to the CAB. [E06]

## Approvers

Approvers without `itil` can read the change only from their approval. [E09] Email replies decide
an approval by their subject. [E07] Approval emails
need mail sent and read, and `glide.email.smtp.active` has no value in the mirror. [E08] [shared/Q18]
