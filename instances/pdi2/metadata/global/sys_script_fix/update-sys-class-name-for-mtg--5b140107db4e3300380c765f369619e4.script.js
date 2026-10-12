(function() {
	if (pm.isZboot())
		return;
	var tableList = [
		"mtg_agenda_item",
		"mtg_attendee",
		"mtg_meeting",
		"mtg_runtime_state"
	];
	var SYS_CLASS_NAME = 'sys_class_name';

	//update Dictionary and set active to false
	tableList.forEach(function(parentTableName) {
		if (!gs.tableExists(parentTableName) || !new GlideRecord(parentTableName).isValidField(SYS_CLASS_NAME))
			return;

		var tableExtensions = GlideDBObjectManager.get().getTableExtensions(parentTableName);

		for (var i = 0; i < tableExtensions.size(); i++) {
			var table = tableExtensions.get(i);
			var extendingTableGR = new GlideRecord(table);

			if (extendingTableGR.isValidField(SYS_CLASS_NAME)) {
				var tableDictionaryGR = new GlideRecord('sys_dictionary');
				tableDictionaryGR.addQuery('name', table);
				tableDictionaryGR.addQuery('element', SYS_CLASS_NAME);
				tableDictionaryGR.addActiveQuery();
				tableDictionaryGR.query();
				if (tableDictionaryGR.next()) {
					tableDictionaryGR.setValue('active', false);
					tableDictionaryGR.update();
				}
			}
		}
	});

	//update sys_class_name value
	tableList.forEach(function(parentTableName) {
		if (!gs.tableExists(parentTableName) || !new GlideRecord(parentTableName).isValidField(SYS_CLASS_NAME))
			return;

		var tableExtensions = GlideDBObjectManager.get().getAllExtensions(parentTableName);

		for (var i = tableExtensions.size() - 1; i > -1; i--) {
			var table = tableExtensions.get(i);
			if (!gs.tableExists(table))
				continue;

			var gmu = new GlideMultipleUpdate(table);
			gmu.addNullQuery(SYS_CLASS_NAME);
			gmu.setValue(SYS_CLASS_NAME, table);
			gmu.execute();
		}
	});

})();
