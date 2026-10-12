var ImageAttachmentValidator = Class.create();
ImageAttachmentValidator.prototype = {

    initialize: function(currentRecord, imageField, supportedTypes) {
		this.currentRecord = currentRecord;
		this.imageField = imageField;
		this.supportedTypes = supportedTypes;
    },
	
	validate: function() {
		var imageFieldValue = this.currentRecord.getValue(this.imageField);
		var table = "ZZ_YY" + this.currentRecord.getRecordClassName();
		var attachment = new GlideRecord("sys_attachment");

		if (!gs.nil(imageFieldValue))
			attachment.get(imageFieldValue);

		if (attachment.isValidRecord()) {
			if (!this.validateAttachment(attachment)) {
				this.currentRecord.setAbortAction(true);
				this.currentRecord.setValue(this.imageField, "NULL");
				return this.currentRecord;
			}
		}
			
		
		else {
			attachment.initialize();
			attachment.addQuery("table_name", table);
			attachment.addQuery("table_sys_id", this.currentRecord.getUniqueValue());
			attachment.addQuery("file_name", this.imageField);
			attachment.query();
			
			while (attachment.next()) {
				if (!this.validateAttachment(attachment)) {
					this.currentRecord.setAbortAction(true);
					this.currentRecord.setValue(this.imageField, "NULL");
					return this.currentRecord;
				}
			}
		}
		
		return this.currentRecord;
	},

	validateAttachment: function(attachment) {
		var contentTypeValidator = new global.ContentTypeValidator();
		if (!contentTypeValidator.isValidType(attachment, this.supportedTypes)) {
			
			// set the abort action & error message
			var errorMessage = gs.getMessage("The {0} must be one of the following content types: {1}", [this.imageField, this.supportedTypes.join(", ")]);
			gs.addErrorMessage(errorMessage);
			
			// then try to delete the attachment
			try {
				var gsa = new GlideSysAttachment();
				gsa.deleteAttachment(attachment.getUniqueValue());
			} catch (error) {
				gs.error("Unable to delete invalid attachment ({0})", attachment.getUniqueValue());
			}

			return false;
		}
		return true;
	},
	
	attachmentExists: function(tableRecordSysId, fileNameTableColumn) {
		var attachment = new GlideRecord("sys_attachment");
		attachment.addQuery("table_sys_id", tableRecordSysId);
		attachment.addQuery("file_name", fileNameTableColumn);
		attachment.query();
		return attachment.hasNext();
	},

    type: 'ImageAttachmentValidator'
};
