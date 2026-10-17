---
title: Log and categorise an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_policy/0c090e93d7b30200f2d224837e61030a
    how: read Fields set to mandatory for all states
    result: Caller and Short description are mandatory in every state
    hash: bebf92599b8560570fad3a720e32d8e8ad0ee1d86a2b0c5e2a3136cc9be82a89
  E02:
    record: sys_script_client/8f0b3ee00a0a0b5700e75f4aaabe4953
    how: read Highlight VIP Caller
    result: a VIP caller shows a VIP icon and a red caller field
    hash: 1f9078853724b55b6d0ef4cede7d86e96bfafb6a29bc539355d246a2b2de295a
  E03:
    record: sys_script_client/5e524025c0a80166004d1761e85e2058
    how: read (BP) Set Location to User
    result: choosing the caller fills the location with theirs
    hash: 35812337c5b1cba4a32a76db07cd6899267391d67b1fd9aaccace40b39488a40
---
## Before you start

You need the service desk role. You find everything under **Incident** in the application
navigator:

| Menu | Shows |
|---|---|
| **Create New** | A new, empty incident |
| **Assigned to me** | Open incidents assigned to you |
| **Open** | All open incidents |
| **Open - Unassigned** | Open incidents nobody has taken yet: the service desk queue |
| **Resolved** | Incidents waiting for the caller to confirm |
| **All** | Every incident, open or not |
| **Overview** | Dashboard of the incident queues |

## Log an incident while you talk to the caller

1. Open **Incident › Create New**.
2. **Caller**: search by name. Location fills in from the caller. [E03] If the caller is a VIP,
   a VIP icon appears and the field turns red: treat them accordingly. [E02]
3. **Contact type**: how they reached you (*Phone*, *Email*, *Walk-in*, *Chat*, *Self-service*,
   *Virtual Agent*).
4. **Category** and **Subcategory**: what it's about. The subcategory list follows the category:

   | Category | Subcategories |
   |---|---|
   | Inquiry / Help | Antivirus, Email, Internal Application |
   | Software | Email, Operating System |
   | Hardware | CPU, Disk, Keyboard, Memory, Monitor, Mouse |
   | Network | DHCP, DNS, IP Address, VPN, Wireless |
   | Database | DB2, Oracle, MS SQL Server |
   | Password Reset | (none) |

5. **Configuration item**: the device, application or service affected. Choosing it can fill the
   support team for you (see *Assign an incident*).
6. **Impact** and **Urgency**: see *Set the priority*. The **Priority** fills in by itself.
7. **Short description**: one line a colleague understands without opening the incident, such as
   *"VPN disconnects every 5 minutes from home"*. **Caller** and **Short description** are
   required. [E01]
8. **Description**: the details: steps to reproduce, error messages, what has been tried.
9. Save with **Submit**. The incident gets its INC number, and the caller receives an email.

## If you can fix it on the call

Assign it to yourself, write what you did in the resolution notes, and resolve it straight away
(see *Resolve an incident*). This is still worth logging: it shows how often things happen.

## Tips

- Search for open incidents with the same configuration item before you log a new one; it may
  be part of something bigger (see *Escalate and link related work*).
- Write the short description for the next person, not for yourself.
