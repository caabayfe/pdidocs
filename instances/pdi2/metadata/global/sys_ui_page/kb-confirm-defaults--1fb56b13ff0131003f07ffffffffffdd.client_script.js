function actionOK() {
	if ("$[JS,HTML:jvar_template]") {
		applyDefaultsAjaxCall("$[JS,HTML:jvar_template]" + '');
	}
	
	GlideModal.get().destroy();
}

function applyDefaultsAjaxCall(queryString) {
	var ga = new GlideAjax('KnowledgeTypeDefaultsAjax');
	ga.addParam('sysparm_name', 'getValues');
	ga.addParam('sysparm_query_string', queryString);
	var templateRecord = new TemplateRecord();
	ga.getXML(templateRecord._applyResponse.bind(templateRecord));
}
