(function executeRule(current, previous /*null when async*/ ) {

    if (gs.hasRole('ais_admin') && !pm.isZboot()) {
        var searchSources = [];
        var indexedSourcesNeedingReindexing = [];

        // check if Search-based Suggested Results Reader Group is mapped to SAC
        var readerGroupGR = new GlideRecord('sys_suggestion_reader_group');
        readerGroupGR.addQuery('context_config_id', current.getUniqueValue());
        var joinCondition = readerGroupGR.addJoinQuery('m2m_sys_suggestion_reader_sys_suggestion_reader_group', 'sys_id', 'sys_suggestion_reader_group_id');
        joinCondition.addCondition('sys_suggestion_reader_id', 'c41365e077020110be280d892c5a99f2'); // The AI Search reader ID
        readerGroupGR.query();

        if (readerGroupGR.next()) {

            // find the linked Search Profile, iterate through the Search Sources to retrieve the tables they include
            var sourcesGR = new GlideRecord('ais_search_profile_ais_search_source_m2m');
            sourcesGR.addQuery('profile', current.getValue('search_profile'));
            sourcesGR.query();

            while (sourcesGR.next()) {
                searchSources.push(sourcesGR.getValue('search_source'));
            }

            var tablesGR = new GlideRecord('ais_search_source');
            tablesGR.addQuery('sys_id', 'IN', searchSources.join());

            // We don't need to warn about Knowledge or Catalog Items because they will 
            // be reindexed automatically on upgrade to Tokyo
            tablesGR.addQuery('datasource', '!=', 'kb_knowledge');
            tablesGR.addQuery('datasource', '!=', 'sc_cat_item');
			
			//Exclude External Content since it cannot be re-indexed
			tablesGR.addQuery('datasource.type', '!=', 'external');
            tablesGR.query();

            while (tablesGR.next()) {
                var tableHistoryGR = new GlideRecord('ais_ingest_datasource_stats');
                tableHistoryGR.addQuery('state', '!=', 'cancelled');
                tableHistoryGR.addQuery('partial_ingestion', false);
                tableHistoryGR.addQuery('start', '>=', '2022-07-01'); // Indexed after getting Tokyo AIS Backend
                tableHistoryGR.addQuery('datasource', tablesGR.getValue('datasource'));
                tableHistoryGR.query();

                if (!tableHistoryGR.next()) {
                    indexedSourcesNeedingReindexing.push(tablesGR.getDisplayValue('datasource'));
                }
            }

            if (indexedSourcesNeedingReindexing.length > 0) {
                indexedSourcesNeedingReindexing.sort();
            }
        }
        if (indexedSourcesNeedingReindexing.length > 0) {
            var indexSourceNames = '<ul><li>' + indexedSourcesNeedingReindexing.join('</li><li>') + '</li></ul>';

            var msg = gs.getMessage('The following tables and any child tables should be re-indexed in order for search-based autosuggestions to be fully-populated: {0}', indexSourceNames);
            gs.addErrorMessage(msg);
        }
    }

})(current, previous);
