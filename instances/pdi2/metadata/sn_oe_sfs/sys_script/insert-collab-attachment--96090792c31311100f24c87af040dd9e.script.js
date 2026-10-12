(function executeRule(current, previous /*null when async*/) {

	var payload = JSON.parse(current.payload);
	if (payload.uiType != 'MultiAttachmentsControl')
		return;
	
	var attachments = payload.uiMetadata.attachments;
	for (index in attachments) {
		var attachment = attachments[index];
		var gr = new GlideRecord('sys_cs_collab_attachment');
		gr.setValue('table', attachment.tableName);
		gr.setValue('document', attachment.tableSysId);
		gr.setValue('file_name', attachment.fileName);
		gr.setValue('attachment_sys_id', attachment.sysId);
		gr.setWorkflow(false);
		gr.insert();
	}

})(current, previous);
