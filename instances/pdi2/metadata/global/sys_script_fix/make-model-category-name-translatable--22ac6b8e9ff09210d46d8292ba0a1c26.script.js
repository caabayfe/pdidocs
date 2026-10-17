(function() {
	if (pm.isZboot()) { return; }

	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', 'cmdb_model_category');
	dictGr.addQuery('element', 'name');
	dictGr.addQuery('internal_type', 'string');
	dictGr.query();

	if (dictGr.next()) {
		// eslint-disable-next-line
    new TranslationUtils().convert("cmdb_model_category", ["name"]);
		gs.info('cmdb_model_category.name internal type changed to "translated_text"');
	}
}());
