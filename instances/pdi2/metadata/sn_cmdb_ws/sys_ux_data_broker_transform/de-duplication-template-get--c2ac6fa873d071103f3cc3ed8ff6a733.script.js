function transform(input) {
	var result = {};
	if(!input.templateSysId || input.templateSysId == ''){
		return {};
	}

	if(input.templateSysId == 'new'){
		// get default values
		var defaultRecord = new GlideRecord("reconcile_duplicate_template");
		defaultRecord.newRecord();
		return {
			"script" : defaultRecord.getValue('script')
		};
		
	}


	var templateId = input.templateSysId;
    
	result = sn_cmdb.DuplicateTemplate.getTemplate(templateId);

	if(result) {
		var templateUtil = new DedupeTemplateUtil();
		result.conditions = templateUtil.getTemplateConditions(templateId);
		
		var scriptInfo = templateUtil.getTemplateScript(templateId);
		result.advanced = false;
		if(scriptInfo.advanced == '1')
			result.advanced = true;
		result.script = scriptInfo.script;

	}

	var gr = new GlideRecord('reconcile_duplicate_template');
	gr.get(templateId);
	var library = gr.getValue('library');
	result.library = library;



	return result; 
}
