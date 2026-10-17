---
title: Schedule and implement
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/b2617622cb600200d71cb9c0c24c9c7a
    how: read Schedule
    result: when Scheduled is available
    hash: 9fea53cb712d46729734dd5a2db075bca9f4702e4274ec5230bfce58a3f94b6a
  E02:
    record: sys_ui_action/ed0777b3cb100200d71cb9c0c24c9c8f
    how: read Implement
    result: when Implement is available
    hash: dda419bc77910301509d4d49aa9d1228d0896dcc9c797e6ca3cc88dd619b6616
  E03:
    record: sys_hub_flow/6bcd6a92731310108ef62d2b04f6a790
    how: read Change - Implementation tasks
    result: creates the change tasks Implementation and Post Implementation and waits for them
    hash: 2309133b0b7a04ce706d8f00de23fac5b74f1a3dcbb1dbcceea63f832dcbf0ec
  E04:
    record: sys_db_object/d9e43a3b8c5503100a22deb6dd2b4e24
    children: sys_choice
    how: read the change task choices
    result: states Pending, Open, In Progress, Closed, Canceled; types Planning, Implementation, Testing, Review
    hash: 6d6a8ef7ae1b7a11e98c88ebc04bc7c7545ebbe8d6e8d27876ade98da4a8ed70
  E05:
    record: sys_ui_action/902135660a0a0b0100cf5f20f75c56c1
    how: read Close Task
    result: not while the change is on hold
    hash: 2f84b1b5661c0cebc420650b3c888523173bb43c204e7e84e17af351f693cba7
  E06:
    record: sys_ui_policy/38175f86d7032200f2d224837e6103ab
    how: read Mandatory - Close code and Close Notes if Closed (change task)
    result: required unless the task is Planning
    hash: a59b7ad917be829a503aebad0226c98387a1a4448593b80baf107bed841de848
  E07:
    record: sys_app_module/d3bcdbe157630300afc34786cc94f9d8
    how: read Change › Change Schedules
    result: the change schedule pages
    hash: 2b61d7ebaee016f530c2edd537e6020d2e3993f6e3af60629178b57ff1b15008
  E08:
    record: sys_script/eeeb0f59d7410200d82ba1737e6103b1
    how: read Update Conflicts
    result: checks for conflicts when the state, CI or dates change
    hash: c9284ed4578e417bee51b5daa29baf80a75ee993b9240855e643a3ca4a5a377c
---
## Schedule

{{animation:chgimpl}}

When approved, the change is **Scheduled** for its planned window. Check the window against
**Change › Change Schedules** and the **Conflicts** tab, which is refreshed when the dates or the
CI change. [E07] [E08] Use **Schedule** if the change is waiting to be scheduled. [E01]

## Implement

At the start of the window press **Implement**. [E02] The change gets two **change tasks**,
*Implementation* and *Post Implementation*; it waits for them. [E03] Each task goes **Open → In
Progress → Closed** and needs a close code and notes unless it is a planning task. [E04] [E06]
Press **Close Task** when done; tasks can't be closed while the change is on hold. [E05]

Record the actual start and end in the **Schedule** section.
