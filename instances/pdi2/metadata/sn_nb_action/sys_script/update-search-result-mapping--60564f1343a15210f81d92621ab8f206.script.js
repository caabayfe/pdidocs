(function executeRule(current, previous /*null when async*/ ) {

    if (((current.operation() === "insert") && (current.search_application_configuration != "")) ||
        (current.operation() === "update" && (current.search_application_configuration != previous.search_application_configuration)))
        updateRASearchResultMapping(current, previous);

    function updateRASearchResultMapping(current, previous) {
        if (previous.search_application_configuration != current.search_application_configuration) {
            //delete the existing search result mapping 
            var searchResultMappingGr = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
            searchResultMappingGr.addQuery(Constants.COL_CONTEXT, current.sys_id);
            searchResultMappingGr.deleteMultiple();
        }

        var searchApplictaionConfig = current.search_application_configuration;
        var contextSysId = current.sys_id;
        var searchContextConfigGr = new GlideRecord(Constants.TBL_SEARCH_CONTEXT_CONFIG);
        searchContextConfigGr.get(searchApplictaionConfig);
        searchContextConfigGr.query();
        if (searchContextConfigGr.hasNext()) {
            var searchProfile = searchContextConfigGr.getValue(Constants.COL_SEARCH_PROFILE);
            var searchProfileSearchSourceM2MGr = new GlideRecord(Constants.TBL_AIS_SEARCH_PROFILE_AIS_SEARCH_SOURCE_M2M);
            searchProfileSearchSourceM2MGr.addQuery(Constants.COL_PROFILE, searchProfile);
            searchProfileSearchSourceM2MGr.query();
            while (searchProfileSearchSourceM2MGr.next()) {
                var searchSourceName = searchProfileSearchSourceM2MGr.search_source.datasource;
                //check if the search source is already created
                var raSearchResultMapping = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                raSearchResultMapping.addQuery(Constants.COL_SEARCH_SOURCE_TABLE, searchSourceName);
                raSearchResultMapping.addQuery(Constants.COL_CONTEXT, contextSysId);
                raSearchResultMapping.query();
                if (!raSearchResultMapping.hasNext()) {
                    var insertRASearchMapping = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                    insertRASearchMapping.initialize();
                    insertRASearchMapping.setValue(Constants.COL_CONTEXT, contextSysId);
                    insertRASearchMapping.setValue(Constants.COL_ACTION_TYPE, "e38f55b9b72120107d472397ee11a9be"); //guidance
                    insertRASearchMapping.setValue(Constants.COL_ACTION, "4f75f24543ed5e109a8b04836ab8f207"); //generic guidance
                    insertRASearchMapping.setValue(Constants.COL_SEARCH_SOURCE_TABLE, searchSourceName);
                    var sysId = insertRASearchMapping.insert();

                    var updateRASearchMapping = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                    updateRASearchMapping.get(sysId);
                    if (updateRASearchMapping && updateRASearchMapping.action_input != undefined) {
                        var keys = Object.keys(updateRASearchMapping.action_input);
                        keys.forEach(function(key) {
                            switch (key) {
                                case "search_table":
                                    updateRASearchMapping.action_input[key] = "{{search_result_table}}";
                                    break;
                                case "search_result_preview":
                                    updateRASearchMapping.action_input[key] = "{{search_result_preview}}";
                                    break;
                                case "search_result_title":
                                    updateRASearchMapping.action_input[key] = "{{search_result_title}}";
                                    break;
                                case "search_teaser_text":
                                    updateRASearchMapping.action_input[key] = "{{search_teaser_text}}";
                                    break;
                                case "search_sys_id":
                                    updateRASearchMapping.action_input[key] = "{{search_result_sysId}}";
                                    break;
                            }
                            updateRASearchMapping.update();
                        });
                    }
                }
            }
            var message = gs.getMessage("Based on the selected Search Application Configuration, the Search Result Mapping list has been updated. Please review!");
            gs.addInfoMessage(message);
        }
    }

})(current, previous);
