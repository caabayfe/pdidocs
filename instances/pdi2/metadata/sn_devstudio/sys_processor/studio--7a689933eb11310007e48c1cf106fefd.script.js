(function() {

	getTree(g_request, g_processor);

	function getTree(g_request, g_processor) {
		var appId = g_request.getParameter("sysparm_transaction_scope");
		var projectInfo, projectTree, userModules, project;
		if(!appId) {
			projectInfo = {};
			projectTree = [];
			userModules = [];
		}
		else {
			projectInfo = getProjectInfo(appId);
			projectTree = ProjectNavigator.getProjectTree(appId);
			userModules = UserDefinedModules.getModules(appId);
		}

		project = {
			metadata : projectInfo,
			artifacts : projectTree,
			modules : userModules
		};
		
		CacheBuster.addNoCacheHeaders(g_response);
		g_processor.writeOutput("application/json", new global.JSON().encode(project));
	}
	
	function getProjectInfo(appId) {
		var isPublishable = false;
		var scopeGr = new GlideRecord('sys_scope');
		scopeGr.get(appId);
		var className = scopeGr.getRecordClassName();
	
		var gr = new GlideRecord(className);
		var record = gr.get("sys_id",appId);

		if (record && className == 'sys_app')
			isPublishable = true;

		if (record && className == 'sys_store_app')
			isPublishable = sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(appId);

		var name = gr.getValue('name') || '';
		var version = gr.getValue('version') || 'N/A';
		
		var hasLocalChanges = 
			typeof sn_vcs !== 'undefined' && 
			typeof sn_vcs.AppSourceControl !== 'undefined' &&
			sn_vcs.AppSourceControl.hasOutgoingChanges(appId);
		
		// Fixing legacy default version number
		if (version === '1.0') version = '1.0.0';

		return {
			appId : appId,
			name : name,
			version : version,
			publishable : isPublishable,
			hasLocalChanges : hasLocalChanges
		};
	}
})();
