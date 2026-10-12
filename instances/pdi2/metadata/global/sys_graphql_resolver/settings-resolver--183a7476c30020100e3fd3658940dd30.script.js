(function process(env) {
	
	var sysId = env.getArguments().sysId;
	
	function includes(str, value) {
		if (str.toLowerCase().indexOf(value) !== -1) {
			return true;
		}
		
		return false;
	}
	
	function getPanelIdFromExperienceId(id) {
		var gr = new GlideRecordSecure('sys_ux_page_registry');
		if (gr.get(id)) {
			return gr.getValue('admin_panel');
		}
		return false;		
	}
	
	function getApplicationType(id) {
		var gr = new GlideRecordSecure('sys_ux_page_registry');		
		if (gr.get(sysId)) {
			var mc = gr.getDisplayValue('root_macroponent');					
			if (includes(mc, 'portal')) {
				return 'portal';
			}			
			if (includes(mc, 'workspace')) {
				return 'workspace';
			}
		}
		return null;
	}
	
    return {
		panelSysId: getPanelIdFromExperienceId(sysId),
		applicationType: getApplicationType(sysId)
	};

})(env);
