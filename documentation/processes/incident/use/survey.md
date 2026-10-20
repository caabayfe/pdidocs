---
title: Tell IT how it went
reviewed: 2026-10-19
evidence:
  E01:
    record: asmt_condition/249e70b0875013005d90bba826cb0bbf
    how: read the survey trigger ITSM Demo Survey
    result: 'active; on incident, when the state changes to Closed and the incident is not part of a universal request; sent to the caller; probability 100%; repeat interval 30 days'
    hash: 56d602bed36bac7aac90a4b4aa914cd5f9ff5ebf9f4b34a6d20708364b88eb7a
  E02:
    record: asmt_metric_type/99471f319f0312006371f84bc42e70f1
    how: read the survey Short Customer Satisfaction Survey using Smiley Face
    result: 'a published survey; 14 days to answer it; can''t be retaken; answers are not anonymous; roles survey_admin and survey_reader'
    hash: dd4654a96eed275a2e4a4d910d135060d3ed48501dccad02b5ce8ad55f96c71c
  E03:
    record: asmt_metric/9b6753719f0312006371f84bc42e70e6
    how: read the question How satisfied are you with the service provided by IT?
    result: a smiley scale from 1 to 5, not mandatory
    hash: ecf3430a70ed59ae81fc6a9010db7198f21ae68460d3b3a1c55d8f953cc457c7
  E04:
    record: asmt_metric_definition/e868d3719f0312006371f84bc42e70a9
    how: read the answers of the smiley question
    result: Very Dissatisfied, Dissatisfied, Neutral, Satisfied, Very Satisfied
    hash: a4f38371bc7595b617bbabde68edbc71230b3ac1bc548cbfbcd2467d6fa9c4a4
  E05:
    record: asmt_metric/c9a817719f0312006371f84bc42e70d0
    how: read the question Tell us what you think about IT and what you want or need.
    result: free text over several lines, not mandatory
    hash: b8d43ff8fed01fa03d6cc7430f989554bc97fde89f9a253b50075c9bc1c9b8de
  E06:
    record: sysevent_email_action/b2b3e70b67a630105f74e8a331b73044
    how: read Incident Survey
    result: 'subject "Feedback makes us better"; for surveys whose task is an incident'
    hash: 7d52fea0b1e316032f733376b228611ab414ed82d414aea4dc616903426f4550
  E07:
    record: sysevent_email_action/b2b3e70b67a630105f74e8a331b73044
    field: message_html
    how: read the message of Incident Survey
    result: '"Tell us how we did with your recent request", the incident number, "Take this quick, 1-minute survey", a link, the incident''s short description'
    hash: 5266b9d3e7052f79105b6dca3fa90207a678ad437efedac9739fc3a8cacf7645
  E08:
    record: sys_script_email/f2edb642e552b010f8777565f90b2fc9
    field: script
    how: read the mail script incident_link
    result: 'in Incident Survey the link reads "Take the survey" and opens the survey itself'
    hash: cb94ff6d73f7fbc2c90b00ba791fa726456ebe8708d0bf0bc1d1244bedbb1ed9
  E09:
    record: sys_script_include/ca4033c1d7110100fceaa6859e610326
    field: script
    how: read AssessmentUtils.getAssessmentInstanceURL and redirectToPortal
    result: with email redirection on and a default portal, a survey link opens that portal's take_survey page
    hash: b92a068d029de2f90482526235e9ef9191a73964a48544792c9e70b7e7ac4b79
  E10:
    record: sp_portal/70cd9f3b734b13001fdae9c54cf6a72f
    how: read the default portal
    result: Employee Center (esc) is the default portal
    hash: 6a7a0d38d3dd84f850cb567aca0c0fe0e8c7af07e6cf73508e14eb5b93ac6d48
  E11:
    record: sp_page/51f7dcc7c3231200e44574e1c1d3ae3a
    how: read the portal page my_surveys
    result: 'My Assessments and Surveys, for any signed-in employee'
    hash: 4d810a7f940f22346de24143ce91ce23ab3ece925133a391f4247cbd2e7e7ed7
  E12:
    record: sysevent_email_action/5b82abc767a630105f74e8a331b73092
    how: read Incident closed
    result: the closed email, sent when the incident closes
    hash: cba7ed515e158d791bb4e913f0b8830a2c042abac92927daeef24f92ab4ab704
---
When your incident is closed, IT asks you how it went. It takes a minute.

## When you get it {label=NEW}

Each time one of your incidents is **closed**, you get a short survey, unless you had one in the
last 30 days. [E01] [Q67] The incident closes when you confirm the fix, or by itself after a while (see
[Confirm the fix, or reopen](see:confirm)); you receive *"Incident … was closed"* at the same
time. [E12]

You don't get one for an incident that belongs to a bigger request. [E01]

## Answer it {label=NEW}

{{animation:incsurv}}

1. Open the email **"Feedback makes us better"**. It names your incident. [E06] [E07] [Q14]
2. Choose **Take the survey**. [E08] The survey opens in **Employee Center**. [E09] [E10] [Q90]
3. Pick a face for **"How satisfied are you with the service provided by IT?"**, from *Very
   Dissatisfied* to *Very Satisfied*. [E03] [E04]
4. If you like, write what you think in **"Tell us what you think about IT and what you want or
   need."** [E05]
5. Submit it.

Both questions are optional. [E03] [E05] You have **14 days**, and you can answer only once.
[E02] Lost the email? Your open surveys are on the page **My Assessments and Surveys**. [E11] [Q91]

## Who reads it {label=NEW}

Your answers are not anonymous: the IT team that runs surveys sees who answered and about which
incident. [E02]

## Tips

- One line on what went well or badly helps more than the face alone.
- If the problem isn't fixed, don't use the survey to say so: report a new incident.

## I want to…

| I want to… | Go to |
|---|---|
| say whether the fix works | [Confirm the fix, or reopen](see:confirm) |
| report a new problem | [Report an incident](see:report) |
| know which emails I get | [Who is told what](see:who-is-told) |
