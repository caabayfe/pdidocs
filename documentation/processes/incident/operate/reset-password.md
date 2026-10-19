---
title: Reset a caller's password
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_declarative_action_assignment/f28e6e7a93f88210885aca32b38918d2
    how: read Reset Password on incident (sn_sow_pwd_reset)
    result: 'a primary button in the action bar of the incident in the Service Operations Workspace, for the role password_reset_service_desk, only when the incident is assigned to you'
    hash: 26894a833836e96e471992bd702342ba1bc55edd07eb60c76058b28fe4b09f3b
  E02:
    record: sys_ux_addon_event_mapping/9a34b632933c8210885aca32b38918d0
    field: target_payload_mapping
    how: read Reset password
    result: 'opens a new workspace tab titled "Reset password"'
    hash: 2d2977982b1a7264afe25322574adc54161d8d87a81ef01a66f0cc01939e9743
  E03:
    record: sys_embedded_tour_guide/f284d39b874016501677ca26cebb3566
    how: read the guided tour Password Reset for incident in SOW
    result: published, for password_reset_admin and password_reset_service_desk
    hash: dc23d5bb9e1c32bbea99d8cdb9748c644f5958e837995f3b6e5e928af450da72
  E04:
    record: sys_embedded_tour_step/9f9e2e6b874c16501677ca26cebb35a1
    field: content
    how: read the tour step Identify the user
    result: '"Select the user from the drop-down menu. Select the password reset process for the user. Select the Continue to verify option."'
    hash: 817735d0e627a79a639290ce4fb6b71e7eac5e407793b62c065f72e23f4f1ee9
  E05:
    record: sys_embedded_tour_step/52aeea6b874c16501677ca26cebb356e
    field: content
    how: read the tour step Verify
    result: '"Enter the answers provided by the user, and then select Continue. If the user''s identity is verified, the Reset form displays the identity verification and status of the account lock."'
    hash: e1d2d6963ebe68d27fee5ae4aece5a3cfa27adb5991b90b651baf0d00a65bb7a
  E06:
    record: sys_embedded_tour_step/b4be2e6b874c16501677ca26cebb35a9
    field: content
    how: read the tour step Reset
    result: '"If the user account isn''t locked, reset the password and share the password details to the user. If the user account is locked, you must unlock the account."'
    hash: 1f1b9307de657bccb23dbc46f3cc918f04f219a38de3a28b80568e5779b4d72a
  E07:
    record: sys_ux_macroponent/95eac6d437304210885a484c24924b00
    field: required_translations
    how: read the labels of the Identify page
    result: 'Identify, "Select the user and the process.", Select user, Select password reset process, Continue to verify'
    hash: 8bab384b1e91bfe75bf1e094a6b63298dc03f5ddac266875d61d98cf330b978b
  E08:
    record: sys_ux_macroponent/761b469437304210885a484c24924b7f
    field: required_translations
    how: read the labels of the Verify page
    result: 'Verify, "Verify the user identity.", Continue'
    hash: 15af9236a182e5cf8e5b07ae6f300e086594c6031b3963c4a37703b8a92dfb3b
  E09:
    record: sys_ux_macroponent/eee1c09a9311021086ac849c5489182e
    field: required_translations
    how: read the labels of the personal data confirmation check
    result: '"Ask the user to provide their", "Answer should be", Reject'
    hash: ef3cf4c678a27ee173e3b81e29fe490adc85c81fdbb0c92a4ed52b5a4ce8f4bd
  E10:
    record: sys_ux_macroponent/bc3b8ed437304210885a484c24924b4b
    field: required_translations
    how: read the labels of the Reset page
    result: 'Reset password ("Use this option to reset the password. If the account is locked, it will be automatically unlocked."), Unlock account ("Use this option if the user only needs their account unlocked."), Enter new password, Re-enter new password, Password criteria, Password strength'
    hash: d7144e4426f9e3395aa13a415b689b2da7f18c910e513d857cd83a8a3d0b65c1
  E11:
    record: sys_ux_macroponent/4786e826536942101c02ddeeff7b12a2
    field: required_translations
    how: read the labels of the Success page
    result: 'New Password, Show/Hide Password, "Phonetic reading:", "Please confirm the following before closing the tab.", "I have read the password to the user", Close'
    hash: 21a7cca5c7247dad64752af1522bb72730846e951216377baeb39823a28d2fb8
  E12:
    record: sys_ux_macroponent/9ba5759393a00210885aca32b389182c
    field: required_translations
    how: read the labels of the Reset password tab
    result: '"The session won''t be saved if you close the tab. Are you sure you want to exit?"'
    hash: 9b5586e2c414a8930783d2dadf2b343fc860b3ecf02960d89e7ef14bea6a06dd
  E13:
    record: sys_script_include/8fc99c809f120210d9e5328dda0a1cd4
    field: script
    how: read PwdResetUXFMainProcessor.canAccess
    result: the Reset password tab opens only for the person the incident is assigned to
    hash: b9fa372da9d4ccf9d7d29e3adf93a59eed57d40ccaf6103a89e3a221880b88fc
  E14:
    record: pwd_process/4ff0c881bf220100710071a7bf0739fa
    how: read Service-Desk Password Reset for Local ServiceNow
    result: 'inactive; for all users; reset and unlock; generates the password, shows it to the agent and emails it to the user; the user must change it at next login; one verification'
    hash: 52ec37a5d5128fd9ea7c636e9e4e19ca8ff13991c6161c4d3b78e0c2292b1f27
  E15:
    record: sys_script_include/9e850edb953bf150f877dc184b4c1b18
    field: script
    how: read PwdIdentifyStageHandler.getProcessesForUser
    result: the process list offers only processes that are not public and that reset a password or unlock an account
    hash: 51f2511514a00c5dc116735d2133b9d6b4cb7093b1779625760157e874f7f1c0
  E16:
    record: pwd_process/c6b0c20667100200a5a0f3b457415ad5
    how: read Default Self Service
    result: active but public (self-service), so it is not offered to the service desk
    hash: 66dfaebef411287b58215b544560f99b13750bbf31611142c127e38f049afdb1
  E17:
    record: pwd_map_proc_to_verification/16220c81bf220100710071a7bf0739e1
    how: read the verification of the service-desk process
    result: Personal Data - Confirm Email Address (the user's email address)
    hash: f2eaced81ca77a1f78604ddc8ee1aac1b4ad8e97db5cd18081bdeb8f3f865f43
  E18:
    record: sysevent_email_action/fa055ad3eb310100c3346f5ca206fe2c
    how: read Password Reset - New Pwd Confirmation
    result: 'active; subject "Your new password", sent to the user''s email address, and it contains the new password'
    hash: 585780bf6333b3fe5209af5b8a7057dbf8a3c9cce8aa02072e415989c33f46a6
  E19:
    record: sys_properties/5dc9ade0ebc101006a668c505206fede
    field: value
    how: read password_reset.request.max_attempt
    result: "3 failed attempts"
    hash: 4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce
  E20:
    record: sys_properties/603ba124ebc101006a668c505206fe10
    field: value
    how: read password_reset.request.max_attempt_window
    result: "1440 minutes: after 3 failures the user is blocked for a day"
    hash: a4ff3ad278c7b0575a8e32ae08eebfb327e37762cb1a2caa793c431b9b2ca2c6
  E21:
    record: sys_user_role/ee536414eb010100c3346f5ca206fe84
    how: read password_reset_service_desk
    result: '"Role enables user to assist other user to reset their password via the service desk module"'
    hash: d780071bdb8e34ce2a851e8ce293f168831ec7c283f74bb54743c53141312fab
  E22:
    record: sys_declarative_action_assignment/427c3e1493164e109086849c5489183b
    how: read Reset Password on interaction
    result: the same button on an interaction assigned to you
    hash: de0e9d36df559eaa98cdee6a97b23ede20628bc10f6a1d296286ca94d15e3840
  E23:
    record: sys_script_include/22b02dae53a942101c02ddeeff7b1275
    field: script
    how: read PwdResetUXFResetProcessor.getPageInfo
    result: 'if the account is locked and the process can''t unlock, the tab shows an error; it shows the password fields only when the process does not generate the password'
    hash: 37151fdae7755173221eca08eea346744f2e7be8d6e83983093a714b7603271f
---
## When to use it {label=NEW}

A caller who is locked out, or has forgotten their password, can ask the service desk to reset it.
From the incident you are working on, **Reset Password** opens a guided tab: pick the user,
check who they are, then reset the password or unlock the account. [E01] [E03]

On pdi2 it **can't be used yet**: the only service-desk process is inactive, so the tab has no
process to offer. [E14] [E15] The steps below are what an agent will see once it is switched on.
Until then, the self-service process lets callers reset their own ServiceNow password [E16],
and the *Password Reset* form in Employee Center logs an incident for other applications (see
[Report an incident](see:report)).

## Who can do it {label=NEW}

- Agents with the **password_reset_service_desk** role. [E01] [E21]
- Only on an incident **assigned to you**: the button and the tab check it. [E01] [E13]

The same button is on an **interaction** assigned to you. [E22]

## Reset a password {label=NEW}

{{animation:incpwd}}

1. Open the incident in the Service Operations Workspace and choose **Reset Password** in the
   action bar (on a narrow screen, under **More options**). [E01] [E04] A **Reset password** tab
   opens. [E02]
2. **Identify**: in **Select user**, choose the caller; in **Select password reset process**,
   choose the process; then **Continue to verify**. [E04] [E07]
3. **Verify**: the tab tells you what to ask, *"Ask the user to provide their"* email address,
   and shows what the answer should be. If it matches, choose **Continue**; if not, **Reject**.
   [E05] [E08] [E09] [E17]
4. **Reset**: the tab shows whether the account is locked. [E05] Choose:
   - **Reset password**, which also unlocks the account; or
   - **Unlock account**, when the caller only needs to get back in. [E10]
5. The new password is generated for you and shown under **New Password**, with a **Phonetic
   reading** to spell it out. Read it to the caller, tick **I have read the password to the
   user**, and **Close**. [E11] [E14]

Don't close the tab half-way: *"The session won't be saved if you close the tab."* [E12]

## What the caller receives {label=NEW}

- The password, read out by you. [E11]
- An email to their address, *"Your new password"*, that contains it. [E14] [E18]
- At the next login, the platform asks them to choose their own password. [E14]

## If verification fails {label=NEW}

After **3** failed attempts the caller is blocked from password reset for **24 hours**. [E19]
[E20] Don't keep trying: put the incident on hold and ask the caller to come back with the right
details, or escalate to the platform team.

## Tips

- Never write the new password in work notes, comments or chat. The caller already gets it by
  email. [E18]
- Reset only for the person who asks, or check with your lead first: the caller of the incident
  is not always the person locked out.
- A locked account with a process that can't unlock it ends on an error; ask the platform team.
  [E23]

## Not yet seen {label=OPEN-QUESTION}

1. Should the service desk reset passwords on pdi2 at all? If so, the platform team must activate
   a service-desk process (see the configuration page) and give agents the
   `password_reset_service_desk` role.
2. None of the screens were opened on 2026-10-18; the steps follow the guided tour and the
   pages' labels. [E04] [E05] [E06]
3. Is checking the caller's email address enough proof of identity, since it is a value anyone
   who knows the caller may know?
4. Should the new password be emailed to the caller, or only read out?
