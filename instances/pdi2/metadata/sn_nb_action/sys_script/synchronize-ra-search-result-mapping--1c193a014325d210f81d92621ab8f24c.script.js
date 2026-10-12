(function executeRule(current, previous /*null when async*/ ) {

    if ((current.operation() === "insert") && (current.name != "")) //linking existing search source
        updateRASearchResult(current, previous);

    if (current.operation() === "update") //linking new search source
        updateRASearchResult(current, previous);

    if (current.operation() === "delete") //deleting or unlinking a search source
        deleteRASearchResult(current);

    function updateRASearchResult(current, previous) {
        var searchApplicationConfiguration = current.search_context_config;
        var searchSourceTableName = current.ais_search_source.datasource;

        //check if there is any context with the current search applictaion config
        var contextGr = new GlideRecord(Constants.TBL_RULE_CONTEXT);
        contextGr.addQuery(Constants.COL_SEARCH_APPLICATION_CONFIGURATION, searchApplicationConfiguration);
        contextGr.query();
        while (contextGr.next()) {
            var contextScope = contextGr.getValue(Constants.COL_SYS_SCOPE);
            var searchResultMappingGR = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
            searchResultMappingGR.addQuery(Constants.COL_CONTEXT, contextGr.getValue(Constants.COL_SYS_ID));
            searchResultMappingGR.addQuery(Constants.COL_SEARCH_SOURCE_TABLE, searchSourceTableName);
            searchResultMappingGR.query();
            if (!searchResultMappingGR.hasNext()) {
                var insertRASearchMapping = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                insertRASearchMapping.initialize();
                insertRASearchMapping.setValue(Constants.COL_CONTEXT, contextGr.getValue(Constants.COL_SYS_ID));
                insertRASearchMapping.setValue(Constants.COL_ACTION_TYPE, "e38f55b9b72120107d472397ee11a9be"); //guidance
                insertRASearchMapping.setValue(Constants.COL_ACTION, "4f75f24543ed5e109a8b04836ab8f207"); //Default guidance for search results  
                insertRASearchMapping.setValue(Constants.COL_SEARCH_SOURCE_TABLE, searchSourceTableName);
                insertRASearchMapping.setValue(Constants.COL_SYS_SCOPE, contextScope);
                var sysId = insertRASearchMapping.insert();
                //update the action inputs
                var updateRASearchMapping = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                updateRASearchMapping.get(sysId);
                if (updateRASearchMapping) {
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
    }

    function deleteRASearchResult(current) {
        var searchApplicationConfiguration = current.search_context_config;
        var searchSourceTableName = current.ais_search_source.datasource;
        if (searchSourceTableName == "") { //when the search source record is deleted
            _deleteInvalidSearchResultMapping(searchApplicationConfiguration);
        } else {
            //check if there are any other search sources indexed on same search source table
            var searchFilterGr = new GlideRecord(Constants.TBL_SEARCH_FILTER);
            searchFilterGr.addQuery(Constants.COL_SEARCH_CONTEXT_CONFIG, searchApplicationConfiguration);
            searchFilterGr.addQuery("ais_search_source.datasource", searchSourceTableName);
            searchFilterGr.query();
            if (searchFilterGr.getRowCount() == 0) {
                var contextGr = new GlideRecord(Constants.TBL_RULE_CONTEXT);
                contextGr.addQuery(Constants.COL_SEARCH_APPLICATION_CONFIGURATION, searchApplicationConfiguration);
                contextGr.query();
                while (contextGr.next()) {
                    var searchResultMappingGR = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                    searchResultMappingGR.addQuery(Constants.COL_CONTEXT, contextGr.getValue(Constants.COL_SYS_ID));
                    searchResultMappingGR.addQuery(Constants.COL_SEARCH_SOURCE_TABLE, searchSourceTableName);
                    searchResultMappingGR.query();
                    if (searchResultMappingGR.next()) {
                        searchResultMappingGR.deleteRecord();
                    }
                }
            }
        }
    }

    /**
     * Delete if any invalid search result mapping exists for all the context
     * where the search source has been updated for a search application configuration 
     */
    function _deleteInvalidSearchResultMapping(searchApplicationConfiguration) {
        var validSources = _validSearchSourcesOfSearchAppConfig(searchApplicationConfiguration);
        var contextGr = new GlideRecord(Constants.TBL_RULE_CONTEXT);
        contextGr.addQuery(Constants.COL_SEARCH_APPLICATION_CONFIGURATION, searchApplicationConfiguration);
        contextGr.query();
        while (contextGr.next()) {
            var searchResultMappingGR = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
            searchResultMappingGR.addQuery(Constants.COL_CONTEXT, contextGr.getValue(Constants.COL_SYS_ID));
            searchResultMappingGR.addQuery(Constants.COL_MAP_GENIUS_RESULT, Constants.CHOICE_NO);
            searchResultMappingGR.query();
            while (searchResultMappingGR.next()) {
                var datasource = searchResultMappingGR.search_source_table.toString();
                if (!validSources.includes(datasource)) {
                    searchResultMappingGR.deleteRecord();
                }
            }
        }
    }

    /**
     * function to get the list of search sources for given search application
     * config
     */
    function _validSearchSourcesOfSearchAppConfig(searchApplicationConfiguration) {
        var gr = new GlideRecord(Constants.TBL_SEARCH_FILTER);
        gr.addQuery(Constants.COL_SEARCH_CONTEXT_CONFIG, searchApplicationConfiguration);
        gr.query();
        var searchSources = new Array();
        while (gr.next())
            searchSources.push(gr.ais_search_source.datasource.source + "");
        return searchSources;
    }

})(current, previous);
