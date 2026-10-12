function transform(input) {
    const rule = input.dmRule;
    const dmRuleConstants = new DMRuleConstants();
    const ruleManager = new ArchiveRuleManager();
    const archiveDestroyRuleManager = new ArchiveDestroyRuleManager();
    let response = {};
    let destoryRuleSaveResponse = {};

    if (input.estimateType == dmRuleConstants.ARCHIVE_ESTIMATE_TYPES.ARCHIVE_ESTIMATE) {
        response = ruleManager.calculateArchiveEstimate(rule.archive.sys_id, rule.archive.condition);
    } else if (input.estimateType == dmRuleConstants.ARCHIVE_ESTIMATE_TYPES.ARCHIVE_DESTROY_ESTIMATE) {
        if (!rule.archive.destroy_rule) {
            destoryRuleSaveResponse = archiveDestroyRuleManager.createOrUpdateDestroyRule(rule.archive);
            // TODO: handle this case properly
            if (destoryRuleSaveResponse.status == "error")
                return destoryRuleSaveResponse;
        }
        const destroyRuleId = rule.archive.destroy_rule ? rule.archive.destroy_rule : destoryRuleSaveResponse.sysID;
		const { years_destroy_duration, days_destroy_duration, hours_destroy_duration } = rule.archive;
        response = archiveDestroyRuleManager.calculateDestoryEstimate(destroyRuleId, years_destroy_duration, days_destroy_duration, hours_destroy_duration);

        if (!rule.archive.destory_rule)
            response.destroyRuleId = destroyRuleId;

    }
    response.estimateType = input.estimateType;

    gs.flushMessages();

    return response;
}
