(function executeRule(current, previous /*null when async*/) {

	// update fiscal cmn_schedule records
	var gr = new GlideRecord('cmn_schedule');
	gr.get(current.schedule);
	gr.is_legacy_schedule = false;
	var calName = getCalName(gr.name);
	
	gr.calendar_name = calName;
	gr.label = calName;
	gr.plural_label = calName + "s";
	gr.update();

	// update the fiscal_period records
	current.setDisplayValue('start', current.getDisplayValue('start_date_time'));
	current.setDisplayValue('end', current.getDisplayValue('end_date_time'));
	var gdt = new GlideDateTime(current.getValue('end'));
	current.setValue('end', gdt.getValue());
	current.calendar = current.schedule;

	var gr2 = new GlideRecord('business_calendar_span_name');
	var name = current.name;
	gr2.label = name;
	gr2.short_name = name;
	gr2.long_name = name;
	gr2.calendar = current.schedule;
	current.span_name = gr2.insert();

	// create filter entry records
	var year = [0, 1, -1];
	var quarter = [0, 1, -1, 4, -4];
	var month = [0, 1, -1, 3, -3, 12, -12];
	var period = [0, 1, -1, 3, -3, 13, -13];
	var gr3 = new GlideRecord('business_calendar_filter_option');
	gr3.addQuery('calendar', current.schedule);
	gr3.query();
	if (gr3.next()) {
		return;
	} else {
		var x = 0;
		var type = current.fiscal_type;
		switch (type.toString()) {
			case "year":
				updateFilterOptions(year, gr3, current.schedule);
				break;
			case "month":
				updateFilterOptions(month, gr3, current.schedule);
				break;
			case "period":
			case "quadweek":
			case "445period":
				updateFilterOptions(period, gr3, current.schedule);
				break;
			case "quarter":
			case "445quarter":
				updateFilterOptions(quarter, gr3, current.schedule);
				break;
			default:
				break;
		}
	}

	// add fiscal to Incident
	var gr4 = new GlideRecord('sys_package');
	gr4.addQuery('name', 'Incident');
	gr4.query();
	if (gr4.next()) {
		var gr5 = new GlideRecord('calendars_for_package');
		gr5.addQuery('calendar', current.schedule);
		gr5.query();
		if (gr5.next()) {
			return;
		} else {
			gr5.calendar = current.schedule;
			gr5.sys_package = gr4.getUniqueValue();
			gr5.insert();
		}
	}

})(current, previous);

function updateFilterOptions(arr, gr, schedule) {
	arr.forEach(function(element) {
		gr.calendar = schedule;
		gr.period = element;
		gr.insert();
	});
}

function getCalName(calName) {
	if (calName == "Fiscal QuadWeek" || calName == "Fiscal 445Period")
		calName = "Fiscal period";
	else if (calName == "Fiscal 445Quarter")
		calName = "Fiscal quarter";

	return calName;
}
