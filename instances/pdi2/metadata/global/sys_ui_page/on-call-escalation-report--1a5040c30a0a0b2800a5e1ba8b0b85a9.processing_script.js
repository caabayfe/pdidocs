v_on_call_handling();
function v_on_call_handling() {
	// Check for a group id - if we don't have one, we need to ask for one
	if ((typeof groups == 'undefined') || (!groups)) {
		gs.addErrorMessage(gs.getMessage("Please select at least one group for the report"));
		response.sendRedirect('ui_page.do?name=on_call_escalation_report');
		return;
	}

	var onCallRotation = new OnCallRotation();

	// Delete any existing records for the current user and populate the list
	onCallRotation.deleteExistingRecords();
	var dateTime = onCallRotation.populateOnCallList({groups: groups, startDate: start_date, showType: show_type_on_call_person});
	if (!dateTime)
		gs.addInfoMessage(gs.getMessage("Current On-call Notification Report"));
	else
		gs.addInfoMessage(gs.getMessage("On-call Notification Report for {0}", GlideStringUtil.escapeHTML(dateTime)));
	response.sendRedirect('v_on_call_list.do?sysparm_query=^ORDERBYcontact_at');
}
