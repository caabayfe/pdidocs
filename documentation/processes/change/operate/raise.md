---
title: Raise a change
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_app_module/323bb07bc611227a018aea9eb8f3b35e
    how: read Change › Create New
    result: roles itil and sn_change_write
    hash: 188726f179662f7372b5a5d8766af2f296ef96c1f7405f912b96359ed36e541c
  E02:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Change › Create New'
    how: 'opened the page'
    result: '"Create a change request": Pinned, All, Model, Standard Change, Templates; cards Emergency, Normal, the standard changes and two templates; Continue'
  E03:
    record: sys_ui_section/cd591479c0a801640182b9b52e6f070b
    children: sys_ui_element
    how: read the change form's main section
    result: requested by, category, service, offering, CI, priority, risk, impact; model, type, state, on hold, conflict status, assignment group, assigned to; short description, description
    hash: dda62a0339c5a9a622324ccf0a9f6be90ab3c3889e5ffbe1f5d68a8e988c60d0
  E04:
    record: sys_ui_section/ee9e7d75c0a8016401581b9fd4dcf2ec
    children: sys_ui_element
    how: read the Planning section
    result: justification, implementation plan, risk and impact analysis, backout plan, test plan
    hash: 1ac4705f7575490c605c555decc414fd3480c14320560edbc251a95784adb4ef
  E05:
    record: sys_ui_section/ee95827dc0a8016400f6e15e01fc13ed
    children: sys_ui_element
    how: read the Schedule section
    result: planned start and end, CAB fields, actual start and end
    hash: 5595c4db9e87729b83d38cf64c9448623c982136da08b36bdacf83d7d0f6ff3d
  E06:
    record: sys_ui_action/eea1aa78c0a8ce01002aa530a8f1eb65
    how: read Calculate Risk
    result: a Related Link on the form
    hash: 11d9d8f280aed4249b37e3744d77c2ba9e29b7673ea667aa304e347e248a5601
  E07:
    record: sys_properties/d54b38860a0a0b1d003d833b08d8e604
    field: value
    how: read glide.ui.risk_calculate_rule
    result: ui_action; risk is calculated only when you press the link
    hash: 4d06d235461558387d51816b10e290f8715ebd60ec44eb4bd605c63daa1a7822
  E08:
    record: risk_conditions/a2e6d7320a0a0b1d01995094c170c6ce
    how: read Insufficient lead time
    result: risk High when the start is less than 3 days away
    hash: 3ae8c570f369878ec6bd183b952ba9184fc9281ab9c03633aa564fe96ddbc2b9
  E09:
    record: sys_ui_policy/bad87d63cb900200d71cb9c0c24c9c3d
    how: read Mandatory - Assignment Group
    result: required from Assess on
    hash: 4c4b83ef9060785b90e17f348c8b60640e5e07cd716676fa77061afd48a9f7a0
  E10:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic change form, CHG0000036'
    how: 'read the tabs and buttons'
    result: 'tabs Planning, Schedule, Conflicts, Notes, Closure Information; buttons Request Approval, Update, Delete; Related Links Calculate Risk'
  E11:
    record: sys_ui_action/2f596102c0a8006400a40575087b60b2
    field: script
    how: read Create Normal Change (problem form menu)
    result: 'creates a normal change with the problem''s short description, description, CI and priority, sets it as the problem''s change request, "Change {0} created", opens the change'
    hash: 41c051453c928a8690592e9b2778a87517bb81a453bbcd82884db7a5370ea67a
  E12:
    record: sys_ui_action/ff73cfec533273005e32ddeeff7b1209
    how: read Create Standard Change (problem form menu)
    result: on the problem form menu
    hash: bda97ba4a26daea8a7df545964487fbb405a48f4c22495eda938d08d4cbd67c9
  E13:
    record: sys_ui_action/728aad41c30202003d2ae219cdba8fcd
    how: read Create Emergency Change (problem form menu)
    result: on the problem form menu
    hash: 84f4e982063961e245a193b1fc47bdab9fd67d346567f131915e87b0b4d21ac4
  E14:
    record: sys_ui_section/991fec850a0006417c9edda2d4e9c487
    children: sys_ui_element
    how: read the incident form's Related Records section
    result: parent incident, problem, change request, caused by
    hash: 526106c5de8d52363e7206a84285e6340d6a053bcea1c13b9525361fdf9964f7
  E15:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    children: sys_choice
    how: read the incident's resolution codes
    result: includes Resolved by change
    hash: 438604df7c0701185679ccf5f78a95effda35ae621060096b2ab78a53ec5cac2
---
## Where it comes from

| The change fixes… | Start from | Then |
|---|---|---|
| a **problem** | the problem's form menu: **Create Normal Change**, **Create Standard Change** or **Create Emergency Change** [E11] [E12] [E13] | the change opens with the problem's short description, description, CI and priority, and the message *"Change CHG… created"*; the problem points to it [E11]. See [Fix and resolve](see:problem/fix). |
| an **incident** | **Change › Create New** (below) | set the change in the incident's **Related Records › Change request** [E14]; when the change has fixed it, resolve the incident with **Resolved by change** [E15]. See [Resolve an incident](see:incident/resolve). |

## Start it

{{animation:chgraise}}

Open **Change › Create New**. [E01] The page **Create a change request** shows a card per kind:
choose **Normal**, **Emergency**, a **standard change** or a **template**, then **Continue**. [E02]
For routine work, look for a standard change first (see [Use a standard change](see:standard)).

## Plan it

On the form [E10]:

1. The top: **Short description**, **Description**, **Configuration item** or **Service**,
   **Category**, **Assignment group**. [E03] The group is required before it leaves *New*. [E09]
2. **Planning**: **Justification**, **Implementation plan**, **Risk and impact analysis**,
   **Backout plan** and **Test plan**. [E04] Approvers read these.
3. **Schedule**: **Planned start date** and **Planned end date**. [E05]

## Set the risk

Press **Calculate Risk** under Related Links. [E06] Risk isn't calculated on save, only when you
press it. [E07] A start less than three days away makes the risk *High*. [E08] The risk decides who
approves (see [Who approves](see:approvals)).

Then request approval: [Get it approved](see:authorize).

## Tips

- Raising it from the problem copies the details and links both records: prefer it to a blank
  change when a problem exists. [E11]
- Fill the plans before pressing **Request Approval**: approvers read them. [E04]
- Plan the start at least three days ahead, or the risk becomes *High*. [E08]
