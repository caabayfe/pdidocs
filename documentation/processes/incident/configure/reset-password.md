---
title: Service desk password reset - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_declarative_action_assignment/f28e6e7a93f88210885aca32b38918d2
    how: read Reset Password (incident)
    result: 'uxf client action Reset Password, form action bar, view Service Operations Workspace; required role password_reset_service_desk; script condition current assigned_to is the user'
    hash: 26894a833836e96e471992bd702342ba1bc55edd07eb60c76058b28fe4b09f3b
  E02:
    record: sys_declarative_action_assignment/427c3e1493164e109086849c5489183b
    how: read Reset Password (interaction)
    result: the same on interaction
    hash: de0e9d36df559eaa98cdee6a97b23ede20628bc10f6a1d296286ca94d15e3840
  E03:
    record: sys_declarative_action_payload_definition/679f62fa93f88210885aca32b38918b4
    field: payload_template
    how: read Reset Password (action key RESET_PASSWORD)
    result: 'payload table and sysID of the record'
    hash: ab14fb422f6fadf024e6d07f227d3cb872cba01f5247512498ee85485afdd1ec
  E04:
    record: sys_ux_addon_event_mapping/9a34b632933c8210885aca32b38918d0
    field: target_payload_mapping
    how: read Reset password (incident action)
    result: 'route password-reset-main-snc, title "Reset password"; active'
    hash: 2d2977982b1a7264afe25322574adc54161d8d87a81ef01a66f0cc01939e9743
  E05:
    record: sys_ux_form_action/85efa6fa93f88210885aca32b3891872
    how: read the form action Reset Password on incident, and its layout item sys_ux_m2m_action_layout_item/9d50befa93f88210885aca32b3891852
    result: active; placed in the incident's action layout as a secondary button
    hash: 1d602e2e96b758711f22d847319c4980bcbc10646395ae6ba5914ae0609f03ef
  E06:
    record: sys_ux_app_route/93a5759393a00210885aca32b389182a
    how: read SOW Password Reset Main SNC
    result: route password-reset-main-snc in the Service Operations Workspace
    hash: ae9f431c3d27eae0b987dd9a186659262ef3494f688ae95df781185e1027e944
  E07:
    record: sys_extension_instance/dc3a3d1d9f120210d9e5328dda0a1c72
    how: read the PwdResetUXFPreLoadValidation implementation for incident (sn_sow_pwd_reset), and b5ea755d9f120210d9e5328dda0a1cd7 for interaction
    result: active; PwdResetUXFPreLoadValidationIncident returns the incident's assigned_to
    hash: 7d32c1a2dd96fc4213b6cc41b58f031b7c63c38f70a9720a2c7ba223ca66d92a
  E08:
    record: sys_script_include/8fc99c809f120210d9e5328dda0a1cd4
    field: script
    how: read PwdResetUXFMainProcessor
    result: 'canAccess: true only if an implementation returns the current user as owner; getRecordDetails: from an interaction, inserts an incident (category password_reset, urgency and impact 2, caller_id set to the interaction''s assigned_to) and links it in interaction_related_record'
    hash: b9fa372da9d4ccf9d7d29e3adf93a59eed57d40ccaf6103a89e3a221880b88fc
  E09:
    record: sys_script_include/a5caa6ee53640210abd8ddeeff7b1235
    field: script
    how: read PwdResetUXFIdentifyProcessor
    result: 'identifyUser calls PwdIdentifyStageHandler.identifyUserForServiceDesk ("User not enrolled!" on code 1000); getProcess drops processes with a soft PIN verification or an RPA credential store'
    hash: 0580930cc2ab9b604a6760ca56fcec34e460b9316bf47ceafd08105c13ff67f2
  E10:
    record: sys_script_include/9e850edb953bf150f877dc184b4c1b18
    field: script
    how: read PwdIdentifyStageHandler
    result: 'getProcessesForUser keeps the user''s processes that are not public and reset or unlock; identifyUserForServiceDesk creates a pwd_reset_request, refuses blocked or not enrolled users, then gets the lock state'
    hash: 51f2511514a00c5dc116735d2133b9d6b4cb7093b1779625760157e874f7f1c0
  E11:
    record: sys_script_include/80cbe36553c50210abd8ddeeff7b12fd
    field: script
    how: read PwdResetUXFVerifyProcessor
    result: 'builds the verification pages from pwd_reset_uxf_route_mapping, retries from password_reset.request.max_attempt; if the process emails a reset URL, sends it after verification'
    hash: dd11c64a13c007e53ee01f89b0b5896175bdc4916e7640e0e410f50eb697cc8e
  E12:
    record: sys_script_include/22b02dae53a942101c02ddeeff7b1275
    field: script
    how: read PwdResetUXFResetProcessor
    result: 'reads auto_gen_password, unlock_account, reset, display_password and send_email from the process; locked account without unlock support ends on an error; password policy and strength from the credential store when the agent types the password'
    hash: 37151fdae7755173221eca08eea346744f2e7be8d6e83983093a714b7603271f
  E13:
    record: sys_script_include/b817e8479f790210d9e5328dda0a1c5f
    field: script
    how: read PwdResetUXFSuccessProcessor
    result: when the process displays the password, returns it with a phonetic spelling, only for a successful or URL-pending request
    hash: 4e3a0a0ee7d2b3d8ae62c881db706d7455abaf9b4d621467a7505dd7863d78b1
  E14:
    record: sys_script_include/c2bb80aa73126300039a2ea3c4f6a721
    field: script
    how: read PasswordResetUtil.sendConfirmation (sn_pwdreset_ah)
    result: queues pwd.email.trigger with the email and the new password (password.reset for the default self-service process)
    hash: 21ca1afc160d32d3a9f124d92e52febe93037ab6555da6326db52c94487bfad4
  E15:
    record: sysevent_email_action/fa055ad3eb310100c3346f5ca206fe2c
    how: read Password Reset - New Pwd Confirmation
    result: 'active, event pwd.email.trigger, to event parm 1 (the email address), subject "Your new password"; the body includes the password'
    hash: 585780bf6333b3fe5209af5b8a7057dbf8a3c9cce8aa02072e415989c33f46a6
  E16:
    record: pwd_process/4ff0c881bf220100710071a7bf0739fa
    how: read Service-Desk Password Reset for Local ServiceNow
    result: 'active false; public_access false; apply_to_all_users true; reset true, unlock_account true; auto_gen_password true, display_password true, send_email true, password_needs_reset true; min_verifications 1; credential store Local ServiceNow Instance'
    hash: 52ec37a5d5128fd9ea7c636e9e4e19ca8ff13991c6161c4d3b78e0c2292b1f27
  E17:
    record: pwd_map_proc_to_verification/16220c81bf220100710071a7bf0739e1
    how: read the service-desk process verification
    result: Personal Data - Confirm Email Address, not mandatory
    hash: f2eaced81ca77a1f78604ddc8ee1aac1b4ad8e97db5cd18081bdeb8f3f865f43
  E18:
    record: pwd_verification/41f1c481bf220100710071a7bf0739f9
    how: read Personal Data - Confirm Email Address and its parameters
    result: 'type Personal Data Confirmation (auto-enrolled), column email, label Email address'
    hash: 0878995a114878cc046a332ab3e74d7a16b23ce61fb2f24d28bf0b2e01342942
  E19:
    record: pwd_process/c6b0c20667100200a5a0f3b457415ad5
    how: read Default Self Service
    result: active, public_access true, emails a reset URL; excluded from the service desk list
    hash: 66dfaebef411287b58215b544560f99b13750bbf31611142c127e38f049afdb1
  E20:
    record: pwd_process/6993473fbf020100710071a7bf073926
    how: read the other processes (Employee Self-Service Process for Local ServiceNow; Demo Self-Service Process 1 and 2)
    result: all inactive and public
    hash: 9a3ed44e744979f8865dee22b8ef88c46dda20606c785e87d21a3d1d1f10c76e
  E21:
    record: pwd_cred_store/6e51033fbf020100710071a7bf0739e0
    how: read Local ServiceNow Instance
    result: 'password policy and strength on; hint: at least 8 characters, upper and lower case, a number'
    hash: 07da696efa710526550ec8dd3a31c56ebc1ab45f8167a58b677c0b007c57612f
  E22:
    record: pwd_cred_store_type/e611433fbf020100710071a7bf073921
    how: read Local ServiceNow Instance (type)
    result: 'use_flow true with reset, unlock and lock-state flows; password_delivery_mechanism 0 (accepts a password)'
    hash: 7c73b43e76f44a494d8fde238f4b0e1a258edd46d30cf9b540560fea39a13940
  E23:
    record: sys_user_role/ee536414eb010100c3346f5ca206fe84
    how: read password_reset_service_desk
    result: grantable, can be delegated, not elevated
    hash: d780071bdb8e34ce2a851e8ce293f168831ec7c283f74bb54743c53141312fab
  E24:
    record: sys_user_role_contains/6d59cc25eb32010045e1a5115206fe9f
    how: read password_reset_credential_manager contains password_reset_service_desk, and ebbfb228ebd0010045e1a5115206fe6d
    result: password_reset_admin contains password_reset_credential_manager, which contains password_reset_service_desk; itil does not
    hash: 1f4be54a4fe515b8a02e07d90a385955ea59eee6ca7a6f4283a5d4b09df7da7c
  E25:
    record: sys_user_role_contains/2e63c74360e02210f87719a8cf3a9475
    how: read the role contains of sn_sow_pwd_reset
    result: password_reset_admin contains sn_sow_itsm_admin.sow_admin_user (admin centre pages)
    hash: 766ccfc74aaee376682ea17de2121f8d31168c3778c0b65ff38b27da4300fd44
  E26:
    record: sn_ace_page/642f2b7347b14610e2d0cc99e16d4351
    field: required_translations
    how: read Service Desk Assisted Password Reset (admin centre page)
    result: 'checklist: Password reset processes, Credential stores, Verification(s), Process mapping, UXF routes mapping, Password policies, Session properties, Password reset agents ("Assign appropriate roles to users who will be working on password reset tickets.")'
    hash: 054c923d382a79f02c994a1f67327adaceaf4f28dd52a6e7593adca2855cd8a5
  E27:
    record: sys_properties/5dc9ade0ebc101006a668c505206fede
    field: value
    how: read password_reset.request.max_attempt
    result: "3"
    hash: 4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce
  E28:
    record: sys_properties/603ba124ebc101006a668c505206fe10
    field: value
    how: read password_reset.request.max_attempt_window
    result: "1440 minutes"
    hash: a4ff3ad278c7b0575a8e32ae08eebfb327e37762cb1a2caa793c431b9b2ca2c6
  E29:
    record: sys_properties/c3efd641eb0311006a668c505206fe25
    field: value
    how: read password_reset.request.unlock_window
    result: "1440 minutes before a new reset after a successful unlock"
    hash: a4ff3ad278c7b0575a8e32ae08eebfb327e37762cb1a2caa793c431b9b2ca2c6
  E30:
    record: sys_embedded_tour_guide/f284d39b874016501677ca26cebb3566
    how: read Password Reset for incident in SOW, and 555403bc87145a501677ca26cebb3522 for interaction
    result: published guided tours, roles password_reset_admin and password_reset_service_desk
    hash: dc23d5bb9e1c32bbea99d8cdb9748c644f5958e837995f3b6e5e928af450da72
---
## The applications {label=NEW}

| Scope | What it gives |
|---|---|
| `sn_sow_pwd_reset` | the **Reset Password** buttons on incident and interaction, the owner checks, the route in the workspace, guided tours, the admin centre page |
| `sn_uib_pwd_reset` | the Reset password pages (Identify, Verify, the verification checks, Reset, Success, Error) and their processors |
| `sn_pwdreset_ah` | the reset, unlock and lock-state flows, and the confirmation email |
| global (Password Reset plugin) | processes, verifications, credential stores, roles, notifications, properties |

## 1. The button {label=NEW}

*Reset Password* is a declarative action in the incident's action bar, for
`password_reset_service_desk`, shown only when the incident is assigned to the current user. [E01]
[E05] The same exists on interaction. [E02] It sends the record's table and sys_id [E03] to the
route `password-reset-main-snc`, in a new tab titled *Reset password*. [E04] [E06]

When the tab loads, `PwdResetUXFMainProcessor.canAccess` asks the
`PwdResetUXFPreLoadValidation` implementations for the record's owner; only the assignee gets in.
[E07] [E08]

From an interaction, the processor inserts an incident (category *password_reset*) and links it
to the interaction. It sets that incident's caller to the interaction's **assigned_to**, the
agent, not the person locked out. [E08] Check this before using it from interactions. [Q51]

## 2. The steps, by processor {label=NEW}

| Page | Processor | Does |
|---|---|---|
| Identify | `PwdResetUXFIdentifyProcessor` | lists the user's service-desk processes (not public, reset or unlock; no soft PIN, no RPA store) and identifies the user [E09] [E10] |
| Verify | `PwdResetUXFVerifyProcessor` | runs the process's verifications, with 3 attempts [E11] [E27] |
| Reset | `PwdResetUXFResetProcessor` | reads the process options, unlocks or resets through the credential store's flows [E12] [E22] |
| Success | `PwdResetUXFSuccessProcessor` | shows the generated password with a phonetic spelling [E13] |

After 3 failed attempts the user is blocked for 1440 minutes [E27] [E28]; after a successful
unlock, a new reset waits 1440 minutes. [E29]

## 3. What is configured on pdi2 {label=NEW}

| Process | Active | Offered to the service desk |
|---|---|---|
| Service-Desk Password Reset for Local ServiceNow | **no** [E16] | it would be: not public |
| Default Self Service | yes | no: public [E19] |
| Employee Self-Service, Demo 1 and 2 | no | no: public [E20] |

So **no process can be chosen on the Identify page**: the feature is installed but not usable.
[E10] [E16] [shared/Q07] [Q81]

If the service-desk process is activated as it stands, it [E16] [E17] [E18] [E21]:

- applies to every user, on the local ServiceNow credential store;
- checks one thing: the agent asks for the user's email address and compares it;
- generates the password, shows it to the agent, and emails it to the user (*"Your new
  password"*, with the password in the body) [E14] [E15];
- forces the user to change it at the next login, and can unlock the account.

## 4. Roles {label=NEW}

| Role | Gives |
|---|---|
| `password_reset_service_desk` | the button and the tab [E01] [E23] |
| `password_reset_credential_manager` | contains the service desk role [E24] |
| `password_reset_admin` | contains both, and SOW admin centre access [E24] [E25] |

`itil` doesn't contain the service desk role [E24]: agents must be given it explicitly. Role
grants aren't in the mirror. [Q58] The
guided tours are shown to the same roles. [E30]

## 5. Switching it on {label=NEW}

The admin centre page *Service Desk Assisted Password Reset* lists what to review: processes,
credential stores, verifications, process mapping, UXF routes mapping, password policies, session
properties and agents. [E26] For pdi2 that means at least:

1. decide on the verifications: one email-address check is weak proof of identity [E17] [Q38];
2. decide whether the password is emailed (`send_email`) or only read out (`display_password`)
   [E16] [Q39];
3. activate the service-desk process;
4. give the agents `password_reset_service_desk`.
