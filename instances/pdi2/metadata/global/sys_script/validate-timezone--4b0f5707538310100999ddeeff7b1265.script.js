(function executeRule(current, previous /*null when async*/ ) {
	if (!validTimezone(current.getValue("table"), current.getValue("timezone_source_field"))) {
		gs.addErrorMessage(gs.getMessage("The Timezone source field selected is not a valid Timezone field"));
		current.setAbortAction(true);
	}
})(current, previous);

function validTimezone(taskTable, timezoneSourceField) {
	if (!taskTable || !timezoneSourceField)
		return false;

	var taskGr = new GlideRecord(taskTable);
	var tableName = taskGr.getElement(timezoneSourceField).getTableName() + "";
	var field = taskGr.getElement(timezoneSourceField).getED().getName() + "";

	if (!tableName || !field)
		return false;

	// Reference field to sys_user.time_zone
	if (tableName === "sys_user" && field === "time_zone")
		return true;

	var sysMetaTable = sys_meta[tableName];
	if (!sysMetaTable)
		return false;

	var sysMetaField = sys_meta[tableName][field];
	if (!sysMetaField)
		return false;

	var sysMetaFieldChoiceTable = sysMetaField["choice_table"];
	var sysMetaFieldChoiceField = sysMetaField["choice_field"];
	if (!sysMetaFieldChoiceTable || !sysMetaFieldChoiceField)
		return false;

	// Derived field to sys_user.time_zone
	if (sysMetaFieldChoiceTable === "sys_user" && sysMetaFieldChoiceField === "time_zone")
		return true;

	return false;
}
