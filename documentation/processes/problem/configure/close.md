---
title: Risk, cancel and reopen - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_properties/e457cdb5874023000e3dd61e36cb0bde
    field: value
    how: read problem.acceptrisk.move_to_closed
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E02:
    record: sys_properties/d6e789f5874023000e3dd61e36cb0b8a
    field: value
    how: read problem.closed.role.reanalyze_from_canceled
    result: problem_manager
    hash: 3c421abd171995b4281e188dfc5405b37e5dd9846040416b7510f70413a824e8
  E03:
    record: sys_properties/6548cdf5874023000e3dd61e36cb0bd9
    field: value
    how: read problem.closed.role.reanalyze_from_closed_riskaccepted
    result: problem_manager
    hash: 3c421abd171995b4281e188dfc5405b37e5dd9846040416b7510f70413a824e8
  E04:
    record: sys_security_acl/80acf238c0a801661d96d0359c65c928
    field: script
    how: read the problem write ACL
    result: false on a closed problem while the Madrid state model plugin is active
    hash: c0d28767b261d93896f99da63bec18f0f9f30d96c05149c137a9ff2700449c17
  E05:
    record: sys_script_client/b5e93a71538823004247ddeeff7b12b0
    field: script
    how: read Rename Closed fields on load
    result: close notes become Canceled reason or Risk accepted reason; closed by becomes Canceled by, Marked duplicate by, Completed by or Risk accepted by
    hash: db6f2838fd3e077546bb3d0f0de9fc0e5b4234c8399e5b1288c3be36844d1c12
  E06:
    record: sys_properties/99a90179874023000e3dd61e36cb0b7d
    how: read problem.duplicate.records_to_move
    result: value not in the mirror
    hash: 1b5563d2a3c636b9b84bc332c962c023362cf1b11fa2f805ee7a700b4acccbac
  E07:
    record: sys_script/0f6e097087a313000e3dd61e36cb0b71
    field: script
    how: read Update fields on Re-analyzing a Problem (before update, order 110, state changes from Closed, Resolved or Fix in Progress to Root Cause Analysis)
    result: from Resolved or Closed, stamps reopened at and by, increments reopen count, clears closed and resolved stamps, close notes and resolution code; always clears fix at and by
    hash: e462d1fbdcaaabe9cb6c416e7115184041cedb7980673f6cf88e112cc56171b4
  E08:
    record: sys_script_include/f8b66716871313000e3dd61e36cb0b77
    field: script
    how: read ProblemStateUtilsSNC (canShowAcceptRisk, canMarkDuplicateOrCancel, canReAnalyze)
    result: Accept Risk from Root Cause Analysis or Fix in Progress; Mark Duplicate and Cancel from Assess or Root Cause Analysis; Re-Analyze from Fix in Progress, Resolved, or Closed by the role in the matching property, never for a duplicate
    hash: 8d690cd0a55837e341f6658b47c51560e80fffe2583333d73bbed9fa4a23668e
  E09:
    record: sys_ui_action/39d088a487a313000e3dd61e36cb0bc3
    how: read Accept Risk (form button, order 190)
    result: condition canWrite and canShowAcceptRisk; opens the accept_risk_dialog_form_view dialog when required fields are missing
    hash: 108939f4eef5838b563ef26a23dce698675312dbf57b687e8cc9a8ff3867ea4d
  E10:
    record: sys_ui_action/e7ef379487a313000e3dd61e36cb0bde
    how: read Cancel (problem form button, order 180)
    result: condition canWrite and canMarkDuplicateOrCancel; closes with resolution code canceled through cancel_dialog_form_view
    hash: d93e8718db5ac3a5b70b180e6c1d39403d7b6db0ac4e90f11752e4d0a2eeaebe
---
## Actions

| Order | Action | Condition | Result |
|---|---|---|---|
| 150 | Re-Analyze | `canReAnalyze` [E08] | Root Cause Analysis |
| 160 | Mark Duplicate | `canMarkDuplicateOrCancel` [E08] | Closed, *Duplicate* |
| 180 | Cancel [E10] | `canMarkDuplicateOrCancel` [E08] | Closed, *Canceled* |
| 190 | Accept Risk [E09] | `canShowAcceptRisk` [E08] | Closed, *Risk Accepted* (the property moves it to Closed) [E01] |

## Accepting the risk

Goes straight to Closed. [E01] Re-analyzing a canceled or risk-accepted problem needs the problem
manager role [E02] [E03]; closed problems are read-only. [E04] The close fields are relabelled to
match how it closed. [E05]

## Re-analyzing

**Update fields on Re-analyzing a Problem** (before, order 110) runs when the state moves back to
Root Cause Analysis: from Resolved or Closed it records the reopening and clears the resolution
fields, so the problem can be resolved again. [E07]

## Duplicates {label=OPEN-QUESTION}

Which records move to the original when a problem is marked a duplicate comes from
`problem.duplicate.records_to_move`, readable only by problem managers, and its value was
withheld from the records read. [E06] Platform team: confirm which related records move.
