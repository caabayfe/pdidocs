(function executeRule(current, previous /*null when async*/) {
    /**
     * when switching source_type or target_type to Scope, a client script hides the source/type field
     * but the field retains the data. this will ensure it is emptied, as we expect it to be when 
     * Scope is the selected source_type/target_type on RCA records.
     */

	if (current.getValue('source_type') == '5')
        current.setValue('source', 'NULL');

    if (current.getValue('target_type') == '3')
        current.setValue('target', 'NULL');

})(current, previous);
