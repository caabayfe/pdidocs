---
title: Work on an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_policy/d8e02184c3b30200b6dcdfdc64d3ae30
    how: read When state is On Hold the On hold reason field is visible and mandatory
    result: On Hold requires an On hold reason
    hash: b8f1c64dc520d3681d801aafa742de23113ce6d8a0158d2ec3c12f7e85321a48
  E02:
    record: sys_ui_policy/31aa2d560b001300ed45478d83673a41
    how: read the policy for Awaiting Caller
    result: additional comments are mandatory when the reason is Awaiting Caller
    hash: b9986e88868b554c8a2a505339713ecd235f556c743d287b0bdb30d19eec2aab
  E03:
    record: sysevent_email_action/fc78e05653a6301001b2ddeeff7b128d
    how: read Comment left on incident
    result: additional comments email the caller
    hash: d097069e0b8fbd39394376644766e8aa8a70426cb0bf04e7baed8585f52a7272
  E04:
    record: sysevent_email_action/fc468017536270108b91ddeeff7b128d
    how: read Incident worknoted for ITIL
    result: work notes email only the assignee and the work notes list
    hash: 7480890492550ade5fcb96ba179c7a9753739b39f07ee8247fa380021a364ac9
  E05:
    record: contract_sla/35420982d732220035ae23c7ce610393
    how: read Priority 1 resolution (1 hour)
    result: the resolution deadline pauses while On Hold - Awaiting Caller and while Resolved
    hash: 6157ef1df804d16a5907062d37e4c485a8acec29cf19eaeb923f59159f793aa9
  E06:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    how: read Update Incident when Problem closes
    result: incidents On Hold - Awaiting Problem are resolved when the problem is fixed
    hash: 79e29d77e4e35595e57cc10caba2d772119cbbe0fc18a4751582359604a95070
---
## Talk to the right audience

| Write in | Who sees it | Use it for |
|---|---|---|
| **Additional comments** | the caller (emailed) and the team [E03] | questions to the caller, progress they should know |
| **Work notes** | support teams only [E04] | findings, what you tried, hand-over notes |

Keep the caller informed in plain words. Keep the detail for the work notes.

## When you have to wait

Set **State** to **On Hold** and choose the **On hold reason**. [E01]

| Reason | Use it when | What happens |
|---|---|---|
| **Awaiting Caller** | you need information or a test from the caller | write your question in *Additional comments* (required) [E02]; the fix deadline stops; the caller's reply puts it back to *In Progress* |
| **Awaiting Change** | the fix needs a planned change | link the change in *Related Records* |
| **Awaiting Problem** | the cause is being worked on as a problem | link the problem; when it is fixed, the incident is resolved for you [E06] |
| **Awaiting Vendor** | a supplier must act | note the vendor's reference in the work notes |

When you take it off hold, set the state back to **In Progress**; the reason clears.

## Deadlines

The incident shows its SLAs (the deadlines) in the **Task SLAs** list at the bottom of the form.
Watch the **response** deadline (someone has taken it) and the **resolution** deadline (it is
fixed and closed). The resolution deadline stops while you wait for the caller, and while the
incident is resolved waiting for confirmation. Waiting for a change, a problem or a vendor does
**not** stop it. [E05]

{{animation:inclife}}

## Changing the priority while you work

If the impact or urgency changes, update them. You must add a work note explaining the change.

## Tips

- Update the incident when something changes, not only when you finish. A silent incident looks
  forgotten to the caller.
- Before you put it On Hold - Awaiting Caller, ask a question the caller can actually answer.
