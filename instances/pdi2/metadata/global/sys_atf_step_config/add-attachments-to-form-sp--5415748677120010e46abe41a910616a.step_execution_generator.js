(function (step, stepResult, assertionObject) {
  assertionObject.executeStep = function(step, stepResult) {
	var MSG_NO_G_FORM = "FAILURE: A valid form must be open in order to upload an attachment";

	var translator = new GwtMessage();
	var msgMap = translator.getMessages([
		MSG_NO_G_FORM
	]);

	// Find g_form -- if no form is loaded fail immediately
	var g_form = g_ui_testing_util.getTestIFrameGForm();
	if (!g_form) {
		stepResult.success = false;
		stepResult.message = msgMap[MSG_NO_G_FORM];
		step.defer.reject();
		return;
	}
	step.portalPage = g_form.$rootScope.page.id;
	step.pageId = g_form.$rootScope.page.sys_id;

	// Get table name and sys_id information from g_form
	var table = g_form.getTableName();
	var targetID = g_form.getUniqueValue();
	if (!table && step.pageId == "9f12251147132100ba13a5554ee490f4")
	    table = "sc_cat_item";

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
			var testWindow = g_ui_testing_util.getTestIFrameWindow();
			if (step.portalPage != "form" || targetID == -1)
				addAttachmentNameToForm(answer.attachments, step.portalPage);
			stepResult.success = true;
			step.defer.resolve();
		} else {
			stepResult.success = false;
			step.defer.reject();
		}
	});

	function addAttachmentNameToForm(attachments, portalPage) {
		var testFrameDocument = jQuery("#testFrame").contents();
		var parentElement = testFrameDocument.find("sp-attachment-button").parent();
		var divEle = jQuery('<div></div>');
		var ulEle = jQuery('<ul class="list-group"></ul>');
		divEle.append(ulEle);
		for (var i = 0; i < attachments.length; i++) {
			var attachmentLink = '<a href="sys_attachment.do?sys_id=' + attachments[i].sys_id + '" style="margin-right:4px;"><img src="' + attachments[i].icon + '" alt="" />' + attachments[i].name + '</a>';
			var liEle = jQuery('<li class="list-group-item"></li>');
			liEle.append(attachmentLink);
			ulEle.append(liEle);
		}
		if (portalPage == "form")
			parentElement = testFrameDocument.find("sp-variable-layout").parent()[0];
		divEle.insertBefore(parentElement);
	}
  };
  assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
