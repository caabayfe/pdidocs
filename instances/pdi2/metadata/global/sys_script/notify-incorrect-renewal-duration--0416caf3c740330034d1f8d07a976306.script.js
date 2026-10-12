(function executeRule(current, previous /*null when async*/) {
	var renOpt = {
		"1 year": { "y": 1, "m": 0, "d": 0 },
		"2 years": { "y": 2, "m": 0, "d": 0 },
		"3 years": { "y": 3, "m": 0, "d": 0 }
	};

	var renLen = renOpt[current.renewal_options + ""];

	var endDate = new GlideDate();
	endDate.setValue(current.renewal_end_date);

	var compDate = new GlideDate();
	compDate.setValue(current.renewal_date);
	if (renLen.y !== 0)
		compDate.addYearsUTC(renLen.y);
	if (renLen.m !== 0)
		compDate.addMonthsUTC(renLen.m);
	if (renLen.d !== 0)
		compDate.addDaysUTC(renLen.d);

	compDate.addDaysUTC(-1); // Last day of the year, not same day next year.

	if (!endDate.equals(compDate))
		gs.addInfoMessage(gs.getMessage("The date range between the Renewal start date and Renewal end date do not match the selected option."));

})(current, previous);
