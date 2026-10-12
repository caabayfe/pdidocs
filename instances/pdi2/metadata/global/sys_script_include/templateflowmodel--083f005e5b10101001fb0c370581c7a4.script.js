var TemplateFlowModel = Class.create();
TemplateFlowModel.prototype = {
	templateName: "",
	templateSysId: "",
	templateType: "",
	createsApp: false,
	
    initialize: function(/*GlideRecord for sys_app_template*/ current) {
		this.templateName = current.name;
		this.templateSysId = current.sys_id;
		this.templateType = current.type.sys_id;
		this.flow = current.flow;

		if (current.create_app) {
			this.subflowName = "Application Template";
			this.createsApp = true;
		} else {
			this.subflowName = "Object Template";
			this.createsApp = false;
		}
    },
	
	getTemplateName: function() {
		return this.templateName;
	},
	
	getTemplateSysId: function() {
		return this.templateSysId;
	},
	
	isAppTemplate: function() {
		return this.createsApp;
	},
	
	getFlowName: function() {
		var templateFlowName = String(this.subflowName + ' - ' + this.templateName + ' - ' + gs.nowNoTZ());
		
		return templateFlowName;
	},
	
	getTemplateType: function() {
		return this.templateType;
	},
	
	getTemplateTypeName: function() {
		var templateType = new GlideRecord('sys_app_template_type');
		if (templateType.get(this.templateType)) {
			return templateType.getValue('name');
		}
	},
	
	getFlow: function() {
		return this.flow;
	},
	
	hasFlow: function() {
		return !gs.nil(this.flow);
	},
	
	isComposedTemplate: function() {
		var composedTemplateTypeSysId = "085fc4a05b03101083f30f216581c74d";
		return this.templateType == composedTemplateTypeSysId;
	},
	
	isPayloadAndMapTemplate: function() {
		var payloadAndMapTemplateTypeSysId = "955f08a05b03101083f30f216581c740";
		return this.templateType == payloadAndMapTemplateTypeSysId;
	},
	
	isFlowTemplate: function() {
		var flowTemplateTypeSysId = "b8c9bf330f3030108c9c5019c4767eb6";
		return this.templateType == flowTemplateTypeSysId;
	},
	
	isNoOpComposedTemplate: function() {
		return this.isComposedTemplate() && !this.hasFlow() && !this.isAppTemplate();
	},

    type: 'TemplateFlowModel'
};
