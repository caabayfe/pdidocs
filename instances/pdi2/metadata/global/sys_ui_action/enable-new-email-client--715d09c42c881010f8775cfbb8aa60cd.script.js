function revertToModern() {
	if (typeof g_form == 'undefined' && typeof g_sysId == 'undefined') {
		jslog('Unable to determine workspace id');
		return;
	}

	var id = typeof g_sysId != 'undefined' ? g_sysId : g_form.getUniqueValue();

	var wcGa = new GlideAjax('WorkspaceEmailConfigHelper');
	wcGa.addParam('sysparm_name', 'toggleEmailClient');
	wcGa.addParam('sysparm_workspace_id', id);
	wcGa.addParam('sysparm_email_client_type', 'new');
	wcGa.getXML(processResult);

	/** Result Codes hints
	* SUCCESS: Email Client Changed
	* REJECTED: Email Client change reject because customer is not using OOB renderer.
	* INVALID: Invalid Update requested.
	* ERROR: Generic Error occured
	*/
	function processResult(response) {
		var resultJson = response.responseXML.documentElement.getAttribute('answer'),
			result;
		if (resultJson) {
			result = JSON.parse(resultJson);
			if (result.status == 'SUCCESS')
				setTimeout(function() {
					location.reload();
				});
			else
				g_form.addErrorMessage(result.message);
		}
	}
}
