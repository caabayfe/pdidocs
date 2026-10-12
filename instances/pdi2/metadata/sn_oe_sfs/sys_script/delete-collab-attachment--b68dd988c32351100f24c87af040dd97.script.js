(function executeRule(current, previous /*null when async*/) {

	var payload = JSON.parse(current.payload);
	if (payload.uiType != 'MultiAttachmentsControl')
		return;

	var attachments = payload.uiMetadata.attachments;
	var attachmentIds = [];
	for (index in attachments) {
		var attachment = attachments[index];
		attachmentIds.push(attachment.sysId);
	}

	var gr = new GlideRecord('sys_cs_collab_attachment');
	gr.addQuery('attachment_sys_id', 'IN', attachmentIds.join());
	gr.setWorkflow(false);
	gr.deleteMultiple();

})(current, previous);
