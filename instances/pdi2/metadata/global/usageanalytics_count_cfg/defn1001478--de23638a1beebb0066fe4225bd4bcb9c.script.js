answer = getExecTime();

function getExecTime() {
	var time_stamp = SNC.UsageAnalyticsScriptUtils.getAccrualTimeStamp('ua_count');
	var answer = -1;
	var gr = new GlideRecord('ua_service_stat');
	if(gr.isValid()){
		gr.addQuery('time_stamp', time_stamp);
		gr.addQuery('name', 'UsageAnalytics Count Persistor Daily');
		gr.query();
		if(gr.next()){
			answer = gr.getValue('execution_time');
		}
	}
	return answer;
}
