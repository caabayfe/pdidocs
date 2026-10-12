(function() {
	var sysAttachmentRecord = new GlideRecord("sys_attachment");
	sysAttachmentRecord.addQuery("table_name", "ecc_agent_mib");
	sysAttachmentRecord.addQuery("table_sys_id", current.sys_id);
	sysAttachmentRecord.query();
	if (!sysAttachmentRecord.next()) {
		gs.addErrorMessage(gs.getMessage("Setting the Active flag to false because no MIB was attached"));
		current.active = false;
	}
})();
