(function executeRule(current, previous /*null when async*/) {

	// Check if table is empty or not valid
    if (current.table.nil() || !isValidTable(current.table)) {
        gs.addErrorMessage(gs.getMessage('You must select a valid table before saving.'));
        current.setAbortAction(true);
        return;
    }
    // Query to check if a record with the same table already exists
    var gr = new GlideRecord('em_impact_inclusion_class');
    gr.addQuery('table', current.table); // Check for duplicate class_name
    gr.addQuery('sys_id', '!=', current.getUniqueValue()); // Exclude the current record (for updates)
    gr.query();

    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('A record with this Table already exists.'));
        current.setAbortAction(true);
    }
})(current, previous);

function isValidTable(tableName) {
    var serviceAutoDescendants = new ServiceAutoDescendants();
	var descendantsJSON = serviceAutoDescendants.getServiceAutoDescendants();
	var descendantTables = JSON.parse(descendantsJSON);
    return descendantTables.indexOf(tableName.trim()) !== -1;
}
