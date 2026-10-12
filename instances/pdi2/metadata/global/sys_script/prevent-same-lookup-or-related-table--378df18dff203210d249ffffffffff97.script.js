(function executeRule(current, previous /*null when async*/ ) {

    if(current.identifier_table.nil() || current.class.nil()) {
        gs.addErrorMessage(gs.getMessage('Identifier Table / Lookup or Related item class is null or empty.'));
        current.setAbortAction(true);
        return;
    }
    var dupGR = new GlideRecord('cmdb_duplicate_lookup_related_allowed_class');
    dupGR.addQuery('identifier_table', current.identifier_table);
    dupGR.addQuery('class', current.class);
    dupGR.addQuery('sys_id', '!=', current.sys_id);
    dupGR.setLimit(1);

    dupGR.query();

    if (dupGR.hasNext()) {
        gs.addErrorMessage(gs.getMessage('A record with the same Identifier Table and Lookup or Related item class already exists.'));
        current.setAbortAction(true);
    }

})(current, previous);
