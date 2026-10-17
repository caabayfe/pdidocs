var PrivacyPopulateParameterValues = Class.create();
PrivacyPopulateParameterValues.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	/*
	 * Populate parameter values entries for a parameterized technique
	 * @sysparm parameterizedTechnique dp_technique_with_params sys_id
	 * @sysparm techniqueId dp_technique sys_id
	 */
	populateValues: function() {
		var parameterizedTechniqueId = this.getParameter('sysparm_parameterizedTechniqueId');
		var techniqueId = this.getParameter('sysparm_techniqueId');
		return this.populateValuesUtil(parameterizedTechniqueId, techniqueId);
	},

	populateValuesUtil: function(parameterizedTechniqueId, techniqueId) {
		// Get list of technique parameters for the technique
		var gr = new GlideRecordSecure('dp_technique_parameter');
		gr.addQuery('technique', techniqueId);
		gr.query();
		while(gr.next()) {
			// For each technique parameter, check if its value has been set for this parameterized technique.
			// Create one with default in dp_technique_parameter_value if it's not been set.
			var techniqueParameterId = gr.getValue('sys_id');
			var parmValueGR = new GlideRecordSecure('dp_technique_parameter_value');
			parmValueGR.addQuery('parameterized_technique', parameterizedTechniqueId);
			parmValueGR.addQuery('technique_parameter', techniqueParameterId);
			parmValueGR.query();
			if (!parmValueGR.hasNext()) {
				// create new parameter value record
				parmValueGR.initialize();
				parmValueGR.setValue('parameterized_technique', parameterizedTechniqueId);
				parmValueGR.setValue('technique_parameter', techniqueParameterId);
				parmValueGR.setValue('value', gr.getValue('default_value'));
				parmValueGR.insert();
			}
		}
		// return a value to make it easy to test excute ACL for this script include
		return true;
	},
	
    type: 'PrivacyPopulateParameterValues'
});
