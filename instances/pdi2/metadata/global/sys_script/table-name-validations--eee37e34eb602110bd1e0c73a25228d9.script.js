(function executeRule(current, previous /*null when async*/ ) {
    var uniqueTableNameGR = new GlideRecord('iamsync_type');
    uniqueTableNameGR.addQuery('table_name', current.table_name);
    uniqueTableNameGR.addQuery('sys_id', '!=', current.getUniqueValue());
    uniqueTableNameGR.query();
    if (uniqueTableNameGR.getRowCount() > 0) {
        gs.addErrorMessage(gs.getMessage("Table Name '{0}' already exists.", current.table_name));
        current.setAbortAction(true);
    }
})(current, previous);
