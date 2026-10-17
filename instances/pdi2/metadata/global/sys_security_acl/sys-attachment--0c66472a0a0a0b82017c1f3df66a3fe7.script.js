answer = getAttachmentDeleteAnswer();

function getAttachmentDeleteAnswer() {
	var isMine = current.sys_created_by == gs.getUserName();
	if (current.table_name.nil())
		return isMine;
	
	var tableName = current.table_name;

	// Handle user_image fields
	if (tableName.startsWith("ZZ_YY")) {
		var rec = new GlideRecord(tableName.substring(5)); // strip user image prefix ZZ_YY
		if (!rec.isValid())
			return isMine;
		
		rec.setWorkflow(false);
		rec.addQuery("sys_id", current.table_sys_id); // avoid Warning on new record
		rec.query();
		if (!rec.next())
			return isMine;
		
		if (rec[current.file_name]) {
			return rec[current.file_name].canWrite(); // current.file_name is the user_image column name
		}

		// Loop through the record fields to find the field that matches the
		// sys_id of the current attachment, check canWrite() for that field.
		var recFields = rec.getFields();
		for (var i = 0; i < recFields.size(); i++) {
			var recField = recFields.get(i);
			if (recField.getValue() == current.getValue("sys_id")) {
				return recField.canWrite();
			}
		}

		// Didn't find correct field for some reason, return write value of parent row instead.
		return rec.canWrite();
	}

	// Remove prefixes
	if (tableName.startsWith("invisible."))
		tableName = tableName.substring(10);
	
	var parentRecord = new GlideRecord(tableName);
	if (!parentRecord.isValid())
		return isMine;
	
	parentRecord.setWorkflow(false);
	parentRecord.addQuery("sys_id", current.table_sys_id); // avoid Warning on new record
	parentRecord.query();
	if (!parentRecord._next())
		return isMine;
	
	// outgoing emails created by Email Client
	if (current.table_name == "sys_email" && parentRecord.weight == -1 && parentRecord.type == "send-ignored")
		return true;
	
	return parentRecord.canWrite();
}
