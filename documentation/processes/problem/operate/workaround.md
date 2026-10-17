---
title: Share a workaround and known error
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/d8677a7d870023000e3dd61e36cb0b72
    how: read Communicate Workaround
    result: when the workaround is filled; stamps who and when; message "Workaround communicated"
    hash: edc2a02886ea99c7a3dc658530177b8abc565c663c1522001b0413a2d82ff528
  E02:
    record: sysevent_script_action/acfd001b536270108b91ddeeff7b12e3
    field: script
    how: read Copy Prb workaround to Inc work notes
    result: '"Workaround shared from PRB…" as a work note on linked incidents up to Resolved'
    hash: 06bec9756037b072de4bd8987e71bfc15a76adbbd70b04eb5fc1f6f4c35e737d
  E03:
    record: sys_ui_action/bdebeb14870023000e3dd61e36cb0b14
    how: read Create Known Error article
    result: when the problem has no known error article yet
    hash: e4454d00d5facbb0eee0a2fc989afe5093fbd4c2326764dcfbd2c5edb75730e9
  E04:
    record: csm_table_map/bc77a3d0870023000e3dd61e36cb0b93
    how: read the Problem Known Error article map
    result: copies the problem statement, description, cause notes and workaround into the article
    hash: f2ac194bd0f688ac30715b171e4e4775e7694db7255315dca6f1eab0eb016b4c
  E05:
    record: sys_script/5da5ffd4870023000e3dd61e36cb0b6a
    field: script
    how: read Link Problem with Primary KE article
    result: saving the article sets it as the problem's primary known error article
    hash: b6fbb01664218d399b2e0160f6a65d0c50c58bca3d42590ce548a294c8b15ee0
  E06:
    record: sysevent_script_action/888ecda493131210c3bbf04e64891829
    field: script
    how: read Show primary KE article in Inc worknotes
    result: '"Known Error article created against PRB…: KB…" on linked incidents'
    hash: d5b9a2b11577b0c79faccce4fcb0b60f465184f4fce4ccf18c0e47232b27467e
  E07:
    record: sys_properties/4cfa4d79874023000e3dd61e36cb0b7b
    how: read problem.knowledgebase.known_error_article
    result: value not in the mirror
    hash: 69ade68cce8af4c5af24e02c8866e88e1e64ff0a184ece4d3425ce0cbceccdec
  E08:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic problem form, PRB0007601'
    how: 'read Related Links and the context menu'
    result: 'Create Known Error article under Related Links and in the menu'
---
## Share the workaround

Write the **Workaround** in *Analysis Information*, save, then choose **Communicate Workaround**
(Related Links or the form menu). [E01] Each linked incident still open gets the work note
*"Workaround shared from PRB…"*. [E02] It is internal: tell callers yourself where it applies.

## Publish a known error

Choose **Create Known Error article**. [E03] [E08] The article starts with the problem statement,
description, cause notes and workaround. [E04] Publish it through knowledge as usual; once saved,
it becomes the problem's **Primary Known Error article** [E05] and linked incidents get a work note
naming it. [E06]

### Which knowledge base {label=OPEN-QUESTION}

The knowledge base for known errors is a property whose value isn't in the mirror [E07], and who
can read it is set by user criteria the mirror doesn't hold. Check whether employees see known
errors in Employee Center.
