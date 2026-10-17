(function executeRule(current, previous /*null when async*/ ) {
    // Check if user has read access on table
    var gSecurityManager = new GlideSecurityManager();
    var grTable = new GlideRecord(current.table);
    if (!gSecurityManager.tableLevelACLAllow(grTable, "read")) {
        gs.addErrorMessage(gs.getMessage("You do not have access to read data from this table"));
        current.setAbortAction(true);
    }
    var isValidTable = new ProminAllowedTableList().getAllowedTableList([current.table]);
    if (gs.nil(isValidTable)) {
        gs.addErrorMessage(gs.getMessage("Please select a valid table."));
        current.setAbortAction(true);
    }
    // Primary entity should be audit-enabled
    if (gs.nil(current.parent_entity) && current.source_type == 'TABLE') {
        var grDictionary = new GlideRecord('sys_dictionary');
        grDictionary.addEncodedQuery('name=' + current.table + '^internal_type.label=Collection^audit=true');
        grDictionary.query();
        if (!grDictionary.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Please select an audit-enabled table"));
            current.setAbortAction(true);
        }
    }
})(current, previous);
