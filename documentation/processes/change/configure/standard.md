---
title: Standard changes - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: std_change_properties/527b5dafff700200b18affffffffff89
    how: read main_config
    result: 'mandatory: short description, description, implementation, backout and test plans, assignment group, justification, risk and impact analysis; tasks: short description and assignment group; read-only: description and the three plans'
    hash: 39349662e87a24e6a9754fc75197244e1e0993e6499babda257baea940e4b41a
  E02:
    record: sys_hub_flow/e89e3ade731310108ef62d2b04f6a744
    how: read Change - Standard
    result: on create, approval=approved, then evaluates the model
    hash: 447f6d4c88af36c747c6613051bc7ee6264e1df07d4c61e1afc4ae50408fc82b
  E03:
    record: sys_script/cfa35b6eb7436010dff9fa13ee11a9df
    how: read Abort insert for inactive Std Change
    result: refuses a standard change from an inactive template
    hash: 05ba6db3fab4e7ddc209773e218d5daf3275924321d8af56af6d42d011d32538
  E04:
    record: std_change_record_producer/df7359bc53231300e321ddeeff7b12f9
    how: read Replace printer toner
    result: a template from the ATF scope sn_change_atf, visible to requesters
    hash: ec4476ec13ac103baf42fff75f95f5b4c8844ad394f947342eabb6cd5bddb3f5
  E05:
    record: sys_properties/067deb0223133010889edc1756bf65b1
    field: value
    how: read com.snc.change_request.standard_change.use_user_criteria
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E06:
    record: sys_hub_flow/665e4a627723021013d4aeb4bb5a994c
    how: read Change - Standard - Proposal
    result: asks the group Change Management to approve a standard change proposal
    hash: e8ef68fa363ca6bd58f0d90402152a5ad945510a3242fcea6d35d2037cb70ae9
---
## Templates and approval

Standard changes are approved on creation by *Change - Standard* [E02], with the mandatory fields
in the main configuration. [E01] Inactive templates can't be used [E03]; who sees a template is set
by user criteria. [E05] Proposals are approved by the **Change Management** group, through
*Change - Standard - Proposal*. [E06]

## An automated-test template {label=OPEN-QUESTION}

*Replace printer toner* comes from the change ATF scope and shows to requesters. [E04] Retire it or
hide it with user criteria.
