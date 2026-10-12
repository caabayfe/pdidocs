function transform(input) {
		
		function _parseInt(str) {
			var n = gs.nil(str) ? 0 : parseInt(str);
			return n ? n : 0;		
		}
		
		var now = new GlideDateTime();		
		
		// potentially useful functions to manipulate current date-time
		var days = _parseInt(input.days);
		if (days != 0)
			now.addDaysUTC(days);
		
		var months = _parseInt(input.months);
		if (months != 0)
			now.addMonthsUTC(months);
		
		var weeks = _parseInt(input.weeks);
		if (weeks != 0)
			now.addWeeksUTC(weeks);
		
		var years = _parseInt(input.years);
		if (years != 0)
			now.addYearsUTC(years);
		
		var seconds = _parseInt(input.seconds);
		if (seconds != 0)
			now.addSeconds(seconds);
		
		return {
			displayValue: now.getDisplayValue(),
			utcValue: now.getValue(),
			displayDate: now.getLocalDate().getDisplayValue(),
			utcDate: now.getDate().getValue(),		
			displayDayOfMonth: now.getDayOfMonthLocalTime(),
			utcDayOfMonth: now.getDayOfMonthUTC(),		
			displayMonth: now.getMonthLocalTime(),
			utcMonth: now.getMonthUTC(),				
			displayYear: now.getYearLocalTime(),
			utcYear: now.getYearUTC(),
			numericValue: now.getNumericValue(),
			dateFormat: gs.getSession().getDateFormat(),
			dateTimeFormat: gs.getSession().getDateTimeFormat()
		};
	}
