---
title: Requests - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ux_form_action_layout/50d15cefc78230105a06a1e603c2603a
    how: read the workspace Request header layout
    result: Cancel Request, two Copy actions, Send SMS, Copy URL
    hash: 6d136774948828c38140abf3140531b3d7b3b8d7de20863c7e86ea064022de24
  E02:
    record: sys_ux_form_action_layout/da7120c8eb8b2110dd0583402a5228ac
    how: read the workspace Request Item header layout
    result: only Send SMS and Copy URL
    hash: b4a14f8247e1c6fa05b7a5bc15816139ab008e03a53f18c12307cf86ade4b73a
  E03:
    record: sysevent_email_action/2bf1538377223010f088a0e89e5a99fb
    how: read Request Rejected (global)
    result: on request_state changing to closed_rejected
    hash: 234796e84ec819b04c11f149e1242870ac2a43a318c572eaa852fc14481c1627
  E04:
    record: sysevent_email_action/db07d5ea0fe433001befa68ca8767edc
    how: read Request Rejected (Now Mobile)
    result: a second notification on the same change
    hash: e32d8b4a0f534f38ee2aa9bbd988d19bcd92dba8947086a301aaf8f0db4d90c9
---
## Headers

The request header has *Cancel Request* [E01]; the item header has no close or cancel action.
[E02]

## Duplicate emails {label=OPEN-QUESTION}

Two *Request Rejected* notifications fire on the same change [E03] [E04]: requesters may get two
emails.
