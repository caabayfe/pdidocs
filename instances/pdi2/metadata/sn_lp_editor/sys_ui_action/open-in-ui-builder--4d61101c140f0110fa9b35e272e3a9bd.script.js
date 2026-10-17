
            function openUIB() {
	var applicability = g_form.getValue('applicability');
	var applicableRegistry = g_form.getValue('applicable_page');
	if (applicability === 'single')  {
		if (applicableRegistry.trim() !== '') {
			g_form.getReference('applicable_page', function(applicablePageGr) {
				if (applicablePageGr.admin_panel_table === 'sys_aw_master_config' && applicablePageGr.admin_panel !== '')
					g_navigation.openPopup(	'/now/build/workspaces/' + applicablePageGr.admin_panel + '/pages/' + g_form.getUniqueValue());					
				else 
					g_form.addErrorMessage(getMessage('Unable to determine associated workspace'));
			});
		} else {
			g_form.addErrorMessage(getMessage('Please select an applicable page to open in UI Builder'));
		}
	} else {
		var agentWorkspaceMasterConfig = '7b24ceae5304130084acddeeff7b12a3';
		g_navigation.openPopup(	'/now/build/workspaces/' + agentWorkspaceMasterConfig + '/pages/' + g_form.getUniqueValue());
	}
}
