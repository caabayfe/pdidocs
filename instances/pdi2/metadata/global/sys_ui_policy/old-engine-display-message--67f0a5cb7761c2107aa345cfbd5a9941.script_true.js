function onCondition() {
	if (getView() != "catch_all" && g_form.getEditableFields().length) {
		var message = getMessage("The all-new schedule engine is here! Click 'Migrate Now' to effortlessly transition and experience the latest improvements. Explore the full list of enhancement here:");
		var link = getMessage("LINK");
		g_form.addInfoMessage(message + " <a target='_blank' href='https://docs.servicenow.com/csh?topicname=oncall-schedule-engine.html&amp;version=latest'>"+link+"</a>");
	}
}
