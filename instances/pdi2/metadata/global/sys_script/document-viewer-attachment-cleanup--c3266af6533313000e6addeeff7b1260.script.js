(function executeRule(current, previous /*null when async*/) {

	var convertedAttachmentID = current.getValue("attachment_number");
	if(convertedAttachmentID && "" !== convertedAttachmentID) {
		var grConvertedAttachment = new GlideRecord("sys_attachment");
		grConvertedAttachment.addQuery('sys_id', convertedAttachmentID);
		grConvertedAttachment.query();
		if(grConvertedAttachment.next()) {
			grConvertedAttachment.deleteRecord();
		}
	}

})(current, previous);
