function testSetupRecord() {
	g_form.addInfoMessage(
		getMessage('Verifying keys in Query result script and Card metadata script responses. Do not navigate away from the page.')
	);

	function setupRecordTestResponse(response) {
		var answer = response.responseXML.documentElement.getAttribute('answer');
		if (!answer) {
			g_form.addErrorMessage(getMessage('Invalid setup id'));
			return;
		}

		var answerJSON = JSON.parse(answer);
		var message = getMessage('Testing completed with {0} error(s) and {1} warning(s)');
		g_form.addInfoMessage(formatMessage(message, [answerJSON.errors, answerJSON.warnings]));
	}

	var ga = new GlideAjax('sn_itam_recomm.ImportantActionAdminAJAXUtils');
	ga.addParam('sysparm_name', 'testSetupRecord');
	ga.addParam('sysparm_setup_id', g_form.getUniqueValue());
	ga.getXML(setupRecordTestResponse);
}
