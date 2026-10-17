(function executeRule(current, previous /*null when async*/) {
	
	/***
	* we would use g_scratchpad to render info messages 
	* related to business calendards, based on different conditions
	*/
	var calendar = current.calendar;
	var validFreq = current.frequency;
	if (calendar == 'standard' || calendar == '') {
		if (validFreq == '65' || validFreq == '85') {
			var fiscalMsg = gs.getMessage('Indicators can now be created using different Business calendars. If you use the calendars from the Fiscal calendar plugin, you will be able to generate more flexible fiscal periods.');
			g_scratchpad.fiscalInfoMessage = fiscalMsg;
		}
	} else {
		var bizCalFreq = current.calendar_freq;
		if (JSUtil.notNil(bizCalFreq)) {
			var forecastDefined = false;
			var record = new GlideRecord('pa_calendars_retention');
			record.addQuery('business_calendar', bizCalFreq);
			record.setLimit(1);
			record.query();
			if (record.next()) {
				if (parseInt(record.getValue('forecast_periodicity')) > 0)
					forecastDefined = true;
			}
			var forecastInfoMsg = gs.getMessage("This indicator uses a business calendar, but no periodicity is defined for this calendar. To achieve a more accurate forecast, please use the 'Configure periodicity' link.");
			if (!forecastDefined)
				g_scratchpad.forecastInfoMessage = forecastInfoMsg;
		}
	}
})(current, previous);
