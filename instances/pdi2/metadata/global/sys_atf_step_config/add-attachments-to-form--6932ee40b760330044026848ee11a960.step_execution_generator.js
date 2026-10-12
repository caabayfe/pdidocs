(function (step, stepResult, assertionObject) {
  assertionObject.executeStep = function(step, stepResult) {
	var MSG_NO_G_FORM = "FAILURE: A valid form must be open in order to upload an attachment";

	var translator = new GwtMessage();
	var msgMap = translator.getMessages([
		MSG_NO_G_FORM
	]);

	// Find g_form -- if no form is loaded fail immediately
	var g_form = g_ui_testing_util.getFormWindow().g_form;
	if (!g_form) {
		stepResult.success = false;
		stepResult.message = msgMap[MSG_NO_G_FORM];
		step.defer.reject();
		return;
	}

	// Get table name and sys_id information from g_form
	var table = g_form.tableName;
	var targetID = g_form.getUniqueValue();

	// Make the AJAX call to copy the attachments over to the current record
	var ajax = new GlideAjax("TestExecutorAjax");
	ajax.addParam("sysparm_name", "uploadAttachments");
	ajax.addParam("sysparm_table", table);
	ajax.addParam("sysparm_target_id", targetID);
	ajax.getXML(function() {
		var answer = JSON.parse(ajax.getAnswer());

		// Regardless of success/failure an output message (already translated) is always specified in the result
		stepResult.message = answer.output;

		if (answer.success) {
			var testWindow = g_ui_testing_util.getFormWindow();

			// The page cannot be refreshed to display the new attachments as the user might end up losing data (e.g. from a "Set Field Values" step)
			// Instead the attachments are added to the form using the standard addAttachmentNameToForm API, which has the following signature:
			// addAttachmentNameToForm(sysid, name, hoverText, image, showRename, showView, showPopup)
			answer.attachments.forEach(function(attachment) {
				testWindow.addAttachmentNameToForm(attachment.sys_id, attachment.name, "", attachment.icon, "true", "true", "true");
			});

			stepResult.success = true;
			step.defer.resolve();
		} else {
			stepResult.success = false;
			step.defer.reject();
		}
	});
  };
  assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
