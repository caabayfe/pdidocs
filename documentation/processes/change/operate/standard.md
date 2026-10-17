---
title: Use a standard change
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_app_module/022f2aa293b002002dcef157b67ffb15
    how: read Change › Standard Change › Standard Change Catalog
    result: opens the catalog category Standard Changes
    hash: 2984ee0f5bb85c90690a11e31c2cd6b51ff4504c188d38b27a48580138fa5c13
  E02:
    record: sc_category/b0fdfb01932002009ca87a75e57ffbe9
    how: read Standard Changes
    result: subcategories Network Standard Changes and Server Standard Changes
    hash: d8377c319f9946b00d483f6fa5401e4a1b98cf06cf59ac1b351457d4fced47b0
  E03:
    record: std_change_properties/527b5dafff700200b18affffffffff89
    how: read main_config
    result: required on a standard change; short description, description, implementation, backout and test plans, assignment group, justification, risk and impact analysis
    hash: 39349662e87a24e6a9754fc75197244e1e0993e6499babda257baea940e4b41a
  E04:
    record: sys_hub_flow/e89e3ade731310108ef62d2b04f6a744
    how: read the flow Change - Standard
    result: approves the change when it is created
    hash: 447f6d4c88af36c747c6613051bc7ee6264e1df07d4c61e1afc4ae50408fc82b
  E05:
    record: sys_ui_action/2c087b1f936002003b7a7a75e57ffb8f
    how: read Propose a Standard Change Template
    result: form menu, on changes that aren't standard
    hash: f2af246c55e23f4902199c9e415f955d19d2156345c1ae95e52fac0260ba44c7
  E06:
    record: sc_cat_item_producer/cb2a927f935002003b7a7a75e57ffb4c
    how: read Propose a new Standard Change Template
    result: a catalog item in Template Management
    hash: 848d1894c3b7329056cb91fbf0616292b5385ec2d36da082bf5869a2db23f69f
  E07:
    record: std_change_record_producer/df7359bc53231300e321ddeeff7b12f9
    how: read Replace printer toner
    result: an automated-test template (scope sn_change_atf)
    hash: ec4476ec13ac103baf42fff75f95f5b4c8844ad394f947342eabb6cd5bddb3f5
  E08:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Change › Create New'
    how: 'read the cards'
    result: 'standard changes Add network switch to datacenter cabinet, Reboot Windows Server, Decommission local office Domain Controller, Change VLAN on a Cisco switchport, Clear BGP sessions on a Cisco router, Replace printer toner'
---
## What's available

Standard changes are routine work done the same way every time, already approved. Find them on
**Create a change request** or under **Change › Standard Change › Standard Change Catalog**, in
*Network* and *Server* standard changes. [E01] [E02] [E08]

| Network | Server |
|---|---|
| Add network switch to datacenter cabinet | Reboot Windows Server |
| Change VLAN on a Cisco switchport | Decommission local office Domain Controller |
| Clear BGP sessions on a Cisco router | |

*Replace printer toner* also shows, but it is a template for automated tests. [E07]

## Use one

Choose it, complete the required fields (description, the plans, the assignment group, the
justification and the risk analysis) [E03], and submit. It is approved at once [E04] and goes to
*Scheduled*: carry on with [Schedule and implement](see:implement).

## Propose a new one

When you do the same normal change often, propose it as a standard: **Propose a Standard Change
Template** from a change's menu [E05], or the catalog item **Propose a new Standard Change
Template**. [E06] The change manager approves proposals.
