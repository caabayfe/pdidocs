---
title: Create a configuration item
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_declarative_action_assignment/9e165b6a7f131210e1a435c59c8665b4
    how: read the list action Create CI (sn_cmdb_ws, table cmdb_ci)
    result: 'primary button on CMDB Workspace lists of CIs only ("limited to CMDB Workspace"); needs the role cmdb_manual_ci_ire_access or sn_cmdb_editor and create access; shown only when the list''s class has identification rules the flow can use'
    hash: 4e8e9a5793d9917089d8511b284fe8503e13f640d4aa627cc1348d863f42675d
  E02:
    record: sys_declarative_action_assignment/896b27e27f931210e1a435c59c866519
    how: read the list action New (sn_cmdb_ws, table cmdb_ci)
    result: 'primary button on the same lists, shown only when the class has no usable identification rules; needs create access, no role'
    hash: 0860125bbbee6b457d8927c4bad325ad97468187f1ce0bdac2024cc4c211c60d
  E03:
    record: sys_declarative_action_payload_definition/08913e7273131010a0a79329faf6a78b
    how: read Create New Record, the action New runs
    result: opens the ordinary record form for a new record of the list's table
    hash: 9dcbb9c17f6e57e8487e7644c7c5f2013d7c80fdfd51b0fd6e7e0495406c95fb
  E04:
    record: sys_ux_macroponent/f363ddbf7f4012105872e83f4d8665ab
    field: required_translations
    how: read the labels of the Manual Create CI page
    result: '"Select the class for the new CI.", Include all classes, "Classes without IRE rules cannot be selected and some specialty classes require other methods for creating CIs and are not available"; "Select dependent-upon class for the new dependent CI.", Search for a dependent-upon CI; Identifier entries ("Identifier entries include criterion attributes that uniquely identify a CI."), Select criterion attributes, "These attributes are either mandatory for the selected class or required by the class identification rule for IRE processing.", "Additional attributes requested by your administrator."; Add relationship(s), "Add relationships to avoid creating an orphan CI", Relationship type; Create; CI already exists, "A CI with given attribute values already exists. Would you like to review the existing CI?", Review existing CI; Review new CI, Create another CI, Done'
    hash: aab2d73ff72ead7fda9593b1807cf2bc2b1d9bdebc9a9c474729459ca4096fb9
  E05:
    record: sys_script_include/e2bb0cc67f10121007246e7b3d866545
    field: script
    how: read CMDBWsManualCreateCIService (_getCiClassesList, _classHasValidIdentificationRules)
    result: 'the classes offered are those of the cmdb_ci hierarchy you can both create and edit, less the excluded ones; a class qualifies only if it has an identification rule that does not rest on product_instance_id'
    hash: 43cccc7f6ab2d623699fb48c84e80b14fdd4621abc8546dde68388a71e15bc7c
  E06:
    record: sn_cmdb_ws_ci_additional_attributes/a9a7b38b771d121098291605bc5a991e
    how: read the additional attributes for create_ci (all classes)
    result: operational_status, location, managed_by_group, owned_by
    hash: 3c61b0be973e61cbaec1ef9247ca3fce530fa1fd5aed223f0b620be1b9fe1bad
  E07:
    record: sys_script_include/e2bb0cc67f10121007246e7b3d866545
    field: script
    how: read CMDBWsManualCreateCIService (identifyCI, _insertCI)
    result: 'Create first asks the identification engine whether the CI exists, then inserts it through it as source "Manual via IRE"; CI relationships go through the engine, user and group relationships are added after the CI'
    hash: 43cccc7f6ab2d623699fb48c84e80b14fdd4621abc8546dde68388a71e15bc7c
  E08:
    record: sys_declarative_action_assignment/4f5f09017f571210e1a435c59c8665f8
    how: read Edit ({{count}}) on cmdb_ci (sn_cmdb_ws)
    result: '"Hiding Edit action for cmdb_ci in CMDB Workspace": it needs the role b05940500a0a0aa70090a4893f6ff35d, so the bulk Edit of other workspaces does not show on CI lists'
    hash: 3de8791a69771646d47f2d2149d76327fd5edcb449dde2230040ca6fe8042780
  E09:
    record: sys_security_acl_role/b37289b677c20110ff643a91fa5a99a6
    how: resolved the role sys_id b05940500a0a0aa70090a4893f6ff35d (the role record isn't in the mirror)
    result: 'it is the role nobody (sys_ux_sitemap_definition.*.nobody), the role no user is given'
    hash: 8b3a80959e8b79509ce9edd38a8ba4c6c3653b0b649a6e6915afe6651cb2ce0a
  E10:
    record: sys_script_include/fca9a45b7f13121007246e7b3d866533
    field: script
    how: read CMDBWsExploreCIService.updateCI
    result: 'an edit on the CI page goes through the identification engine; if a changed identifying value matches another CI, nothing is saved and the answer is "Duplicate CI found"; a dependent CI without its dependent relationship can''t be edited'
    hash: ce2aa77f747acded207905dd60d828e1cad897aada3e5cfc3ad47c066a6fef2f
  E11:
    record: sys_security_acl/90589cdd4fd12210072487af20ce0b8b
    how: read the execute ACL on the data broker Explore CI Update CI, and its sys_security_acl_role record
    result: role sn_cmdb_editor
    hash: d80bcbde191a78c0296adfdc1a71e6e3d6f783c90293210c56878c2f642227f1
  E12:
    record: sys_user_role_contains/8c846d9d73e3a410960c6039faf6a753
    how: read which roles contain sn_cmdb_editor
    result: sn_cmdb_admin contains sn_cmdb_editor
    hash: 3abf4699b981ba15b0190638baa9ee3a0f2216a8001874fccf86c642d5418630
---
## Before you start {label=NEW}

Create CIs in the **CMDB Workspace** with **Create CI**: it checks the CMDB first, so you don't
add a second copy of a CI that already exists. [E01] [E07]

| You have | You see on a list of CIs |
|---|---|
| `sn_cmdb_editor` (in `sn_cmdb_admin`) or `cmdb_manual_ci_ire_access` | **Create CI**, for classes with identification rules [E01] [E12] |
| create rights on the class, no CMDB role | **New**, only for classes without identification rules [E02] |

With the service desk role and no CMDB role, you see neither on most classes: ask the CMDB manager.
[E01] [E02]

## Create a CI {label=NEW}

{{animation:cmdbcreate}}

1. Open a list of CIs in the CMDB Workspace and choose **Create CI**. [E01]
2. **Select the class for the new CI.** Only classes with identification rules can be chosen;
   some special classes are created another way and aren't listed. [E04] [E05]
3. If the class depends on another CI (an application on a server, for example), pick the
   **dependent-upon CI**: the CI it runs on. If none exists yet, go back and create that one
   first. [E04]
4. Fill the **Identifier entries**: the attributes that tell this CI apart from every other, and
   any the class makes mandatory. [E04]
5. Fill the **additional attributes**: **Operational status**, **Location**, **Managed by group**
   and **Owned by**. [E04] [E06]
6. **Add relationship(s)**, to other CIs, people or groups, so the CI isn't left an orphan. [E04]
   [E07]
7. Choose **Create**. [E04]

## What happens {label=NEW}

- If a CI with the same identifying values already exists, you're told **CI already exists** and
  offered **Review existing CI**: nothing new is created. [E04] [E07]
- Otherwise the CI is created, with its relationships, and you can **Review new CI**, **Create
  another CI** or choose **Done**. [E04] [E07]

## Classes without identification rules: New {label=NEW}

On a class that has no identification rules, the list shows **New** instead. It opens an empty
form, with no duplicate check: search for the CI first. [E02] [E03]

## Change several CIs at once {label=NEW}

CI lists in the CMDB Workspace have no bulk **Edit**: it is hidden on purpose, behind a role no
user is given. [E08] [E09] Change CIs one at a time on their page, or ask the CMDB manager.

## Change one CI {label=NEW}

Editing on a CI's page also goes through the identification engine. [E10] If your change makes
the CI look like another one, nothing is saved and you see **Duplicate CI found**; merge them, or
correct the value. [E10] Saving on the CI page needs `sn_cmdb_editor`. [E11]

See [Keep your configuration items right](see:cmdb/maintain) for what to keep up to date.

## Tips

- Search for the CI before creating it, even with **Create CI**: a misspelt identifying value
  creates a second CI. [E07]
- Fill **Owned by** and **Managed by group**: certification and routing depend on them. [E06]

## Not yet seen {label=OPEN-QUESTION}

1. **Create CI** and **New** weren't opened on screen; the steps follow the page's labels. [E04]
   Which lists of CIs show them on pdi2 (a class list from Home or Management, a saved list)?
2. Who should create CIs here? Nobody may hold `sn_cmdb_editor` or `cmdb_manual_ci_ire_access`
   yet, while the service desk role can still create CIs in the classic list (see
   [Keep your configuration items right](see:cmdb/maintain)).
3. Does the base list **Configuration Items** (all classes) show **Create CI** or **New**? That
   depends on the identification rules of the base class.
4. Is the bulk **Edit** hidden from admins too? It rests on the role `nobody`. [E09]
