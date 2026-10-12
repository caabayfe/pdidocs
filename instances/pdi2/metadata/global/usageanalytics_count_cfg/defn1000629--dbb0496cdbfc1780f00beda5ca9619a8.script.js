answer = getMonthlyPredictionsCount();

function getMonthlyPredictionsCount() {
	var totalCount = 0;
	var previous_month = gs.beginningOfLastMonth().slice(0, 7);
	
	if(!hasRequiredTableAndColumns())
		return 0;
	
	var gr = new GlideRecord('ua_event_stat');
	gr.addQuery('event_id', 'ml.predictions');
	gr.addQuery('time_stamp', previous_month);
	gr.query();
	if (gr.next())
	   totalCount = gr.event_count;
	return totalCount;
}

function hasRequiredTableAndColumns() {
	return GlideTableDescriptor.isValid('ua_event_stat') && 
		GlideTableDescriptor.fieldExists('ua_event_stat', 'event_id') &&
		GlideTableDescriptor.fieldExists('ua_event_stat', 'time_stamp') &&
		GlideTableDescriptor.fieldExists('ua_event_stat', 'event_count');
}
