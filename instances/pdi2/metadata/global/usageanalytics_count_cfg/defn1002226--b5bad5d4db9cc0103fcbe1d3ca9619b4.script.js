var totalDurationInMins = 0;
var gr = new GlideAggregate('notify_conference_call');
gr.setCategory("usage");
gr.addQuery('sys_created_onRELATIVEGE@dayofweek@ago@30');
gr.addNotNullQuery('duration');
gr.query();
while (gr.next()) {
	totalDurationInMins += new GlideDateTime(gr.duration).getNumericValue()/1000;
}
answer = Math.round(totalDurationInMins / 60);
