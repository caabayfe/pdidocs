function transform(input) {
    try {
        const PAGE_NUMBER = 0;
        const RECORD_PER_PAGE = 1;
        var result = NAALlmChangeHistoryUtil.getSkillUpdateData(input.search_term, input.page_number, input.records_per_page, input.skill_change_filter, gs.getSession().getCurrentDomainID());
        result.policyUpdateData = NAALlmChangeHistoryUtil.getPolicyUpdateData("", PAGE_NUMBER, RECORD_PER_PAGE);
        return result;
    } catch (e) {
        gs.error("Failed to fetch Skill provider Update History - " + e.toString());
        throw new Error("Failed to fetch Skill provider Update History");
    }
}
