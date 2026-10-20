---
title: Templates and response templates - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_ux_app_route/443d853443f47110cc25ff53e9b8f257
    how: read Templates (sn_sow), a route of the SOW record side panel
    result: 'icon document-template-outline, order 800, screen Template SNC'
    hash: 86271022ae5be95e5533ca795372acbd0d95f87d0796d37c6aa4a4c4b3e3988f
  E02:
    record: sys_ux_screen/483d853443f47110cc25ff53e9b8f25c
    field: screen_condition
    how: read Template SNC and searched the mirror for an applicability on it
    result: 'all tables except sys_template, cmdb_ci_outage, sn_occ_custom_alert, sn_occ_log_viewer_search, em_alert and sysapproval_approver; no audience; macroponent Template (sn_record_page), which embeds Record templates (sn_now_record_side)'
    hash: 60d7515fbff28be5695e5bd17eac6ec13bee8d03e1d0f27e531c19153147d4b1
  E03:
    record: sys_ux_lib_component/cbf864782d81b9c645a970ac48fcb2dc
    field: required_translation_keys
    how: read now-record-common-templates-connected
    result: 'search, Favorites / My Templates / All, Create template, preview, Apply, Undo template, Reapply, conflict and "not present on this form" messages; template v2 options (field conditions, Email content, Update to, Content placement) with the warning that they restrict a template to Workspace'
    hash: 21b3779b4521053df133354332ec064428642d7bd4a063774424f40d63cedfac
  E04:
    record: sys_declarative_action_assignment/d1e5f3aeb3a033002bf182c136a8dc2b
    how: read Templates (sn_itsm_workspace), the census claim
    result: 'Agent Workspace contextual side panel action on incident, active; script condition glide.ui.show_template_bar.<table> (default true); no required roles'
    hash: 329248fa584d303a7637a3ff17b26089dcf1bdb680319278c584d26291b54ebd
  E05:
    record: sys_declarative_action_assignment/9f7bc17d53332300099addeeff7b1208
    how: read Templates (global)
    result: 'the same contextual side panel action for every table, active, same condition'
    hash: 7f0033527e45a12c0db282b865f598fb44a7332fabce54b902ac43b936578b39
  E06:
    record: sys_script/f5ab8f060a0a0bc50013f5ab4b8315c1
    field: script
    how: read SNC Template Query
    result: 'before query, active; for interactive users without template_editor_global (and not on sttrm_base_template tables) adds global=true OR user=me OR groups in my groups'
    hash: 4acf0d62e57495a776964d1d4936f29196fd900f66eff4cb3b3c431250b958b8
  E07:
    record: sys_security_acl/8f66f7f1c0a80165015fb84a5081ef10
    field: script
    how: read the sys_template read ACL
    result: 'condition global or user is me; script: the user has the template''s roles (empty roles pass) or is in one of its groups'
    hash: 64eca963de72cff63ce4a8cfb9a6f19e3d50e8eeb53a3f792be907e26db45715
  E08:
    record: sys_security_acl/d5f55ab0f3211200a29a4af234612bf4
    how: read the sys_template read ACL with a role
    result: template_editor_global reads every template
    hash: b002a0aab79966f9ba24dc0deb2f53a8782dedec8e517ef124b3d23531381756
  E09:
    record: sys_security_acl/1b76dab0f3211200a29a4af234612b07
    how: read the sys_template read ACL for groups
    result: 'template_editor_group, for templates shared with one of the user''s groups'
    hash: ccffe651c23a4d96c70afed1786ab248136a6f12b94829baf4742c921ed83b2d
  E10:
    record: sys_security_acl/8f33087ec0a8016500aeac57c249f3c8
    field: script
    how: read the sys_template create ACL
    result: template_editor, template_editor_global or template_editor_group
    hash: 2dddf063aec9551759995e5ffdce319404b0648a73ee531a3eeb2eb86866e7a0
  E11:
    record: sys_user_role_contains/5e0287f78c5143100a22deb6dd2b4e2f
    how: read itil's contained roles
    result: itil contains template_editor
    hash: f60e3d3edcf336ed7551391452545b8895e6da7b3734466cb738680e57b1dd29
  E12:
    record: sys_user_role_contains/d60247f78c5143100a22deb6dd2b4ee1
    how: read sn_incident_write's contained roles
    result: sn_incident_write contains template_editor
    hash: eb223a13e04e4b18714a7f8747cac5d6bec87994ea8b601bed7e569b9e57dad5
  E13:
    record: sys_template/acd87481d7930200f2d224837e6103f3
    field: template
    how: read Incident Call Type
    result: 'contact_type=self-service; active, show_on_template_bar true, global false, user set, no groups or roles, v2 false'
    hash: 7a1376c332ee07ee41903a3e9614e1f994ae5d9050a6724715fa824f32725cc2
  E14:
    record: sys_template/18f3f7e4c3122200b6dcdfdc64d3ae62
    field: template
    how: read Major Incident
    result: 'short_description, caller_id=javascript:gs.getUserID(), impact=1, urgency=1; next_child Investigation; global false, user set'
    hash: e08f95f9325e0871003b0ddaaf62eafd58face1e1fc7d3de647ca4619313317c
  E15:
    record: sys_template/14343be4c3122200b6dcdfdc64d3ae73
    how: read Investigation, Provide fast recovery of service (7c847be4…) and RCA (65c4bbe4…)
    result: 'incident_task templates linked by parent, chained by next: Investigation → Provide fast recovery of service → RCA; each sets a short description; global false, user set'
    hash: 0347c45413413d2eb0449085f53569a1ab8f6a0b7f7e3703d7617b890b0640e6
  E16:
    record: sys_template/5fd009740b2003005775aabcb4673a50
    field: template
    how: read Major Incident Candidate
    result: 'major_incident_state=proposed; global false, user set'
    hash: ddd3d6b7bb590ec9e73993acffe832714840b98f4ffdc17eaca9602e9bd79379
  E17:
    record: sys_template/ad7e30c10b2003005775aabcb4673ac9
    field: template
    how: read MIM Major Incident
    result: 'major_incident_state=accepted; global false, user set'
    hash: de947633401a68b66abc02b794c75231a3c631967cc150e02b4eae64d3bd79fb
  E18:
    record: sys_template/56e62ccbc611227500adb083f968a484
    field: template
    how: read Reset Password
    result: 'short_description, active=true, contact_type=self-service; global false, no user, no groups, show_on_template_bar false'
    hash: 3d7eafc51adf8f56a7c10e6b3eea02526a1412d9d62acec54a569b8967459fd6
  E19:
    record: sys_script/4d6d3e51ff88321080cfffffffffff3f
    how: read Update templates with advanced config
    result: 'inactive; would move templates without advanced features from template_v2 back to template, and mark the others v2 (workspace only)'
    hash: db33befa3b52e83a9b6f4054842fe158089d9655c89a31ace5bd48a8470873c4
  E20:
    record: sys_properties/65dae9f9c7c000106d1f19e603c26093
    field: value
    how: read glide.ui.allow.field.dependency.for.templates
    result: "true: dependent fields are honoured when a template is applied"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E21:
    record: sys_properties/42c3f43d7f721200348ef0d8adfa91ba
    field: value
    how: read glide.ui.template_bar_limit
    result: "40"
    hash: d59eced1ded07f84c145592f65bdf854358e009c5cd705f5215bf18697fed103
  E22:
    record: sys_ux_app_route/2fd8eaf94350121085678772d9b8f25c
    how: read Response Templates (sn_sow_itsm_common)
    result: 'icon document-outline, order 750, screen Response Templates SNC'
    hash: d53a61f5582bf7e9ba16ce293dbba01d9997237fb423cb84606f6cd5c3a29d76
  E23:
    record: sys_ux_screen/33d86ef94350121085678772d9b8f2a0
    field: screen_condition
    how: read Response Templates SNC
    result: 'every table but sysapproval_approver; audience through sys_ux_applicability_m2m_screen a6ef554a…'
    hash: 913d325872571d506730356cae300afb0a43b89d6fd0f84aa7f8c0eadbc7adb7
  E24:
    record: sys_ux_applicability/ba4f990a43ec561085678772d9b8f2b0
    how: read Show Response Template on Roles SOW
    result: 'role_names sn_templated_snip.template_snippet_reader'
    hash: 4d5b3335661284f3729a5856b1d3209b9eb0a2295e983bb27239060c28e64a16
  E25:
    record: sys_ux_data_broker_transform/48a1f6f54390121085678772d9b8f2d0
    field: script
    how: read Fetch response templates for SOW
    result: 'ResponseTemplateSOW.query on the Form channel, at most 100, with the evaluated body'
    hash: d5829b691edb80ade3c098e31c7ac4b05781e19710a405b23402e03e4928da9a
  E26:
    record: sys_security_acl/376332b94390121085678772d9b8f267
    how: read the execute ACL on that data broker and its role
    result: sn_templated_snip.template_snippet_reader
    hash: 0ec904ae4d23213507141306b8cbad9413c49ab03a188dc91229615711093aa1
  E27:
    record: sys_script_include/1e9bddc243ec561085678772d9b8f27a
    field: script
    how: read ResponseTemplateSOW
    result: 'uses an extension of sn_templated_snip.response_template when one says it should run, otherwise sn_templated_snippets.ResponseTemplate for the channel'
    hash: d005f5afe1a08f4ead2c5cf7a56bd160b3658ab9eee95d2a82fbc4021092c003
  E28:
    record: sys_extension_point/e1f3de0793332300a9bc1d1e867ffb12
    how: read sn_templated_snip.response_template and searched the mirror for implementations
    result: no sys_extension_instance implements it on pdi2, so the platform implementation runs
    hash: 57741667a027cdf654e7f4e3a915be883af58cb9d6ce2a6b036e2583ced70b2e
  E29:
    record: sys_ux_client_script/1b93e3554360921085678772d9b8f22a
    field: script
    how: read copy to clipboard
    result: 'strips HTML (line breaks kept), writes the text to the clipboard, "Copied to clipboard"'
    hash: 7698ce6a8aa86b14a28f0192ba49d994820356bcb70e5ab5c57c05b03e1b5353
  E30:
    record: sys_ui_text_command/bc158c1eff1722102e62ffffffffff6f
    field: action_script
    how: read the quick action Response Template
    result: 'command r, journal_input fields, all tables; ResponseTemplate on the form channel, limit com.glide.quickactions.maxresults.templates (default 9), only templates that evaluate successfully'
    hash: 92a8a7f7a25e37ac39f184749301db43e44515d3aa3ee5e509869b230b29e868
  E31:
    record: sys_ui_action/9967d6050b63320036e62c7885673a7b
    field: condition
    how: read Responses (task form button, classic UI)
    result: 'template_snippet_reader and NoteTemplateCheck.hasAvailableTemplate; opens the Response Templates dialog, or the side panel in Next Experience'
    hash: 632eaeb7654717e8a3a58583649547be3f1b0e184a2a402b4e565e2c856f9755
  E32:
    record: sys_security_acl/f29756430b63320036e62c7885673a23
    field: script
    how: read the sn_templated_snip_note_template read ACL (role template_snippet_reader)
    result: 'template_snippet_writer, or a member of one of the template''s visibility groups (empty: everyone)'
    hash: 2536adf8057066b4ddc67f773906fd72958104f7a3df385cced177f1f774ae84
  E33:
    record: sys_user_role_contains/0e16db230b70030036e62c7885673a25
    how: searched the mirror for roles that contain template_snippet_reader and template_snippet_writer
    result: 'reader is in writer only (this record); writer is in template_snippet_admin only (74515519…); template_snippet_admin is in admin (922a0d98…)'
    hash: f83e722f8c3cd592e4eb547b7b392c891dd0acbb86706dcde37840231e4fe20b
  E34:
    record: sys_app_module/85161a030b63320036e62c7885673a3a
    how: read Response Template Configuration
    result: 'list of sn_templated_snip_note_template, role template_snippet_writer'
    hash: 4c872f6f6bd53e46b3b1516b3954b972c6377052bee22e47f14315ef4b134471
  E35:
    record: sys_script/d5fad8cc0b53320036e62c7885673a40
    field: script
    how: read Validate template variables (before insert and update)
    result: 'refuses to save a template with an unknown variable or one the author can''t read, naming them'
    hash: 8c93a92569ac7c6ca325e436d96f9ef339350f5809427ec03598e24fea0f7b43
  E36:
    record: sys_script_include/05b971650b32320036e62c7885673afd
    field: script
    how: read NoteTemplate
    result: '${field} replaced by the display value if readable; ${Date} and ${current_user}; otherwise the variable in red'
    hash: 1299d6f3a0d7130cdd23f45b13a822065fb522d0d6d43839545568b0228cb5a4
  E37:
    record: sn_templated_snip_note_template/0604877a53833010ae50ddeeff7b129e
    how: read Need more information
    result: 'table incident, short name more info, no condition, no group visibility, no language'
    hash: 48d3e83570f0533f220ce37702876d808f590f99d06d79398bcda6cbc906fc79
  E38:
    record: sn_templated_snip_note_template/4a68c73e53833010ae50ddeeff7b1297
    how: read Schedule a meeting
    result: 'table incident, short name meeting request, no condition, no group visibility, no language'
    hash: 4f5025de8db8ef2de9cbbdf52fd1702033aac60070dce84cd135ca2970f2c570
  E39:
    record: m2m_response_template_to_channel/2ac5d14fffc72210188affffffffff0b
    how: read the six channel links of the two templates
    result: 'each template on Form, Email and Chat'
    hash: 2785958e423cbee91367154896081549e9cd6a6b487b3c2281da22d37d6b574d
  E40:
    record: sys_properties/02f9dfa47312130030f331d7caf6a740
    field: value
    how: read sn_templated_snip.max_template_responses
    result: "5000"
    hash: 0f8eb4b72b6e0c9e88b388eb967b49e067ef1004bf07bffc22c3acb13b43580a
  E41:
    record: sys_ux_client_script/76c864e487c72910ad900e19dabb35b8
    field: script
    how: read beforePageLoad of the SOW admin incident record page (sn_sow_itsm_admin)
    result: 'for template_snippet_writer or admin, shows "No response template created" or "{0} response template(s) created" for incident'
    hash: 106685efa0644561626c69e477c0108a66976a797856a61ff34be3513262c4b8
  E42:
    record: sys_ux_form_action_layout_item/6ca306a9c7210110d7e818b1c7c260fa
    how: read Compose Email (sn_sow_inc)
    result: 'incident, in the overflow menu, order 200; form action Compose Email → UI action compose_email_workspace'
    hash: ec8b83ac0498a03bf5226c882d5c05ab4cd203ae2f3539e87c88836272d40026
  E43:
    record: sys_script_include/e6be13a577b33300112f8b51a91061da
    field: script
    how: read EmailEditorUtil.showInWorkspaceFormMenu
    result: 'not new (unless glide.ui.email_client.pop_on_new_records); write access when glide.email_client.check_write_access (default true); table attribute email_client; rights to processor EmailClientProcessor'
    hash: eb8ff781c30dfbe603f607bec2fbacf268caf264687530b414716e66a5d64d28
  E44:
    record: sys_dictionary/b8e4363b8c5503100a22deb6dd2b4e99
    field: attributes
    how: read the incident collection
    result: email_client=true
    hash: 2a8be79e4a31b650b18d1f3e50151858bd707ff1c7eaf456518f859c3f25f91a
  E45:
    record: sys_user_role_contains/e18a5629244c8ac251ae5a40eff8bb20
    how: read itil's contained roles
    result: 'itil contains email_composer; sn_incident_write too (42d58e5b…); email_composer contains email_client_template_read (f6dbcfb7…)'
    hash: df8224bf6b90e3e3f22d052b65cf8ae0b475a70d5ea6fe38edf8c3fb4669a7f5
  E46:
    record: sys_email_client_configuration/71357392575023007f004758ef94f92b
    how: read Default
    result: 'the default configuration (no table), active; attachments go to the target record'
    hash: 84f4e077c50eb984c585dea43f4bb394f7f986473b2db2a8c340dad0cffa961a
  E47:
    record: sys_ux_screen/10139db843f47110cc25ff53e9b8f224
    field: screen_condition
    how: read Email template SNC (route Email template, order 900, d8139db8…)
    result: 'controller.record.isEmailClientEnabled=true; an Agent Assist panel'
    hash: 29e12b2999d5f57477595a7d5c5cf99e14a840a9ff0458d709b5378cbf55f116
  E48:
    record: cxs_search_res_config/382d65e343502110102b09b3c7b8f2d1
    how: read Email Templates and searched the mirror for sys_email_client_template
    result: 'searches sys_email_client_template; the mirror holds 16, none for incident'
    hash: d3424c659349b835817393bc0e0ec05db49e670a297b4ce134ba09dbcf4fc469
  E49:
    record: sys_ui_text_command/26f6deb8b5b87a10f877b2fb1965f070
    field: action_script
    how: read View response templates (email, command r); also View email templates (e) and View drafts (d)
    result: 'inserts an Email-channel response template; may offer AI suggestions from the email skill settings'
    hash: d58c2975c1787360e0818ca9b7ec4537b168263f46e63cc0be739ec8db9cdfbc
---
## The applications {label=NEW}

| Scope | What it gives incident management |
|---|---|
| `global` | record templates (`sys_template`), their ACLs and query rule, the incident templates, the Compose Email action and the email client |
| `sn_sow` | the SOW side panel routes **Templates** and **Email template** [E01] [E47] |
| `sn_now_record_side` | the Templates panel component [E03] |
| `sn_itsm_workspace` | the Agent Workspace **Templates** side panel action (census claim) [E04] |
| `sn_templated_snip` | response templates (`sn_templated_snip_note_template`), channels, roles, the classic **Responses** button [E31] |
| `sn_sow_itsm_common` | the SOW **Response Templates** panel [E22] |
| `now_email_client` | the email composer, its quick actions and the email template search [E48] [E49] |
| `sn_sow_inc` | **Compose Email** in the incident's overflow menu [E42] |

## 1. Record templates {label=NEW}

**Where they appear.** The SOW side panel route *Templates* opens *Template SNC* on almost every
table, with no role audience. [E01] [E02] The census claim `sn_itsm_workspace:Templates` (and its
global twin) is the Agent Workspace side panel action, shown while
`glide.ui.show_template_bar.<table>` is not false; pdi2 sets no such property for incident.
[E04] [E05]

**Who sees which template** (in execution order):

1. *SNC Template Query* narrows every interactive query to global, own and my groups' templates,
   unless the user has `template_editor_global`. [E06]
2. Read ACLs: global or own (and the template's roles or groups) [E07]; all for
   `template_editor_global` [E08]; group templates for `template_editor_group` [E09].
3. Create: `template_editor`, `template_editor_global` or `template_editor_group`. [E10]
   `itil` and `sn_incident_write` contain `template_editor`. [E11] [E12]

**The incident templates on pdi2**

| Template | Sets | Shared with |
|---|---|---|
| Incident Call Type | `contact_type=self-service` [E13] | one user |
| Major Incident | short description, `caller_id` = the user applying it, impact 1, urgency 1; child incident tasks [E14] [E15] [Q86] | one user |
| Major Incident Candidate | `major_incident_state=proposed` [E16] | one user |
| MIM Major Incident | `major_incident_state=accepted` [E17] | one user |
| Reset Password | short description, active, `contact_type=self-service` [E18] | nobody (no user, not global, not on the template bar) |

All are old (2015-2017) classic templates (`v2` false). [E13] [E14] None is global or shared
with a group, so an agent sees none of them. [E06] [Q09] Two set `major_incident_state` directly, which
skips the propose and accept steps of major incident management; they are reachable only by their
owner and by `template_editor_global`. [E16] [E17] [E08] [Q35]

Workspace-only features (field conditions, email content, content placement for journal fields)
need template v2. [E03] The rule that would sort templates into v1 and v2 is inactive. [E19]

**Properties**

| Property | pdi2 | Effect |
|---|---|---|
| `glide.ui.allow.field.dependency.for.templates` | true | dependent fields respected on apply [E20] |
| `glide.ui.template_bar_limit` | 40 | templates on the classic template bar [E21] |
| `glide.ui.show_template_bar.incident` | not set (true) | Agent Workspace action shown [E04] |

## 2. Response templates {label=NEW}

**Where they appear**

| Surface | Record | Gate |
|---|---|---|
| SOW side panel *Response Templates* | route [E22], screen [E23] | audience `sn_templated_snip.template_snippet_reader` [E24]; data broker execute ACL, same role [E25] [E26] |
| Quick action `r` in journal fields | [E30] | no role on the command; the templates' read ACL applies [E32] |
| Classic form button *Responses* (task) | [E31] | `template_snippet_reader` and at least one Form template |
| Email body, quick action `r` | [E49] | Email channel |

The SOW panel fetches up to 100 Form-channel templates with their evaluated body [E25] through
`ResponseTemplateSOW` [E27]; no extension overrides the platform implementation. [E28] The
panel copies the message as plain text; it doesn't write to the incident. [E29]

**Who can read and write**

- Read: role `template_snippet_reader`, then `template_snippet_writer` or the template's visibility
  groups (empty means everyone). [E32]
- Configure: *Response Template Configuration*, role `template_snippet_writer`. [E34]
- Roles: reader ⊂ writer ⊂ `template_snippet_admin` ⊂ `admin`. **No ITSM role contains the
  reader**, so on pdi2 only administrators see response templates. [E33] [Q08]

**Variables.** `${field}` (dot-walking allowed, such as `${caller_id.name}`), `${Date}` and
`${current_user}`; a field the agent can't read, or an unknown name, shows in red. [E36] A template
with unknown or unreadable variables can't be saved. [E35]

**The incident response templates on pdi2**

| Name | Short name | Channels | Restrictions |
|---|---|---|---|
| Need more information | more info | Form, Email, Chat [E39] | none [E37] |
| Schedule a meeting | meeting request | Form, Email, Chat [E39] | none [E38] |

`sn_templated_snip.max_template_responses` is 5000. [E40] The SOW admin page for incident shows
writers how many response templates exist. [E41]

## 3. Compose Email and email templates {label=NEW}

1. **Action:** *Compose Email* is in the incident's overflow menu (sn_sow_inc) and in the global
   layout, both pointing at the UI action `compose_email_workspace`. [E42]
2. **Condition:** saved record, write access, the table's `email_client` attribute, and rights to
   the email client processor. [E43] Incident has `email_client=true`. [E44]
3. **Roles:** `itil` and `sn_incident_write` contain `email_composer`, which contains
   `email_client_template_read`. [E45]
4. **Configuration:** no incident-specific email client configuration; the *Default* one applies.
   [E46]
5. **Templates:** the *Email template* panel appears where the email client is enabled and searches
   `sys_email_client_template`. [E47] [E48] There are **none for incident**: the existing ones serve
   incident communication tasks, communication tasks, change requests, email replies and surveys.
   [E48] [Q36]
6. **Quick actions in the email body:** `r` response template, `e` email template, `d` draft.
   [E49]
