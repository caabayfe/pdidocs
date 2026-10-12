(function executeRule(current, previous /*null when async*/) {

// If any duplicate sys_ui_macro exists, throw a warning
	var query = 'name=' + current.name + '^scoped_nameISEMPTY^media_type=' + current.media_type;
	var dupes = new GlideAggregate('sys_ui_macro');
	dupes.addAggregate('COUNT');
	dupes.addQuery('sys_id', '!=', current.getUniqueValue());
	dupes.addEncodedQuery(query);
	dupes.query();
	if (dupes.next() && dupes.getAggregate('COUNT') > 0) {
		gs.addErrorMessage(gs.getMessage('An existing UI Macro has the same name and media type, which can lead to unexpected behavior. <a href="/sys_ui_macro_list.do?sysparm_query={0}" target="_blank">Please review the duplicates, and rename as needed</a>.', [query]));
	}

})(current, previous);
