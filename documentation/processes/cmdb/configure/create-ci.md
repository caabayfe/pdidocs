---
title: Creating and editing CIs in the CMDB Workspace - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_ux_action_config/aa116c28b7a11110b87e80408e11a928
    how: read CMDB Workspace Actions Configuration, the action configuration the three list actions are added to
    result: the CMDB Workspace's own list and form actions
    hash: c44cb5068eec8b9a6851a581f295000780ef3b3e4f8367bf64db214da57e2741
  E02:
    record: sys_ux_m2m_action_assignment_action_config/ed1753ea7f131210e1a435c59c8665f3
    how: read the link of Create CI to the CMDB Workspace action configuration
    result: Create CI (9e165b6a…) is in CMDB Workspace Actions Configuration
    hash: 4b303f236de51d2186a22ab5fbf7068d6bac72f7a4086556536730dd11cb7264
  E03:
    record: sys_declarative_action_assignment/9e165b6a7f131210e1a435c59c8665b4
    how: read Create CI
    result: 'table cmdb_ci, model List, client action Create CI, experience restricted, order 400, specificity 21; required_roles 82c32c19… (cmdb_manual_ci_ire_access), 64c3259d… (sn_cmdb_editor); create_access true; script_condition CMDBWsManualCreateCIService().classHasValidIdentificationRules(CMDB Workspace page registry, current.getTableName())'
    hash: 4e8e9a5793d9917089d8511b284fe8503e13f640d4aa627cc1348d863f42675d
  E04:
    record: sys_declarative_action_assignment/896b27e27f931210e1a435c59c866519
    how: read New
    result: 'table cmdb_ci, model List, client action Create New Record, experience restricted, order 400, specificity 21; no roles; create_access true; script_condition the negation of Create CI''s'
    hash: 0860125bbbee6b457d8927c4bad325ad97468187f1ce0bdac2024cc4c211c60d
  E05:
    record: sys_declarative_action_payload_definition/98a61baa7f131210e1a435c59c866500
    how: read the client action Create CI (sn_cmdb_ws)
    result: action key create_ci, for the List model
    hash: b8e7441c85632f5b1ecf5b4e7dce2bfaad44ae85ec8ee2db11d25f92dba4a3ec
  E06:
    record: sys_ux_app_route/bf63ddbf7f4012105872e83f4d8665a7
    how: read the route Manual Create CI of the CMDB Workspace
    result: route manual-create-ci, optional parameters sysClassName, parentCiRefQuery, classHierarchy, addtlContext
    hash: 9db896195d42e4b53d9c00b11ec1c96a25df888fd958e338d06bdb564ebb51ab
  E07:
    record: sys_declarative_action_payload_definition/08913e7273131010a0a79329faf6a78b
    field: payload_template
    how: read Create New Record
    result: route record with sysId -1, the list's query passed on
    hash: ebd8adebd71661b9a6cb06054bd665d7365d068de635798a74efcb13c94f854a
  E08:
    record: sys_script_include/e2bb0cc67f10121007246e7b3d866545
    field: script
    how: read CMDBWsManualCreateCIService
    result: '_getCiClassesList: classes from sn_cmdb_ws_ci_class_config for the app (include or exclude, with or without the hierarchy), kept only if GlideRecordSecure canCreate and canWrite, less the global exclusions (always cmdb_ci_service_auto and its children, plus the property sn_cmdb_ws.manual_create_ci.global_class_exclusion); _classHasValidIdentificationRules: the class must be in that list and have an identification rule whose fields do not include product_instance_id; _insertCI: IRE insert with discovery source Manual via IRE, then cmdb_rel_person and cmdb_rel_group rows; the extension point sn_cmdb_ws.ManualCreateCIExtPoint runs after insert for the app'
    hash: 43cccc7f6ab2d623699fb48c84e80b14fdd4621abc8546dde68388a71e15bc7c
  E09:
    record: sn_cmdb_ws_ci_class_config/16f184417f01921007246e7b3d8665f3
    how: read create_ci
    result: active; include class cmdb_ci, apply to hierarchy
    hash: 0e005eb8c44f35116a78dcab94c69a20d18a5a6ceb48114b69c8323875107a74
  E10:
    record: sn_cmdb_ws_ci_additional_attributes/a9a7b38b771d121098291605bc5a991e
    how: read create_ci
    result: active; cmdb_ci and its hierarchy; operational_status, location, managed_by_group, owned_by
    hash: 3c61b0be973e61cbaec1ef9247ca3fce530fa1fd5aed223f0b620be1b9fe1bad
  E11:
    record: sys_properties/884e95117f41121007246e7b3d86653c
    how: read sn_cmdb_ws.manual_create_ci.global_class_exclusion
    result: comma-separated classes left out of Manual Create CI; read roles cmdb_manual_ci_ire_access, sn_cmdb_editor; write role sn_cmdb_admin; its value is redacted in the mirror
    hash: 04d5394cfaba5ee5a94f498931b8c3a5757e6565116cb135bc4643ee32b3da9a
  E12:
    record: sys_ux_applicability/756b774283a21210982970eb922bc0c2
    how: read Manual Create CI via IRE
    result: active; roles cmdb_manual_ci_ire_access, admin, sn_cmdb_editor
    hash: dbab72053d2a764019ee92e4378428ba0200ce7b51212e9306547c9704e3ea32
  E13:
    record: sys_security_acl/83feeca5773c1210ee0d0cc2fa5a99bf
    how: read the execute ACL on the data broker Manual CI - Identify or create CI, and its sys_security_acl_role records
    result: roles sn_cmdb_editor, cmdb_manual_ci_ire_access
    hash: 9b930571d3ab8f71920958a7f1761e962bd3d6aad43cb6319ffc92bdc15a5801
  E14:
    record: sys_security_acl/7626a19d7f41121007246e7b3d866519
    how: read the execute ACL on the data broker Manual CI - Get CI classes, and its sys_security_acl_role records
    result: roles cmdb_manual_ci_ire_access, sn_cmdb_editor
    hash: 5c2cfeb6e1d7bd27ec97aac15f7d6161b7953ca766590057a21bff7f317da974
  E15:
    record: sys_user_role/82c32c197f05121018b51630be86650e
    how: read cmdb_manual_ci_ire_access (sn_cmdb_ws)
    result: '"Role needed to use/access Manual CI Creation experience in any workspace."; contains no roles, and no role contains it'
    hash: 94494bf0b9116343294e902ad474cce9fbbb75a917b1ebc80d27d19d89d50b9a
  E16:
    record: sys_user_role/64c3259d73e3a410960c6039faf6a7d6
    how: read sn_cmdb_editor and the sys_user_role_contains records that name it
    result: '"CRUD access to CMDB records but not allowed to change policies such as data manager, class manager etc."; contains sn_cmdb_user and cmdb_ms_editor; contained in sn_cmdb_admin'
    hash: b8613b06f3a651f0d4135bec039a2cba25b5cce10550271c6af3e6ecd9cdde38
  E17:
    record: sys_declarative_action_assignment/4f5f09017f571210e1a435c59c8665f8
    how: read Edit ({{count}}) on cmdb_ci (sn_cmdb_ws)
    result: '"Hiding Edit action for cmdb_ci in CMDB Workspace"; client action Edit, specificity 21, experience restricted; required_roles b05940500a0a0aa70090a4893f6ff35d'
    hash: 3de8791a69771646d47f2d2149d76327fd5edcb449dde2230040ca6fe8042780
  E18:
    record: sys_security_acl_role/b37289b677c20110ff643a91fa5a99a6
    how: looked for b05940500a0a0aa70090a4893f6ff35d in the mirror (its sys_user_role record isn't mirrored)
    result: 'named sys_ux_sitemap_definition.*.nobody: the role nobody'
    hash: 8b3a80959e8b79509ce9edd38a8ba4c6c3653b0b649a6e6915afe6651cb2ce0a
  E19:
    record: sys_ux_m2m_action_assignment_action_config/f77f4d017f571210e1a435c59c8665cd
    how: read the link of this Edit to the CMDB Workspace action configuration
    result: Edit ({{count}}) (4f5f0901…) is in CMDB Workspace Actions Configuration
    hash: b0b898701e9783c8597e308cbe7bdb3440cdd60b076873b418f3bce47939fe59
  E20:
    record: sys_declarative_action_assignment/4a9232b273131010a0a79329faf6a732
    how: read the base Edit ({{count}}) (global)
    result: table global, specificity 1, write access, no roles; the one the CMDB Workspace record overrides on cmdb_ci
    hash: fbf7e22e0ae790808b253fe1ae031be124a6354786f62253a6917e75558aeb67
  E21:
    record: sys_script_include/fca9a45b7f13121007246e7b3d866533
    field: script
    how: read CMDBWsExploreCIService.updateCI
    result: 'with no identification rule for the class, the update skips IRE; otherwise criterion values are merged with the edits; if no criterion attribute changed the CI is updated through IRE (Manual via IRE); if one changed, IRE identifies first and a match on another CI returns "Duplicate CI found" without saving; a dependent class without its dependent relationship returns MISSING_DEPENDENT_RELATIONSHIP; a bypassIRE flag updates without IRE'
    hash: ce2aa77f747acded207905dd60d828e1cad897aada3e5cfc3ad47c066a6fef2f
  E22:
    record: sys_security_acl/90589cdd4fd12210072487af20ce0b8b
    how: read the execute ACL on the data broker Explore CI Update CI, and its sys_security_acl_role record
    result: role sn_cmdb_editor
    hash: d80bcbde191a78c0296adfdc1a71e6e3d6f783c90293210c56878c2f642227f1
---
## The application {label=NEW}

Creating and editing CIs in the CMDB Workspace belongs to `sn_cmdb_ws`. The three list actions on
`cmdb_ci` are in the workspace's own action configuration [E01] [E02] [E19] and apply to every
class, as `cmdb_ci` actions do.

## 1. Which button a list shows {label=NEW}

| Action | Shown when | Roles | Opens |
|---|---|---|---|
| **Create CI** | the class qualifies for Manual Create CI [E03] [E08] | `cmdb_manual_ci_ire_access` or `sn_cmdb_editor` [E03] | Manual Create CI [E05] [E06] |
| **New** | the class doesn't qualify [E04] | none; create access on the class [E04] | the ordinary form, `sysId -1` [E07] |

A class qualifies when it is in the configured class list and has an identification rule that
doesn't rest on `product_instance_id`. [E08] The list is all of `cmdb_ci`'s hierarchy [E09], less
the classes the user can't both create and write, less `cmdb_ci_service_auto` and the classes in
`sn_cmdb_ws.manual_create_ci.global_class_exclusion` (value redacted in the mirror). [E08] [E11]

So a user with `itil` but no CMDB role, who may create CIs through the `cmdb_ci` ACLs (see
[CI data and access](see:cmdb/maintain)), gets **New** only on classes without identification
rules, and no button elsewhere. [E03] [E04]

## 2. Manual Create CI {label=NEW}

1. The page is available to `cmdb_manual_ci_ire_access`, `admin` and `sn_cmdb_editor` [E12]; its
   data brokers run for `sn_cmdb_editor` and `cmdb_manual_ci_ire_access`. [E13] [E14]
2. Class, dependent-upon CI, identifier entries, and the additional attributes **Operational
   status**, **Location**, **Managed by group**, **Owned by**. [E10]
3. **Create** runs IRE identification first; on a match the user is offered the existing CI. On no
   match the CI is inserted through IRE with the discovery source *Manual via IRE*; CI relationships
   go through IRE, person and group relationships are inserted directly; any implementation of
   `sn_cmdb_ws.ManualCreateCIExtPoint` for the workspace runs after. [E08]

## 3. Bulk edit is hidden {label=NEW}

The CMDB Workspace overrides the base **Edit ({{count}})** [E20] on `cmdb_ci` with a copy that
requires the role `nobody` (sys_id `b05940500a0a0aa70090a4893f6ff35d`). [E17] [E18] This is the
platform's way of hiding the bulk edit on CI lists, so changes go one CI at a time through the
CI page.

## 4. Editing on the CI page {label=NEW}

The CI page saves through `CMDBWsExploreCIService.updateCI`, which uses IRE when the class has
identification rules and refuses a change that would make the CI a duplicate of another. [E21]
Its data broker runs only for `sn_cmdb_editor` [E22]: `itil` users can't save there, even though
the classic form lets them edit CIs.

## Roles {label=NEW}

| Role | Gives |
|---|---|
| `cmdb_manual_ci_ire_access` (`sn_cmdb_ws`) | Manual Create CI, in any workspace; nothing else [E15] |
| `sn_cmdb_editor` | create, read, update and delete of CMDB records, not policies; includes `sn_cmdb_user` [E16] |
| `sn_cmdb_admin` | includes `sn_cmdb_editor` [E16] |

## Open questions {label=OPEN-QUESTION}

1. Who should create CIs: give `sn_cmdb_editor` to CI owners and CMDB managers, or keep the
   service desk creating CIs in the classic list?
2. What does `sn_cmdb_ws.manual_create_ci.global_class_exclusion` hold? Its value is redacted in
   the mirror. [E11]
3. Is the bulk edit to stay hidden on CI lists? The override ships with the CMDB Workspace
   application (`sn_cmdb_ws`). [E17]
4. Should the `itil` create and write ACLs on `cmdb_ci` be moved to the CMDB roles, so the classic
   list and the workspace give the same answer?
