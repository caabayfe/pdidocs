if (!pm.isZboot()) {
	gs.info("Modifying hide_sp field to false for standard change record producer");
	var std_change = new GlideRecord('std_change_record_producer');
	var qc = std_change.addNullQuery('hide_sp');
	qc.addOrCondition('hide_sp', true);
	std_change.setValue('hide_sp', false);
	std_change.updateMultiple();
	gs.info("Updated hide_sp field to false for standard change record producer");

	gs.info("Remove override of the hide_sp field");
	var dictionaryGr = new GlideRecord('sys_dictionary_override');
	dictionaryGr.addQuery('element', 'hide_sp');
	dictionaryGr.addQuery('name', 'std_change_record_producer');
	dictionaryGr.query();

	if (dictionaryGr.next())
		dictionaryGr.deleteRecord();
}
