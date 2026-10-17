function executeRule(input) {
	const {ruleId, ruleType} = input;
	const CONSTANTS = new DMRuleConstants();
	
    if (JSUtil.notNil(ruleType)) {
        if (ruleType ==  CONSTANTS.RULE_TYPES.ONETIME_DELETE) {
            return new OnetimeDeleteRuleManager().executeRule(ruleId);
        }
    }
}
