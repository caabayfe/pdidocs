var emailConfigGr = cxs_App.getBusiness(current).getDuplicate();

if (emailConfigGr) {
	var tableConfig = emailConfigGr.cxs_table_config.getRefRecord();
	var tableConfigLink = "<a style='font-weight:bold' href='" + tableConfig.getLink(false) + "'>" + tableConfig.getValue("name") + "</a>";

	gs.addErrorMessage(gs.getMessage("There is already an email configuration for email notification {0} using table configuration {1}",
									["<span style='font-weight:bold'>" + current.sysevent_email_action.getDisplayValue() + "</span>",
									tableConfigLink]));
	current.setAbortAction(true);
}
