var TemplateIOValidator = Class.create();
TemplateIOValidator.prototype = {

	templateRecord: null,
	
    initialize: function(/*GlideRecord sys_app_template*/ record) {
		if (!this._isTemplateRecord(record)) {
			var errorMessage = gs.getMessage("Cannot validate Template Input Variables or Template Output Variables for the '{0}' record", [recordClassName]);
			throw new Error(errorMessage);
		}
		
		this.templateRecord = record;
    },
	
	hasMandatoryInputs: function() {
		var sysAppTemplateInputVar = new GlideRecord("sys_app_template_input_var");
		sysAppTemplateInputVar.addQuery("template", this.templateRecord.sys_id);
		sysAppTemplateInputVar.addActiveQuery();
		sysAppTemplateInputVar.query();
		
		return sysAppTemplateInputVar.hasNext();
	},
	
	hasMandatoryOutputs: function() {
		var sysAppTemplateOutputVar = new GlideRecord("sys_app_template_output_var");
		sysAppTemplateOutputVar.addQuery("template", this.templateRecord.sys_id);
		sysAppTemplateOutputVar.addActiveQuery();
		sysAppTemplateOutputVar.query();
		
		return sysAppTemplateOutputVar.hasNext();
	},
	
	validateMandatoryTemplateIOs: function () {
		var hasMandatoryInputs = this.hasMandatoryInputs();
		var hasMandatoryOutputs = this.hasMandatoryOutputs();
		
		if (!hasMandatoryInputs && !hasMandatoryOutputs) {
			throw new Error(gs.getMessage("The Template record is missing the following mandatory related records: Template Input Variables, Template Output Variables"));
		}
		
		if (hasMandatoryInputs && !hasMandatoryOutputs) {
			throw new Error(gs.getMessage("The Template record is missing the following mandatory related records: Template Output Variables"));
		}
		
		if (!hasMandatoryInputs && hasMandatoryOutputs) {
			throw new Error(gs.getMessage("The Template record is missing the following mandatory related records: Template Input Variables"));
		}
	},
	
	_isTemplateRecord: function(/*GlideRecord*/ record) {
		var recordClassName = record.sys_class_name;
		return recordClassName == "sys_app_template";
	},

    type: 'TemplateIOValidator'
};
