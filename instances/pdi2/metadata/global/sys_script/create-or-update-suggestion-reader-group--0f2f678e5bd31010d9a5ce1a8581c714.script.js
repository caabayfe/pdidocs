(function executeRule(current, previous /*null when async*/ ) {
    if (current.operation() === "insert") {
        new SuggestionReaderGroupUtils().createSuggestionReaderGroupsIfNeeded(current.sys_id, current.name);
    }
    if (current.operation() === "update") {
        if (current.search_engine == "ai_search" && previous.search_engine == "zing") {
            new SuggestionReaderGroupUtils().createSuggestionReaderGroupsIfNeeded(current.sys_id, current.name);
        }
        if (current.getValue('name') != previous.getValue('name')) {
            // Get suggestion reader groups with the old name and update their suggestion_type to the new name
            var suggestionTypeGR = new GlideRecord('sys_suggestion_reader_group');
            var condition = suggestionTypeGR.addNullQuery('context_config_id');
            condition.addOrCondition('context_config_id', current.getValue('sys_id'));
            suggestionTypeGR.addQuery('suggestion_type', 'ENDSWITH', 'for ' + previous.getValue('name'));
            suggestionTypeGR.query();
            while (suggestionTypeGR.next()) {
                var existingName = suggestionTypeGR.getValue('suggestion_type');
                var newName = existingName.replaceAll(previous.getValue('name'), current.getValue('name'));
                suggestionTypeGR.setValue('suggestion_type', newName);
                gs.info("Updating name of Suggestion Reader Group due to name change of Search Application (from " + existingName + " to " + newName + ")");
                suggestionTypeGR.update();
            }
        }
    }
    return;
})(current, previous);
