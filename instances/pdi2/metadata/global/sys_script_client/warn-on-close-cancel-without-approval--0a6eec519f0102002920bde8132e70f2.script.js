function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === "")
		return;

	var messageId = "std_change_proposal:manual_field_change";
	var stateInProgress = "2";
	var stateClosed = "3";
	var stateCanceled = "4";

	if (oldValue === stateInProgress && (newValue === stateClosed || newValue === stateCanceled)) {
		var ga = new GlideAjax("StdChangeUtils");
		ga.addParam("sysparm_name", newValue === stateClosed ? "isProposalApproved" : "isProposalRejected");
		ga.addParam("sysparm_proposalSysId", g_form.getUniqueValue());
		ga.getXMLAnswer(function(isApprovedOrRejected) {
			// We only want to pop the message up if the state value has changed AND the record has not been approved/rejected. This means the state field was changed manually
			if (isApprovedOrRejected === "false")
				g_form.addErrorMessage(getMessage("An outstanding approval record exists. Please approve to publish this template or reject to cancel. If you continue to close without approval the template will not be published."), messageId);
		});
	}
}
