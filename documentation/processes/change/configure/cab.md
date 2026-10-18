---
title: CAB - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: cab_definition/30b99b3d93a0220050bef157b67ffb2e
    how: read Network CAB
    result: 'auto-adds changes: type normal or emergency, risk 1 to 3 (Very High, High, Moderate), category Network; 10 minutes per item'
    hash: 43d3b34d595a2a0bd649719313bb13f402e0878b965ee6561af286dabd0c2590
  E02:
    record: sys_script/318cdc50d7302200d105ef637e610366
    field: script
    how: read Sync approval with agenda item (after, order 100, when the change's approval changes to approved or rejected)
    result: updates the agenda item's decision and adds the approval decision to the meeting notes
    hash: 9e27810eb9b74b8c3fff6fd80275a9d00326d417f74905402c742a83723a8e5c
  E03:
    record: sys_properties/93d9fcc1b7d822100a11807cae11a995
    field: value
    how: read cab.use_sow_meeting
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E04:
    record: sys_user_role/d2d83927eb32120034d1eeea1206fef9
    how: read sn_change_cab.cab_manager
    result: contains sn_change_write and workspace roles; not itil
    hash: 578f85479cad2a032aa8e7c36b33547bddfa49ba7d6ca38c2f7fa4f19474e002
  E05:
    record: sys_decision_question/10284a9db701230034d1da23ee11a9c1
    how: read Requires CAB Approval (Normal Change Policy)
    result: in Authorize with moderate, high or no risk, or a group without a manager, the CAB Approval definition
    hash: 218626518664d74e741d7f64a8d163ed7e6136a2800d25f69c113cd1d4367ab9
---
## Definitions and meetings

The only definition is the demo **Network CAB** [E01]; meetings are business data the mirror
doesn't hold. When a change's approval becomes approved or rejected, its agenda item's decision
and the meeting notes are updated. [E02] Meetings open in the
workspace's CAB meeting page. [E03] The CAB manager role doesn't contain `itil`. [E04]

## Only network changes {label=OPEN-QUESTION}

With one definition limited to *Network* changes [E01], a moderate-risk server change still gets
its CAB approval from the *CAB Approval* definition [E05], but is never put on a meeting agenda:
its approvers decide it alone. Is that intended, or should a definition cover the other
categories?
