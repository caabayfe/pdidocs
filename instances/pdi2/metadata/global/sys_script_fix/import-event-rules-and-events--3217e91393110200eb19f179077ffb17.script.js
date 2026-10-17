var er = new SNC.EventRuleManager();
er.migrateAllRules();
er.migrateEvents();
er.checkAndUpdateEmptyEvents();
