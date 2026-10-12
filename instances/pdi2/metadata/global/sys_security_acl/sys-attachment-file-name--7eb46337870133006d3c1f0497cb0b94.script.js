answer = canEditFileName();

function canEditFileName() {
	var canEdit = current.getValue("sys_created_by") === gs.getUserName();
	var tableName = current.getValue("table_name");

	if (!tableName)
		return canEdit;

	// Field level file attachment table name starts with ZZ_YY.
	// Both field level file attachment and image attachment table name starts with ZZ_YY.
	if (tableName.startsWith("ZZ_YY"))
		tableName = tableName.substring(5);

	// Remove prefixes
	if (tableName.startsWith("invisible."))
		tableName = tableName.substring(10);

	var parentRecord = new GlideRecord(tableName);
	if (!parentRecord.isValid())
		return canEdit;

	if (parentRecord.get(current.getValue("table_sys_id")))
		return parentRecord.canWrite();

	return canEdit;
}
