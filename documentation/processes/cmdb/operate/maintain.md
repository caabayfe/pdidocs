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
