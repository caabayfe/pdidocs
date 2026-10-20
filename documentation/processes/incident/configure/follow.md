---
title: Following an incident - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_script/2bc2f9b1c0a801640199f9eb0067326e
    field: script
    how: read the before-query rule incident query
    result: without itil or sn_incident_read, interactive sessions see caller_id = me OR opened_by = me OR watch_list contains me; not restricted at all for service_viewer, sn_sow_srm.srm_responder, and with their plugins active wm_ext_agent (sn_fsm_itsm_mng), sn_hamp.ham_user (com.sn_hamp), sn_ot_incident_read (com.sn_ot_inc_mgmt)
    hash: ad5e561c6e03bfd11c79d467397c72a763bb6d7e39e7929f893fea7c25750e72
  E02:
    record: sys_app_application/08771d0cc0a8016401f604303b94b999
    how: read the Self-Service menu (no roles)
    result: modules Incidents (caller is me, active) and Watched Incidents (watch list contains me), view ess
    hash: 36b109d6761083b0a25735e87e2b20f7ed0c82455f1c5dabb0d4da63f020e027
  E03:
    record: sys_ui_section/4fc4979ec0a8016401e142a5a0c599ce
    how: read the ess view of the incident form
    result: number, caller, watch list, opened, closed, urgency, state, hold reason, short description, comments, activity; no work notes
    hash: 76601a13dbc57e55dfb160f390ef8e7828dc50f9f6eb87f406b08292418a0bfa
  E04:
    record: ticket_configuration/33ad80e787f10010e0ef0cf888cb0b87
    how: read the standard ticket configuration (scope sn_std_tkt)
    result: info fields caller_id, urgency, cmdb_ci, assigned_to; actions Resolve (caller and canResolveIncident), Reopen (caller or opener and canReopenIncident), Close (canCloseIncident)
    hash: 7881cdd31f9224ee69f625337c149b1ee29ced966ed47a57c97e19818f0ea831
  E05:
    record: sys_script/162581e087133200b4ae6c5837cb0b1a
    how: read Incident State Change to In Progress
    result: before update; comments change, state 3, hold reason 1, caller is me; template state=2, incident_state=2
    hash: f4a62fc198d894d826c0208e5e0e606e78139e16118c59d6c52e02bd8be29828
  E06:
    record: sysevent_email_action/fc78e05653a6301001b2ddeeff7b128d
    how: read Comment left on incident
    result: event incident.commented, to the caller
    hash: d097069e0b8fbd39394376644766e8aa8a70426cb0bf04e7baed8585f52a7272
  E07:
    record: asmt_condition/249e70b0875013005d90bba826cb0bbf
    how: read ITSM Demo Survey
    result: when state changes to 7, to the caller, 100% of incidents, smiley-face survey, 30 days to answer
    hash: 56d602bed36bac7aac90a4b4aa914cd5f9ff5ebf9f4b34a6d20708364b88eb7a
  E08:
    record: sys_script/28beab035f201000b12e3572f2b477ed
    how: read Caller Close
    result: when the caller resolves or closes, close code defaults to Resolved by caller and notes to Closed by Caller
    hash: 527f35a8727133dd4c175328b497004453f9045b2d6fc88adbd1bd6a3b50818c
---
## What the caller sees

Query restriction for non-agents: they see only incidents they are the caller of, opened, or
watch. [E01] Self-Service menu modules. [E02] The self-service form
view has comments but no work notes. [E03] The portal ticket page and its actions. [E04] [Q76]

### Roles that see every incident

These roles skip the restriction and can read **all** incidents, without `itil` or
`sn_incident_read` [E01]:

| Role | Condition |
|---|---|
| `service_viewer` | always |
| `sn_sow_srm.srm_responder` | always |
| `wm_ext_agent` | plugin `sn_fsm_itsm_mng` active |
| `sn_hamp.ham_user` | plugin `com.sn_hamp` active |
| `sn_ot_incident_read` | plugin `com.sn_ot_inc_mgmt` active |

Review who holds them: incidents can carry personal and security details. The restriction also
applies only to interactive sessions; integrations and scripts aren't filtered by it. [E01]

## Caller interactions

| Interaction | Effect | Record |
|---|---|---|
| Comment while Awaiting Caller | state back to In Progress | [E05] |
| Any comment by support | caller emailed | [E06] |
| Caller resolves | close code *Resolved by caller* | [E08] |
| Incident closed | smiley survey to the caller | [E07] [shared/Q08] |
