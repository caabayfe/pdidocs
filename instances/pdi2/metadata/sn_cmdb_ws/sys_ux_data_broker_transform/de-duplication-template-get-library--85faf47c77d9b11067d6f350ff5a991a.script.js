function transform(input) {

	var templateId = input.templateSysId;
	var gr = new GlideRecord('reconcile_duplicate_template');
	gr.get(templateId);
	var library = gr.getValue('library');
	return {"library" : library};

}
