(function process(g_request, g_response, g_processor) {
	// derive required parameters
	var actionVerb = j2js(g_request.getParameter('sysparm_returned_action'));
	var srcTable = j2js(g_request.getParameter("srcTable"));
	var srcSysID = j2js(g_request.getParameter("srcSysID"));
	var srcField = j2js(g_request.getParameter("srcField"));
	var newSysID = j2js(g_request.getParameter("newSysID"));

	if (JSUtil.nil(actionVerb) || actionVerb === '' || 
		JSUtil.nil(srcTable) || srcTable === '' || 
		JSUtil.nil(srcSysID) || srcSysID === '' || 
		JSUtil.nil(srcField) || srcField === '' || 
		JSUtil.nil(newSysID) || newSysID === '') {
		gs.log('processor - Link Standard Change with Task - Required parameters missing');
	} else {
		var changeUtils = new ChangeUtils();
		var navigationUrl = "";
		if (!changeUtils.isVerbBack(actionVerb)) {
			// Update task's change record field
			var taskGr = new GlideRecord(srcTable);
			if (taskGr.get(srcSysID) && taskGr.canWrite()) {
				if (!taskGr.getValue(srcField)) {
					taskGr.setValue(srcField, newSysID);
					if (taskGr.update() === null)
						gs.addInfoMessage(gs.getMessage("Standard Change could not be created from {0}", taskGr.getDisplayValue()));
				}
			}
			navigationUrl = changeUtils.getRedirectUrlForChangeForm(actionVerb, newSysID);
		} else {
			// If platform back is hit on change record preview form, user should be taken to the service catalog page 
			var ses = gs.getSession();
			if (ses && !ses.getStack().isEmpty())
				navigationUrl = ses.getStack().pop();
			if (JSUtil.nil(navigationUrl))
				navigationUrl = 'home.do';
		}
		g_response.sendRedirect(navigationUrl);
	}
})(g_request, g_response, g_processor);
