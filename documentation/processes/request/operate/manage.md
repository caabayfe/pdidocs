---
title: Manage a request
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ux_list/c1a01258c3753010965e070e9140dd31
    how: read Requests › Open requests
    result: active requests
    hash: bc59cc462be8450a70eeef288050774c131619c8aa74f658e083f3c1226d2f4d
  E02:
    record: sys_ux_list/39c0de18c3753010965e070e9140ddd3
    how: read Requests › Open items
    result: active requested items
    hash: f2c339b49a6f165312ebbd54875d7d341c30a026f95b295f40739a4fc07dfb93
  E03:
    record: sys_ui_action/180dfd110a04bf1501fc982f0cf791bb
    how: read Cancel Request
    result: while Pending Approval or Approved; closes it as Closed Cancelled
    hash: cc6d7a56749108b8d15764bbeb96dffad92f065a306663cecb2e67c7a57b4c8d
  E04:
    record: sys_script/180430660a04bf1500f82aaba735fe7f
    how: read Close Tasks Due to Cancellations
    result: canceling an item closes its tasks
    hash: 4a5af44969c0b1e25b6a53e859f76d6b3247a161940ff025dac6c94be13017ab
  E05:
    record: sys_ui_action/0c4c19670a0a0a7001101d92fa2649da
    how: read Add New Item
    result: classic form, while the request is Pending Approval
    hash: f3f76fc83380b00e75401db38f07102e6fdf41c3bd2d300cbfbf4107e5a827b4
  E06:
    record: sys_ux_list/a91ea05b9351121004e40b2764891806
    how: read Approvals › My approvals
    result: includes request and item approvals
    hash: fc69db4d74ecb8b75d2f83e659d7192eead58821ddf0bd3375297539ac46e4c4
---
## Find it

{{animation:reqmanage}}

**Requests › Open requests** and **Open items** in the workspace. [E01] [E02]

## Cancel

On the request press **Cancel Request** (workspace header or classic form) while it is pending
approval or approved. [E03] Its items' tasks close with it. [E04]

## Add an item

On the classic form, **Add New Item** adds another item while the request waits for approval.
[E05]

## Approvals

IT approvers find request approvals under **Approvals › My approvals**, as for changes (see
[Approve as a technical approver](see:change/review-approval)). [E06]
