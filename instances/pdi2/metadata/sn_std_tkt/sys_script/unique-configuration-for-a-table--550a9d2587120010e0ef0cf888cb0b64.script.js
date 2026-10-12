(function executeRule(current, previous /*null when async*/ ) {

    if (current.isNewRecord() || current.table.changes() || current.sys_domain.changes() || current.active.changes()) {
        var gr = new GlideRecord('ticket_configuration');
        gr.addActiveQuery();
        gr.addQuery('table', current.table);
        gr.addQuery('sys_domain', current.sys_domain);
        gr.query();
        if (gr.next() && current.sys_id.toString() != gr.getUniqueValue()) {
            current.setAbortAction(true);
            var configTable = new GlideRecord('sys_db_object');
            configTable.get('name', current.table);
            gs.addErrorMessage(gs.getMessage("Active configuration already exists for '{0}' table", configTable.label));
        }
    }

})(current, previous);
