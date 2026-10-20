---
title: Incident satisfaction survey - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: asmt_condition/249e70b0875013005d90bba826cb0bbf
    how: read the trigger condition ITSM Demo Survey
    result: 'active; table incident; condition stateCHANGESTO7^universal_requestISEMPTY; user field caller_id; assessment 99471f31…; trigger randomly false, probability 100; repeat interval 30 days; business rule 01de34b0…'
    hash: 56d602bed36bac7aac90a4b4aa914cd5f9ff5ebf9f4b34a6d20708364b88eb7a
  E02:
    record: sys_script/01de34b0875013005d90bba826cb0b88
    how: read Auto assessment business rule (async, insert and update, order 300)
    result: "condition AssessmentUtils.conditionCheck(current, 'stateCHANGESTO7^EQ'); calls sn_assessment_core.AssessmentCreation.conditionTrigger with the trigger condition 249e70b0…"
    hash: 354055e8c0ef67a4424fcf7f5ae4bff86a9c42558c5d12ae71020ed7487dce26
  E03:
    record: sys_script_include/ca4033c1d7110100fceaa6859e610326
    field: script
    how: read AssessmentUtils.conditionCheck, getAssessmentInstanceURL and redirectToPortal
    result: 'conditionCheck is a GlideFilter match; the instance URL is <default portal>?id=take_survey&instance_id=… (public_survey when public) when the Service Portal survey plugins are active, a default portal exists and email redirection is on; otherwise assessment_take2.do'
    hash: b92a068d029de2f90482526235e9ef9191a73964a48544792c9e70b7e7ac4b79
  E04:
    record: asmt_metric_type/99471f319f0312006371f84bc42e70f1
    how: read Short Customer Satisfaction Survey using Smiley Face
    result: 'evaluation method survey; published; on demand; assessment duration 14 days; allow retake false; anonymize false; send notifications true; notify if overdue false; scoring percent; roles survey_admin, survey_reader; not public'
    hash: dd4654a96eed275a2e4a4d910d135060d3ed48501dccad02b5ce8ad55f96c71c
  E05:
    record: asmt_metric/9b6753719f0312006371f84bc42e70e6
    how: read How satisfied are you with the service provided by IT?
    result: datatype imagescale, 1 to 5, scale high, not mandatory, not scored
    hash: ecf3430a70ed59ae81fc6a9010db7198f21ae68460d3b3a1c55d8f953cc457c7
  E06:
    record: asmt_metric_definition/e868d3719f0312006371f84bc42e70a9
    how: read the smiley question's answer definitions
    result: 1 Very Dissatisfied, 2 Dissatisfied, 3 Neutral, 4 Satisfied, 5 Very Satisfied
    hash: a4f38371bc7595b617bbabde68edbc71230b3ac1bc548cbfbcd2467d6fa9c4a4
  E07:
    record: asmt_metric/c9a817719f0312006371f84bc42e70d0
    how: read Tell us what you think about IT and what you want or need.
    result: datatype string, multiline, not mandatory, not scored
    hash: b8d43ff8fed01fa03d6cc7430f989554bc97fde89f9a253b50075c9bc1c9b8de
  E08:
    record: sysevent_email_action/b2b3e70b67a630105f74e8a331b73044
    how: read Incident Survey
    result: 'asmt_assessment_instance; event record.send_survey; condition task_id set and task_id.sys_class_name=incident; recipient event.parm1; subject "Feedback makes us better"; not subscribable'
    hash: 7d52fea0b1e316032f733376b228611ab414ed82d414aea4dc616903426f4550
  E09:
    record: sys_script_email/f2edb642e552b010f8777565f90b2fc9
    field: script
    how: read incident_link
    result: 'for Incident Survey: link = event.parm2, text "Take the survey"'
    hash: cb94ff6d73f7fbc2c90b00ba791fa726456ebe8708d0bf0bc1d1244bedbb1ed9
  E10:
    record: sysevent_email_action/3a92de88672630105f74e8a331b7300a
    how: read Request survey
    result: the same event for surveys whose task is a request (sc_request)
    hash: 9465a06d0507a1c9033eaea4cc48f2fda71a05cd84a118e73aa4312f0c7f6a2d
  E11:
    record: sysevent_email_action/9df8615dd7220100c11180f29e610369
    how: read Notify assessment user
    result: 'event assessment.received, only for metric types with evaluation method assessment; the reminder and overdue notifications filter the same way'
    hash: da59133fd07cf5959ffd61e142ae4c39324494a2b8afa7fe7f8c3989cc8d4e29
  E12:
    record: sys_properties/dcd0aea56730220005d1ff5557415a9a
    field: value
    how: read sn_portal_surveys.sp_survey.email_redirection
    result: "true: survey links from email open in the portal"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E13:
    record: sp_portal/70cd9f3b734b13001fdae9c54cf6a72f
    how: read the default portal
    result: Employee Center, suffix esc, default true
    hash: 6a7a0d38d3dd84f850cb567aca0c0fe0e8c7af07e6cf73508e14eb5b93ac6d48
  E14:
    record: sp_page/ba1e4495c3331200e44574e1c1d3ae09
    how: read the portal page take_survey (sn_portal_surveys)
    result: Take Survey, no roles
    hash: b9f8b557b358e8aa8e2950db595200efb8e1a5912e7430a245ba254ac3bbc8ca
  E15:
    record: sp_page/51f7dcc7c3231200e44574e1c1d3ae3a
    how: read the portal page my_surveys (sn_portal_surveys)
    result: My Assessments and Surveys, roles snc_internal and snc_external
    hash: 4d810a7f940f22346de24143ce91ce23ab3ece925133a391f4247cbd2e7e7ed7
  E16:
    record: sys_app_module/9db3136bbfe001007a6d257b3f0739dd
    how: read Self-Service › My Assessments & Surveys
    result: assessment_list.do?sysparm_show=user, no roles
    hash: 4ceff55c7fa9f41931dc236a647fdd87b687b481b142ab02bfda79ec3d47cc64
  E17:
    record: sys_app_module/69900cdb67800300a8532b505685efcc
    how: read Survey › Survey Instances › Completed
    result: completed survey instances, newest first, view survey; roles survey_admin, survey_reader, survey_creator
    hash: 3a8ac6cf9dce94d4eee641abe43020e173472eb0f06ac77c07026d1fd2f95d91
  E18:
    record: sys_app_module/cfe33363d7111100158ba6859e6103df
    how: read Survey › Survey Responses
    result: list of asmt_metric_result; roles survey_admin, survey_reader, survey_creator
    hash: d30c15549afab4bede2971d08eab7b82ea77b4ebf4d127dbf056441bffe9a860
  E19:
    record: sys_app_module/0d8d9aa0bf011100eae043fada073916
    how: read Survey › Trigger Conditions
    result: list of asmt_condition; roles survey_admin, survey_creator
    hash: 0f80e202dbd92681e301ad51d516dbfaf66e2fc5c37fab85116d1cd4a0216b6c
  E20:
    record: sys_ui_related_list/fa3f3ac143e9d2108c5fa32d68b8f24b
    children: sys_ui_related_list_entry
    how: read the incident's related lists in the Service Operations Workspace view
    result: sixteen related lists; none on asmt_assessment_instance
    hash: 1dc5e75dcb9cb55b773b0992baca4499230041ea4b78c3d3db3162b600bf30b5
---
## The applications {label=NEW}

| Scope | What it gives |
|---|---|
| global (Assessments and Surveys) | the trigger condition, its business rule, the survey and its questions, the Incident Survey email [E01] [E02] [E04] [E08] |
| `sn_assessment_core` | `AssessmentCreation`, which creates the survey instance; not in the mirror [E02] |
| `sn_portal_surveys` | the portal pages *Take Survey* and *My Assessments and Surveys*, and the email redirection property [E12] [E14] [E15] |

The census lists only the business rule (*Auto assessment business rule*, global) for this
feature: the trigger condition, the survey and its email are on tables outside the process.

## 1. The trigger {label=NEW}

1. *Auto assessment business rule* runs async after an insert or update of an incident whose
   state changes to 7 (Closed). [E02] [E03]
2. It passes the trigger condition *ITSM Demo Survey* to `AssessmentCreation.conditionTrigger`.
   [E02] [shared/Q08]
3. The trigger's full condition adds that the incident has no universal request. The survey goes
   to `caller_id`, always (probability 100%), at most once per caller per 30 days (repeat
   interval). [E01]

Steps 2 and 3 are done by `sn_assessment_core`, which isn't in the mirror: the repeat interval's
exact effect is read from the record, not from code. [Q67]

## 2. The survey {label=NEW}

*Short Customer Satisfaction Survey using Smiley Face*: published, on demand, 14 days to answer,
no retake, not anonymous, not public. [E04]

| Order | Question | Type | Mandatory |
|---|---|---|---|
| 100 | How satisfied are you with the service provided by IT? | smiley scale 1-5 [E05] [E06] | no |
| 100 | Tell us what you think about IT and what you want or need. | multi-line text [E07] | no |

Neither question is scored. [E05] [E07]

## 3. The invitation {label=NEW}

*Incident Survey* listens to `record.send_survey` on `asmt_assessment_instance` when the
instance's task is an incident; it sends to parm1 with the subject *"Feedback makes us better"*.
[E08] Its link is the survey URL passed in parm2, labelled *Take the survey*. [E09] The
email says *"your recent request"*, though it is about an incident. [Q14] Requests have
their own *Request survey* on the same event. [E10]

The reminder and overdue notifications filter on the evaluation methods assessment, quiz,
attestation or test plan, so none reminds a caller about this survey.
[E11] [E04] [Q33]

## 4. Where it is answered {label=NEW}

Email redirection is on and Employee Center is the default portal, so the link opens
`esc?id=take_survey&instance_id=…`. [E03] [E12] [E13] [E14] A caller can also find open surveys
on the portal page *My Assessments and Surveys* [E15], or in the platform under *Self-Service ›
My Assessments & Surveys* [E16].

## 5. Where results are seen {label=NEW}

| Module | Shows | Roles |
|---|---|---|
| Survey › Survey Instances › Completed | each answered survey, newest first [E17] | `survey_admin`, `survey_reader`, `survey_creator` |
| Survey › Survey Responses | each answer (`asmt_metric_result`) [E18] | `survey_admin`, `survey_reader`, `survey_creator` |
| Survey › Trigger Conditions | the trigger [E19] | `survey_admin`, `survey_creator` |

The survey's own roles are `survey_admin` and `survey_reader`. [E04] The incident has no survey
related list in Service Operations Workspace, so agents don't see the answers on the incident.
[E20] [Q34]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `sn_portal_surveys.sp_survey.email_redirection` | true | email links open the portal, not the platform [E12] |
