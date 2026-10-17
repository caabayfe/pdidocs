function onBefore(current, previous) {

	// we only need to to delete prefs if the field is being deactivated
	if (current.getValue("active") === "0" && !current.isActionAborted())
		flushTableListViewPreferences(previous.name);

	function flushTableListViewPreferences(table) {
		var ELEMN = 'sys_ui_list_element';
		var gr = new GlideRecord('sys_ui_list');
		gr.addNotNullQuery('sys_user');
		gr.addQuery('name', table);
		gr.query();
		try {
			while (gr.next()) {
				var elements = new GlideRecord(ELEMN);
				elements.addQuery('list_id', gr.sys_id);
				elements.query();
				// we just delete everything. could be optimized to delete only prefs with current column
				while (elements.next())
					elements.deleteRecord();
				gs.print('deleting list view user preference on table ' + table + 'for user: ' + gr.sys_user);
				gr.deleteRecord();
			}
		} catch (e) {
			gs.print(e);
		}
	}
}
