gs.include("AttachmentUtils");
(function executeRule(current, previous /*null when async*/) {
	
	var attachGr = new GlideRecord("sys_attachment");
	attachGr.addQuery("table_name", "ecc_agent_script_file");
	attachGr.addQuery("table_sys_id", current.getUniqueValue());
	attachGr.addQuery("file_name", current.name);
	attachGr.orderByDesc('sys_created_on');
	attachGr.setLimit(1);
	attachGr.query();
	
	if (attachGr.next()) {
		current.script_attachment = attachGr.getUniqueValue();
		current.checksum = new AttachmentUtils(attachGr.getUniqueValue()).getMD5ChecksumFromAttachment();
	} else {
		if (current.name != null && current.name != "") {
			gs.clearMessages();
			gs.addErrorMessage(gs.getMessage("'{0}' attachment is missing, please attach script file", current.name));
		current.setAbortAction(true);
		}
	}
})(current, previous);
