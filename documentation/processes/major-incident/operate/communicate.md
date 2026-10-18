---
title: Communicate
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_declarative_action_assignment/a8b7c3f0a37002101509d63f26fcda17
    how: read Open new communication modal (workspace)
    result: Create new communication, on active incidents, for users with ia_admin
    hash: 85bd83856a161f7151e0b354051dfa9542e5e1c5b9146ecf365732b6c48190e9
  E02:
    record: sys_user_role/78e83d9687480300b4ae6c5837cb0b14
    how: read communication_manager
    result: contains itil, ia_admin and comm_plan_viewer
    hash: 1cf8c88f3ae49c2d511c737cccfdff13fad0f83f2697d194a12085ae12560e52
  E03:
    record: sys_email_client_template/7fa8e20a870103006fb5d61e36cb0b1d
    how: read Initial communication (Business)
    result: 'subject "Service Interruption - <short description>"'
    hash: a97706f4c8e0dbadb7c30278abb7520089ad66f497ce40d46c2ce85db71000ce
  E04:
    record: sys_email_client_template/2189660a870103006fb5d61e36cb0b1d
    how: read Business Update
    result: 'subject "Update: Service Interruption - <short description>."'
    hash: 9bee54e2e014f7a63d0c2cc0dcab40442d987fcb2c5fc7a91d4bf604cce87ab1
  E05:
    record: sys_email_client_template/7c1aa60a870103006fb5d61e36cb0b79
    how: read Resolution Communication (Business)
    result: 'subject "Recovered Service - <short description>."'
    hash: 57dcbd66969431174d115ca304a3f975beaa9d7685b79ab64a42aa4ef1343d8b
  E06:
    record: sys_properties/f4202de587dea110de52a64d0ebb35c3
    field: value
    how: read com.snc.iam.default_email_recipient_field
    result: bcc
    hash: a9b8efc5a481ac393e6fad94441247d18cc508a740ea59b83fc31cae7db4eb48
  E07:
    record: sys_properties/5a6d11fb87e833000e3dd61e36cb0b5c
    field: value
    how: read com.snc.iam.enable_notify
    result: false, so SMS and conference calls through Notify are off
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E08:
    record: sys_app_module/043c16c853081300fc91ddeeff7b129a
    how: read the module Communication Plan Definitions
    result: the plans that can attach to incidents
    hash: 835f2508eb01ce78ba0aa423bbb3284815d2464a6427c13a55a8e7bfbe2d2099
  E09:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Communication Plan Definitions list, table incident'
    how: 'opened the list'
    result: 'No records to display'
  E10:
    record: sys_ux_form_action_layout_item/90f84734a37002101509d63f26fcda6c
    how: read the workspace incident header item
    result: 'label "Create new communication", in the overflow menu'
    hash: c0e30936377e4622d6351c5c4bf377f5d9c6a1d81b9875f089e864819d22555b
  E11:
    record: sys_ux_macroponent/ae81738d53ad71109194ddeeff7b1205
    how: read Adhoc Communication modal SNC (the page the route open-new-communication opens)
    result: 'texts "Create new communication", "Select when you would like to send your communication, add channels, and add recipients.", Short description, Now, Later, Frequency, One time, Recurring, Due in (minutes), Channels, Recipients, Clear all, Cancel, "You will be taken to start the communication and will be reminded for the next update as it gets due"'
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
    result: 'creates the communication plan and task; Later shows "New communication successfully created and added to the Upcoming section."; Now opens the communication to compose'
    hash: cd5b711cbbc9b99143789b87a9a63603298ba521ff5c11e39ad5e887b30e26c0
  E15:
    record: sys_ux_client_script/7291f38d53ad71109194ddeeff7b1227
    field: script
    how: read build channels choice list
    result: offers only available channels, never a bridge (conference)
    hash: 9aa807969f15fee6448339ae6ca0bb07fc44a515b48497fd51ac2457768d6b05
  E16:
    record: sys_script_include/1d5e72985310130009170ef5d5dc343b
    field: script
    how: read CommunicationManagementChannelSmsConfigSNC
    result: SMS is available only when Notify is enabled or a Notify number is set
    hash: 3c7affa4cdb665a13801725f421ecc37f2ab13bf31007f62a6dc19ca2a33ca88
  E17:
    record: sys_ui_action/66869b0273581300cab854eb7df6a727
    how: read Compose (communication task, related link)
    result: opens the task communication dialog for the task's record
    hash: 50aa1c5f54b2967f48d76ed5523036e551d7bde1a8884d1e96e3a45770414379
---
## Communications

A communication on a major incident is a **communication task**: one message (or a series of
updates) to a set of recipients through a channel. Plans can attach tasks automatically from their
definitions (**Major Incidents › Communication Plan Definitions**) [E08], but there is **no**
definition for incidents [E09], so you start each communication yourself.

Only communication managers and major incident managers can do it: the action needs the role
`ia_admin`, which those roles contain. [E01] [E02]

## Send a communication

{{animation:mimcomm}}

1. In the Service Operations Workspace, open the major incident, open the ⋯ menu in its header and
   choose **Create new communication**. [E01] [E10] The dialog **Create new communication** opens:
   *"Select when you would like to send your communication, add channels, and add recipients."*
   [E11]
2. Fill **Short description**: the subject of this communication. [E11]
3. Choose when: **Now** to write it straight away, or **Later** to schedule it. Choose the
   **Frequency**: **One time** or **Recurring**, and for a reminder, **Due in (minutes)**. [E11]
4. Under **Channels**, pick how it goes out, usually email. SMS appears only when Notify is set
   up, and Notify is switched off here [E07] [E16]; a conference bridge is never offered in this
   dialog. [E15]
5. Under **Recipients**, search and add people or groups; **Clear all** empties the list. [E11]
6. Press **Compose communication** (with *Now*) or **Save** (with *Later*). The button stays
   disabled until the short description, a channel, a recipient and the frequency are set; *Later*
   also needs **Due in**. [E12] [E13]

With *Now*, the communication opens for you to write and send. With *Later*, you see *"New
communication successfully created and added to the Upcoming section."* [E14]

On the classic interface, open the communication task and choose the related link **Compose**
to write and send it. [E17]

## What to write

Emails start from templates:

| Template | Subject |
|---|---|
| Initial communication (Business) | *Service Interruption - …* [E03] |
| Business Update | *Update: Service Interruption - …* [E04] |
| Resolution Communication (Business) | *Recovered Service - …* [E05] |

The technical templates add the business impact, the groups involved, the conference details and
the actions taken. Recipients are put in **blind copy**, so they don't see each other. [E06]

## What happens next

Send updates as the response progresses (a *Recurring* communication reminds you when the next
one is due [E11]) and the resolution notice when you [resolve the major incident](see:review).
Callers of linked incidents also get every **Additional comment** you write on the major incident
(see [Link the other reports](see:link)).
