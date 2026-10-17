function transform(input) {
   const {tableName, ruleSysID, ruleType} = input;
   const ruleManager = new DMRuleManager();
   return { rule: ruleManager.getRule(ruleType, ruleSysID)};
}
