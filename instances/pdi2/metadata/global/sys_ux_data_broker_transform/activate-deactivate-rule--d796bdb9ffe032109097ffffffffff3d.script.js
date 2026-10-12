function transform(input) {
   const {ruleSysID, ruleType, isActive} = input;
   const ruleManager = new DMRuleManager();
   const response = {rule: ruleManager.activateRule(ruleType, ruleSysID, isActive)};
   gs.flushMessages();
   return response;
}
