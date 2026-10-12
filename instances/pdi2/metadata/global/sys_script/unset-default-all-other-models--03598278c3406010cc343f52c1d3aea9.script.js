(function executeRule(current, previous /*null when async*/) {
	var chgModelGr = new GlideRecord("chg_model");
	chgModelGr.addQuery("sys_id", "!=", current.sys_id);
	chgModelGr.addQuery("default_change_model", "1");
	chgModelGr.addQuery("table_name", current.getValue("table_name"));
	chgModelGr.query();
	while (chgModelGr.next()) {
		chgModelGr.setValue("default_change_model", "0");
		chgModelGr.update();
	}
})(current, previous);
