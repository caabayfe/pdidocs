function transform(params) {
    var answer = {};

    if (!GlidePluginManager.isActive("sn_km_gen_ai")) {
        answer.eligible = false;
        return answer;
    }

    if (gs.nil(params) || gs.nil(params.kb_sys_id) || gs.nil(params.target_table)) {
        answer.eligible = false;
        return answer;
    }

    var utils = new sn_km_gen_ai.KMNowAssistInProductUtils();
    //Author flow condition check and it fills the dropdown with task table in workspace  
    if (gs.nil(params.source_sys_id)) {
        if (params.kb_sys_id.indexOf('-1') !== 0) {
            answer.eligible = false;
            return answer;
        }
        var searchService = new sn_km_gen_ai.KMSearchService();
        answer.availableTaskFilters = searchService.getAvailableFilters(params.target_table);
        var filtersCount = Object.keys(answer.availableTaskFilters).length;
    }
    answer.eligible = utils.shouldShowGenAIGenerate(params.kb_sys_id == '-1', params.source_table, params.source_sys_id, params.target_table);

    answer.timeout = utils.getClientSideTimeout();
    return answer;
}
