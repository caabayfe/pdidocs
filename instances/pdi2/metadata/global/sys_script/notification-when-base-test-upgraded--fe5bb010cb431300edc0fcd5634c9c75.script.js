(function executeRule(current, previous /*null when async*/) {
	var uri = gs.action.getGlideURI().getFileFromPath();
	if ("sys_atf_test" != uri)
		return;
	
	var tableName = "sys_copied_base_upgrade_log_mapping";
	var table = new TableUtils(tableName);
	if (!table.tableExists())
		return;
	var gr = new GlideRecord("sys_copied_base_upgrade_log_mapping");
	gr.addQuery("copied_record_sys_id", current.sys_id);
	gr.orderByDesc("sys_created_on");
	gr.query();
	if (!gr.next())
		return;
	
	var upgradeHistory = gr.getValue("upgrade_history");
	if (!upgradeHistory)
		return;
	
	gr = new GlideRecord("sys_copied_base_upgrade_log_mapping");
	gr.addQuery("copied_record_sys_id", current.sys_id);
	gr.addQuery("upgrade_history", upgradeHistory);
	gr.orderByDesc("sys_created_on");
	gr.query();
	while(gr.next()) {
		var log = new GlideRecord("sys_upgrade_history_log");
		if (!log.get(gr.getValue("copied_record_upgrade_log")))
			continue;

		var resolution = log.getValue("resolution_status");
		if (resolution && resolution != "not_reviewed")
			continue;

		// skip if in update set
		var history = new GlideRecord("sys_upgrade_history");
		if (!history.get(upgradeHistory))
			continue;

		var updateSetHistory = history.getValue("update_set");
		if (updateSetHistory)
			continue;

		var disposition = log.getValue("disposition");
		if (["201","202","203"].indexOf(disposition) == -1)
			continue;

		var message = gs.getMessage("{0} <a {1}>Resolve the conflict here</a>", [log.getValue("comments"), "href="+log.getTableName()+".do?sys_id="+log.getUniqueValue()]);
		gs.addInfoMessage(message);
	}
	})(current, previous);
