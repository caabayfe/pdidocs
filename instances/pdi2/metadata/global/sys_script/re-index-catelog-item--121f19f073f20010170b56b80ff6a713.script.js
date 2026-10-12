(function executeRule(current, previous /*null when async*/) {
	function getCorrectTableName(sysId) {
		var gr = new GlideRecord('sc_cat_item');
		return gr.get(sysId) ? (gr.getValue('sys_class_name') || 'sc_cat_item') : null;
	}

	var currentSysId = current.getValue("sc_cat_item");
	if (currentSysId) {
		var tableName = getCorrectTableName(currentSysId);
		if (tableName)
			new sn_ais.IndexEvent().indexRecord(tableName, currentSysId);
	}

	if (previous != null) {
		previousSysid = previous.getValue("sc_cat_item");
		if (previousSysid && previousSysid != currentSysId) {
			var prevTableName = getCorrectTableName(previousSysid);
			if (prevTableName)
				new sn_ais.IndexEvent().indexRecord(prevTableName, previousSysid);
		}
	}
})(current, previous);
