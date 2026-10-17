(function executeRule(current, previous /*null when async*/) {

	var monitorStateGr = new GlideRecord("em_monitor_state");
	monitorStateGr.addQuery("monitored_sysid", current.sys_id);
	monitorStateGr.deleteMultiple();

})(current, previous);
