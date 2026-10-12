var calendarId = current.calendar_freq;
var record = new GlideRecord('pa_calendars_retention');
record.addQuery('business_calendar', calendarId);
record.setLimit(1);
record.query();
if (record.next()) {
	action.setRedirectURL(record);
	action.setReturnURL(current);
} else {
	// If we don't have periodicity defined , open the newRecord form
	action.setRedirectURL('pa_calendars_retention.do?sys_id=-1&sysparm_query=business_calendar='+calendarId);
	action.setReturnURL(current);
}
