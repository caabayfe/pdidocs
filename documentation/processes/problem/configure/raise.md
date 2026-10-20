---
title: Raising - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_properties/cb0e6a0b43100210644b3d1e2ab8f2a6
    field: value
    how: read com.snc.problem_management.models.enabled
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E02:
    record: prb_model/b58c327fb70c021041c2feb0be11a90e
    how: read the problem model General
    result: active, default; "All other problems"
    hash: 68cd5b03191e0e14915386cd8e84b0116406da4efe9f15c4d6a27019360576e9
  E03:
    record: sys_state_model/df73699a3b031300ad3cc9bb34efc42d
    how: 'read Problem Management: Default Flow'
    result: applies only to problems without a model
    hash: a7d6d66f41ee5dcecb461382447d5055830065c8e139de6596b50b5bb3e9833e
  E04:
    record: sys_dictionary_override/57b3fafd534823004247ddeeff7b12d3
    how: read problem.assigned_to
    result: reference qualifier roles=problem_coordinator
    hash: c97ac6c31436fff661daae7a75741054f3a8c05f1a71c9f62a56e3ee299e664d
  E05:
    record: sys_script/7d6621d8532c0010833addeeff7b12ca
    how: read Abort changes on group
    result: the assignee must belong to the group
    hash: 3dbdafe4177ada7a2d806c5e49cbc586307ce6da0164840abd5a3b738d55c88b
  E06:
    record: sys_properties/7e33f799c7233300c0d3231c95c260d1
    field: value
    how: read glide.problem.interaction.allow_create
    result: false; interactions can't create problems
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E07:
    record: sys_hub_flow/7d92737377612110b88153cf6b5a9986
    how: read Create Problem from Major Incident
    result: inactive
    hash: ae144c2dfc00312b4354cec6694b0701f9e3b4a92ca3fbe49475548fdf930b90
  E08:
    record: sys_ux_form_action/eb60cefac7213010d7e818b1c7c26035
    how: read the workspace incident Create problem form action
    result: points to sys_ui_action 2f43c471c0a8006400a07440e49924c2, which isn't on the instance
    hash: c0ffd8b50bbee40430e87ec6f37b709668417ff48a557a4457bbe794fa9eeed8
---
## Models

Models are on [E01]: new problems get *General* [E02], whose transitions replace the older state
model, which now covers only problems without a model. [E03]

## Assignment

Only problem coordinators can be assigned [E04], and the assignee must be in the group. [E05]

## No other way in

Problems can only be created from **Problem › Create New**: interactions can't [E06], the major
incident flow is inactive [E07], and the workspace's *Create problem* on incidents points to a UI
action the instance doesn't have. [E08] Whether that is intended is not decided yet. [Q02]
