var AttachmentSecurity = Class.create();
AttachmentSecurity.prototype = {
	initialize: function() {
	},

	canRead: function(current) {
		if (current.table_name.nil())
			return true;
		
		// If the attachment is from live feed,
		// grant it the read access
		if (current.table_name.indexOf("live_profile") > -1 || current.table_name.indexOf("live_group_profile") > -1)
			return true;

		// Remove Prefix
		var tableName = current.table_name + '';
		var fieldAttachment = false;
		if (tableName.startsWith("invisible."))
			tableName = tableName.substring(10);
		else if (tableName.startsWith("ZZ_YY")) {
			fieldAttachment = true;  // "Field Attachment" - parent record has a field that references this attachment.
			tableName = tableName.substring(5);
		}

		var parentRecord = new GlideRecord(tableName);

		parentRecord.setWorkflow(false);
		// If parent table does not exist, or parent sys_id not found,
		if (!parentRecord.isValid() || !parentRecord.get(current.table_sys_id)) {
			// If this attachment was created by this user,
			if (current.sys_created_by.equals(gs.getUserName())) {
				// User can add attachments to: a new record they are creating, but haven't submitted yet.
				// They need to be able to view attachments on the record they are creating.
				return true;
			}
			return false;
		}

		// Is there a parent field that references this attachment ID?
		if (fieldAttachment) {
			var attachmentId = current.sys_id + '';
			var parentElements = parentRecord.getElements();
			for (var i = 0; i < parentElements.size(); ++i) {
				var parentElement = parentElements.get(i);
				if (parentElement.getValue() == attachmentId) {
					// Make sure this user has access to this parent field.
					return parentElement.canRead();
				}
			}
		}

		// General attachment. Not associated with a field in parent. Just check for access to parent record.
		return parentRecord.canRead();
	},
	
	canWriteTarget: function(target_table, target_sys_id) {
		var gr = new GlideRecord(target_table);
		gr.setWorkflow(false);
		if (gr.get(target_sys_id))
			return gr.canWrite();
		else
			return true;
	},
	
	type: 'AttachmentSecurity'
};
