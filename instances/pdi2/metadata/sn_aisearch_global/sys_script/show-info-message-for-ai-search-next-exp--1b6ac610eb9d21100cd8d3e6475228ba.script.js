(function executeRule(current, previous /*null when async*/ ) {

	/** This property gets enabled by default for Utah Zboooted instances */
    function isZbootedUtahInstanceAndBeyond() {
        return gs.getProperty('glide.ais.global_search.app_installed', 'false') === 'true';
    }

	/** Check the instance is not on the expected version  */
    function isNotOnTheExpectedVersionInstance(version) {
        var gr = new GlideRecord('sys_upgrade_history');
        gr.addEncodedQuery('from_version!=n/a^ORfrom_version=NULL^history_type=upgrade');
        gr.setLimit('1');
        gr.orderByDesc('upgrade_finished');
        gr.query();
        if (gr.next())
            return !gr.getValue('to_version').toLowerCase().contains(version);
    }

    /** Checks if search-based and user history suggestion readers are linked to next experience application */
    function searchBasedSuggestionsEnabled() {
        var readerGroupGR = new GlideRecord('m2m_sys_suggestion_reader_sys_suggestion_reader_group');
        readerGroupGR.addQuery('sys_suggestion_reader_group_id.context_config_id', current.getUniqueValue());
        readerGroupGR.addQuery('sys_suggestion_reader_id', 'IN', 'f8495b9077210110be280d892c5a9986,c41365e077020110be280d892c5a99f2'); //Search-based and User History suggestion reader groups
        readerGroupGR.query();
        return (readerGroupGR.hasNext() && readerGroupGR.getRowCount() == 2);
    }

    if (isNotOnTheExpectedVersionInstance('sandiego') && !searchBasedSuggestionsEnabled())
        gs.addInfoMessage(gs.getMessage("Search-based autocomplete suggestions are not enabled. Refer to <a href = '/sysauto_script.do?sys_id=25261d54ebf021100cd8d3e6475228e2'>here</a> to enable them."));

    if ((isNotOnTheExpectedVersionInstance('sandiego') && isNotOnTheExpectedVersionInstance('tokyo')) || isZbootedUtahInstanceAndBeyond)
        gs.addInfoMessage(gs.getMessage("Cross-table facets allow you to filter search results using values from fields on multiple indexed tables. Your configured cross-table facet definitions appear on the \"All\" tab. To make a facet cross-field, enter a comma-separated list of table.field entries (or the special values \"tags\" or \"language\") as its Facet Field."));

})(current, previous);
