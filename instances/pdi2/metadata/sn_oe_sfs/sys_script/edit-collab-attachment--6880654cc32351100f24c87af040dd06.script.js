(function executeRule(current, previous /*null when async*/) {

	var curPayload = current.message_type == 'rich' ? JSON.parse(current.payload) : {};
	var prePayload = previous.message_type == 'rich' ? JSON.parse(previous.payload) : {};
	if (curPayload.uiType != 'MultiAttachmentsControl' && prePayload.uiType != 'MultiAttachmentsControl')
		return;

	var preAttachments = !prePayload.uiMetadata ? [] : prePayload.uiMetadata.attachments;
	var attachmentMap = {};
	for (index in preAttachments) {
		attachmentMap[preAttachments[index].sysId] = "delete";
	}

	var curAttachments = !curPayload.uiMetadata ? [] : curPayload.uiMetadata.attachments;
	for (index in curAttachments) {
		if (attachmentMap[curAttachments[index].sysId] == "delete")
			attachmentMap[curAttachments[index].sysId] = "keep";
		else 
			attachmentMap[curAttachments[index].sysId] = "insert";
	}

	var attachmentIdsToDelete = [];
	var attachmentIdsToAdd = [];

	for (var property in attachmentMap) {
		if (attachmentMap.hasOwnProperty(property)) {
			if (attachmentMap[property] == 'delete')
				attachmentIdsToDelete.push(property);
			else if (attachmentMap[property] == 'insert')
				attachmentIdsToAdd.push(property);
		}
	}

	var gr = new GlideRecord('sys_cs_collab_attachment');
	gr.addQuery('attachment_sys_id', 'IN', attachmentIdsToDelete.join());
	gr.setWorkflow(false);
	gr.deleteMultiple();

	for (index in curAttachments) {
		var attachment = curAttachments[index];
		if (attachmentIdsToAdd.indexOf(attachment.sysId) < 0)
			continue;

		var grNew = new GlideRecord('sys_cs_collab_attachment');
		grNew.setValue('table', attachment.tableName);
		grNew.setValue('document', attachment.tableSysId);
		grNew.setValue('file_name', attachment.fileName);
		grNew.setValue('attachment_sys_id', attachment.sysId);
		grNew.setWorkflow(false);
		grNew.insert();
	}

})(current, previous);
