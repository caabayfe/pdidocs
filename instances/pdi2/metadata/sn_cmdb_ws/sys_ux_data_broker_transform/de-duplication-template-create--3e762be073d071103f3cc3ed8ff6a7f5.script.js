function transform(input) {
	var result = {};
	var templateJson = input.templateJson;

	result = sn_cmdb.DuplicateTemplate.createTemplate(templateJson);
	if(result) {
		var templateUtil = new DedupeTemplateUtil();
		var conditions = templateJson.conditions ? templateJson.conditions : "";
		var advanced = templateJson.advanced ? true : false;
		var script = templateJson.script ? templateJson.script : "";
		// if adavnced (use script) clear conditions
		if(advanced)
			conditions = '';

		templateUtil.addTemplateConditions(result,conditions);
		templateUtil.addTemplateScript(result, advanced, script);
	}

	if(templateJson.library) {
		var util = new DedupeTemplateLibraryUtil();
		var LibrayResult = util.addTemplateToLibrary(result,templateJson.library);
	}
	return result; 
}
