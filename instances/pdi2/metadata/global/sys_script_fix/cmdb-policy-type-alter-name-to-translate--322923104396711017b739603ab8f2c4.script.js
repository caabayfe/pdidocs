(function () {
	if (pm.isZboot()) {
		gs.info('zbooting, not running cmdb_policy_type alter name to translate fix');
		return;
	}

	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'cmdb_policy_type');
	gr.addQuery('element', 'name');
	gr.addQuery('internal_type', 'string');
	gr.query();
	
	if(gr.next()) {
		new TranslationUtils().convert("cmdb_policy_type",["name"]);
		gs.info('cmdb_policy_type.name internal type changed to "translated_text"');
	}
})();
