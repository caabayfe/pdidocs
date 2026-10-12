(function executeRule(current, previous /*null when async*/) {
	if (current.getTableName() == "sys_email") {
		var emailLog = new GlideRecord("sys_email_diagnostic_info");
		emailLog.setValue("email_sys_id", current.getUniqueValue());
		emailLog.setValue("email_table_name", current.getTableName());
		emailLog.setValue("queued",  gs.nowGlideDateTime());
		emailLog.setValue("state", "queued");
		
		emailLog.insert();
	}
})(current, previous);
