getCount(); 

function getCount() {
	var gr = new GlideAggregate('sys_user_login_history');
	var startDate = score_start.getGlideObject().toString();
    var endDate = score_end.getGlideObject().toString();

	gr.addQuery('login_status', 'FAILURE');
	gr.addEncodedQuery("login_timeBETWEEN" + startDate + "@" + endDate, true);
	gr.addAggregate('COUNT');
	gr.query();
	
	if(gr.next())
		return gr.getAggregate('COUNT');
	return 0;
} 
