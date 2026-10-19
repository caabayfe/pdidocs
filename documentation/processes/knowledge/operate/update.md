---
title: Update a published article
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_properties/58b7a716db103200a042f278f0b8f585
    field: value
    how: read glide.knowman.versioning.enabled
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E02:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canWrite and getEditableFields
    result: 'a published article can be edited in place only for the fields named in glide.knowman.versioning.minor_edit_fields, and only while minor edits are on; retired and outdated versions can''t be edited'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E03:
    record: sys_properties/960e23bcdb0f2200a042f278f0b8f581
    field: value
    how: read glide.knowman.versioning.enable_minor_edits
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E04:
    record: sys_ui_action/1343604253c000108bd7ddeeff7b1243
    field: client_script_v2
    how: read Checkout (workspace button) and its condition
    result: 'on the latest published version; creates a new version and opens it with "A new version of the article is created for revision."; otherwise "You cannot checkout this article as it is already checked out."'
    hash: b1bff8c6f3fb575385e8bf358a4a76939abb3c593ca2834eb7159f341b6c15cd
  E05:
    record: sys_ui_action/169ee7fcdb122200a042f278f0b8f58e
    field: script
    how: read Checkout (classic form button)
    result: 'the same, and when the new version gets a new Valid to date: "Valid to has been changed from {0} to {1}."'
    hash: 7c5e73a47f4c21df74d8bf5f6916f80018653d541501cf785d82b06658e86801
  E06:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.canCheckout
    result: 'only a published article that isn''t already checked out; by the knowledge base owner or managers, a knowledge admin, or anyone who may contribute to the knowledge base'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E07:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC._performCheckout, _resetFieldsForCheckout and _nextMinorVersion
    result: 'copies the article with its attachments, keywords, tags and related articles; the copy is a draft, you are its reviser, the version goes up by 0.01 (1.0 to 1.01), and views and ratings carry over'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E08:
    record: sys_script/2e03c5a3dbd62200a042f278f0b8f55b
    field: script
    how: 'read Versioning : Increment Version'
    result: publishing a version gives it the next major version (1.01 published becomes 2.0)
    hash: 13639e2e828eeee1e34c72e92e814422c366ff79fe70fc9e67a5f5431226cd99
  E09:
    record: sys_script_include/e88483e0db122200a042f278f0b8f5d0
    field: script
    how: read KBVersioningSNC.outdateOldVersion
    result: 'when the new version is published, the earlier published version becomes Outdated: through Knowledge - Outdate Article when the knowledge base uses flows, otherwise directly'
    hash: 9a6dc81ae0aac6d8b952c7fd7afa8e7271b116c062f4e6ddc168cc9847a987a5
  E10:
    record: sys_hub_flow/6a151635c416f610f8775e5cc901a819
    how: read Knowledge - Outdate Article
    result: '"updates a knowledge article''s stage to Outdated when a newer version is published"; active'
    hash: 7692b306b1cb7668b18bdf95c3a50c545cd2b56b9bf630e159f83a19c6b9d8bf
  E11:
    record: sys_ui_action/3ba2c012db432200a042f278f0b8f507
    field: script
    how: read Recall
    result: '"Recalls the article back to editable state."; in Review or Scheduled for publish; "Moved the article back to draft state"'
    hash: 6ec6ab4a5411d82fa43ebf5296fd2f7851c2371018b6778bc40a0d1a80d4e77e
  E12:
    record: sys_ui_action/0acbaa0f73100010bcfd1c86fbf6a7eb
    field: client_script_v2
    how: read Make this Current (workspace button), with KBVersioningSNC.canMakeThisCurrent
    result: 'on an outdated version, for the knowledge base owner or managers or a knowledge admin, while no version is checked out: creates a new draft from it, "A new version of the article is created for revision."'
    hash: 69bb7aee57afb58aea658cc24e871fcdc4199756b924dd4b45d183a8294f9ad3
  E13:
    record: sys_declarative_action_assignment/869cc60489631010f8779cb12a81070d
    how: read Compare (sn_km_uib, on kb_version)
    result: a list action that needs selected records
    hash: 2b52d05563e4f4cda4a7860645174bda61184e48097fa3e12d6d432d040964ea
  E14:
    record: sys_ux_app_route/53a62321ffb872106f72ffffffffffd1
    how: read the Knowledge Center route Version Compare
    result: '"Route for version compare page in knowledge center", for a table and versions'
    hash: 21539fb9ebbca4557d539fc04c32f7f3c7d63c6ecc79c61d0c12ad1310ac52b4
  E15:
    record: sys_ux_lib_component/c80896b41656ad926130c04c4f5aab59
    field: required_translation_keys
    how: read the knowledge component labels
    result: '"You can compare only two versions of a knowledge article."'
    hash: 46ee5323adbb1bc28520258aadbd5b8a0ce809a8be5cb9d2c1315bfec46c6d2b
  E16:
    record: sys_script/ce68d00d67203200d358bb2d07415a3f
    field: script
    how: read Notify about article's checkout, with glide.knowman.enable_km_subscription (sys_properties/7948c79367583200d358bb2d07415aa0) true
    result: a checkout is posted as an activity to the article's subscribers
    hash: 06fe569f4a1f1db35106891ad4bc9272cb4647dc5565f88d3f6274abcfd6e37f
  E17:
    record: sys_script/65c8e098db872200a042f278f0b8f543
    field: script
    how: 'read Versioning : Retire all versions'
    result: retiring an article retires all its other versions
    hash: 724cd8b3285bcf796b38973fa9ebfdaa8510ca63e55b4c1c14bae09194521951
---
## How updating works {label=NEW}

Versioning is on for pdi2. [E01] You don't edit a published article; you **check out** a new
version, change it, and publish it. Readers keep seeing the published version until the new one
is published. [E07] [E09]

Editing a published article in place is off: minor edits are switched off, so no field of a
published article can be changed directly. [E02] [E03]

## Check out a new version {label=NEW}

{{animation:kbauthor}}

1. Open the published article in the Knowledge Center.
2. Choose **Checkout**. It is offered on the latest published version, to anyone who may
   contribute to its knowledge base, and to its owner and managers. [E04] [E06]
3. A new version opens with *"A new version of the article is created for revision."* It is a
   **draft**, you are its **reviser**, and its version goes up by 0.01 (for example 1.0 to 1.01).
   [E04] [E07] If the new version got a new **Valid to** date, the message says so. [E05]
4. Make your changes and save.
5. [Publish it](see:publish), as for a new article.

If someone has already checked it out, you see *"You cannot checkout this article as it is
already checked out."* Work on their version, or ask them. [E04]

The new version keeps the attachments, keywords, tags and related articles, and the views and
ratings of the old one. [E07] The article's subscribers see the checkout in its activity. [E16]

## When the new version is published {label=NEW}

| Version | Becomes |
|---|---|
| the new one | **Published**, with the next whole version number (1.01 becomes 2.0) [E08] |
| the one readers had until now | **Outdated** [E09] [E10] |

Outdated versions are kept, and can't be changed. [E02]

## Recall a version waiting for approval {label=NEW}

While your version is in **Review** or **Scheduled for publish**, choose **Recall** to bring it
back to draft: *"Moved the article back to draft state"*. [E11] Change it, then publish again.

## Go back to an older version {label=NEW}

The knowledge base's owner and managers can choose **Make this Current** on an **outdated**
version. It creates a new draft from that version, which they then publish. It isn't offered
while another version is checked out. [E12]

## Compare two versions {label=NEW}

In the article's versions, select **two** versions and choose **Compare**. The Knowledge Center
shows them side by side. [E13] [E14] Select only two: *"You can compare only two versions of a
knowledge article."* [E15]

## Tips

- Check out only when you are ready to make the change: while your version is checked out,
  nobody else can check the article out. [E06]
- Retiring an article retires all its versions, not just the one you have open. [E17]
- For an article that is wrong in a way readers have reported, start from the feedback task, so
  that the task is closed with the update. See [Work feedback and knowledge gaps](see:feedback).

## Not yet seen {label=OPEN-QUESTION}

1. **Checkout**, **Recall**, **Make this Current** and **Compare** were not used on screen; the
   steps follow the records. [E04] [E11] [E12] [E13] Where does the Knowledge Center show the
   article's versions?
2. Should small corrections (a typo, a link) be possible without a new version? Minor edits are
   off. [E03]
3. Is a new version from Checkout approved again under Approval Publish, as a new article is?
