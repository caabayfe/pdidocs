(function executeRule(current, previous /*null when async*/) {
	var tables = current.tables.split(',');
	if (tables.length > 10) {
		gs.addErrorMessage(gs.getMessage("Maximum number of tables allowed in an index group is 10"));
		current.setAbortAction(true);
	} else {
		var limit = parseInt(gs.getProperty("glide.ts.index.group.table.rows.limit"));
		for (var i = 0; i < tables.length; i++) {
			if (tables[i] == 'cmdb' || tables[i] == 'task') {
				gs.addErrorMessage(gs.getMessage("cmdb and task table cannot be added to an index group"));
				current.setAbortAction(true);
				return;
			}
			var grT = new GlideAggregate(tables[i]);
			grT.addAggregate('COUNT');
			grT.query();
			if (grT.next() && parseInt(grT.getAggregate('COUNT')) > limit) {
				gs.addErrorMessage(gs.getMessage("Table {0} has more than {1} number of rows and cannot be added to an index group", [tables[i], limit]));
				current.setAbortAction(true);
			}
		}
	}
})(current, previous);
