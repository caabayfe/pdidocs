---
title: Choose which emails you get
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_properties/71830fa167232200eae64ce742415ac8
    field: value
    how: read glide.notification.preference.ui.enabled
    result: true; the notification preferences page is switched on
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E02:
    record: sys_app_module/fdb68384c32112002841b63b12d3ae37
    how: read the Self-Service module My Notification Preferences
    result: active, no role needed; opens /now/nav/ui/classic/params/target/notification_preferences.do
    hash: d55f54b35f4d4b5cbce8b0d0bac32ca617e1270128fd0a39a375391949efd48d
  E03:
    record: sys_ux_lib_component/8f7b91398631d3a13a67c5c9604cc16a
    field: required_translation_keys
    how: read the labels of the notification preferences page (sn_unif_nav_pref)
    result: '"Notifications preferences", "Allow notifications", System notifications, Delivery channels (Email, SMS, Push and others), "Create notification", "Subscribable Notifications", "Email Digest", and "This is a mandatory notification and cannot be turned off or unsubscribed"'
    hash: c1a5e3309b7b8b946b9fec61ca7dc66c44146be17f94c5de3d1e689238dc01a8
  E04:
    record: sysevent_email_action/58e3c1d45322301001b2ddeeff7b1266
    field: mandatory
    how: read Incident was opened (and Incident resolved 4d505448e5aeb410f8777565f90b2f13, Comment left on incident fc78e05653a6301001b2ddeeff7b128d)
    result: not mandatory; category IT Service Management
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E05:
    record: sysevent_email_action/0b4ae8c0b462b410f87755e926c386c2
    field: mandatory
    how: read Request was opened (and Request approved d0e27780b4b27050f87755e926c38683, Request completed a3360ac0672630105f74e8a331b73019)
    result: not mandatory; category Service Catalog
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E06:
    record: sysevent_email_action/aea24ac2c611227101fe910c323fb00e
    field: mandatory
    how: read Approval Request (and Request approval assigned bb32008477623010f088a0e89e5a9945)
    result: not mandatory; category Approval
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E07:
    record: sysevent_email_action/ae2ab4805bb91010f8f93eaa3d81c7c5
    how: listed the active notifications marked mandatory
    result: one of 405 active notifications, New Signal Notification Responsible User, for analytics owners; none for employees
    hash: 1774aa510835392bea6db9535980c1aee739704812ad1f54d91622640b495ca1
  E08:
    record: sysevent_email_action/9546d4509f131200f45c7b9ac42e70ca
    field: mandatory
    how: read Password Reset - Reset Link
    result: not mandatory; it carries the link to reset your password
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E09:
    record: sysevent_email_action/8e0aa4580a0a0286007245685cbff26b
    how: read Location affected
    result: 'subscribable; "Your subscribed location … is being affected by INC…"'
    hash: 8f4301114453ca1755b1bc6deae4c55c404d0a511b801c76898d6bb2fba10310
  E10:
    record: sys_script/0a7daca70a0a0b1d00b156b6b953267b
    how: read Affected location notifications
    result: active; when a ticket with affected locations is updated, tells the subscribers of each location and of the locations above it
    hash: d320ff3c6d9868f39f14562b05d23451e10e7cb1ebc3cb352379814a921da802
  E11:
    record: sysevent_email_action/8e0a46fa0a0a0286002d78c0934d827c
    how: read the other subscribable incident notifications (CI affected; Group affected c8378399c0a80a16007243ab16d423d8; Cost center affected 8e0ac2b70a0a028600ce0aaed477bb41)
    result: subscribable; email you when an incident affects a system, group or cost centre you subscribed to
    hash: 42e869520ab18888b59f30ba6e7bcc7a19a431202840130782f409c14a8d42d5
  E12:
    record: sys_email_layout/9d3d6f8777823010f088a0e89e5a997f
    how: read the Employee notification layout
    result: 'the footer of each email holds an unsubscribe link and a preferences link'
    hash: 0abae2f3e8cfc238437246c3e5335618f896edfb9b4454dff580a2bb12d294ca
  E13:
    record: sysevent_email_template/1462e7ca918a3010f877b1d70a4d6a3d
    how: read the Employee notification template
    result: uses the Employee notification layout; Incident was opened and Location affected use it
    hash: 7e93bb567dd4ef1c2f6ba56beb73fcc4de2d5d7ac7c7c615e12d2f24ae22afe7
  E14:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Employee Center › profile (esc?id=user_profile), and the bell
    how: opened the profile and the bell's panel
    result: 'profile: About, User preferences (Accessibility enabled, Time zone, Configure Multi-Factor Authentication, View Identity Center), no notification preferences; bell: Unread toggle, Filter by, ⋮ › Mark all as read, no settings'
  E15:
    record: sn_ex_sp_notifs_portal_notification_config/69a7295377701210f1d7756f1b5a99f6
    how: read the Employee Center notifications configuration
    result: the bell shows a count; each notification can be marked as read, kept as a reminder or cleared
    hash: cfe8465b99c4332bfcb06fb8769e0d52ed907646d14915e86403c2e934416a63
  E16:
    record: sp_page/e2f75af6534132007a97e192d5dc3422
    how: read the portal page actsub_notif_pref
    result: '"Subscription & Notification Preferences", for employees; its widget (sp_widget 9e59def6534132007a97e192d5dc345f) shows "Notifications and Subscriptions" with Subscriptions and Save'
    hash: 04459773e22f2e95e7603951db3202fc4e380c026261a58925faa7d1df7023e5
  E17:
    record: sys_script_email/5171c08767113200d358bb2d07415a83
    how: read km_notif_pref_url
    result: knowledge emails link to that page ("here")
    hash: 6cab381c84da122f23744de37aa5dfc8a7ebef69dc4bc191effbad983386934b
  E18:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Employee Center › a knowledge article
    how: read the article's header
    result: 'favourite (heart), Subscribe, Actions'
---
IT sends you emails about your incidents, requests and approvals. You can switch most of them off,
and you can subscribe to a few more, such as when an incident affects your office. It's done in
**notification preferences**, not in Employee Center.

{{animation:helpnotif}}

## Emails and the bell {label=NEW}

There are two kinds of notification:

- **Emails**: *"Incident … was created"*, *"Request … was created"*, approvals waiting for you,
  and so on. These are what your preferences control. [E04] [E05] [E06]
- **The bell** in Employee Center: the same news, on screen. You can mark each one as read, keep
  it as a reminder or clear it, but the bell has no settings. [E14] [E15] See [Using Employee
  Center](see:employee-center).

## Where to change them {label=NEW}

Employee Center has no notification settings: neither your profile nor the bell has them. [E14]
Use one of these instead:

- **The link at the bottom of an IT email.** Every email from IT ends with an *unsubscribe* link
  and a *preferences* link. [E12] [E13]
- **My Notification Preferences**, in the **Self-Service** menu of the instance. Nobody needs a
  special role for it. [E01] [E02]

## Switch an email off {label=NEW}

1. Open your **notification preferences**. [E02]
2. Under **System notifications**, find the email, for example *Comment left on incident*.
   Search needs 3 characters. [E03]
3. Turn its switch off. The page saves it for you.

**Allow notifications** at the top switches all of them off at once. [E03] Don't: you would
also miss the approvals waiting for you and the password reset link. [E06] [E08]

Some emails are **mandatory**: the page says *"This is a mandatory notification and cannot be
turned off or unsubscribed"*. [E03] None of the emails IT sends employees on pdi2 is mandatory.
[E04] [E05] [E06] [E07]

## Subscribe to more {label=NEW}

A few notifications are **subscribable**: you receive them only if you ask. [E03] The useful one
for employees is **Location affected**: *"Your subscribed location … is being affected by
INC…"*. [E09] You are told when an incident affecting your office, or a building it belongs to,
is updated. [E10]

1. In your notification preferences, choose **Create notification**. [E03]
2. **Select notification**: choose *Location affected*.
3. Choose the location, then where you want to be told (**Email**) and, if you like, a
   schedule. [E03]
4. **Save**.

You can subscribe in the same way when an incident affects a system, a group or a cost centre.
[E11]

### Knowledge articles {label=NEW}

To hear when a help article changes, open it in Employee Center and choose **Subscribe**. [E18]
You manage those subscriptions on the **Subscription & Notification Preferences** page, which
the knowledge emails link to. [E16] [E17]

## Tips {label=NEW}

- Turn off what you don't need, one by one, rather than everything.
- **Email Digest** groups some emails into one, if you prefer fewer messages. [E03]
- Turning an email off doesn't stop the work: your ticket goes on, and the bell and My Requests
  still show it. [E15]

## Not yet seen {label=OPEN-QUESTION}

1. **Can employees open My Notification Preferences?** It is in the instance's Self-Service
   menu [E02], but employees work in Employee Center, which has no link to it. [E14] Walk it as
   an employee, and consider a link in the Employee Center profile menu.
2. **Where do the email footer links lead?** Check that *unsubscribe* and *preferences* appear
   in a real email and open a page an employee can use. [E12]
3. **Location affected relies on agents filling in affected locations** [E10]. Is that done for
   outages? If not, don't promote the subscription.
4. The preferences page and the steps above were not walked; they follow the page's labels.
   [E03]
