(function() {
    if (pm.isZboot())
        return;
	
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'sys_hub_ui_element');
	gr.addQuery('element', 'label');
	gr.addQuery('internal_type', 'string');
	gr.query();
	
	if(gr.next()) {
		new TranslationUtils().convert("sys_hub_ui_element",["label"]);
		gs.info('sys_hub_ui_element.name internal type changed from "string" to "translated_text"');
	}
}());
