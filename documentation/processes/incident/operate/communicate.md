---
title: Communicate about an incident
reviewed: 2026-10-18
evidence:
  E01:
    record: sys_declarative_action_assignment/a8b7c3f0a37002101509d63f26fcda17
    how: read Open new communication modal (table incident, workspace view)
    result: offered on any active incident, not only major incidents, to users with ia_admin (plus itil or sn_incident_read)
    hash: 85bd83856a161f7151e0b354051dfa9542e5e1c5b9146ecf365732b6c48190e9
  E02:
    record: sys_ux_form_action_layout_item/90f84734a37002101509d63f26fcda6c
    how: read the workspace incident header item
    result: 'label "Create new communication", in the overflow menu'
    hash: c0e30936377e4622d6351c5c4bf377f5d9c6a1d81b9875f089e864819d22555b
  E03:
    seen:
      by: 'Documentation agent, as admin'
      on: 2026-10-18
      where: 'Service Operations Workspace, incident, header'
    how: 'opened More actions'
    result: 'Create new communication is listed'
  E04:
    record: sys_user_role_contains/57c31b815fc91300ff67a184ff46669f
    how: read incident_manager contains ia_admin
    result: incident managers have the action
    hash: adc49b35191098c83559ec7c3ef8dc2800031729645062949069668e24ad5d52
  E05:
    record: sys_user_role_contains/5484f9f5c34103009f93dfdc64d3ae74
    how: read major_incident_manager contains ia_admin
    result: major incident managers have the action
    hash: 849effef0e1fd8b229ea018434a87571525559636239ca70e8fc61eb323dd84c
  E06:
    record: sys_user_role_contains/08a43df5c34103009f93dfdc64d3ae0e
    how: read communication_manager contains ia_admin
    result: communication managers have the action
    hash: 4ce4db373a357b48f4e4caa660dbca9fd8575b8139ead2037c6386982ebc985b
  E07:
    record: sys_user_role_contains/0dd4329e3b481300ad3cc9bb34efc469
    how: read itil contains comm_plan_viewer
    result: every support agent can read communication plans and tasks
    hash: bb1640c43292805cc2d6867731fddecce8df0c5899183e69b33c615a555ceff7
  E08:
    record: sys_ui_related_list/fa3f3ac143e9d2108c5fa32d68b8f24b
    children: sys_ui_related_list_entry
    how: read the related lists of the workspace incident view
    result: incident_alert.source (the incident's communication plans) at position 13
    hash: 1dc5e75dcb9cb55b773b0992baca4499230041ea4b78c3d3db3162b600bf30b5
  E09:
    seen:
      by: 'Documentation agent, as admin'
      on: 2026-10-18
      where: 'Service Operations Workspace, incident, Related records tab'
    how: 'read the related lists'
    result: 'Incident Communication Plans is listed'
  E10:
    record: sys_ui_section/79a302aca3110210ebb11e3f26fcda9d
    children: sys_ui_element
    how: read the workspace form of a communication plan
    result: number, source incident, plan type, plan definition, state, assignment group, assigned to, order, short description
    hash: 4daa8c38d32723372ea40433f992c436d73f8684a6fef576d1f0d858927de36c
  E11:
    record: sys_ux_macroponent/ae81738d53ad71109194ddeeff7b1205
    how: read Adhoc Communication modal SNC
    result: 'texts "Create new communication", "Select when you would like to send your communication, add channels, and add recipients.", Short description, Now, Later, Frequency, One time, Recurring, Due in (minutes), Channels, Recipients, Clear all, Cancel'
    hash: 5bcfaa4248f946c2bab471134d1524483f5ba4b324c9d7c858aebcce51566ae5
  E12:
    record: sys_ux_client_script/905704555321b1109194ddeeff7b1274
    field: script
    how: read save or compose label
    result: 'the button reads "Compose communication" for Now and "Save" for Later'
    hash: c392969f7fca5c14715302917d6357ca8f940b0ec30ea935aa3bfb935bb5cb7b
  E13:
    record: sys_ux_client_script/105704555321b1109194ddeeff7b1274
    field: script
    how: read save or compose disabled
    result: enabled only with a short description, a channel, a recipient and a frequency; Later also needs Due in above 0
    hash: 807e84229e14253bfc3c42285c6ecd18e78078d9b2810b52d83ed3e54cc9ae4b
  E14:
    record: sys_ux_client_script/505704555321b1109194ddeeff7b1274
    field: script
    how: read save compose handler
    result: 'creates the plan and task on the incident; Later shows "New communication successfully created and added to the Upcoming section."; Now opens the communication to compose'
    hash: cd5b711cbbc9b99143789b87a9a63603298ba521ff5c11e39ad5e887b30e26c0
  E15:
    record: sys_properties/5a6d11fb87e833000e3dd61e36cb0b5c
    field: value
    how: read com.snc.iam.enable_notify
    result: false, so SMS and conference calls through Notify are off
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E16:
    record: sys_ux_client_script/7291f38d53ad71109194ddeeff7b1227
    field: script
    how: read build channels choice list
    result: offers only available channels, never a bridge (conference)
    hash: 9aa807969f15fee6448339ae6ca0bb07fc44a515b48497fd51ac2457768d6b05
  E17:
    record: sysevent_email_action/013a8f3d5be81300e3cc8e6541f91ae1
    how: read Communication Due Warning
    result: 'to the communication task''s assignee, subject "<task> due for Incident <number>"'
    hash: 86bd37039bea064f5dbbcab73588c27a1309d936fc9b30099e478b54e8160221
  E18:
    record: sysevent_email_action/69ca5cac5b701300e3cc8e6541f91a10
    how: read Communication Overdue
    result: 'to the communication task''s assignee, subject "<task> is overdue for Incident <number>"'
    hash: c9e6132c1a7fa97009beabf179b382649f86403e10af955ffbe84ed313518646
  E19:
    record: sys_script/87d6f91953701300d6fdddeeff7b1297
    how: read Auto Assignment of ICT
    result: tasks take the plan's group and assignee only on an accepted major incident
    hash: b91bde9469af991ea0a9fe85b4f29d3a2bc4b0b9295b334d7387f8f9f1a2a477
  E20:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Communication Plan Definitions list, table incident'
    how: 'opened the list'
    result: 'No records to display'
  E21:
    record: sys_properties/5aefbb67871b030055c9d61e36cb0bc6
    field: value
    how: read com.snc.incident.incident_alert.closure
    result: false, so closing the incident doesn't close its plans
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
---
## What a communication plan is {label=NEW}

A **communication plan** collects the messages sent about one incident to people outside the
team: business users, managers, other teams. Each message is a **communication task**: one email
(or a series of updates) to a set of recipients. Nothing on pdi2 attaches a plan by itself
[E20], so a plan exists only when someone creates a communication.

It works on **any active incident**, not only on major incidents. [E01] For a major incident, see
[Communicate](see:major-incident/communicate), which also lists the email templates.

| Who | Can |
|---|---|
| Incident managers, major incident managers, communication managers | create communications [E01] [E04] [E05] [E06] [Q05] |
| Every support agent | see the incident's plans and tasks [E07] |

Use it when an incident affects people who aren't the caller and should be told on a schedule.
To tell the caller, write in **Additional comments** instead (see [Work on an incident](see:work)).

## Create a communication {label=NEW}

{{animation:inccomm}}

1. In the Service Operations Workspace, open the incident, open **More actions** (⋯) in its
   header and choose **Create new communication**. [E02] [E03] The dialog *"Select when you
   would like to send your communication, add channels, and add recipients."* opens. [E11]
2. Fill **Short description**: the subject of this communication. [E11]
3. Choose **Now** to write it straight away, or **Later** to schedule it. Choose the
   **Frequency**: **One time**, or **Recurring** for regular updates, and **Due in (minutes)**
   for when it is due. [E11]
4. Under **Channels**, pick **email**. SMS is switched off on pdi2 [E15], and a conference bridge
   is never offered here. [E16]
5. Under **Recipients**, search and add people or groups; **Clear all** empties the list. [E11]
6. Press **Compose communication** (with *Now*) or **Save** (with *Later*). The button stays
   disabled until the short description, a channel, a recipient and the frequency are set;
   *Later* also needs **Due in**. [E12] [E13]

With *Now*, the email opens for you to write and send. With *Later*, you see *"New communication
successfully created and added to the Upcoming section."* [E14]

## See the plans of an incident {label=NEW}

Open the incident's **Related records** tab and choose **Incident Communication Plans**. [E08]
[E09] Each plan shows its number, its type and definition, its state, its group and assignee, and
its short description. [E10] Every support agent can open it; only the managers above can create
one. [E07]

## Reminders {label=NEW}

When a communication task is coming due, its **assignee** gets *"<task> due for Incident
<number>"*; once it is late, *"<task> is overdue for Incident <number>"*. [E17] [E18] On an
ordinary incident the task doesn't take an assignee from the plan (that happens only on a major
incident) [E19], so set **Assigned to** on the task if you want the reminders. [Q06]

## When the incident is closed {label=NEW}

Closing or canceling the incident leaves its plans open on pdi2. [E21] Close the plan yourself
when no more updates are needed.
