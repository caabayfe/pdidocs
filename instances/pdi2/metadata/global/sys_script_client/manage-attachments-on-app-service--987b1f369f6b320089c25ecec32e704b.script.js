function onLoad() {
    //for all views, listen on action to open platform dialog to add attachments
    //this event sent from directive.singleBusinessService
	var tableName = g_form.getTableName();
	CustomEvent.unAll("sa.saveAttachmentOnService");
	CustomEvent.observe("sa.saveAttachmentOnService", function(serviceId) {
		saveAttachment(tableName, serviceId);
	});
	
	//PRB1350497 the logic to detect form load/reload/abort was moved to directive.singleBusinessService.js
}
