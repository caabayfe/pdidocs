executeFix();

function executeFix() {
	activateAllTemplates();
	
	var mobileTemplates = [
		{id: '', htmlTemplateId: '366ddc93b7b3101038a12b04ae11a971'}, // PersonCard
		{id: '', htmlTemplateId: '4c50c908b733101038a12b04ae11a9f6'}, // CatalogCard
		{id: '', htmlTemplateId: 'c7114548b733101038a12b04ae11a94d'}  // QACard
	];
	
	for (var i in mobileTemplates) {
		// De-activate the new mobile template if there are customer updates to the
		// existing html templates
		if (hasUpdate(mobileTemplates[i].htmlTemplateId))
			deActivateTemplate(mobileTemplates[i].id);
	}
}

function activateAllTemplates() {
	var gr = new GlideRecord('sys_cs_adapter_card_template');
	gr.query();
	gr.setValue('active', true);
	gr.updateMultiple();
}

function hasUpdate(id) {
	var gr = new GlideRecord('sys_update_xml');
	gr.addQuery('name', 'sys_cs_adapter_card_template_' + id);
	gr.query();
	return gr.hasNext();
}

function deActivateTemplate(id) {
	var gr = new GlideRecord('sys_cs_adapter_card_template');
	gr.get(id);
	gr.setValue('active', false);
	gr.update();
}
