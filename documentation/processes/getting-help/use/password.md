---
title: Reset or change your password
reviewed: 2026-10-19
evidence:
  E01:
    record: pwd_process/c6b0c20667100200a5a0f3b457415ad5
    how: read the password reset process Default Self Service
    result: 'active, open to everyone and to all users; you identify yourself by user name, with a captcha; a reset link is emailed to you; the same process lets you change your password; it does not unlock accounts'
    hash: 66dfaebef411287b58215b544560f99b13750bbf31611142c127e38f049afdb1
  E02:
    record: pwd_map_proc_to_verification/b2c8aeed93503200da8d37ae867ffb26
    how: read the first check of Default Self Service
    result: 'Personal Data - Enter Email Address, mandatory: you type your email address'
    hash: 2e6571c2ecbd9af817f72db4438580b26cb5b58de53ccb234df0e6be3111564f
  E03:
    record: pwd_map_proc_to_verification/704463bd87553110bca24156dabb35f6
    how: read the second check of Default Self Service
    result: 'SMS Verification, mandatory: a code sent to your mobile phone'
    hash: 5430e84ea0b04fbb9d7bd6873650edfda78439446cc3fc4b6d3900156cc4e258
  E04:
    record: pwd_verification_type/58a2f398eb6001006a668c505206fed3
    how: read SMS Code Verification Type
    result: not enrolled automatically; you must register your phone first
    hash: 73d8abf8dde5bce82ff83e21121fb54d5d8c1ffef765b9e9bc20d881aaf4a55a
  E05:
    record: pwd_verification_type/2f39b371eb1101004d7763fba206fed1
    how: read Personal Data Verification Type
    result: checks your details against your user record; no enrolment needed
    hash: 4ce23f97ed33b7f410ed3cfc80cd0e5a805292cd6f13713cc4b9ca64b6243b5e
  E06:
    record: pwd_verification_param/f4303a85eb2001006a668c505206fea1
    how: read the SMS verification's settings (and expiry 9715eb13eb2001006a668c505206fefc)
    result: a 6-digit code, valid for 5 minutes
    hash: 5c3536baf6a939406816c416cb7fc623eae08efa0f9e4e9e41168134fea0bcee
  E07:
    record: sys_properties/5dc9ade0ebc101006a668c505206fede
    field: value
    how: read password_reset.request.max_attempt
    result: "3"
    hash: 4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce
  E08:
    record: sys_properties/603ba124ebc101006a668c505206fe10
    field: value
    how: read password_reset.request.max_attempt_window
    result: 1440 minutes (24 hours)
    hash: a4ff3ad278c7b0575a8e32ae08eebfb327e37762cb1a2caa793c431b9b2ca2c6
  E09:
    record: sys_properties/cf05503a53d04210abd8ddeeff7b12e3
    field: value
    how: read glide.pwd_reset.onetime.token.validity
    result: the emailed reset link expires after 1 hour
    hash: 6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b
  E10:
    record: sysevent_email_action/9546d4509f131200f45c7b9ac42e70ca
    how: read the notification Password Reset - Reset Link
    result: active; sent to your email address, subject "Password Reset"
    hash: e344abb34f4bbd03be6b394f5b36d7f191d2e945ba7e4f3121d1d4dc1d50e74d
  E12:
    record: pwd_process/4ff0c881bf220100710071a7bf0739fa
    how: read Service-Desk Password Reset for Local ServiceNow
    result: inactive; the service desk has no process to reset a password from the workspace
    hash: 52ec37a5d5128fd9ea7c636e9e4e19ca8ff13991c6161c4d3b78e0c2292b1f27
  E13:
    record: pwd_cred_store/6e51033fbf020100710071a7bf0739e0
    how: read Local ServiceNow Instance
    result: 'password policy on; at least 8 characters, upper and lower case, a number'
    hash: 07da696efa710526550ec8dd3a31c56ebc1ab45f8167a58b677c0b007c57612f
  E14:
    record: sc_cat_item_content/3c72dc91eb00210045e1a5115206fec7
    how: read the catalog item Change Password
    result: active; opens /$pwd_change.do; in the category Can We Help You?; no restriction on who sees it
    hash: 4a2c78549a3f4d4779b6b840bc512d3032b97cb55b75f1d8883fe630fc71a246
  E15:
    record: sc_cat_item_content/b59db52cbf320100710071a7bf0739ba
    how: read the catalog item Password Reset Enrollment
    result: active; opens /$pwd_enrollment_form_container.do; no restriction on who sees it
    hash: eadadb0ed92bea0f94beef00aeb2d6cec269c505df64556901436dd5ce5c6d48
  E16:
    record: sc_cat_item_category/657390b787010300e0ef0cf888cb0b68
    how: read the category of Password Reset Enrollment
    result: Can We Help You?
    hash: c1ab7d081b9d636c3ee5f75b381039675ef6861754468c73834ee07d43dad062
  E17:
    record: sys_app_module/c0454c61eb6311006a668c505206fe4a
    how: read the Password Reset menu's modules Change Password (and Enroll 4a5634a19f01010054005f29468ba36b)
    result: active, no role needed; Change Password opens $pwd_change.do, Enroll opens $pwd_enrollment_form_container.do
    hash: 645cbfc07a790fb943b048dae3c5fe68efed7268b78e65aa5cce55dd4cc8ba4e
  E18:
    record: sc_cat_item_producer/29a39e830a0a0b27007d1e200ad52253
    how: read the form Password Reset (sn_ect)
    result: '"Request a reset of a password for a service or an application."; asks whose password, which application (mandatory), and how to send the new one; creates an incident'
    hash: 6f2ab0f06c1e9f4c403e4671faa7ab8f0cdfdc0f70fb786acace63f93cf1fdcb
  E19:
    record: item_option_new/2a2d651a0a0a020e00d40dc62454d73f
    how: read the question How would you like to be contacted with your new password?
    result: Telephone, SMS or Email
    hash: 9be250a8e07fdcab388de2d4fe684493949d7f1d5dc86ab51051f93ea62534e2
  E20:
    record: sc_cat_item_user_criteria_mtom/ff642d5c7361230039517a5454f6a790
    how: read who the Password Reset form is available for
    result: Users with 'cmdb_read' Role only
    hash: 1e50b259aaa2a5e81dfd9de365ba49a6a7a990c79b38f0a0f3820d540f201086
  E21:
    record: sys_user_role_contains/0c5a41e7b31213005e3de13516a8dc69
    how: read which roles contain cmdb_read
    result: itil contains it, and other IT roles; the employee role does not
    hash: ab9fdb1261d323545d9e8da9313e4955e3d780113f21625dfa4b9f24c2aef46a
  E23:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Forgot password page ($pwd_reset.do)
    how: looked at the page, did not use it
    result: 'steps 1 Identify, 2 Verify, 3 Reset; "Forgot password?" with User name, Captcha and Next; "Log in with user name and password"'
  E24:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Employee Center search, "password"
    how: searched
    result: 'the catalog item Password Reset ("Request a reset of a password for a service or an application"), then knowledge articles; no Change Password or Password Reset Enrollment'
  E25:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Employee Center › profile (esc?id=user_profile)
    how: opened the profile
    result: 'About (email, business phone, mobile phone); User preferences (Accessibility enabled, Time zone, Configure Multi-Factor Authentication, View Identity Center); no change-password link'
  E26:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: Employee Center › Get support
    how: opened the Get support window
    result: 'cards Request password reset, and Contact us +1-200-120-2020 (Available 9am to 5pm PST)'
  E27:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: Employee Center › Get support
    how: opened the Get support window as an employee
    result: 'Contact us: +1-200-120-2020 (Available 9am to 5pm PST) only'
---
You can **reset** a password you've forgotten on the **Forgot password** page, and **change** a password
you know from the Password Reset menu. To reset it yourself you must first **enrol** your mobile
phone. If you can't, call the service desk.

{{animation:helppwd}}

## At a glance {label=NEW}

| I want to… | Where | What you need |
|---|---|---|
| reset a password I've forgotten | the **Forgot password** page [E01] [E23] | your user name, your email address and your enrolled mobile phone [E02] [E03] |
| change a password I know | **Change Password**, in the **Password Reset** menu [E14] [E17] | your current password |
| get ready to reset it myself | **Password Reset Enrollment** [E15] [E17] | your mobile phone |
| get back into another application | call the service desk | the application's name |

## Reset a forgotten password {label=NEW}

1. Open the **Forgot password** page. It has three steps:
   **Identify**, **Verify** and **Reset**. [E23] [Q13]
2. **Identify**: type your **User name**, fill in the **Captcha**, and choose **Next**. [E01] [E23]
3. **Verify**: you are asked for two things, and both are required [E02] [E03]:
   - your **email address**, as IT has it [E05];
   - a **6-digit code** sent to your mobile phone. Type it within **5 minutes**. [E06] [Q01]
4. **Reset**: you get an email, *"Password Reset"*, with a link. [E01] [E10] Open it within
   **1 hour** [E09] and choose your new password: at least 8 characters, with upper and lower
   case letters and a number. [E13]

After **3** failed attempts you can't try again for **24 hours**. [E07] [E08] Call the service
desk instead.

The page resets your password, but it **doesn't unlock** a locked account. [E01] If your account
is locked, call the service desk.

## Enrol your phone first {label=NEW}

The text-message code only reaches you if you registered your mobile phone beforehand: it isn't
done for you. [E03] [E04] Do it now, while you can still sign in:

1. Open **Password Reset Enrollment**, or **Enroll** in
   the **Password Reset** menu; in the catalog it is under **Can We Help You?**. [E15] [E16]
   [E17]
2. Follow the **Steps to enroll**: add your mobile number and confirm it with the code you
   receive.
3. Choose **Submit**. [Q14]

Your email address needs no enrolment. [E05]

## Change your password {label=NEW}

When you know your password and want a new one, open **Change Password**,
in the **Password Reset** menu or the catalog's **Can We Help You?** category. [E14] [E17] Type
your current password and the new one twice. The same rules apply: at least 8 characters, upper
and lower case letters and a number. [E13]

Your Employee Center profile has no change-password link. [E25] [Q05]

## A password for another application {label=NEW}

For a system other than this one, ask the service desk. Signed in as an IT person, you also see
the **Password Reset** form: *"Request a reset of a password for a service or an application"*.
It asks whose password, which application, and how to send you the new one (**Telephone**,
**SMS** or **Email**), and it logs an incident for the service desk. [E18] [E19] [E24]

An employee doesn't see that form: it is open only to IT roles. [E20] [E21] [Q03] **Get support**
offers the *Request password reset* card only to administrators; you see the phone number.
[E26] [E27]

## When to call the service desk {label=NEW}

Call **+1-200-120-2020**, 9am to 5pm PST [E27], when:

- you didn't enrol your phone, or the code doesn't arrive;
- you failed 3 times and are blocked for 24 hours [E07] [E08];
- your account is locked [E01];
- you need a password reset for another application.

For how the service desk resets a password, see [Reset a caller's password](see:incident/reset-password).
On pdi2 the service desk can't reset it from its workspace yet [E12], so expect them to log an
incident and come back to you. [Q04]

## Tips {label=NEW}

- Enrol your phone today: you can't do it once you're locked out.
- Never tell anyone your password, including the service desk. They never need it.
- The reset link works once and only for an hour [E09]; if it expired, start again.
