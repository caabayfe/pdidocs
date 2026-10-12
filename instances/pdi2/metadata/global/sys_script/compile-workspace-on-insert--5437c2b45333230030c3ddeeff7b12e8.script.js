(function executeRule(current, previous /*null when async*/) {
	var wcu = new WorkspaceCompilerUtils();
	var validation = wcu.runValidations(current);
	
	if (!validation.passes) {
		current.setAbortAction(validation.shouldAbort);
		gs.addInfoMessage(validation.message);
		return;
	}

	var compileData = makeWorkspaceMetadata(current);
	current.setValue('compiled_page', compileData.page);
	current.setValue('compiled_page_registry', compileData.registry);

	function makeWorkspaceMetadata(workspaceGr) {
		var canonicalPage = wcu.getCanonicalUxPage();
		if (gs.nil(canonicalPage)) {
			current.setAbortAction(true);
			gs.addInfoMessage('Required canonical sys_ux_page record was not found.');
			return;
		}
		var pageRegistryGr = createWorkspaceUxPageRegistry(canonicalPage, workspaceGr);
		var pageRegistryId = pageRegistryGr.getUniqueValue();
		var propArray = [
			{ pageProp: 'ws_active_notification', type: 'boolean', description: 'Include/exclude workspace notification', workspaceField: 'notifications_enabled' },
			{ pageProp: 'ws_active_search', type: 'boolean', description: 'Show/Hide search component in workspace header', workspaceField: 'search_enabled' },
			{ pageProp: 'ws_active_user_pref', type: 'boolean', description: 'Exclude/include user preferences in workspace chrome.', workspaceField: 'user_preference_controls_enabled' },
			{ pageProp: 'ws_navigation_mode', type: 'choicelist', description: 'Workspace level navigation mode', workspaceField: 'navigation_type' }
		];
		
		createPageProps(pageRegistryId, workspaceGr, propArray);

		return {
			page: canonicalPage,
			registry: pageRegistryId
		};
	}

	function createWorkspaceUxPageRegistry(canonicalPage, workspaceGr) {
		var wsUxPageRegGr = new GlideRecord('sys_ux_page_registry');
		wsUxPageRegGr.newRecord();
		wsUxPageRegGr.setValue('page', canonicalPage);
		wsUxPageRegGr.setValue('title', workspaceGr.getValue('name'));
		wsUxPageRegGr.setValue('path', wcu.makeWorkspaceUxPageUrl(workspaceGr.getValue('workspace_url')));
		wsUxPageRegGr.setValue('active', workspaceGr.getValue('active'));
		wsUxPageRegGr.setValue('admin_panel', current.getUniqueValue());
		wsUxPageRegGr.setValue('admin_panel_table', 'sys_aw_master_config');
		wsUxPageRegGr.insert();
		return wsUxPageRegGr;
	}

	function createPageProps(pageRegistryId, workspaceGr, mappings) {
		var pagePropGr;
		var mapping;
		var pagePropertyValue;

		for (var i = 0; i < mappings.length; i++) {
			mapping = mappings[i];
			pagePropertyValue = workspaceGr[mapping.workspaceField];
			
			if (mapping.type === 'boolean')
				pagePropertyValue = (!!pagePropertyValue) ? 'true' : 'false';
			pagePropGr = new GlideRecord('sys_ux_page_property');
			pagePropGr.newRecord();
			pagePropGr.setValue('name', mapping.pageProp);
			pagePropGr.setValue('value', pagePropertyValue);
			pagePropGr.setValue('type', mapping.type);
			pagePropGr.setValue('page', pageRegistryId);
			pagePropGr.setValue('description', mapping.description);
			if (mapping.type === 'choicelist')
				pagePropGr.setValue('choices', pagePropertyValue);
			pagePropGr.insert();
		}
	}

})(current, previous);
