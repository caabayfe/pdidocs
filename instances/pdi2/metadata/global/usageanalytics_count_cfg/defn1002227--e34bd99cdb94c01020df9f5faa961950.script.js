var start = new GlideDateTime("1970-01-01 00:00:00");
var end;
var gr = new GlideRecord('notify_participant');
gr.setCategory("usage");
gr.addQuery('sys_created_onRELATIVEGE@dayofweek@ago@30');
gr.addNotNullQuery('duration');
gr.query();
var durationInMins = 0;
while (gr.next()) {
	end = new GlideDateTime(gr.duration);
	durationInMins += parseInt(gs.dateDiff(start, end, true));
}
answer = Math.round(durationInMins / 60);
