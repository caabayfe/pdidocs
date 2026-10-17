---
title: The change advisory board
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_app_module/3d236def9f131200b18a7feea57fcf6c
    how: read Change › CAB Workbench
    result: opens /cab?id=cab_calendar
    hash: 3cbc654ce05d42657d8810f00a22098c592b1f4f61ad823f68c29615baeea162
  E02:
    record: sp_portal/0d3fa8649f131200b18a7feea57fcf7a
    how: read the portal CAB Workbench
    result: suffix cab; calendar home; workbench page with header, current agenda item and pending items
    hash: 7ec25fe71a8b757db81a31dc02ebb46931ad173b9fd7348d17f29ed237650c0e
  E03:
    record: sp_widget/4c1ab0f1eb10220034d1eeea1206fed4
    how: read CAB Workbench - Current Agenda Item
    result: Approve, Reject, Next, Pause, Resume, Demote, Finish, End meeting
    hash: 37d6d00d8913da8f135a7dad68a0e6d4c1063e75002eefb5354e41e81a001e27
  E04:
    record: cab_definition/30b99b3d93a0220050bef157b67ffb2e
    how: read Network CAB
    result: adds normal and emergency Network changes with risk High or higher-tier to its meetings
    hash: 43d3b34d595a2a0bd649719313bb13f402e0878b965ee6561af286dabd0c2590
  E05:
    record: sys_user_role/d2d83927eb32120034d1eeea1206fef9
    how: read sn_change_cab.cab_manager
    result: Change Advisory Board Managers
    hash: 578f85479cad2a032aa8e7c36b33547bddfa49ba7d6ca38c2f7fa4f19474e002
  E06:
    record: sysevent_in_email_action/6e583dffeb6022002a7a666cd206fe85
    how: read Process CAB meeting invite replies
    result: records Accept, Tentative or Decline from the invitation
    hash: 37587f29c9b3528277cdc4d994bedcb35acb2ef644602c59d0279706481de191
  E07:
    record: sys_script/318cdc50d7302200d105ef637e610366
    how: read Sync approval with agenda item
    result: the change's approval and its agenda item decision stay in step
    hash: 4b4df9e7f17d9fef9f8e95e7766954e6fe8f221de09b7b5c903e24a3cf0f028f
  E08:
    record: sys_properties/93d9fcc1b7d822100a11807cae11a995
    field: value
    how: read cab.use_sow_meeting
    result: true; meetings open in the workspace's CAB meeting page
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E09:
    record: sys_app_module/f77c3d27eb32120034d1eeea1206fe36
    how: read Change › My CAB Meetings
    result: meetings you manage or sit on
    hash: 19005ad2142b6dc7efec3d492cb899b42e664c38a457e0d598515bea5c325d5b
---
## Who's on it

A **CAB definition** says which changes go to a board and who sits on it; pdi2 has one, **Network
CAB**, for network changes of higher risk. [E04] Its meetings are run by a **CAB manager** [E05];
members are the board's people and groups, not a role.

## Before the meeting

Members get an invitation with a calendar attachment; answering it records whether you come. [E06]

## In the meeting

Open **Change › CAB Workbench** [E01]: the calendar, then the meeting. [E02] **My CAB Meetings**
lists the ones you are on. [E09] For each change on the
agenda the board can **Approve** or **Reject**, or move on with **Next**, **Pause** or **Demote**.
[E03] The decision becomes the change's CAB approval. [E07] On pdi2 the meeting link opens the
workspace's CAB meeting page. [E08]

### Not yet seen {label=OPEN-QUESTION}

pdi2 has no CAB meeting yet, so the meeting pages haven't been checked on screen.
