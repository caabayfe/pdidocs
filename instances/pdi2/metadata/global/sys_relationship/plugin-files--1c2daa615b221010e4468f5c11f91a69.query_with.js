(function refineQuery(current, parent) {
	current.addQuery("plugin", parent.upgrade_file);
	current.addQuery("upgrade_history", parent.upgrade_history);
})(current, parent);
