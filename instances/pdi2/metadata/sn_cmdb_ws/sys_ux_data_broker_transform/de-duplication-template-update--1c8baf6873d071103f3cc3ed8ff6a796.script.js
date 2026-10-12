function transform(input) {
	var result = {};
	var templateId = input.templateSysId;
	var templateJson = input.templateJson;

	result = sn_cmdb.DuplicateTemplate.updateTemplate(templateId, templateJson);
	if(result) {
		var templateUtil = new DedupeTemplateUtil();
		var conditions = templateJson.conditions ? templateJson.conditions : "";
		var advanced = templateJson.advanced ? true : false;
		var script = templateJson.script ? templateJson.script : "";
		// if adavnced (use script) clear conditions
		if(advanced)
			conditions = '';
		templateUtil.addTemplateConditions(templateId,conditions);
		templateUtil.addTemplateScript(templateId, advanced, script);
	}

	if(templateJson.library) {
		var util = new DedupeTemplateLibraryUtil();
		var LibrayResult = util.addTemplateToLibrary(templateId,templateJson.library);
	}

	return result; 

}
