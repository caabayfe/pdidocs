newAttachmentUploaded();

function newAttachmentUploaded() {
	if (fileNameStr || parent.attachmentParentSysId) {
		if ('${JS:sysparm_error}' != '') {
                var commonErrorMessage = "${gs.getMessage('The MIME type, file extension, or file type could be invalid or unsupported. Please contact your administrator for assistance.')}";
			    alert(commonErrorMessage); //Fix for p2 security issue : DEF0659232
        }

		parent.clearAttachmentFields();

		var fileName = fileNameStr.split('///');
		var canDelete = canDeleteStr.split(',');
		var createdBy = createdByStr.split(',');
		var createdOn = createdOnStr.split(',');
		var contentType = contentTypeStr.split(',');
		var encryption = encryptionStr.split(',');
		var iconPath = iconPaths.split(',');

		var newAttachmentId = newAttachmentIdString.split(',');
		for (var i = 0; i < newAttachmentId.length; ++i) {
			if (fileName[i]) {
				parent.refreshAttachments(newAttachmentId[i], fileName[i], canDelete[i], createdBy[i],
										  createdOn[i], contentType[i], encryption[i], iconPath[i]);
			} else
				parent.refreshAttachments();
		}
	} else
		alert(missingAttachmentMsg); //PRB1292322
}

if (parent.renderAttachmentOutputMessages)
	parent.renderAttachmentOutputMessages($j("#output_messages"));
