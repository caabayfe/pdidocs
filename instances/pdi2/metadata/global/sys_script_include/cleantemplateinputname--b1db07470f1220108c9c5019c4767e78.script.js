var CleanTemplateInputName = Class.create();
CleanTemplateInputName.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'CleanTemplateInputName',
	createCleanName: function() {
		var label = this.getParameter("sysparm_label");
		var templateAPI = new sn_templates.TemplateScriptableAPI();
		var cleanVarName = templateAPI.generateCleanFlowVariableName(label);
		return cleanVarName;
	}
});
