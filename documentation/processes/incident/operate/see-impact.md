---
title: See what the incident's configuration item affects
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_declarative_action_assignment/d8b16452439e42102e5e1febb7b8f26d
    how: read CI dependency view (sn_sow_itsm_common)
    result: 'a button with a tree icon beside the Configuration item field, shown when the field has a value; tooltip "Configuration item dependency view"; no role required'
    hash: 89f5400674d4eb93b56dbc428aaa3c5300bfa2bb88a2a7bfe0ed309b7b96358a
  E02:
    record: sys_declarative_action_assignment/5de0705e439e42102e5e1febb7b8f23f
    how: read Service dependency view (sn_sow_itsm_common)
    result: the same button beside the Service field, when it has a value; no role required
    hash: 05805ffb16bde6df2513fc95b706f9aff7a09c28c906d220c22986c78d5e5781
  E03:
    record: sys_declarative_action_assignment/e5219cd8432202102e5e1febb7b8f2b1
    how: read Service offering dependency view (sn_sow_itsm_common)
    result: the same button beside the Service offering field, when it has a value; no role required
    hash: 28a8c082d44de4b431a0a3e00c44b209f6bc2eecb7efc1f14cc3eb7e13129b14
  E04:
    record: sys_declarative_action_payload_definition/2daa3908f8156a10f8775f2783e9b7e8
    field: payload_template
    how: read Open CI dependency view
    result: 'opens the Map page in a new workspace tab titled "Map", centred on the CI, five levels deep (the service and service offering buttons do the same for their field)'
    hash: c5b61f58eaad61f0a6ae0a2a4cda07fb73d89147f17e0c1db50692994cbc42bb
  E05:
    record: sys_ux_app_route/518e5a48f8d56a10f8775f2783e9b748
    how: read the Map route of the Service Operations Workspace
    result: route unifiedmap, which shows the CMDB Unified Map page inside the workspace
    hash: 23242da376b338da5be12f83e43b9bd1af3e56edd3cced60f8a451b6da8a7642
  E06:
    record: sys_ux_macroponent/50182083770d9110960ced43ba5a99a4
    field: required_translations
    how: read the labels of the CMDB Unified Map page
    result: 'Add to map, Open in new map, Apply filters ("Filter CIs by specifying conditions that contain fields, operators, and values."), Preset, Create my preset, Attributes, Related items; also Create or change connection and Delete connection ("Deleting this connection might result in an invalid CMDB state. This action might affect service instances.")'
    hash: df67e18a15ad6accf28c0fbccd246498e2bf62831565cf09826f5af2b585ee74
  E07:
    record: sys_ui_related_list/fa3f3ac143e9d2108c5fa32d68b8f24b
    how: read the related lists of the incident in the Service Operations Workspace view
    result: 'Affected CIs (task_ci) second after the SLAs, then Impacted Services/CIs (task_cmdb_ci_service); Outages (task_outage) and Locations (task_location) further down'
    hash: 73b1913c826b56fe758873726968b365bd03b5c7b29643ed2b24831c520ea8ba
  E08:
    record: sys_ux_macroponent/f94d88d57341301045216238edf6a718
    field: required_translations
    how: read the labels of the Incident Overview page (sn_sow_inc)
    result: 'an Impact section with Affected CIs, Impacted Services/CIs and Assets, "View impacted locations", and an Impact Summary to edit and save'
    hash: d4f725611c22de16ec619bce65306d635223e69eab038cf310cb9dd0311a49cd
  E09:
    record: sys_ux_client_script/725abcff77523010012f06e57b5a99db
    field: script
    how: read Set Impact Related lists (Incident Overview)
    result: the Impact section shows Affected CIs, Impacted Services/CIs, and Assets (the affected CIs that have an asset), opening on Affected CIs
    hash: fa1dac3cdb8f5fa7ff29cb44a35e55269538dba1a8281805cac16e006e263a4c
  E10:
    record: sys_script/6f8daf204a3623120146c79f308310df
    field: script
    how: read Sync CI with Affected CIs (after insert and update on task, when the CI changes)
    result: the incident's CI is added to Affected CIs; when the CI is changed, the old one is removed
    hash: 75404bfd298fb51c68a4ccf3ecb43d59b2300738f5c3140db75bedcff9e6ca04
  E11:
    record: sys_script/429f991b0b323200ed45478d83673ac5
    field: script
    how: read Sync BS with Impacted Services (incident, problem, change)
    result: the incident's Service is added to Impacted Services/CIs; when it is changed, the old one is removed
    hash: 3ea8adcb1badaeb1abb97de5ba5d558f06e58aa1d9beb12b8b176b676be3aa7c
  E12:
    record: sys_declarative_action_assignment/c46bdcc07321301045216238edf6a7ba
    how: read Add on Affected CIs in the Incident Overview view (sn_sow_inc)
    result: shown while the incident is active; no role required
    hash: 1b45740efc25873adc72e6fb0c3de4410545e5187b0a7779b5e3a5d07d0bfa4f
  E13:
    record: sys_declarative_action_payload_definition/d46c98047321301045216238edf6a7c7
    field: payload_template
    how: read Task CI MRA
    result: 'Add opens a picker of configuration items, filterable by Configuration Class'
    hash: 8d4694c29123a025718fb6db49057c1e3668dcde6ab79ae1a96f7c2d3715fcdc
  E14:
    record: sys_declarative_action_assignment/d805f3c07321301045216238edf6a7ff
    how: read Add on Impacted Services/CIs in the Incident Overview view (sn_sow_inc)
    result: shown while the incident is active; opens the same configuration item picker
    hash: 90f82ef19e4c4185ddcd6e462f550616fdbb33504dbcf35cf1f7345e812555dc
  E15:
    record: sys_declarative_action_assignment/ed88bf447321301045216238edf6a705
    field: server_script
    how: read Remove on Affected CIs in the Incident Overview view (sn_sow_inc)
    result: '"A task''s primary CI cannot be removed from Affected CIs - change or remove the CI from the task form instead"; other rows are removed'
    hash: 8e93e259e83475e32de1c836c55919f3f84bc4cb3237b82757a6779e896360a0
  E16:
    record: sys_declarative_action_assignment/606dd806531001100999ddeeff7b124c
    how: read Refresh impacted services (sn_sow_inc, Impacted Services/CIs)
    result: for itil and sn_incident_write, when incident is listed in com.snc.task.refresh_impacted_services
    hash: 868fdcf3046e5fa753b8a65faa442bfa6a67691098b17002499bb265b1f0afe0
  E17:
    record: sys_script_include/1cf5818a878010100e3dd61e36cb0b4a
    field: script
    how: read TaskUtilsSNC.refreshImpactedServices
    result: 'the refresh runs in the background and ends with the message "Refresh impacted services for {number} has completed"'
    hash: fb29844c2ed2602a3fab55d939a18eca34518a7f8a0a36f797fc2fad4a4e3f7c
  E18:
    record: sys_script_include/c93a87d20a0a0b1d0196af61b0ca8db5
    field: script
    how: read CIUtils.refreshImpactedServices
    result: removes the impacted services that were not added by hand, then adds the services the incident's CI affects
    hash: d0ffe3a4077a604252a5612b8e3c35150410e6b62b0b3444edcbd8ba1ffeec31
  E19:
    record: sys_properties/75e8df71874010100e3dd61e36cb0b6e
    field: value
    how: read com.snc.incident.refresh_impacted.include_affected_cis
    result: "false: on an incident, the refresh starts from the incident's CI only, not from every affected CI"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E20:
    record: sys_declarative_action_assignment/fe3d9a487331301045216238edf6a7ff
    how: read Add on Affected CIs in the Service Operations Workspace view (sn_sow_itsm_common)
    result: shown only when the incident is active and its table is listed in com.snc.task.associate_ci (the same condition for Add and Remove on Impacted Services/CIs)
    hash: abcc86f89b332ce80a2d906d80face670ee6860cd3900e40f3729e7119e93efe
  E21:
    record: sysevent_email_action/8e0a46fa0a0a0286002d78c0934d827c
    how: read CI affected
    result: 'active and subscribable: "Your Subscribed CI {CI} is being affected by {number}"'
    hash: 42e869520ab18888b59f30ba6e7bcc7a19a431202840130782f409c14a8d42d5
  E22:
    record: sys_script/09fa6af10a0a0b1d00c6605ebe45bc26
    how: read Affected ci notifications (after update on task, when the state changes)
    result: when the state of an incident with affected CIs changes, the people subscribed to those CIs are told
    hash: f9192aa35a00764f668dcce9699740387572c5d5b23084b7435d48fb6ca15dad
  E23:
    record: sys_declarative_action_assignment/77291ca1a3320210ebb11e3f26fcdad6
    how: read Create outage (sn_sow_inc, Outages list)
    result: shown in the Service Operations Workspace view with no condition and no role
    hash: 1292783c440ea0b09b645cc11430b14b16bc0403277f44552c4535a3f3df46ae
  E24:
    record: sys_ux_macroponent/5e1e4acc43010210aca28772d9b8f24c
    field: required_translations
    how: read Impacted locations SNC
    result: 'Impacted locations, "No data available."'
    hash: ad2cd9da051644670652de0806d908692260b786b4df4913909bf5da82f3de66
---
## When to use it {label=NEW}

An incident usually names one **Configuration item** (the server, application or device that
fails) and one **Service**. Before you set the impact, or when calls keep coming in, look at what
else depends on that item: other services, other users, a whole site. The workspace gives you
three ways:

| You want to | Use |
|---|---|
| see the item's upstream and downstream connections | the **dependency view** button beside the field [E01] |
| keep a list of what the incident touches | **Affected CIs** [E07] |
| keep a list of the services hit | **Impacted Services/CIs** [E07] |

What you find feeds the **Impact** you choose (see [Set the priority](see:prioritise)). The CMDB
side of the same views is in [See what depends on a configuration item](see:cmdb/impact).

## Open the dependency view {label=NEW}

{{animation:incimpact}}

1. Open the incident in the Service Operations Workspace and fill **Configuration item** (or
   **Service**, or **Service offering**).
2. Choose the tree icon beside the field: **CI dependency view**, **Service dependency view** or
   **Service offering dependency view**. It appears only when the field has a value, and needs no
   special role. [E01] [E02] [E03]
3. A **Map** tab opens in the workspace, centred on that item and showing five levels of
   connections around it. [E04] [E05]
4. Use **Apply filters** to narrow the CIs by field, and **Open in new map** to centre the map
   on another CI. **Related items** and **Attributes** show more about a selected CI. [E06]

The map can also create and delete connections between CIs, and warns that deleting one "might
result in an invalid CMDB state". [E06] Leave the CMDB's relationships to its owners: if a
connection looks wrong, tell the CI's support group instead of fixing it from the incident.

## Keep the affected and impacted lists {label=NEW}

The incident keeps two lists, both on the record's related lists and in the **Impact** section of
the incident overview. [E07] [E08] [E09]

- **Affected CIs**: what the incident touches. The incident's own CI is added for you, and
  replaced when you change the CI. [E10]
- **Impacted Services/CIs**: the services hit. The incident's **Service** is added for you in the
  same way. [E11]
- **Assets**, in the overview: the affected CIs that have an asset record. [E09]

To add more, in the overview's Impact section, choose **Add** on the list and pick configuration
items; filter by **Configuration Class** to find them faster. [E12] [E13] [E14] **Remove**
takes rows away, except the incident's own CI: change or clear the field on the form instead.
[E15] Both buttons appear only while the incident is active. [E12] [E14]

On the related lists of the main form, **Add** and **Remove** on these two lists appear only if
the platform team has switched list editing on for incidents. [E20] The mirror can't show whether
it is (see the open questions).

### Refresh the impacted services

**Refresh impacted services** on the Impacted Services/CIs list (for agents with the `itil` or
`sn_incident_write` role) rebuilds the list from the services that the incident's CI affects. [E16]
[E18] It runs in the background; you get *"Refresh impacted services for INC… has completed"*.
[E17] Services you added by hand stay. [E18] On pdi2 it starts from the incident's CI only, not
from every affected CI. [E19]

## Outages and locations {label=NEW}

- **Outages**: record that a CI was down, with **Create outage** on the Outages list. [E07] [E23]
- **View impacted locations**, in the overview, lists the locations hit. [E08] [E24]

## Who is told {label=NEW}

People can subscribe to a configuration item. When the state of an incident with affected CIs
changes, they get *"Your Subscribed CI … is being affected by INC…"*. [E21] [E22] So keeping
Affected CIs right also tells the CI's subscribers.

## Tips

- Set the CI before you open the view: the button isn't there while the field is empty. [E01]
- An affected CI with many dependants is a reason to raise the impact, or to propose a major
  incident (see [Escalate an incident](see:escalate)).
- Prefer **Refresh impacted services** to adding services one by one, then add by hand only what
  the CMDB doesn't know.

## Not yet seen {label=OPEN-QUESTION}

1. None of these screens were opened on 2026-10-18. Does the **Map** tab open from the CI field
   on pdi2, and how much of the CMDB does it show for the demo CIs?
2. Which view do resolvers work in: the incident overview with its **Impact** section, or the
   main form's related lists? The Add and Remove buttons differ between them. [E12] [E20]
3. Is incident listed in `com.snc.task.associate_ci` and `com.snc.task.refresh_impacted_services`?
   The mirror doesn't hold their values, so it can't show whether Add, Remove and Refresh are
   offered. [E16] [E20]
4. Does anyone subscribe to CIs, so that the *CI affected* email reaches someone? [E21]
