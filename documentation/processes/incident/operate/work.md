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
    result: the resolution deadline pauses while On Hold - Awaiting Caller and while Resolved, and stops at Closed
    hash: 6157ef1df804d16a5907062d37e4c485a8acec29cf19eaeb923f59159f793aa9
  E06:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    how: read Update Incident when Problem closes
    result: "incidents On Hold - Awaiting Problem are resolved when the problem's resolution code is fix_applied; with risk_accepted they only get a work note"
    hash: 79e29d77e4e35595e57cc10caba2d772119cbbe0fc18a4751582359604a95070
  E07:
    record: sys_ui_section/4059739977453010dc2c885d9f5a9911
    children: sys_ui_element
    how: read the workspace form's Notes section
    result: work notes, additional comments, the activity stream, actions taken
    hash: 2adf9dd40253048e69440d4fbe30041cb4bd56e1c625d15f8edc82ee3b817837
  E08:
    record: sys_script_client/ed5392f3c3122200b6dcdfdc64d3ae96
    how: read Worknotes mandatory onChange of priority
    result: a work note is required when the priority of an existing incident changes
    hash: 85e1e0ad4eb9c3abd45d92b342ccb970bc5edae319c7179f8ac28b106d849498
  E09:
    record: sys_script/ac79b245c31b220035ae3f52c1d3ae77
    how: read Clear On Hold Reason
    result: leaving On Hold clears the On hold reason
    hash: 05bc25fd736b7f0fe3cef91e841f18031074ba38eb5caf397e0bb910bce78fd6
  E10:
    record: sys_script/162581e087133200b4ae6c5837cb0b1a
    how: read Incident State Change to In Progress
    result: a comment from the caller while On Hold - Awaiting Caller puts the incident back to In Progress
    hash: f4a62fc198d894d826c0208e5e0e606e78139e16118c59d6c52e02bd8be29828
  E11:
    record: sys_ux_app_route/0bd6c17843b47110cc25ff53e9b8f288
    how: read the side panel route Attachments (sn_sow)
    result: "a paperclip icon, Attachments, in the record's side panel"
    hash: 34f0b43a600c8c1672bc3c7557b19f51d799cc06b01ce2693017fc76f717b2e8
  E12:
    record: sys_ux_lib_component/3b442b0a49981f104f75325e7baf6ef6
    field: required_translation_keys
    how: read the labels of the attachments component (now-record-common-attachments-connected)
    result: 'Add file, Drag & drop or select files, Upload, Search attachments, Sort by newest to oldest, Preview, Download, Download all, Rename, Delete ("Attachment will be deleted permanently."), Max file size: {0}, Supported formats: {0}, "{0} failed to upload because the file type is not permitted, or the file type does not match the file content."'
    hash: 21b3779b4521053df133354332ec064428642d7bd4a063774424f40d63cedfac
  E13:
    record: sys_script_include/ffbb141c471103007a977eaecb9a712e
    field: script
    how: read AttachmentSecurity.canRead, used by the sys_attachment read ACL
    result: whoever can read the incident can read its attachments
    hash: 32e48cb1e4c6c755bdd7368f8b83e272ff125f77f9ac7d1b83fb92cab00fc754
  E14:
    record: sys_security_acl/0bcff9740a0006d400ae1a384168533a
    field: script
    how: read the create ACL on sys_attachment
    result: you can add an attachment if you can write to the incident
    hash: 308f8c88bd1b89c1928419596e4c11488c6e83cd5b90b4d13dfaefa2b69ee94f
  E15:
    record: sys_security_acl/0c66472a0a0a0b82017c1f3df66a3fe7
    field: script
    how: read the delete ACL on sys_attachment
    result: you can delete an attachment if you can write to the incident
    hash: 69184e554410c8bb52afdf5cf5b46ec236c0187be5aecd70af2c5a873cd5beec
  E16:
    record: sys_properties/2e89e7edc0a80027000beaeebb29707a
    field: value
    how: read com.glide.attachment.max_size
    result: 1024 (MB)
    hash: e39eef82f61b21e2e7f762fcc4307358f165757f2e77ec855d6992f7e0191932
  E17:
    record: sys_properties/167afa3b8cd903100a22deb6dd2b4e2a
    field: value
    how: read glide.security.file.mime_type.validation
    result: "true: a file whose content doesn't match its type is refused"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E18:
    record: sp_instance/47af3d50d7000200a9ad1e173e24d4f6
    how: read the Attachments widget on the portal's ticket page
    result: the Ticket Attachments widget, active, no roles
    hash: 62925ca9ea67737c3a4bfc6decb0485e4d147b5bc2140fe2b2010a6a2880f654
  E19:
    record: sp_widget/9ee37281d7033100a9ad1e173e24d457
    field: script
    how: read Ticket Attachments
    result: 'shown to anyone who can read the record; the caller can add files if they can write to it; deleting one from the portal adds the comment "deleted an attachment"'
    hash: 9a49985d9470b4fd4ab991b244cbcc7952bfd45707f9c70029411e6b93352913
  E20:
    record: sysevent_email_action/fc78e05653a6301001b2ddeeff7b128d
    field: include_attachments
    how: read Comment left on incident
    result: "false: the email doesn't carry the incident's attachments"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E21:
    record: sys_properties/4db639b577e60110c4501238bd5a9976
    field: value
    how: read glide.activity.attachment_preview
    result: "true: the activity stream shows a preview of each attachment"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E22:
    record: sys_script_client/5601ea5f0a0a0b4b0055644e71c28968
    field: script
    how: read (BP) Hide Attachment Link when Closed
    result: on load of a Closed incident (state 7), the form switches attachments off
    hash: d47ca8f7d3244524dedce3aa7b8c82ca5e050a4ff78130ea6337f05b0817a0f7
---
## Talk to the right audience

| Write in | Who sees it | Use it for |
|---|---|---|
| **Additional comments** | the caller (emailed) and the team [E03] | questions to the caller, progress they should know |
| **Work notes** | support teams only [E04] | findings, what you tried, hand-over notes |

In the workspace both are in the form's **Notes** section, above the activity stream. [E07]
Keep the caller informed in plain words. Keep the detail for the work notes.

## When you have to wait

Set **State** to **On Hold** and choose the **On hold reason**. [E01]

| Reason | Use it when | What happens |
|---|---|---|
| **Awaiting Caller** | you need information or a test from the caller | write your question in *Additional comments* (required) [E02]; the fix deadline stops [E05]; the caller's reply puts it back to *In Progress* [E10] |
| **Awaiting Change** | the fix needs a planned change | link the change in *Related Records* (see [Raise a change](see:change/raise)); nothing takes it off hold for you when the change is done |
| **Awaiting Problem** | the cause is being worked on as a problem | link the problem (see [Link incidents to a problem](see:problem/link)); when the problem is closed as *Fix applied*, the incident is resolved for you; if the problem team accepts the risk instead, you only get a work note and the incident stays on hold [E06] |
| **Awaiting Vendor** | a supplier must act | note the vendor's reference in the work notes; nothing takes it off hold for you |

Only *Awaiting Problem* ends by itself, and only for a fixed problem. [E06] For the other reasons,
you take the incident off hold.

When you take it off hold, set the state back to **In Progress**; the reason clears. [E09]

## Deadlines

The incident shows its SLAs (the deadlines) in the **Task SLAs** list at the bottom of the form.
Watch the **response** deadline (someone has taken it) and the **resolution** deadline. The
resolution deadline pauses while you wait for the caller and from the moment you resolve the
incident, and it completes when the incident closes. So it is met when you **resolve** the
incident in time, as long as it isn't reopened. Waiting for a change, a problem or a vendor does
**not** pause it. [E05]

{{animation:inclife}}

## Changing the priority while you work

If the impact or urgency changes, update them. You must add a work note explaining the change.
[E08] See [Set the priority](see:prioritise).

## Add and find attachments {label=NEW}

Screenshots, logs and error files belong on the incident, not in someone's mailbox. In the
workspace, open the **Attachments** icon (the paperclip) in the record's side panel. [E11]

- **Add**: choose **Add file**, or drag files onto the panel, then **Upload**. [E12]
- **Find**: **Search attachments**, and sort by newest or oldest. [E12]
- **Open**: **Preview** a file, or **Download** it; **Download all** takes every file. [E12]
- **Tidy**: **Rename** a file, or **Delete** it. Deleting is permanent. [E12]

Each file also shows in the activity stream, with a preview. [E21]

| Who | Can |
|---|---|
| anyone who can open the incident | see and download its attachments [E13] |
| anyone who can update the incident | add and delete attachments [E14] [E15] |

Limits on pdi2: a file can be up to 1024 MB [E16], and a file whose content doesn't match its
type is refused [E17]. The panel shows the maximum size and the allowed formats when they are
set. [E12]

Once the incident is **Closed**, the form switches attachments off: add files before it
closes. [E22]

**The caller sees them too.** The portal's ticket page has an **Attachments** panel: the caller
sees every attachment on their incident, including the ones you add, and can add their own
while they may update it. [E18] [E19] Don't attach anything the caller shouldn't read: unlike
work notes, an attachment can't be kept to the support teams. [E13]
Emails about comments don't carry the attachments. [E20]

## Tips

- Update the incident when something changes, not only when you finish. A silent incident looks
  forgotten to the caller.
- Before you put it On Hold - Awaiting Caller, ask a question the caller can actually answer.

## Not yet seen {label=OPEN-QUESTION}

1. The Attachments panel was read from the mirror only; no walk has recorded it yet. Does the
   paperclip show a count, and does the workspace honour the closed-incident script [E22] as the
   classic form does?
2. Does the panel show allowed formats on pdi2? The list of allowed extensions isn't in the
   mirror.
3. When a caller deletes a file on the portal, a comment *"deleted an attachment"* is added
   [E19]: do resolvers know to expect it?
