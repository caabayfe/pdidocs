---
title: Workarounds and known errors - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_script_action/acfd001b536270108b91ddeeff7b12e3
    field: script
    how: read Copy Prb workaround to Inc work notes
    result: on communicate.workaround, a work note on linked incidents up to Resolved
    hash: 06bec9756037b072de4bd8987e71bfc15a76adbbd70b04eb5fc1f6f4c35e737d
  E02:
    record: sysevent_script_action/415bc17a53a823004247ddeeff7b1209
    field: script
    how: read Copy Prb workaround to Inc comments
    result: for resolved Known error incidents; writes work notes because of the property below
    hash: 5571ba6d405d6f0e59b6e9066f0a165b68cd758d9ac72047f64f148062a29933
  E03:
    record: sys_properties/106170f54324561085678772d9b8f2ff
    field: value
    how: read com.snc.incident.communicate_prb_workaround_to_inc_worknotes
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E04:
    record: csm_table_map/bc77a3d0870023000e3dd61e36cb0b93
    how: read Problem Known Error article
    result: problem to kb_template_known_error_article
    hash: f2ac194bd0f688ac30715b171e4e4775e7694db7255315dca6f1eab0eb016b4c
  E05:
    record: sys_script/5da5ffd4870023000e3dd61e36cb0b6a
    field: script
    how: read Link Problem with Primary KE article (kb_template_known_error_article, after insert, order 100, source is a problem)
    result: 'sets problem.primary_known_error_article to the new article and shows "Known Error article … created"'
    hash: b6fbb01664218d399b2e0160f6a65d0c50c58bca3d42590ce548a294c8b15ee0
  E06:
    record: sys_script/877c97b80a0a3c740147ca0a46126576
    field: script
    how: read Problem Create Knowledge (legacy)
    result: active, but tests problem_state 4, which no longer exists
    hash: 433a91792454c92f7a496849c864c41e66cb50846603808da73834945f055c6d
---
## Workaround delivery

Communicating a workaround writes a work note on linked incidents. [E01] A second script action
targets resolved *Known error* incidents and, with the property set, also writes work notes [E02]
[E03]: those incidents can get the note twice.

## Known error articles

The table map creates the article [E04]; inserting it links it back to the problem as its primary article. [E05] The legacy rule *Problem
Create Knowledge* is active but can never fire. [E06]
