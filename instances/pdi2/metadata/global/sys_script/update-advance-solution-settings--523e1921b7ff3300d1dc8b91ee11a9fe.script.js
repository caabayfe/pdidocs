(function executeRule(current, previous /*null when async*/ ) {
    if (current.getValue("clustering_method") != previous.getValue("clustering_method")) {
        var clustering_params = ['999c201453733300d1dcddeeff7b1212'];
		for (var i =0; i< clustering_params.length; i++){
			addAdvanceSolutionSetting(clustering_params[i]);
		}
    }
	function addAdvanceSolutionSetting(solutionParamSysid) {
		var solParamSysidGr = new GlideRecord('ml_solution_parameters');
		if (solParamSysidGr.get(solutionParamSysid)) {
			var gr = new GlideRecord('ml_advanced_solution_settings');
			gr.initialize();
			gr.setValue('solution_parameters', solParamSysidGr.getValue('sys_id'));
			gr.setValue('ml_capability_definition', current.getUniqueValue());
			gr.setValue('user_inputs', solParamSysidGr.getValue('user_inputs'));
			gr.insert();
		}
	}
})(current, previous);
