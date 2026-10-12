function openWorkspaceTestAuthoring() {
		var testId = g_form.getValue("test");
		var order = g_form.getValue("order");
		var stepGR = new GlideRecord('sys_atf_step');
		stepGR.addQuery('test', testId);
		stepGR.addQuery('step_config', 'b74ae80243700210285ffa73cbb8f2d2');
		stepGR.addQuery('order', '<', order);
		stepGR.query();
		var lastWorkspaceUrl;
		while (stepGR.next()) {
			var variableGR = new GlideRecord('sys_variable_value');
			variableGR.addQuery('variable', '7ee8cdce43b00210285ffa73cbb8f2f9')
			variableGR.addQuery('document', 'sys_atf_step');
			variableGR.addQuery('document_key', stepGR.sys_id);
			variableGR.query();
			if (variableGR.next())
				lastWorkspaceUrl = variableGR.getValue('value');
		}

		if (lastWorkspaceUrl && lastWorkspaceUrl !== 'undefined') {
			var gurl = new GlideURL(lastWorkspaceUrl);
			var workspaceUrl = gurl.getRelativeURL();
			var escapedUrl = "/now/nav/ui/classic/params/target/%24atf_page_inspector.do%3Fsysparm_stack%3Dno%26sysparm_test%3D" + testId + "%26sysparm_step_order%3D" + order + "%26sysparm_replay_edit%3Dtrue";
			var fullUrl = escapedUrl + "%26sysparm_url%3D" + workspaceUrl.replaceAll("/", "%2F") + "%3Fatf%3Dtrue";
			window.open(fullUrl);
		}
	}
