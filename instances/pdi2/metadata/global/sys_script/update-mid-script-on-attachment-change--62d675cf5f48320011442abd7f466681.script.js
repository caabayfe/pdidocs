gs.include("AttachmentUtils");
(function executeRule(current, previous /*null when async*/) {
	var fileName = current.file_name;
	var tableSysId = current.getValue('table_sys_id');
	var sGr = new GlideRecord("ecc_agent_script_file");
	
	if (sGr.get(tableSysId)) {
		if (sGr.use_attachment && sGr.name == fileName) {
			sGr.setWorkflow(false);
			sGr.script_attachment = current.getUniqueValue();
			sGr.checksum = new AttachmentUtils(current.getUniqueValue()).getMD5ChecksumFromAttachment();
			sGr.update();
		}
	}
 })(current, previous);
