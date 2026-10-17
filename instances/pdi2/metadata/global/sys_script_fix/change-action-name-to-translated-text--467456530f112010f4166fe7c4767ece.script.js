(function() {
    if (pm.isZboot())
        return;
	
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'sys_hub_action_type_base');
	gr.addQuery('element', 'name');
	gr.addQuery('internal_type', 'string');
	gr.query();
	
	if(gr.next()) {
		new TranslationUtils().convert("sys_hub_action_type_base",["name"]);
		gs.info('sys_hub_action_type_base.name internal type changed to "translated_text"');
	}
}());
