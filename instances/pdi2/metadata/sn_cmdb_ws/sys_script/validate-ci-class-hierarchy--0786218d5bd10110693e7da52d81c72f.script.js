(function executeRule(current, previous /*null when async*/ ) {

    var flag = false;
    var gr = new GlideRecord('sn_cmdb_ws_ms_class_metadata');
    gr.query();

    while (gr.next()) {
		
		// Skip the previous table.
		if (gr.getValue('table') == previous.table)
			continue;
		
        var au = new global.ArrayUtil();

        // Check if parent class already exists. For example, trying to add server when hardware exists.
        var table = new GlideTableHierarchy(gr.getValue('table'));
        var tables = table.getAllExtensions();
        if (au.indexOf(tables, current.table) >= 0)
            flag = true;

        // Check if child class already exists. For example, trying to add hardware when server exists.
        table = new GlideTableHierarchy(current.table);
        tables = table.getAllExtensions();
        if (au.indexOf(tables, gr.getValue('table')) >= 0)
            flag = true;

        if (flag) {
            gs.addErrorMessage(gs.getMessage("'{0}' from the same hierarchy already exists. Cannot add '{1}' within the same hierarchy!", 
				[GlideStringUtil.escapeHTML(gr.getValue('table')), GlideStringUtil.escapeHTML(current.table)]));
            current.setAbortAction(true);
			break;
        }
    }

})(current, previous);
