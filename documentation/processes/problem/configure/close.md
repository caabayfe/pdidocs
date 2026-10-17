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
---
## Accepting the risk

Goes straight to Closed. [E01] Re-analyzing a canceled or risk-accepted problem needs the problem
manager role [E02] [E03]; closed problems are read-only. [E04] The close fields are relabelled to
match how it closed. [E05]

## Duplicates {label=OPEN-QUESTION}

Which records move to the original when a problem is marked a duplicate comes from a property
whose value isn't in the mirror. [E06]
