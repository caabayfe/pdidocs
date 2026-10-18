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
    field: script
    result: form button while the request state is requested or in_process; sets request state Closed Cancelled and stage closed_incomplete
    hash: 72aca974338373d09bdbb148d7c22f64a6bb9c8d5e44d25875d9e4ecf26464a4
  E04:
    record: sys_script/180430660a04bf1500f82aaba735fe7f
    how: read Close Tasks Due to Cancellations
    result: canceling an item closes its tasks
    hash: 4a5af44969c0b1e25b6a53e859f76d6b3247a161940ff025dac6c94be13017ab
  E05:
    record: sys_ui_action/0c4c19670a0a0a7001101d92fa2649da
    field: script
    how: read Add New Item
    result: 'classic form button while the request state is requested; opens the dialog "Add Catalog Item" asking an item and a quantity'
    hash: 842fce36e27915f08a01e5b8190e93af720a5468f776252f91d8f8579dc71a19
  E06:
    record: sys_ux_list/a91ea05b9351121004e40b2764891806
    how: read Approvals › My approvals
    result: includes request and item approvals
    hash: fc69db4d74ecb8b75d2f83e659d7192eead58821ddf0bd3375297539ac46e4c4
  E07:
    record: sys_script/4fc071d89381a6101ba7f2f17cba100f
    field: script
    how: read Cancel Flows Upon Cancellation (after, order 100, when the state changes to Closed Incomplete)
    result: 'cancels the request''s flows with the message "Due to request cancellation by <user>"'
    hash: 0f3a037cac209608e3f9105b26b592236deab60dd491f3bad28d37024f1d005b
  E08:
    record: sys_script/40afa110c611228401d8643e2c2748cb
    field: script
    how: read Mark Request Closed (before, order 1200)
    result: on a closed request state or stage, makes the request inactive and sets closed by and closed at
    hash: 3975c4a268e4cd2762eb91fcf4d2ef680e296c4127da9ade43b67dd64351c380
---
You manage requests from the Service Operations Workspace: find them, cancel them, add items to
them while they wait for approval, and answer their approvals.

## Find it

{{animation:reqmanage}}

1. In the workspace open **Requests › Open requests** for whole orders, or **Open items** for each
   ordered item. [E01] [E02]
2. Open the request to see its items, state and approvals.

## Cancel

1. Open the request. **Cancel Request** shows in the header (or as a classic form button) while the
   request is pending approval or approved. [E03]
2. Press it. The request becomes *Closed Cancelled*. [E03]

What follows: its flows are canceled with the note *"Due to request cancellation by …"* [E07], its
items' tasks close [E04], and the request becomes inactive with the closing time and who closed
it. [E08]

## Add an item

1. Open the request on the **classic form** while it waits for approval. [E05]
2. Press **Add New Item**. The *Add Catalog Item* window asks the item and the quantity. [E05]
3. Choose them and confirm: the item joins the request.

## Approvals

IT approvers find request approvals under **Approvals › My approvals**, as for changes (see
[Approve as a technical approver](see:change/review-approval)). [E06]

## Tips

- Look at **Open items** first: **Cancel Request** stops every item in the request, not just one.
  [E03] [E04]
- Write the reason in the request's comments before you cancel, so the requester knows why.
- **Add New Item** only works while the request waits for approval [E05]; after that, the
  requester orders the extra item separately.
