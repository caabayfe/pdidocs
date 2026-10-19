---
title: Fill in and reply with templates
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-18
      where: Service Operations Workspace › incident › side panel › Response Templates, Templates, Email template
    how: looked at the icons of the record's side panel
    result: the side panel has the icons Response Templates, Templates and Email template
  E02:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Service Operations Workspace, INC0010023, header ⋯'
    how: 'opened the overflow menu'
    result: 'Compose Email, Copy Incident, Report Knowledge Gap, Copy URL, Delete, Create new communication; no Propose or Promote'
  E03:
    record: sys_ux_lib_component/cbf864782d81b9c645a970ac48fcb2dc
    field: required_translation_keys
    how: read the labels of the Templates panel component (now-record-common-templates-connected)
    result: 'Search Templates, Create template, tabs Favorites, My Templates and All, sort A - Z, Z - A and Last used; Add to favorites, preview template, Apply, "This template will update the record as follows.", "Set Fields :"; "{0} Template Applied", "{0} Template Applied with {1} conflicts", "{0} items not present on this form"; Undo template ("Select to undo last applied template changes"), "Reapply this template?"; for text fields: Replace existing text, Insert before existing text, Insert after existing text, Insert at cursor'
    hash: 21b3779b4521053df133354332ec064428642d7bd4a063774424f40d63cedfac
  E04:
    record: sys_template/acd87481d7930200f2d224837e6103f3
    how: read Incident Call Type
    result: 'table incident, active, on the template bar; sets Channel (contact_type) to Self-service; owned by one user, not global, no groups'
    hash: 09136fcf4cecb133df1ea955d6d9ee28e49396e18e346b98fa8638f91bce51c8
  E05:
    record: sys_template/18f3f7e4c3122200b6dcdfdc64d3ae62
    how: read Major Incident
    result: 'table incident; sets a short description, the caller to whoever applies it, impact 1 and urgency 1; child template Investigation (incident task), which chains to Provide fast recovery of service and RCA; owned by one user, not global'
    hash: 240ce21502826ac56ec1f8083cd5f2fcdd6f4c7defa9b53525db12e416ae53f5
  E06:
    record: sys_template/5fd009740b2003005775aabcb4673a50
    how: read Major Incident Candidate
    result: 'table incident; sets Major incident state to Proposed; owned by one user, not global'
    hash: dd6a04ac26af98305423d91b91b60c8f0b6a2f69e62e44800e9c3b3d6d4be2ab
  E07:
    record: sys_template/ad7e30c10b2003005775aabcb4673ac9
    how: read MIM Major Incident
    result: 'table incident; sets Major incident state to Accepted; owned by one user, not global'
    hash: eaada45cfd63061e0c4bdc99499b3f327a886d3b898dcec712675b67e200d6a3
  E08:
    record: sys_template/56e62ccbc611227500adb083f968a484
    how: read Reset Password
    result: 'table incident; sets a short description, active and Channel Self-service; no owner, not global, no groups, not on the template bar'
    hash: b69963035b343a4252da8371bb4396d7b175e39df71847939b3ac1991d621232
  E09:
    record: sys_script/f5ab8f060a0a0bc50013f5ab4b8315c1
    field: script
    how: read SNC Template Query (before query on sys_template)
    result: 'for interactive users without template_editor_global, only templates that are global, or owned by the user, or shared with one of the user''s groups are returned'
    hash: 4acf0d62e57495a776964d1d4936f29196fd900f66eff4cb3b3c431250b958b8
  E10:
    record: sys_user_role_contains/5e0287f78c5143100a22deb6dd2b4e2f
    how: read the role that itil contains
    result: itil contains template_editor, so every agent can create their own templates
    hash: f60e3d3edcf336ed7551391452545b8895e6da7b3734466cb738680e57b1dd29
  E11:
    record: sn_templated_snip_note_template/0604877a53833010ae50ddeeff7b129e
    field: html_script_body
    how: read the response template Need more information (short name "more info")
    result: 'table incident; fills in the caller''s name (${caller_id.name}), the short description (${short_description}) and your name (${current_user}); asks the caller for details such as steps to reproduce'
    hash: dfae08b47dc1da4a8ad910c14ba24df78b4dd02f5f8510009c495e00ffda88cd
  E12:
    record: sn_templated_snip_note_template/4a68c73e53833010ae50ddeeff7b1297
    field: html_script_body
    how: read the response template Schedule a meeting (short name "meeting request")
    result: 'table incident; fills in the caller''s name, the short description and your name; asks the caller for their availability for a call'
    hash: e627784371c13003421ae9bd3dd7528527337b18726092c1bdbaad32eabb41d9
  E13:
    record: m2m_response_template_to_channel/2ac5d14fffc72210188affffffffff0b
    how: read the channels of the two incident response templates
    result: 'both are linked to the Form, Email and Chat channels'
    hash: 2785958e423cbee91367154896081549e9cd6a6b487b3c2281da22d37d6b574d
  E14:
    record: sys_ux_applicability/ba4f990a43ec561085678772d9b8f2b0
    how: read Show Response Template on Roles SOW, the audience of the Response Templates panel
    result: 'role sn_templated_snip.template_snippet_reader'
    hash: 4d5b3335661284f3729a5856b1d3209b9eb0a2295e983bb27239060c28e64a16
  E15:
    record: sys_user_role_contains/0e16db230b70030036e62c7885673a25
    how: searched the mirror for the roles that contain sn_templated_snip.template_snippet_reader
    result: 'only sn_templated_snip.template_snippet_writer, which only sn_templated_snip.template_snippet_admin contains, which admin contains; itil and sn_incident_write do not'
    hash: f83e722f8c3cd592e4eb547b7b392c891dd0acbb86706dcde37840231e4fe20b
  E16:
    record: sys_ux_macroponent/a3d8eaf94350121085678772d9b8f260
    how: read the Response Templates panel (Response Templates SNC)
    result: 'a "Select response template" drop-down of the templates for this record on the Form channel, the filled-in message, and a Copy to clipboard button'
    hash: e72fa3cd66a148750b3a84b1f0683900f41431a319b0ea3bd0ba89a28dde21bd
  E17:
    record: sys_ux_client_script/1b93e3554360921085678772d9b8f22a
    field: script
    how: read copy to clipboard
    result: 'copies the message as plain text (formatting removed) and shows "Copied to clipboard"'
    hash: 7698ce6a8aa86b14a28f0192ba49d994820356bcb70e5ab5c57c05b03e1b5353
  E18:
    record: sys_ui_text_command/bc158c1eff1722102e62ffffffffff6f
    field: action_script
    how: read the quick action Response Template
    result: 'command r on journal fields (work notes, additional comments); with a keyword, lists up to 9 matching Form templates for the record and inserts the chosen one as text; without one: "Enter a keyword to search for the relevant template"; none: "Template not found"'
    hash: 92a8a7f7a25e37ac39f184749301db43e44515d3aa3ee5e509869b230b29e868
  E19:
    record: sys_ui_action/0bdd499d77773300112f8b51a9106179
    field: condition
    how: read Compose Email (form menu in workspaces)
    result: 'shown on saved records you can write to, on tables with the email_client attribute, if you may use the email client'
    hash: cabb0cd5d7136394d9bf966f5a9cdf9ab86c7561fe0fe0de4ee6aa1df8e25e53
  E20:
    record: sys_dictionary/b8e4363b8c5503100a22deb6dd2b4e99
    field: attributes
    how: read the incident table's attributes
    result: email_client=true
    hash: 2a8be79e4a31b650b18d1f3e50151858bd707ff1c7eaf456518f859c3f25f91a
  E21:
    record: sys_user_role_contains/e18a5629244c8ac251ae5a40eff8bb20
    how: read the role that itil contains
    result: 'itil contains email_composer'
    hash: df8224bf6b90e3e3f22d052b65cf8ae0b475a70d5ea6fe38edf8c3fb4669a7f5
  E22:
    record: sys_ui_text_command/26f6deb8b5b87a10f877b2fb1965f070
    how: read the email quick actions View response templates (r), View email templates (e) and View drafts (d)
    result: 'in an email: r inserts a response template on the Email channel ("No response templates configured" if none); e replaces the draft with an email template; d replaces it with a saved draft'
    hash: 2c071ba6e2fc677cc97306ada827019719d3c297c79378b7cf2d99c937f7c0f1
  E23:
    record: cxs_search_res_config/382d65e343502110102b09b3c7b8f2d1
    how: read Email Templates, the search behind the Email template panel, and searched the mirror for email client templates (sys_email_client_template)
    result: 'it searches sys_email_client_template; none of the 16 in the mirror is for incident (they are for incident communication tasks, communication tasks, change requests, email replies and surveys)'
    hash: d3424c659349b835817393bc0e0ec05db49e670a297b4ce134ba09dbcf4fc469
  E24:
    record: sys_ux_screen/10139db843f47110cc25ff53e9b8f224
    field: screen_condition
    how: read Email template SNC
    result: the Email template panel appears only on tables with the email client switched on
    hash: 29e12b2999d5f57477595a7d5c5cf99e14a840a9ff0458d709b5378cbf55f116
  E25:
    record: sys_script_include/05b971650b32320036e62c7885673afd
    field: script
    how: read NoteTemplate, which fills in a response template's variables
    result: '${field} becomes the record''s value; ${Date} today''s date and ${current_user} your name; a field you can''t read, or an unknown variable, stays as the variable in red'
    hash: 1299d6f3a0d7130cdd23f45b13a822065fb522d0d6d43839545568b0228cb5a4
  E26:
    record: sys_ux_screen/483d853443f47110cc25ff53e9b8f25c
    field: screen_condition
    how: read Template SNC, the Templates panel, and searched the mirror for an audience on it
    result: 'shown on every record table except a few (templates, outages, alerts, approvals); no role audience'
    hash: 60d7515fbff28be5695e5bd17eac6ec13bee8d03e1d0f27e531c19153147d4b1
---
## Which template for what {label=NEW}

{{animation:inctmpl}}

The record's side panel has three template icons. [E01] Each does a different job:

| Icon or action | What it is | What it does |
|---|---|---|
| **Templates** | a record template | fills in fields of the incident for you [E03] |
| **Response Templates** | a prepared message | gives you a text to put in the work notes, the additional comments or an email [E16] |
| **Email template** | an email client template | gives a whole email to start from, when you write one with **Compose Email** [E23] |

**Compose Email** itself is in the header's **⋯** (More actions) menu. [E02]

## Fill in an incident with a template {label=NEW}

1. Open the incident and choose **Templates** in the side panel. [E01]
2. Find the template: **Search Templates**, or the tabs **Favorites**, **My Templates** and
   **All**. [E03]
3. Preview it: the panel says "This template will update the record as follows" and lists the
   fields it sets. [E03]
4. Choose **Apply**. The fields are filled in on the form, and the panel reports "Template
   Applied", or the number of conflicts, or fields that are not on this form. [E03]
5. Check the values, then save the incident as usual. If it was the wrong template, choose
   **Undo template** to put the last values back. [E03]

For a text field a template can replace the existing text, or insert its text before, after or at
the cursor. [E03]

**Create template** saves your own template. Every agent may do this: the `itil` role includes
the template editor role. [E10]

### The templates on pdi2 for incident {label=NEW}

| Template | Fills in |
|---|---|
| Incident Call Type | Channel = Self-service [E04] |
| Major Incident | a short description, you as caller, impact 1, urgency 1; and three incident tasks (investigation, fast recovery, root cause analysis) [E05] |
| Major Incident Candidate | Major incident state = Proposed [E06] |
| MIM Major Incident | Major incident state = Accepted [E07] |
| Reset Password | a short description, active, Channel = Self-service [E08] |

**You won't see these.** Each of the first four belongs to one user account and is not shared
globally or with a group, and *Reset Password* has no owner and isn't global. [E04] [E05] [E06]
[E07] [E08] The workspace shows you only global templates, your own and your groups'. [E09] On
pdi2, an agent's **Templates** panel therefore starts empty, apart from the templates they create.

Don't use the major incident templates to make an incident major: propose it instead, so that the
major incident manager decides. See [Propose a major incident](see:major-incident/propose).

## Reply with a response template {label=NEW}

A response template is a prepared message with gaps that are filled in from the incident. [E11]

### From the side panel

1. Choose **Response Templates** in the side panel. [E01]
2. Pick a template in **Select response template**. The message appears with the incident's
   values filled in. [E16]
3. Choose **Copy to clipboard**. The message is copied as plain text. [E17]
4. Paste it into **Additional comments** (what the caller sees) or **Work notes**, adjust it, and
   post. See [Work an incident](see:incident/work).

### While you type

In **Work notes** or **Additional comments**, use the **Response Template** quick action
(command `r`) with a keyword: it lists up to nine matching templates and inserts the one you
choose as text. [E18]

### The response templates on pdi2 for incident

| Template | Short name | Fills in |
|---|---|---|
| Need more information | more info | the caller's name, the short description, your name; asks for details [E11] |
| Schedule a meeting | meeting request | the caller's name, the short description, your name; asks when they can talk [E12] |

Both can be used on the form, in an email and in chat. [E13]

**Who sees them:** the Response Templates panel and the quick action need the role
`sn_templated_snip.template_snippet_reader`. [E14] [E18] On pdi2 only administrators have it:
neither `itil` nor `sn_incident_write` includes it. [E15] The walk that saw the icon was done as
admin. [E01]

## Write an email with Compose Email {label=NEW}

1. Open the incident and choose **⋯ › Compose Email** in the header. [E02] It is there on saved
   incidents you can update, because the incident table has the email client switched on. [E19]
   [E20] Agents have the email role through `itil`. [E21]
2. Write the email. In its body:
   - the quick action `r` inserts a response template, [E22] [E13]
   - `e` replaces the draft with an email template, and `d` with a saved draft. [E22]
3. The **Email template** panel lists email templates for the record. [E24] [E23]

On pdi2 there is **no email template for incident**: the existing ones are for communication tasks,
change requests and email replies. [E23] Start from a blank email or a response template. Emails
for a communication plan are written from the communication task instead; see
[Communicate about an incident](see:incident/communicate).

## Who sees what {label=NEW}

| Feature | Who | On pdi2 |
|---|---|---|
| **Templates** panel | everyone who opens the incident [E26] | lists global, own and group templates only; empty for agents today [E09] |
| **Create template** | `itil` (template editor) | yes [E10] |
| **Response Templates** panel and quick action | `sn_templated_snip.template_snippet_reader` | administrators only [E14] [E15] |
| **Compose Email** | who can update the incident and use the email client | `itil` [E19] [E21] |
| **Email template** panel | tables with the email client | shown, but nothing for incident [E24] [E23] |

## Tips

- Preview before you apply: a template can overwrite what you or the caller already wrote. [E03]
- Read the message after a response template fills it in. A value you can't read stays as a red
  placeholder; replace it before you post. [E25]
- A response template copied to the clipboard loses its formatting. [E17] Fix line breaks before
  posting.

## Not yet seen {label=OPEN-QUESTION}

1. The Templates panel was not opened on screen; the steps follow the component's labels. [E03]
   What does it list for an agent, and for admin?
2. Does applying **Major Incident** in the workspace also create its three incident tasks, as the
   template's child templates say? [E05]
3. Should agents have response templates? If so, `itil` (or the agents' groups) needs
   `sn_templated_snip.template_snippet_reader`. [E15]
4. How is the `r` quick action typed in Work notes on screen (for example `/r`)? [E18]
5. What does the **Email template** panel show on an incident, with no incident email template?
   [E23]
6. Should the incident templates owned by one account be shared (made global, or given to groups),
   or retired?
