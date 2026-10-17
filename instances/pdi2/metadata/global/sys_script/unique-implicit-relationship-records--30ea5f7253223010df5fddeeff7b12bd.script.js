(function executeRule(current, previous /*null when async*/ ) {
    var fromTable = current.from_table;
    var filter = current.filter;
    var toTable = current.to_table;
    if ((fromTable != previous.from_table) || (filter != previous.filter) || (toTable != previous.to_table)) {
        var cmdbImplicitRelTypeRecord = new GlideRecord("nlq_cmdb_implicit_relationship");
        cmdbImplicitRelTypeRecord.addQuery("from_table", fromTable);
        cmdbImplicitRelTypeRecord.addQuery("filter", filter);
        cmdbImplicitRelTypeRecord.addQuery("to_table", toTable);
        cmdbImplicitRelTypeRecord.query();

        if (cmdbImplicitRelTypeRecord.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Cmdb Implicit relationship for the specified From table, Filters and To table already exist. Please update the existing record."));
            current.setAbortAction(true);
        }
    }

})(current, previous);
