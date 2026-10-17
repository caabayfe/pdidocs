current.addQuery("upgrade_history", parent.getUniqueValue());
current.addQuery("claim_status", "Won Conflict").addOrCondition("disposition", 4).addCondition("claim_status", "No Conflict").addOrCondition("claim_status", "Lost Conflict");
