function transform(input) {
    try {
        var result = NAALlmChangeHistoryUtil.getPolicyDataInPresentationalListFormat(input.search_term, input.page_number, input.records_per_page, gs.getSession().getCurrentDomainID());
        return result;
    } catch (e) {
        gs.error("Failed to fetch Policy Update History - " + e.toString());
        throw new Error("Failed to fetch Policy Update History");
    }
}
