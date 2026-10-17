(function executeRule(current, previous /*null when async*/ ) {

	if (!current.independent) {
		gs.addErrorMessage(gs.getMessage("Non CMDB table entry needs to be independent"));
        current.setAbortAction(true);
	}

    if (!current.applies_to) {
        gs.addErrorMessage(gs.getMessage("applies_to column cannot be empty or null"));
        current.setAbortAction(true);
    }
	// Only tables defined in the glide.identification_engine.non_cmdb_tables are allowed for global scope,
	// all non global scope tables are allowed by default
    if (getScope().toLowerCase() == 'global' && !isTableIncluded()) {
        gs.addErrorMessage(gs.getMessage("Only non CMDB tables defined in the system property glide.identification_engine.non_cmdb_tables are allowed for global scope"));
        current.setAbortAction(true);
    }

    function getScope() {
        var table = new GlideRecord("sys_db_object");
        table.addQuery('name', current.applies_to);
        table.query();
        var scope = '';
        if (table.next())
            scope = table.sys_scope;
        return scope;
    }

    function isTableIncluded() {
        var validTables = gs.getProperty("glide.identification_engine.non_cmdb_tables").toLowerCase().split(",").map(function(value) {
            return value.trim();
        });
        return validTables.indexOf(current.applies_to.toLowerCase().toString()) > -1;
    }

})(current, previous);
