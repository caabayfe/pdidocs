---
title: Raising and risk - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_properties/f569ebb1ff24fa101b4bffffffffff4f
    field: value
    how: read com.snc.change_request.next_create_page
    result: true; Create New opens the Next Experience page
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E02:
    record: chg_model/007c4001c343101035ae3f52c1d3aeb2
    how: read the Normal model
    result: default, available in the UI
    hash: 2ed69ed3e8376288d464a35fd5dcce3562112b8c944d100820a95f031bd67207
  E03:
    record: sys_script/b6dae9e15317101034d1ddeeff7b1278
    field: script
    how: 'read Change Model: Check State Transition'
    result: governs changes with a model
    hash: d3b37e4e63f6440f9f305b9946112dd1858f2771f5e3d31b091815d53d85347e
  E04:
    record: sys_script/f3fbe0d8cb200200d71cb9c0c24c9c93
    field: script
    how: read State model - Can change state?
    result: legacy state model, only for changes without a model
    hash: 6371ce117ee5e4dacfdfcab3ca06511dd7d98a1a14afaea400fdf8c227b4bfac
  E05:
    record: sys_properties/d54b38860a0a0b1d003d833b08d8e604
    field: value
    how: read glide.ui.risk_calculate_rule
    result: ui_action
    hash: 4d06d235461558387d51816b10e290f8715ebd60ec44eb4bd605c63daa1a7822
  E06:
    record: sys_script/a6eade070a0a0b1d0177e6b738c4b7d8
    field: script
    how: read Calculate Risk (business rule)
    result: runs only when the property is business_rule, so it does nothing here
    hash: b84ceea4ce887ba1f0fa2a72335afc5d6854029c987e2cedeb9fbc2bb5c7a093
  E07:
    record: risk_conditions/a2e6d7320a0a0b1d01995094c170c6ce
    how: read Insufficient lead time
    result: order 100, risk High
    hash: 3ae8c570f369878ec6bd183b952ba9184fc9281ab9c03633aa564fe96ddbc2b9
  E08:
    record: risk_conditions/a2e959d70a0a0b1d0012b03e8ece3bf5
    field: advanced_condition
    how: read Critical service affected
    result: tests busines_criticality on affected services
    hash: c10fa4fbb8c19b101ac0cc9e2d11e5f805b7b80357d4bed5a3a0ca737ee86499
  E09:
    record: risk_conditions/0efa06e5a681c09f003cadda0b90a9ec
    how: read No expected risk issues found
    result: order 400, risk Low
    hash: 210a2fa326ea62f6c7b849fc597a8b20089c9d9ae400f97c4b1c0c036888e3fc
  E10:
    record: sys_properties/acfabf359f30121065fe946eda0a1cde
    field: value
    how: read com.snc.change_management.risk_conditions.match_all
    result: true; every matching condition counts, the highest risk wins
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E11:
    record: sys_properties/c56c6ddab733130034d1da23ee11a95c
    field: value
    how: read com.snc.change_management.enforce_data_requirements
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## Models

Six change models are active; *Normal* is the default. [E02] With a model, *Change Model: Check
State Transition* polices the states [E03]; the legacy state model only covers changes without a
model. [E04] Create New opens the Next Experience page. [E01] Data requirements (mandatory fields per
state, read-only fields) are enforced. [E11]

## Risk

Risk is calculated only from the **Calculate Risk** link [E05]; the business rule of the same name
is inert. [E06] Four risk conditions apply, from *Insufficient lead time* (High) to *No expected
risk issues found* (Low) [E07] [E09], and all matches count. [E10] No risk assessment or
change-success scoring is installed.

### The field name

*Critical service affected* tests `busines_criticality` [E08]: that is the platform's own field name
on services (with the typo), so the condition works.
