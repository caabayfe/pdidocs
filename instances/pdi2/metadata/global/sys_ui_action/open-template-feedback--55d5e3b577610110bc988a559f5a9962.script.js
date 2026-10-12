var templateFeedbackID = current.getValue('template_feedback');
if (GlideStringUtil.isEligibleSysID(templateFeedbackID))
	action.setRedirectURL("sc_wizard_feedback.do?sys_id=" + templateFeedbackID);

else {
	gs.addErrorMessage(gs.getMessage("No template feedback is attached to the wizard step"));
	action.setRedirectURL(current);
}
	
