(function() {
	data.i18n = {
		tabPanel: gs.getMessage('Tab panel for current Change {0}'),
		tabPanelDefault: gs.getMessage('Current Change tab panel'),
		showForm: gs.getMessage('Show form'),
		currentChangeTabsGroup: gs.getMessage('Current Change tabs group')
	};

	data.widget = {
		form: $sp.getWidget("cab-form-widget", {}),
		calendar: $sp.getWidget("cab-change-calendar", {})
	};

	data.meetingId = $sp.getParameter('sys_id'); // meeting id
})();
