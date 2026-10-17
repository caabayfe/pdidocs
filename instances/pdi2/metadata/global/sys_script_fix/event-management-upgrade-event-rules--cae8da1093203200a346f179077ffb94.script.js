var er = new SNC.EventRuleManager();
er.migrateAllRules(); //upgrades fuji event rules to Istanbul version
er.migrateAllRulesToJakartaAndAbove(); //upgrades all event rules to Jakarta and above version
