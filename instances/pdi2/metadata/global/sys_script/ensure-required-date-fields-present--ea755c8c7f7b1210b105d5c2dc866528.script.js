(function executeRule(current, previous /*null when async*/) {
	var triggerType = current.getValue('run_type');
	var runMonth = current.getValue('run_month');
	var runWeekInMonth = current.getValue('run_weekinmonth');

	switch (triggerType) {
		case 'day_and_month_in_year':
			if (JSUtil.nil(runMonth)) {
				gs.addInfoMessage(sn_i18n.Message.getMessage("com.snc.automation", "'{field}' field cannot be empty. Contact your Servicenow admin to add this field.", {"field": current.getElement('run_month').getLabel()}));
				current.setAbortAction(true);
			}
			break;
		case 'week_in_month':
			if (JSUtil.nil(runWeekInMonth)) {
				gs.addInfoMessage(sn_i18n.Message.getMessage("com.snc.automation", "'{field}' field cannot be empty. Contact your Servicenow admin to add this field.", {"field": current.getElement('run_weekinmonth').getLabel()}));
				current.setAbortAction(true);
			}
			break;
		case 'day_week_month_year':
			var isPrevented = false;
			if (JSUtil.nil(runWeekInMonth)) {
				gs.addInfoMessage(sn_i18n.Message.getMessage("com.snc.automation", "'{field}' field cannot be empty. Contact your Servicenow admin to add this field.", {"field": current.getElement('run_weekinmonth').getLabel()}));
				isPrevented = true;
			}
			if (JSUtil.nil(runMonth)) {
				gs.addInfoMessage(sn_i18n.Message.getMessage("com.snc.automation", "'{field}' field cannot be empty. Contact your Servicenow admin to add this field.", {"field": current.getElement('run_month').getLabel()}));
				isPrevented = true;
			}
			if (isPrevented) {
				current.setAbortAction(true);
			}
			break;
	}
})(current, previous);
