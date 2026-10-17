---
title: Communication - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/1d55de4b83f78310292aca75eeaad3d0
    how: read incident_alert (Incident Communication Plan)
    result: extends comm_plan; types Business and Technical Communication
    hash: eabd42d393b3dc295d710f17b430861b238a66f6e668823c62fbfb71d5d84833
  E02:
    record: sys_db_object/0255128b83f78310292aca75eeaad379
    how: read incident_alert_task (Incident Communication Task)
    result: extends comm_task; types Initial Notification, Send Update, Resolution Notification, Initiate conference call, Status Page Update, IVR Update
    hash: 433413fb0bb4a345538cffd0c593f468a9f842fc020bc2b14ca9a7b84882456a
  E03:
    record: sys_script/1953a23e5b3b0300e3cc8e6541f91a3a
    field: script
    how: read Attach Communication plans (task, async)
    result: attaches plans whose definitions match the record
    hash: d3481d01605405c79cff65ba17445cfbeb4af31b6edf772253b698fed91ef5fc
  E04:
    record: sys_script/a433f9d553701300d6fdddeeff7b121b
    how: read Auto Assignment of ICP
    result: a plan on an accepted major incident inherits its group and assignee
    hash: d01f7d466a3d4476abb961f68e0e7ab70065c31adf1129b15a5974e1414e3e7f
  E05:
    record: sys_declarative_action_assignment/a8b7c3f0a37002101509d63f26fcda17
    field: script_condition
    how: read Open new communication modal
    result: needs com.snc.iam, itil (or incident read roles) and ia_admin
    hash: c7084a4463ba956ef7c3f05cc8d91a81f5ac3aaf65a4d22af8c6365301ae1f21
  E06:
    record: sys_properties/f4202de587dea110de52a64d0ebb35c3
    field: value
    how: read com.snc.iam.default_email_recipient_field
    result: bcc
    hash: a9b8efc5a481ac393e6fad94441247d18cc508a740ea59b83fc31cae7db4eb48
  E07:
    record: sys_properties/5a6d11fb87e833000e3dd61e36cb0b5c
    field: value
    how: read com.snc.iam.enable_notify
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E08:
    record: sys_properties/5aefbb67871b030055c9d61e36cb0bc6
    field: value
    how: read com.snc.incident.incident_alert.closure
    result: false, so closing the incident doesn't close its plans
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E09:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Communication Plan Definitions list, table incident'
    how: 'opened the list'
    result: 'No records to display'
---
## Plans and tasks

Plans are `incident_alert` [E01] with tasks in `incident_alert_task` [E02]. A business rule
attaches plans whose definitions match the incident [E03]; a plan on an accepted major incident
inherits its group and assignee. [E04] Closing the incident doesn't close its plans. [E08]

## Who may send

*Create new communication* in the workspace needs `ia_admin` [E05], which the major incident
manager, communication manager and incident manager roles contain.

## Delivery

Emails go to blind copy [E06]; Notify (SMS, conference) is off. [E07]

## Plan definitions {label=CORRECTED}

pdi2 has **no plan definition for incidents** [E09], so no plan attaches by itself: every
communication is created by hand with *Create new communication*.
