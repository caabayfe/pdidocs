(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sn_employee_definition');
    gr.addQuery("active", true);
    gr.addQuery("sys_id", "!=", current.getValue("sys_id"));
    gr.addQuery("sys_domain", current.getValue("sys_domain"));
    gr.addQuery("table", current.table);
    gr.query();

    if (gr.next()) {
        // If any active record with the same table in the same domain exists, block creation
        gs.addErrorMessage(gs.getMessage("There can only be one active employee definition with the same table. You must deactivate the existing employee definition before activating this one."));
        current.setAbortAction(true);
        return;
    }
})(current, previous);
