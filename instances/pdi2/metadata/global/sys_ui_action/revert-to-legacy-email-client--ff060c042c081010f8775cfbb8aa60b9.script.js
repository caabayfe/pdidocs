function revertToLegacy() {
	// Confirmation diaglog	
	var cMessage = getMessage("Are you sure you would like to revert to the legacy email client? This change will affect all users. It is highly recommended that you test this change on a sub-prod instance before making this change in a production environment."),
		cTitle = getMessage("Confirmation"),
		okText = getMessage("OK"),
		cancelText = getMessage("Cancel"),
		okBtn = '<button class="btn btn-primary" role="button" data-action="save" type="button" onClick="g_form.switchToOldEmail()" id="ok_closemodal">'+ okText +'</button>',
		cancelBtn = '<button class="btn btn-default" role="button" data-action="discard"  data-dismiss="GlideModal" type="button">'+ cancelText +'</button>',
		cBody = '<div id="email_revert_modal" role="alertdialog" aria-labelledby="_title" aria-describedby="email_revert_modal_description"><p id="email_revert_modal_description">'+ cMessage +'</p><div class="modal-footer">'+ cancelBtn + okBtn +'</div></div>';

	var gm = new GlideModal();
	gm.setTitle(cTitle);
	gm.setPreference('focusTrap', true);
	gm.renderWithContent(cBody);

	//Putting the logic on g_form
	g_form.switchToOldEmail = function () {
		if (typeof g_form == 'undefined' && typeof g_sysId == 'undefined') {
			jslog('Unable to determine workspace id');
			return;
		}

		var id = typeof g_sysId != 'undefined' ? g_sysId : g_form.getUniqueValue();

		var wcGa = new GlideAjax('WorkspaceEmailConfigHelper');
		wcGa.addParam('sysparm_name', 'toggleEmailClient');
		wcGa.addParam('sysparm_workspace_id', id);
		wcGa.addParam('sysparm_email_client_type', 'old');
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
	};
}
