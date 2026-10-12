
			var totalCompleted = 0;
var totalCompletedAfter = 0;
var gr = new GlideRecord("sn_critical_update");
gr.addEncodedQuery("up_active=true^up_update_status=acknowledged^sys_updated_onBETWEENjavascript:gs.beginningOfYesterday()@javascript:gs.endOfToday()");
gr.query();
while (gr.next()) {
    var duedate = new GlideDateTime(gr.up_due_date);
    totalCompleted++;
    if (gr.sys_updated_on > duedate) {
        totalCompletedAfter++;
    }
}
if(totalCompleted == 0) {
	answer = 0;
} else {
	answer = (totalCompletedAfter / totalCompleted) * 100;
}
