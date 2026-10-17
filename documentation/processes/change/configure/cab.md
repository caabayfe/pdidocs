---
title: CAB - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: cab_definition/30b99b3d93a0220050bef157b67ffb2e
    how: read Network CAB
    result: 'auto-adds changes: type normal or emergency, risk 1 to 3, category Network; 10 minutes per item'
    hash: 43d3b34d595a2a0bd649719313bb13f402e0878b965ee6561af286dabd0c2590
  E02:
    record: sys_script/318cdc50d7302200d105ef637e610366
    how: read Sync approval with agenda item
    result: keeps the change's approval and the agenda decision in step
    hash: 4b4df9e7f17d9fef9f8e95e7766954e6fe8f221de09b7b5c903e24a3cf0f028f
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
---
## Definitions and meetings

The only definition is the demo **Network CAB** [E01]; meetings are business data the mirror
doesn't hold. Decisions in the meeting sync to the change's approval. [E02] Meetings open in the
workspace's CAB meeting page. [E03] The CAB manager role doesn't contain `itil`. [E04]

## Only network changes {label=OPEN-QUESTION}

With one definition limited to *Network* changes, the CAB approvals other changes need have no
board to meet in. Is that intended?
