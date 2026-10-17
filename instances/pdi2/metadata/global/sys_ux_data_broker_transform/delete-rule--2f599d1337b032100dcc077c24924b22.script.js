function transform(input) {
   const {ruleSysID, ruleType} = input;
   const ruleManager = new DMRuleManager();
   return ruleManager.deleteRule(ruleType, ruleSysID);
}
