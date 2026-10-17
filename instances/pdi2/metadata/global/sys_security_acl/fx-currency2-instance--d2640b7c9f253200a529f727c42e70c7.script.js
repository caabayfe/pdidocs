	answer = getWriteAnswer();

	function getWriteAnswer() {
		var tableName = current.table;
		if (!tableName)
			return true;

		var fieldName = current.field;
		if (!fieldName)
			return true;

		var parentGR = new GlideRecord(tableName);
		if (!parentGR.isValid())
			return true;
		
		parentGR.setWorkflow(false);

		if (!parentGR.get(fieldName, current.sys_id))
			return false;

		var field = parentGR.getElement(fieldName);

		if (field == null)
			return false;

		return field.canWrite();
	}
