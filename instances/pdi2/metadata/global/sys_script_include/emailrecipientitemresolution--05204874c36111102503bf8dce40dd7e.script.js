var EmailRecipientItemResolution = Class.create();
    EmailRecipientItemResolution.prototype = {
	/**
      This method will save the Recipient Item resolution and notifies platform about completion. 
	*/
	  updateResolvedRecipientItem: function(emailSysID, recipientItemSysID, recipientTable, result, errorMessage) {
		var recipientItemGr = new GlideRecord('sys_email_resolution_item');
		recipientItemGr.addQuery('email', emailSysID);
		recipientItemGr.addQuery('recipient_item_sys_id', recipientItemSysID);
		recipientItemGr.addQuery('recipient_table', recipientTable);
		recipientItemGr.query();
		if (recipientItemGr.next()){
			if(errorMessage != null && errorMessage.trim() != "") {
				recipientItemGr.setValue("error",errorMessage);
			} else {
				var sysAttachment = new GlideSysAttachment();
				var attachmentSysId = sysAttachment.write(recipientItemGr, "resolution.txt", "plain/text", result.join("\n"));
				recipientItemGr.setValue("resolution_attachment_id", attachmentSysId);
				recipientItemGr.setValue("size", result.length);
			}
			recipientItemGr.setValue("status","resolved");
			recipientItemGr.update();
			this._notifyRecipientItemResolved(emailSysID, recipientItemSysID);
	  	}
	  },
	
	_notifyRecipientItemResolved: function(emailSysID, recipientItemSysID){
		var params = {};
		params.emailSysID = emailSysID;
		params.recipientItemSysID = recipientItemSysID;
		var param1 = JSON.stringify(params);
		gs.eventQueue('recipient_item_resolution_complete', null, param1, "");
	},

    type: 'EmailRecipientItemResolution'
};
