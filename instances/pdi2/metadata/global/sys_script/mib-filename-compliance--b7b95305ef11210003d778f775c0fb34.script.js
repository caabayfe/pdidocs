(function() {
	var regex = new RegExp('[a-zA-Z][a-zA-Z0-9-_]*');
	var sysAttachmentRecord = new GlideRecord('sys_attachment');
	sysAttachmentRecord.addQuery('table_name', 'ecc_agent_mib');
	sysAttachmentRecord.addQuery("table_sys_id", current.sys_id);
	sysAttachmentRecord.query();
	
	while (sysAttachmentRecord.next()) {
		var name = '' + sysAttachmentRecord.file_name;
		var matches = name.match(regex);
		if (!matches) {
			gs.addErrorMessage(gs.getMessage('MID Server MIB filename compliance error'));
			current.active = false;
			continue;
		}
		
		var part = '' + matches[0];
		if (name == part)
			continue;
		
		//this should not happen but checking just in case
		if (part.length == 0) {
			gs.addErrorMessage(gs.getMessage('MID Server MIB filename compliance error'));
			current.active = false;
			continue;
		}
		
		sysAttachmentRecord.file_name = part;
		if (sysAttachmentRecord.update())
			gs.addInfoMessage(gs.getMessage('MID Server MIB filename updated'));
		else
			gs.addErrorMessage(gs.getMessage('MID Server MIB filename compliance error'));
	}
})();
