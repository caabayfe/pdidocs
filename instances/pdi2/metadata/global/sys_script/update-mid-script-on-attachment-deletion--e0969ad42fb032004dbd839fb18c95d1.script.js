(function executeRule(current, previous /*null when async*/) {
	var fileName = current.file_name;
	var tableSysId = current.getValue("table_sys_id");
	var sGr = new GlideRecord("ecc_agent_script_file");
	
	if (sGr.get(tableSysId)) {
		if (sGr.use_attachment && sGr.script_attachment && sGr.script_attachment.sys_id == current.getUniqueValue()) {
			sGr.script_attachment = '';
			sGr.checksum = "";
			sGr.use_attachment = false;
			sGr.active = false;
			sGr.setWorkflow(false);
			sGr.update();
		}
	}
})(current, previous);
