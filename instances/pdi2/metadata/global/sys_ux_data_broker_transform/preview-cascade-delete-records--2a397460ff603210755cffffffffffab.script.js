function transform(input) {
    const {
        ruleId
    } = input;
    if (!ruleId) return;
    const otdRuleManager = new OnetimeDeleteRuleManager();
    return otdRuleManager.fetchCascadeDeletePreview(ruleId);
}
