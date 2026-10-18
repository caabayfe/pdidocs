---
title: Say which service is affected
reviewed: 2026-10-17
evidence:
  E01:
    record: item_option_new/38c56db30a0a0b27000e9c6778a1dc64
    how: read the Report Outage question
    result: '"What application is down/unavailable?", a service, mandatory'
    hash: 60eacd608d169896b17909741ee518b3a9b96657516eb3305f36841492dfc5c6
  E02:
    record: item_option_new/3828a3d80a0a0b2700fd9da427364121
    how: read the Report Performance Problem question
    result: '"What application is experiencing performance problems?", a service, mandatory'
    hash: 9295b2c02660bcb62c765fe888d1b091ab971031f82604c2d4d58f4a4aa5f424
  E03:
    record: item_option_new/2a2be6520a0a020e00d111208c9c6391
    how: read the Password Reset question
    result: '"What application password do you need reset?", a service, mandatory'
    hash: 9359406d0e853f3556272296e268ada928ae4e506fd0c8bde5fce11a6d4190a5
---
Some forms ask which application or service you mean, so that IT knows what is affected.

## When you're asked

{{animation:cmdbpick}}

1. On **Report Outage**, **Report Performance Problem** or **Password Reset**, you see a
   question such as *What application is down/unavailable?* It must be answered. [E01] [E02] [E03]
2. Start typing the name of the application or service. A list of matches appears.
3. Pick the one you mean from the list.

The forms themselves are described in [Report an incident](see:incident/report).

## What happens next

The service desk sees what you picked on your incident, which helps it send your report to the
team that looks after it.

## Tips

- Pick only one: if several applications are affected, name the others in the description.
- Can't find it? Choose the closest one and say what you mean in the description; the service
  desk will correct it.

## I want to…

| I want to… | Go to |
|---|---|
| report something that isn't working | [Report an incident](see:incident/report) |
| know which way to contact IT | [Ways to get help](see:getting-help/channels) |
