(function executeRule(current, previous /*null when async*/ ) {
    var MESSAGE = 'Search-based Autocomplete has been automatically added to your search configuration, and Popular Search Autocomplete has been removed. You can add it back by simply adding the "Popular Search Reader Group" in your autocomplete configuration.';

    /** Retrieves the most recent upgrade record and returns an object with the "from" and "to" versions */
    function getLastUpgradeVersions() {
        var gr = new GlideRecord('sys_upgrade_history');
        gr.addQuery('from_version', '!=', 'n/a');
        gr.addQuery('history_type', 'upgrade');
        gr.setLimit('1');
        gr.orderByDesc('upgrade_finished');
        gr.query();
        if (gr.next()) {
            return {
                toVersion: gr.getValue('to_version'),
                fromVersion: gr.getValue('from_version')
            };
        }
    }

    /** 
     * Returns true if not a zboot instance and customer is on Tokyo or has upgraded to Utah and bypassed Tokyo
     * (Since we don't need to show this message forever, one upgrade cycle is enough)
     */
    function isRecentUpgradeCustomer() {
        if (pm.isZboot()) return false;
        var lastUpgradeVersions = getLastUpgradeVersions();
        return lastUpgradeVersions.toVersion.toLowerCase().contains('tokyo') ||
            (lastUpgradeVersions.toVersion.toLowerCase().contains('utah') && !lastUpgradeVersions.fromVersion.toLowerCase().contains('tokyo'));
    }

    /** 
     * Checks if a suggestion reader group w/ a search-based suggestion reader is linked to the search 
     * application this reader group is linked to
     */
    function searchBasedSuggestionsEnabled() {
        if (!current.context_config_id) return false;
        var readerGroupGR = new GlideRecord('sys_suggestion_reader_group');
        readerGroupGR.addQuery('context_config_id', current.context_config_id);
        var joinCondition = readerGroupGR.addJoinQuery('m2m_sys_suggestion_reader_sys_suggestion_reader_group', 'sys_id', 'sys_suggestion_reader_group_id');
        joinCondition.addCondition('sys_suggestion_reader_id', 'c41365e077020110be280d892c5a99f2'); // The AI Search reader ID
        readerGroupGR.query();
        return readerGroupGR.hasNext();
    }

    if (gs.hasRole('ais_admin') && searchBasedSuggestionsEnabled() && isRecentUpgradeCustomer())
        gs.addInfoMessage(gs.getMessage(MESSAGE));

})(current, previous);
