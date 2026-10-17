(function executeRule(current, previous /*null when async*/ ) {
    if (!parseInt(previous.getValue('enable_ais')) && parseInt(current.getValue('enable_ais')) ||
        previous.getValue('search_application') != current.getValue('search_application')) {
        var sacId = current.getValue('search_application');
        var sacName = current.search_application.getDisplayValue('name');
        new SuggestionReaderGroupUtils().createSuggestionReaderGroupsIfNeeded(sacId, sacName);
    }
})(current, previous);
