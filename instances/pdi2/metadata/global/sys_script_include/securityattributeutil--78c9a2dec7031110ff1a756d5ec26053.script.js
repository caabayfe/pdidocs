var SecurityAttributeUtil = Class.create();
SecurityAttributeUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	checkIfConditionExists: function() {
		var api = new SNC.SecurityAttributeAPI();
		var condition = this.getParameter('sysparm_attribute_condition');
		var includeLocal = this.getParameter('sysparm_include_local');
		// checks for security attributes in the same scope as the application whose condition string
		// matches the condition parameter
		return api.checkIfConditionExists(condition, includeLocal);
	},

	updateLocalSecurityAttribute: function() {
        var attributeId = this.getParameter('sysparm_attribute_id');
		var condition = this.getParameter('sysparm_attribute_condition');
		var gr = new GlideRecord('sys_security_attribute');
		var exists = gr.get(attributeId);
		if (exists) {
			gr.setValue('condition', condition);
			gr.update();
		}
    },

	deletePrevLocalAttribute: function() {
		var attributeId = this.getParameter('sysparm_attribute_id');
		var gr = new GlideRecord('sys_security_attribute');
		var exists = gr.get(attributeId);
		if (exists) {
			gr.setValue("active", false);
			gr.deleteRecord();
		}
	},

	createSecurityAttribute: function() {
		var label = this.getParameter('sysparm_label');
		var name = this.getParameter('sysparm_name0');
		var condition = this.getParameter('sysparm_condition');
		return this._createSecurityAttribute(label, name, condition);
	},

	updateOrCreateLocalSA: function() {
		var label = this.getParameter('sysparm_label');
		var name = this.getParameter('sysparm_name0');
		var condition = this.getParameter('sysparm_condition');

		var gr = this._getGRByLabelAndName(label, name);
		if (gr.next()) { //update
			gr.setValue('condition', condition);
			gr.update();
			return gr.getUniqueValue();
		} else { //create
			return this._createSecurityAttribute(label, name, condition);
		}
	},

	_getGRByLabelAndName: function(label, name) {
		var gr = new GlideRecord('sys_security_attribute');
		gr.addQuery('label', label);
		gr.addQuery('name', name);
		gr.query();
		return gr;
	},

	_createSecurityAttribute: function(label, name, condition) {
		var gr = new GlideRecord('sys_security_attribute');
		gr.initialize();
		gr.setValue('label', label);
		gr.setValue('name', name);
		gr.setValue('condition', condition);
		gr.setValue('is_localized', 'true');
		gr.setValue('type', 'compound');
		gr.setValue('description', 'Auto Created Attribute - ' + label);
		return gr.insert();
	},

    type: 'SecurityAttributeUtil'
});
