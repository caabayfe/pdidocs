function transform(params) {
    if (gs.nil(params) || params.should_fetch === false)
        return {
            success: false
        };

    if (!GlidePluginManager.isActive("sn_km_gen_ai"))
        return {
            success: false
        };

    if (gs.nil(params) || (gs.nil(params.search_terms) && gs.nil(params.source_sys_id)))
        return {
            success: false
        };

    try {
        var answer = {
            order: [],
            data: {}
        };
        var searchResult = null;
		var api = new sn_km_gen_ai.KMSearchService();
        if (!gs.nil(params.source_sys_id)) {
            searchResult = api.searchSimilarTasks(params.source_sys_id, params.source_table);
        } else if (!gs.nil(params.search_terms)) {
            searchResult = api.searchText(params.search_terms, params.search_filters.split(','));
        }

        if (searchResult != null) {
            var filters = [];
            for (var idx in searchResult) {
                var id = searchResult[idx].sysId;
                answer.order.push(id);
                filters.push('sys_id=' + id);
            }
            if (filters.length > 0) {
                answer.data = new sn_km_uib.KMGenAITaskSearchUtil().getData(searchResult[0].table, filters);
            }
        }
    } catch (error) {
        gs.error('Tasks Search error: ' + error);
        return {
            success: false,
            error: error
        };
    }

    return {
        success: true,
        content: answer
    };
}
