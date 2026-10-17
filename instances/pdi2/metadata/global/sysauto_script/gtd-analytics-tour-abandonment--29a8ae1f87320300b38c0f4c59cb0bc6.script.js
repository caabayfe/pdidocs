/* Updates the status of all tours which are in_transit for more than 10 minutes to abandoned*/
var analyticsTable = 'sys_guided_tour_analytics';
var thresholdInMinutes = 10;
var gr = new GlideRecord(analyticsTable);
gr.addQuery('last_status', '=', 'in_transit');
gr.addQuery('sys_updated_on', '<=', gs.minutesAgo(thresholdInMinutes));
gr.query();
while(gr.next()) {
   gr.last_status = 'abandoned';
	gr.reason = 'unknown'; //Either user has closed window or navigated to a different domain
   gr.update();
}
