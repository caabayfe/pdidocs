---
title: CIs on tickets - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_script_include/1cf5818a878010100e3dd61e36cb0b4a
    field: script
    how: read TaskUtilsSNC getConfigurationItemFilter
    result: excludes offerings; for incident and problem, CIs in states not allowed for new tasks
    hash: fb29844c2ed2602a3fab55d939a18eca34518a7f8a0a36f797fc2fad4a4e3f7c
  E02:
    record: sys_properties/1f2f01ce878010100e3dd61e36cb0b63
    how: read com.snc.task.principal_class_filter
    result: empty; no principal-class filter
    hash: 9108e266319b4395cc9c1712431253ff5baf46153934eb4db2d7fc4816b3c214
  E03:
    record: sys_script/27453ac6b73610102d2fbc16de11a937
    field: script
    how: read Populate Assignment Group based on CI/SO
    result: before insert and update, order 100; support_group for incident and problem, assignment_group for change
    hash: 0e3a958914d0876724533ef5bbe26decbf83e5305e020f9e5a2edcf725aa487c
  E04:
    record: sysrule_assignment/5f516f38675432004792adab9485efce
    how: read the assignment rule Database Problem
    result: problems on database CIs
    hash: 9c5e538d6c55702ea02f3f6e50bc993afa57a6d90182855e210793f99fb7f6c6
---
## Lookup and routing

The CI lookup excludes offerings and unusable states [E01]; no principal-class filter is set. [E02]
Routing from the CI fills the group from `support_group` or, for changes, `assignment_group` (the
*Change Group*). [E03] Two assignment rules route problems by CI class. [E04]
