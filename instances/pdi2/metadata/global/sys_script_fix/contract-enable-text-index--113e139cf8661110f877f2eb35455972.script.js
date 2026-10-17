(function() {
	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'ast_contract');
	dictGr.addQuery('internal_type', 'collection');
	dictGr.addQuery('text_index', false);
	dictGr.query();
	if (dictGr.next()) {
		dictGr.setValue('text_index', true);
		dictGr.update();
		// Trigger event to generate index for existing data
		GlideTextIndexEvent().indexAll('ast_contract', '');
	}
}());
