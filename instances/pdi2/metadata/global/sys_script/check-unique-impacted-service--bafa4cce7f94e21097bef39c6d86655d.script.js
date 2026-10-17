(function executeRule(current, previous /*null when async*/) {

    // Query to check if a record with the same service already exists
    var gr = new GlideRecord('em_impacted_service');
    gr.addQuery('service', current.service); // Check for duplicate class_name
    gr.addQuery('sys_id', '!=', current.getUniqueValue()); // Exclude the current record (for updates)
    gr.query();

    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('A record with this Service already exists.'));
        current.setAbortAction(true); // Prevent the insert/update
    }
})(current, previous);
