---
title: Keep your configuration items right
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_app_module/21e0c9185312301071b9ddeeff7b1270
    how: read the module CMDB Workspace
    result: /now/cmdb/home, for sn_cmdb_user
    hash: d061b23b693f86336fe1469b11f4c4c4cf026bb8187899b67547fc77dec08ffd
  E02:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'CMDB Workspace home'
    how: 'opened the workspace'
    result: 'My work shows Open tasks and Overdue tasks; Intelligent search'
  E03:
    record: sys_security_acl/3a28e3e0730203000d72a56a4cf6a71b
    how: read the cmdb_ci write ACL for certification
    result: certification role may edit CIs it owns
    hash: d8bd93d5337b8873b94d48278946de896be5da696c73f12445835b848def4859
  E04:
    record: cert_audit/fd030171dfa0010068c37a0d3df263c7
    how: read the certification audit Critical Business Services
    result: weekly, assigned to Managed by
    hash: 2869d177d7094084ab41f7d6124862447cb0871a24eeef331b6bfd5583ad2550
  E05:
    record: sysevent_email_action/6a6508b6df11210068c383f36bf26324
    how: read Notify attestation recipient
    result: emails the person asked to attest
    hash: ca6e3347cb89ce6776fff2f3d721f396e737eb7e95e9dbe520a54287a617c0a6
  E06:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: CMDB Workspace › a service CI (cmdb_ci_service)
    how: opened a service CI from the workspace and looked at its header and More actions
    result: 'header: Open map; More actions: Configure attributes, Configure resources; sections Summary, Attributes, Tags, Resources, Activity, Relationships, Services and Offerings, Health; no Create incident or Create change'
  E07:
    record: sys_properties/88e57eecffa0a2105872ffffffffffb7
    field: value
    how: read sn_cmdb_ws.explore_ci.record.enabled
    result: 'true: CIs open on the new CI page instead of the form'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E08:
    record: sys_ux_client_script/8fefdd1ea3f3121066189bd2361e61fc
    field: script
    how: read Redirect cmdb ci, on the CMDB Workspace's record page
    result: a saved record of any class under cmdb_ci is sent to the CI page (route ci-record) when the property is true; only a new record stays on the form
    hash: dfd79c6ecd04acdd8edd492027cabe6f35351a25d5688b71510fc585b3fe1a41
  E09:
    record: sys_ux_client_script/3a3f51654f352210a27b87af20ce0b6f
    field: script
    how: read Set configuration actions, on the CI page header
    result: 'Configure attributes for admin, maint or personalize_form; Configure resources for admin, maint or personalize_list; nothing else in that menu'
    hash: 62640e330ea72e8a53f48605ab9d81bd16266c33139f2129880c47f4ba3e9181
  E10:
    record: sys_ux_macroponent/d5da4451a367121066189bd2361e6170
    field: composition
    how: read Explore CI Header Default
    result: 'the header holds the CI''s name and class, the Open map button (route unifiedmap) and the configuration menu; no Create incident, Create change or dependency view button'
    hash: 83c3227274cf7640cfbe38985f6c81b0e7401bb5f33a938e26c6e1e32aebe0a5
  E11:
    record: sys_ui_action/f9c2f25ab710301094bb21208e11a9b7
    how: read Create incident (sn_cmdb_pg_templts, table cmdb_ci)
    result: 'form button for the form view CMDB - Workspace (cmdb_browse); opens a new incident with this CI; condition: can create incidents and has sn_incident_write'
    hash: 5af5814b0347b201495a870ddd55ca2827de1374c3aeae47ad92fa5713698a78
  E12:
    record: sys_ui_action/e7bef692b750301094bb21208e11a9c9
    how: read Create change (sn_cmdb_pg_templts, table cmdb_ci)
    result: 'form button for the same view; opens a new change with this CI; condition: can create changes'
    hash: 4ee298431bf793d4df3c6edc4dcd4e5029469515dba7f1191e01c2a2384dcc27
  E13:
    record: sys_ui_action/81c5badab710301094bb21208e11a92d
    how: read Open dependency view (sn_cmdb_pg_templts, table cmdb_ci)
    result: form button for the same view, on saved CIs; opens the classic dependency view ($ngbsm.do) for the CI in a new tab
    hash: 7cdefb450963081614dae34ad7e43f961d5c0a59bd7532fe45003b23ed0da6b4
  E14:
    record: sys_properties/6fd83eec5b020110693e7da52d81c738
    field: value
    how: read glide.identification_engine.multisource_enabled, which View CMDB 360 Data needs
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
---
## Your CIs

{{animation:cmdbmaint}}

Open the **CMDB Workspace** [E01]: **My work** lists the tasks waiting for you, and **Intelligent
search** finds a CI by name. [E02] Keep these right on each CI you own: the **Support group**, the
**Change Group**, **Owned by**, and its statuses (see [Who owns what](see:ownership)).

## Certification

Certification audits check CI data on a schedule, such as **Critical Business Services** every
week, assigned to the CI's *Managed by*. [E04] You're emailed when asked to attest [E05]; you can
edit the CIs you own to fix what the audit finds. [E03]

## A CI's page in the CMDB Workspace {label=NEW}

Opening a CI in the CMDB Workspace shows the **CI page**: the sections **Summary**, **Attributes**,
**Tags**, **Resources**, **Activity**, **Relationships**, **Services and Offerings** and
**Health**. [E06] Its header has:

| Button | What it does | Who sees it |
|---|---|---|
| **Open map** | opens the unified map, centred on the CI | everyone [E06] [E10] |
| **More actions › Configure attributes** | changes which fields the page shows | admins, `personalize_form` [E09] |
| **More actions › Configure resources** | changes the related lists under **Resources** | admins, `personalize_list` [E09] |

That is all, for **every** class of CI, not only services. [E06] [E10] [Q16]

### Create incident and Create change don't show {label=NEW}

The CMDB Workspace also has form buttons **Create incident**, **Create change**, **Open dependency
view** and **View CMDB 360 Data**. [E11] [E12] [E13] They belong to the older CI form, and on pdi2
CIs always open on the CI page instead [E07] [E08], so you won't see them. [Q02] **View CMDB 360 Data**
would stay hidden anyway: multisource data is switched off. [E14]

Instead:

- **To raise an incident or a change for a CI**, create it from the incident or change list and
  set the configuration item there: see [Choose the right configuration item](see:cmdb/choose-ci).
- **To see dependencies**, use **Open map** on the CI page, or the dependency view from a ticket:
  see [See what depends on a configuration item](see:cmdb/impact).
- **To create a CI**, see [Create a configuration item](see:cmdb/create-ci).
