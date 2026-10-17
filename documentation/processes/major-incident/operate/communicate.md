---
title: Communicate
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_declarative_action_assignment/a8b7c3f0a37002101509d63f26fcda17
    how: read Open new communication modal (workspace)
    result: Create new communication, on active incidents, for users with ia_admin
    hash: 85bd83856a161f7151e0b354051dfa9542e5e1c5b9146ecf365732b6c48190e9
  E02:
    record: sys_user_role/78e83d9687480300b4ae6c5837cb0b14
    how: read communication_manager
    result: contains itil, ia_admin and comm_plan_viewer
    hash: 1cf8c88f3ae49c2d511c737cccfdff13fad0f83f2697d194a12085ae12560e52
  E03:
    record: sys_email_client_template/7fa8e20a870103006fb5d61e36cb0b1d
    how: read Initial communication (Business)
    result: 'subject "Service Interruption - <short description>"'
    hash: a97706f4c8e0dbadb7c30278abb7520089ad66f497ce40d46c2ce85db71000ce
  E04:
    record: sys_email_client_template/2189660a870103006fb5d61e36cb0b1d
    how: read Business Update
    result: 'subject "Update: Service Interruption - <short description>."'
    hash: 9bee54e2e014f7a63d0c2cc0dcab40442d987fcb2c5fc7a91d4bf604cce87ab1
  E05:
    record: sys_email_client_template/7c1aa60a870103006fb5d61e36cb0b79
    how: read Resolution Communication (Business)
    result: 'subject "Recovered Service - <short description>."'
    hash: 57dcbd66969431174d115ca304a3f975beaa9d7685b79ab64a42aa4ef1343d8b
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
    result: false, so SMS and conference calls through Notify are off
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E08:
    record: sys_app_module/043c16c853081300fc91ddeeff7b129a
    how: read the module Communication Plan Definitions
    result: the plans that can attach to incidents
    hash: 835f2508eb01ce78ba0aa423bbb3284815d2464a6427c13a55a8e7bfbe2d2099
  E09:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Communication Plan Definitions list, table incident'
    how: 'opened the list'
    result: 'No records to display'
---
## Communication plans

A **communication plan** on the major incident holds the **communication tasks**: the initial
notification, updates and the resolution notice, each for business or technical readers. Plans
attach to the incident from their definitions (**Major Incidents › Communication Plan
Definitions**). [E08] pdi2 has **none** for incidents [E09], so start each communication yourself.

## Send a communication

In the workspace, choose **Create new communication** in the incident's ⋯ menu. It is offered to
communication managers and major incident managers, not to every agent. [E01] [E02]

Emails start from templates:

| Template | Subject |
|---|---|
| Initial communication (Business) | *Service Interruption - …* [E03] |
| Business Update | *Update: Service Interruption - …* [E04] |
| Resolution Communication (Business) | *Recovered Service - …* [E05] |

The technical templates add the business impact, the groups involved, the conference details and
the actions taken. Recipients are put in **blind copy**. [E06] SMS and conference calls through
Notify are switched off on pdi2. [E07]
