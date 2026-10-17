var table = 'cmn_schedule_condition';
var column = 'applies_to';

var dictionaryRecord = new GlideRecord('sys_dictionary');
dictionaryRecord.addQuery('name', table);
dictionaryRecord.addQuery('element', column);
dictionaryRecord.query();
if (dictionaryRecord.next()) {
	var attributes = new GlideAttributes(dictionaryRecord.getValue('attributes'));
	var baseTableAttr = attributes.getAttribute('base_table');
	// if keeps the default base_table (not overwritten by the customer), we set the script to retrieve tables choices including Change Request tables
	if (baseTableAttr == 'cmdb_ci') {
		gs.debug('Modifying applies_to Schedule Conditions dictionary entry to enable Change Request choice');
		SNC.DictionaryAttribute.remove(table, column, 'base_table');
		SNC.DictionaryAttribute.set(table, column, 'tableChoicesScript', 'ConditionScheduleAppliesToTables');
		SNC.DictionaryAttribute.set(table, column, 'show_table_names_on_label', 'true');
		SNC.DictionaryAttribute.set(table, column, 'includeNone', 'true');
	} else 
		gs.info('Change Requests choice will not be enabled in applies_to in Schedule Conditions because dictionary entry is not using default cmdb_ci base table');
}
