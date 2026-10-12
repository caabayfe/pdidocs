(function executeRule(current, previous /*null when async*/) {
	var renOpt = {
		"1 year": { "y": 1, "m": 0, "d": 0 },
		"2 years": { "y": 2, "m": 0, "d": 0 },
		"3 years": { "y": 3, "m": 0, "d": 0 }
	};

	//Check the value of the options field,
	var renLen = renOpt[current.renewal_options + ""];

	if (!renLen)
		return;

	var renStart = new GlideDate();
	renStart.setValue(current.ends);
	renStart.addDaysUTC(1);

	var renEnd = new GlideDate();
	renEnd.setValue(current.ends);
	if (renLen.y !== 0)
		renEnd.addYearsUTC(renLen.y);
	if (renLen.m !== 0)
		renEnd.addMonthsUTC(renLen.m);
	if (renLen.d !== 0)
		renEnd.addDaysUTC(renLen.d);

	current.renewal_date = renStart;
	current.renewal_end_date = renEnd;
})(current, previous);
