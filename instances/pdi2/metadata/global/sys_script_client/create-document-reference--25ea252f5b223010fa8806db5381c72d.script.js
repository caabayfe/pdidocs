function onSubmit() {
    //Type appropriate comment here, and begin script below
	if (g_scratchpad._ajaxChecked) {
		// We have run our Ajax Checks, so we can continue on
		// and let our form submission continue
		g_scratchpad._ajaxChecked = null;
		return true;
	}
    var documentId = g_form.getValue('document');
    var sysparm_accesses_needed = 'write';
    var ga = new GlideAjax('DocumentObjectSecurityAjax');
    ga.addParam('sysparm_name', 'getDocumentAccess');
    ga.addParam('sysparm_accesses_needed', 'write');
    ga.addParam('sysparm_documentId', documentId);

    ga.getXMLAnswer(function(answer) {
		// g_form.addInfoMessage(answer); //JSON String
		var access = JSON.parse(answer);
		var canWrite = access.canWrite;
		if (!canWrite) {
			g_form.addErrorMessage("Do not have permission to create Document Reference for this document as the current user do not have write access.");
			return;
		}
		g_scratchpad._ajaxChecked = true;
		var actionName = g_form.getActionName();
		g_form.submit(actionName);
	});
	
	return false;
}
