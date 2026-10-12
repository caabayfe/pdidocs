var MLPlatformUtils = Class.create();
MLPlatformUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getCurrentTime:function() {
		var currentTime = new GlideDateTime();
		return currentTime;
	},
	
	deactivateSolutionWithSameSolutionDefinition:function(){
		var solution = new GlideRecord('ml_solution');
		var sys_id = this.getParameter('sysparm_sys_id');
		solution.addQuery('solution_definition',sys_id);
		solution.addQuery('active', true);
		solution.query();
		
		var currentTime = this.getCurrentTime();
		while (solution.next()) {
			solution.setValue('active', false);
			solution.setValue('last_activated_date',currentTime);
			solution.update();
		}
	},

	impersonateUser:function(userId) {
		var impUser = new GlideImpersonate();
		impUser.impersonate(userId);
		gs.info("Successfully impersonated user : " + userId);
	},

	getSolutionMLUC:function(solutionName) {
		var grCap = new GlideRecord("ml_capability_definition_base");
		grCap.get('solution_name', solutionName);
		if (grCap.getRowCount() != 0) {
			var capabilitySysId = grCap.getValue('sys_id');
			var grAdv = new GlideRecord("ml_advanced_solution_settings");
			grAdv.addEncodedQuery('ml_capability_definition=' + capabilitySysId + '^solution_parameters.key=mluc');
			grAdv.query();
			if (grAdv.next()) {
				return {'mluc': grAdv.getValue('user_inputs')};
			}
		}
		return null;
	},

	type: 'MLPlatformUtils'
});
