(function refineQuery(current, parent) {
    const searchFacetMappings = new SearchFacetItemMappings();
    const behelper = new BundleExtensions();
    const grBundle =
        searchFacetMappings.getRecordsByQuery("element_table=sys_uib_bundle_extension^target_id=" + parent.sys_id, false, true);

    const bundleContext = {};

    while (grBundle && grBundle.next()) {
        const value = grBundle.search_facet_item.api_name;
        const key = grBundle.search_facet_item.search_facet.api_name.toString();
        bundleContext[key] = value;
    }
    if (Object.keys(bundleContext).length > 0) {
        const expIdToContext = {};
        const grExp =
            searchFacetMappings.getRecordsByQuery("element_table=sys_ux_app_config", false, true);

        while (grExp && grExp.next()) {
            var searchFacetKey = grExp.search_facet_item.search_facet.api_name;
            var searchFacetvalue = grExp.search_facet_item.api_name;

            if (expIdToContext[grExp.target_id]) {
                expIdToContext[grExp.target_id][searchFacetKey] = searchFacetvalue;
            } else {
                expIdToContext[grExp.target_id] = {};
                expIdToContext[grExp.target_id][searchFacetKey] = searchFacetvalue;
            }
        }
        const expIds = [];
        for (const [expId, expContext] of Object.entries(expIdToContext)) {
            if (bundleContext && expContext && behelper.compareContexts(bundleContext, expContext)) {
                expIds.push(expId.toString());
            }
        }
        const query = "sys_idIN" + expIds.join(",");
        current.addEncodedQuery(query);
    } else {
        
        current.addQuery('sys_id', '=', 'undefined');
    }

})(current, parent);
