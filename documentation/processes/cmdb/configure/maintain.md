---
title: CI data and access - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_security_acl/8befa3be0a0a0b44015ec85eea1ca44c
    how: read the cmdb_ci write ACL for asset and itil
    result: itil can edit CIs
    hash: e5a5f132a1148fca2248f7f35bcba146c3e0c1433eee17be52f9981a964f5c3d
  E02:
    record: sys_security_acl/8bee9ba70a0a0b44001693883b4358bf
    how: read the cmdb_ci create ACL for asset and itil
    result: itil can create CIs
    hash: 1a5e6b95f6e619ed6c9975b1f90029cf2324373c51d85677bf6a6ecaa0ce471b
  E03:
    record: sysauto_script/dafaa231b7862210e1a480408e11a9b4
    how: read Remove CMDB Roles from ITIL roles…
    result: an on-demand job that would limit CI editing to the CMDB roles; not run
    hash: d26b960f66ccd29f670b95e3fd03a8ab408eadf39ab3a65ffabd292691b84907
  E04:
    record: sys_dictionary/a6023a7b8c9103100a22deb6dd2b4e33
    how: read cmdb_ci.support_group
    result: Support group
    hash: 8b955b25b82919d339234d4bced5973f057c5757c25479458bcfa532b5e002c1
---
## Who can edit CIs {label=OPEN-QUESTION}

Anyone with `itil` can create, edit and delete CIs [E01] [E02]. The platform offers a job that
moves those rights to the CMDB roles [E03]; it hasn't been run. Should the service desk keep
editing CIs?

## Data owners

Ask CI owners to fill the **Support group** [E04] and Change Group: on pdi2 most CIs have neither.
