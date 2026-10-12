var feedbackID = current.getValue('feedback');
if (GlideStringUtil.isEligibleSysID(feedbackID))
	action.setRedirectURL("sc_wizard_feedback.do?sys_id=" + feedbackID);

else {
	gs.addErrorMessage(gs.getMessage("No feedback is attached to the wizard step"));
	action.setRedirectURL(current);
}
