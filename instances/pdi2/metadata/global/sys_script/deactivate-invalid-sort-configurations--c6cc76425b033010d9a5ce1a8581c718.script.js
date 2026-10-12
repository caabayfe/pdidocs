(function executeRule(current, previous /*null when async*/ ) {

    if (current.operation() === 'delete') {
        deleteSortOption(current.profile, current.search_source);
    } else if (
        current.operation() === 'update' &&
        (current.profile != previous.profile || current.search_source != previous.search_source)
    ) {
        deleteSortOption(previous.profile, previous.search_source);
    }

    /**
     * Returns whether or not the profile has other linked search sources that
     * are based on the same table
     */
    function checkForOtherSourcesWithSameTable(profile, tableName) {
        var matchingSearchSourceCount = 0;
        var profileSearchSourceGR = new GlideRecord('ais_search_profile_ais_search_source_m2m');
        profileSearchSourceGR.addQuery('profile', profile);
        profileSearchSourceGR.query();
        while (profileSearchSourceGR.next()) {
            if (profileSearchSourceGR.search_source.datasource.source == tableName) {
                matchingSearchSourceCount += 1;
            }
        }
        // We check for >1 instead of >0 since there will always be a match on 
        // the current record this BR is executing on
        return matchingSearchSourceCount > 1;
    }

    /**
     *  Deactivate the sort config For each search application that uses the specified search profile and has a sort configuration based on the specified search source's table
     */
    function deleteSortOption(profile, source) {
        var searchSourceGR = new GlideRecord('ais_search_source');
        if (searchSourceGR.get(source)) {
            var searchSourceTableName = searchSourceGR.datasource.source;
            if (!checkForOtherSourcesWithSameTable(profile, searchSourceTableName)) {
                // Fetch all Configs that's use the search profile whose search sources are being updated
                var searchAppConfigGr = new GlideRecord('sys_search_context_config');
                searchAppConfigGr.addQuery('search_profile', profile);
                searchAppConfigGr.query();
                while (searchAppConfigGr.next()) {
                    var sortConfigGR = new GlideRecord('sys_search_sort_option');
                    sortConfigGR.addQuery('search_context_config', searchAppConfigGr.getValue('sys_id'));
                    sortConfigGR.addQuery('ais_field_name', 'STARTSWITH', searchSourceTableName);
                    sortConfigGR.query();
                    while (sortConfigGR.next()) {
                        var sortField = sortConfigGR.getValue('ais_field_name');
                        var sortConfigTableName = sortField.split('.')[0];
                        if (sortConfigTableName == searchSourceTableName) {
                            sortConfigGR.active = false;
                            sortConfigGR.update();
                        }
                    }
                }
            }
        }
    }

})(current, previous);
