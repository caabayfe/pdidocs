function transform(input) {
    rule = input.dmRule;
    const tableName = input.tableName;
    const { rule_type } = rule;
    const dmcScopeUtils = new DMCAppScopeUtils();
    const dmRuleConstants = new DMRuleConstants();

    if (dmRuleConstants.RULE_TYPES.ONETIME_DELETE != rule_type) {
        dmcScopeUtils.switchToTableScope(tableName);
    }

    const ruleManager = new DMRuleManager();
    const response = ruleManager.createOrUpdateRule(rule);

    if (dmRuleConstants.RULE_TYPES.ONETIME_DELETE != rule_type) {
        dmcScopeUtils.switchToCurrentScope();
    }
    gs.flushMessages();

    return response;
}
