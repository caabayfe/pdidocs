---
title: Set up knowledge bases
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Knowledge Center (/now/knowledge-center), Knowledge Hub › Quick view
    how: read the Knowledge bases panel
    result: 'Knowledge bases (4): IT (35), KCS Knowledge Base (demo data) (4), Knowledge (0), Known Error (3)'
  E02:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: classic list Knowledge Bases (kb_knowledge_base)
    how: read the list
    result: 4 records; KCS Knowledge Base (demo data) with checklist Default AQI Survey; Known Error, IT and Knowledge with no checklist
  E03:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Knowledge Center (/now/knowledge-center), Knowledge Hub
    how: read the header and the Actions and Configurations sections
    result: '"Knowledge Center — Set up, manage, and monitor your knowledge bases"; Actions: Create an article, Manage groups; Configurations: AI config, Guided setup, Knowledge management properties, User criteria diagnostics, Article optimization jobs, Article optimization scans'
  E04:
    record: sys_ux_list_category/647bf525ffbd2210e9c3ffffffffffad
    how: read the Knowledge Center list group Administration and its lists (sn_km_center)
    result: 'Knowledge Bases (active), Article Templates, Style guides, Ratings, Search Log, View Log, Navigation Add-Ons, Messages, User Criteria (active)'
    hash: 937ce1899b920ec9d7177a19f02a23d46f2380f6a040b6b54e7e804394aa456e
  E05:
    record: sc_cat_item_producer/81c887819f203100d8f8700c267fcfb5
    how: read the record producer Request Knowledge Base
    result: 'active; "Request for a Knowledge Base"; in the Service Catalog and the Technical Catalog, category Can We Help You?; "anyone can request for a new one to be created"; after submitting: "Your request for a new knowledge base has been received - once the request is approved, you will be notified by email"'
    hash: 8f42e456f583399f13102592608524713e874c8cd15cefbe1d6d83b003019a59
  E06:
    record: item_option_new/9abeb6349f203100d8f8700c267fcf0b
    how: read the questions of Request Knowledge Base, and item_option_new/4e92cf349f203100d8f8700c267fcfe4
    result: 'What is the name of the Knowledge Base?; What is the reason for this Knowledge Base to be created? (both optional)'
    hash: c04b1eb66ade934b40ccff693f8c875e6b87fa51906572025ddac5c35ba89f9e
  E07:
    record: sys_hub_flow/7953111f83831210730e5b43c22bc0ac
    children: sys_hub_action_instance_v2
    how: read Request new Knowledge Base (on a new kb_knowledge_base_request)
    result: 'asks one fixed user to approve (the default admin account); approved: creates the knowledge base and emails "Knowledge Base request approved"; rejected: emails "Knowledge Base rejected", "Your request for a new Knowledge Base has been rejected."; stages Awaiting response, KB approved, KB rejected'
    hash: 17a519f5ed47e0109d1ee922c5ee9693300f1f88ff7f19e7e558887f68709690
  E08:
    record: sys_hub_action_type_definition/9b5d8ffd3bcfd6104b63e554c3e45aea
    how: read the flow action Create KB
    result: '"After the request is approved a new knowledge base record is created with requestor as the owner of this new knowledge base."'
    hash: 0b2ab991821a5a761a462c636da85e8d095655e17199942fbf315c1d518c2fd1
  E09:
    record: sys_script_include/2d407422c30221000096dfdc64d3aeca
    field: script
    how: read KBKnowledgeBaseSNC.canCreate, canWrite and canDelete (used by the kb_knowledge_base ACLs)
    result: only knowledge administrators create a knowledge base; the owner, the managers and administrators edit it; nobody deletes one
    hash: 3545bfb77cc9a167a5e315322cd2b05a6f7d3558c2357e4437a1ad1dcb061817
  E10:
    record: sys_script/70860eb3bf3021003f07e2c1ac07398f
    field: script
    how: read Duplicate Knowledge Base (before insert or update, title changes)
    result: '"A knowledge base called ''{0}'' already exists"; the save is refused'
    hash: 18f90da22b0ebf3d995f0968f3237279dc5f03c60c98afb2ef5e3296c7e5ff83
  E11:
    record: sys_script/ff215a229f112100a04d7e50d67fcf0a
    field: script
    how: read Update knowledge_manager roles, with KnowledgeSecurityManagerSNC.updateKnowledgeManagers (sys_script_include/6bf2247bb712230026778d78ee11a9fb)
    result: 'the owner and managers get knowledge_manager ("Adding role {0} to {1}"); someone removed loses it unless they still own or manage another knowledge base'
    hash: bbaccee9860cee6ca279c63fd4911546974673360dc5b0300ea2ee501a4fd912
  E12:
    record: sys_script_client/9e6b43f3d730210013ab49547e61031d
    field: script
    how: read Display owner info message, and Display manager info message (sys_script_client/7d70413dd701210013ab49547e6103ab)
    result: '"User {0} will be assigned the knowledge_manager role after adding!" under Owner; the same for Managers'
    hash: 667d1437d45806488be8c8b456f4e3de098c6f9851ecdc100e23e088f0b1fba3
  E13:
    record: sys_dictionary/18487ab38c5903100a22deb6dd2b4eab
    how: read kb_knowledge_base.kb_publish_flow and kb_retire_flow (sys_dictionary/1c487ab38c5903100a22deb6dd2b4ea9)
    result: Publish flow and Retire flow, references to sys_hub_flow; the legacy Publish workflow and Retire workflow fields are inactive (sys_dictionary/fd457eff8c5503100a22deb6dd2b4e14, sys_dictionary/79457eff8c5503100a22deb6dd2b4e16)
    hash: 900a82c2c6f01c7bc76e5f4d31bf003386a6569db4de2dd800201242806bed0b
  E14:
    record: sys_script/07c35286fc05ae10f877d15605e71613
    field: script
    how: read Populate Default Flows if Empty
    result: a new knowledge base without flows gets Knowledge - Instant Publish and Knowledge - Instant Retire
    hash: 7d81775b8d139b4c5fdc6fb4c3b5e6604001d314faea5004caf6f08da2fb8346
  E15:
    record: sys_script_include/a659e923c30321000096dfdc64d3ae33
    field: script
    how: read KBWorkflowSNC.getApprovers
    result: with ownership groups off, the approvers are the knowledge base's owner (if active) and managers
    hash: 25c0f0e7da5e3fe9a5d385c225dfd3ade8ba2d0ea08ba2c53ccd270920afc36c
  E16:
    record: sys_properties/d20ff8ab53012300cc376512a2dc3483
    field: value
    how: read glide.knowman.ownership_group.enabled
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E17:
    record: kb_uc_can_read_mtom/56b2d093ff4221009b20ffffffffffbf
    how: read who may read and contribute to each knowledge base (kb_uc_can_read_mtom, kb_uc_cannot_read_mtom, kb_uc_can_contribute_mtom, with their user_criteria)
    result: 'IT: read "''Problem Analyzers'' and ''Problem Solving'' Group Members", "All ACME North America employees", "All ACME Corporation employees"; contribute "The ACME North America IT Department". Known Error: read "Users who can access Known Error knowledge base"; contribute "Users with ''itil'' role". Knowledge: read "Any user for KB", cannot read "Guest User"; contribute "Users with ''knowledge'' role for KB". KCS demo: none in the mirror'
    hash: 97631f241a6fdd915a55f41233bf9d0947010d20b7bc7de278715bdb0f926b5c
  E18:
    record: user_criteria/cc5a47fa53c033004558ddeeff7b12b3
    field: role
    how: read Users who can access Known Error knowledge base
    result: roles itil, problem_task_analyst, sn_problem_write
    hash: b1c93645a5422a8fa025285911d0999d44486cc01ee4e52bfe68119dde3fa2d9
  E19:
    record: user_criteria/0f8d9007b58b8110f8779c9460b51456
    how: read Any user for KB
    result: active, not advanced; no role, group, user, company, department or location
    hash: 8d6128d965f61529d6cf8b6c1b048998ebb4e3ad881d7edba7d62453c0cf76f5
  E20:
    record: sys_properties/b8a2fb1acbb400108ad442fcf7076d9d
    field: value
    how: read glide.knowman.block_access_with_no_user_criteria
    result: 'true: "Deny access to a knowledge base when either Can Read or Can Contribute user criteria list for the knowledge base isn''t specified."'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E21:
    record: sys_script_include/e3f2247bb712230026778d78ee11a9e2
    field: script
    how: read KBDiagnosticsSNC
    result: 'reports read and contribute access of a user to a knowledge base or an article, and why: "{0} has contribute access to knowledge base ({1}), because the user is the knowledge base owner, manager, or admin.", "User denied read access to the knowledge base because Can Read is not set.", domain and scope reasons'
    hash: 758f366cb0a4610af9be919911fdc048764f9e06110e2f1b8fb8a2147ab03a3d
  E22:
    record: sys_ux_macroponent/d03a345d65003210f877884ed83ad848
    field: required_translations
    how: read the Knowledge Center page User Criteria Diagnostic (sn_km_center)
    result: 'User Criteria Diagnostics; Select Record Type (Knowledge Base, Article); Select Knowledge Base, Select Article, Select User; Diagnose'
    hash: 1e34e7de6dc236814a5da2785bb49194b52812cd6ab76dbe3961bf245b08d233
  E23:
    record: sys_security_acl/ead0506d65407210f877884ed83ad813
    how: read the execute ACL on the diagnostics data broker (sn_km_center)
    result: roles knowledge_manager, knowledge_admin
    hash: c73d072537f4802e86e20963c9db91420ac88f54c1f96ab60f10d8055251308c
  E24:
    record: sys_ui_action/a694eaa487101300b66b5cdac5cb0b2d
    field: condition
    how: read Run User Criteria Diagnostics on kb_knowledge_base, and on kb_knowledge (sys_ui_action/16316e2387401300b66b5cdac5cb0bac)
    result: a related link for admin, knowledge_admin, and the knowledge base's owner and managers; opens user_diagnostics.do with the knowledge base or article filled in
    hash: 0c8297493220f0e1a1377cda1e98adefa10f5381967490ea288e72e5d476f363
  E25:
    record: sys_dictionary/71457eff8c5503100a22deb6dd2b4e37
    how: read kb_knowledge_base.article_validity, with the Valid to default of kb_knowledge (sys_dictionary/ed453eff8c5503100a22deb6dd2b4e58)
    result: Article Validity, in days; new articles' Valid to is today plus it, otherwise 2100-01-01
    hash: 9c700b2eaf929da1e836a36f49ddf871053d239f27df2e9459dce433aab6de35
  E26:
    record: sys_script/17982cf29f713100a04d7e50d67fcfb6
    field: script
    how: read Inherit commenting and suggesting (before insert on kb_knowledge)
    result: a new article takes the knowledge base's Disable commenting and Disable suggesting
    hash: 3a7622c7cb500b48a30f04e282f6e00b8704008d2104849cd850d4219876c316
  E27:
    record: sys_user_role/f8bfbd02eb202100216a87b9d106fe92
    field: description
    how: read knowledge_manager, and knowledge_admin (sys_user_role/aaa4855d0a0a0b820170399909974b83)
    result: '"Can administer knowledge bases and request new knowledge bases for the knowledge_admin to approve"; "Can manage Knowledge Bases"'
    hash: 359c60dade15df4ea81a3ccd5548c7385a9d4c39584c099044571e36ea07e8bb
  E28:
    record: sys_ui_action/ebfbe3939f013100d8f8700c267fcfc3
    how: read View Knowledge Base (related link on kb_knowledge_base)
    result: opens the classic knowledge home on the knowledge base's categories
    hash: 6643b35fa824b1fb1d19d5d015530247abcc23e1dec821612e69626bc81d998b
---
## The knowledge bases on pdi2 {label=NEW}

| Knowledge base | Articles | Quality checklist |
|---|---|---|
| **IT** | 35 | none |
| **KCS Knowledge Base (demo data)** | 4 | Default AQI Survey |
| **Knowledge** | 0 | none |
| **Known Error** | 3 | none |

[E01] [E02]

Each knowledge base has an **owner** and **managers**: they approve publishing and retiring where
its flows ask for approval, can retire any of its articles, and edit the knowledge base itself.
[E09] [E15] Who they are on pdi2 is not recorded here.

## Where you work {label=NEW}

The **Knowledge Center** opens on the Knowledge Hub, *"Set up, manage, and monitor your knowledge
bases"*. [E03]

- **Configurations**: *AI config*, *Guided setup*, *Knowledge management properties*, *User
  criteria diagnostics*, *Article optimization jobs* and *scans*. [E03]
- The **Administration** list group: *Knowledge Bases*, *Article Templates*, *Style guides*,
  *Ratings*, *Search Log*, *View Log*, *Navigation Add-Ons*, *Messages* and *User Criteria*. [E04]

## Ask for a new knowledge base {label=NEW}

{{animation:kbadmin}}

Anyone can ask from the Service Catalog: **Request Knowledge Base**, under *Can We Help You?*.
[E05]

1. Answer *What is the name of the Knowledge Base?* and *What is the reason for this Knowledge
   Base to be created?* [E06]
2. Submit. You see *"Your request for a new knowledge base has been received - once the request
   is approved, you will be notified by email"*. [E05]
3. One user named in the flow, the platform's default admin account, approves or rejects it. [E07]
4. Approved: the knowledge base is created with **you as its owner**, and you get *Knowledge Base
   request approved*. Rejected: *"Your request for a new Knowledge Base has been rejected."* [E07]
   [E08]

## Create or change a knowledge base {label=NEW}

Only knowledge administrators create knowledge bases; the owner and managers may change theirs.
Knowledge bases can't be deleted: make one inactive instead. [E09] Two knowledge bases can't share
a title: *"A knowledge base called '…' already exists"*. [E10]

| Field | What it does |
|---|---|
| **Owner**, **Managers** | they get the `knowledge_manager` role when you save: *"User … will be assigned the knowledge_manager role after adding!"* They lose it when they no longer own or manage any knowledge base. [E11] [E12] |
| **Publish flow**, **Retire flow** | whether publishing and retiring need approval; left empty, a new knowledge base gets the *instant* flows, with no approval [E13] [E14] |
| **Can Read**, **Cannot Read**, **Can Contribute** | who reads and who writes; see below [E17] |
| **Checklist** | the quality checklist; see [Check article quality](see:quality) [E02] |
| **Article Validity** | days until a new article's **Valid to**; empty means 2100 [E25] |
| **Disable commenting**, **Disable suggesting** | copied to each new article [E26] |

The approvers of an approval flow are the owner and managers: ownership groups are off on pdi2.
[E15] [E16]

## Who reads and who contributes {label=NEW}

| Knowledge base | Can read | Cannot read | Can contribute |
|---|---|---|---|
| IT | 'Problem Analyzers' and 'Problem Solving' group members; All ACME North America employees; All ACME Corporation employees | | The ACME North America IT Department |
| Known Error | holders of itil, problem_task_analyst or sn_problem_write [E18] | | holders of itil |
| Knowledge | *Any user for KB* [E19] | the guest user | holders of knowledge |
| KCS demo | none in the mirror | | none in the mirror |

[E17]

A knowledge base with no **Can Read** list is closed to readers, and one with no **Can Contribute**
list is open only to its owner, managers and administrators: pdi2 blocks access where no user
criteria are set. [E20] [E21]

## Check someone's access {label=NEW}

When someone can't see or edit an article, open **User criteria diagnostics** in the Knowledge
Center. [E03] Choose **Knowledge Base** or **Article**, pick it and the user, and choose
**Diagnose**. [E22] The answer says whether they can read or contribute, and why: for example
*"… has contribute access to knowledge base (…), because the user is the knowledge base owner,
manager, or admin."* or *"User denied read access to the knowledge base because Can Read is not
set."* [E21]

Knowledge managers and knowledge administrators can use it. [E23] On the classic forms of a
knowledge base or an article, the related link **Run User Criteria Diagnostics** does the same for
admins, knowledge administrators and the knowledge base's owner and managers. [E24]

## Tips

- Ask for a knowledge base with the catalog item rather than by email: the requester becomes the
  owner, with the knowledge_manager role. [E08] [E11]
- Choose the flows when you create a knowledge base: an empty choice means instant publishing and
  retiring. [E14]
- Use **View Knowledge Base** on the classic form to see a knowledge base as readers browse it.
  [E28]

## Not yet seen {label=OPEN-QUESTION}

1. Who owns and manages each knowledge base, and which publish and retire flows do they use? The
   knowledge base records are not in the mirror and the walk did not record them.
2. The KCS demo knowledge base has no user criteria in the mirror: with access blocked where none
   are set, can anyone but its owner, managers and administrators read it? [E20]
3. *Any user for KB* sets no condition at all: does it let every user read the Knowledge
   knowledge base? [E19]
4. Requests for a knowledge base are approved by one fixed account, though the knowledge_manager
   role says requests go to knowledge administrators. Who should approve them? [E07] [E27]
5. The Request Knowledge Base page, the User criteria diagnostics page and a knowledge base form
   were not opened on screen.
