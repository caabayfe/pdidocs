(function executeQuery(v_table, v_query) {
	var fixedDecimalLength = 10;
	var query = "";
	//this remote table does not have a sys_id since it is an aggregated query
	//use job_classification instead
	if (v_query.isGet()) 
		query= "job_classification=" + v_query.getSysId();
	else 
		query = v_query.getEncodedQuery();

	var gr = new GlideAggregate("sys_scheduler_job_history");
	gr.addAggregate('SUM', 'count');
	gr.addAggregate('SUM', 'total');
	gr.addAggregate('MAX', 'max_duration');
	gr.addAggregate('MIN', 'time_range_start');
	gr.addAggregate('MAX', 'time_range_end');
	gr.addAggregate('SUM', 'total_lateness');
	gr.addEncodedQuery(query, true);
	gr.groupBy('job_classification');
	gr.groupBy('priority');
	gr.orderByAggregate('SUM', 'count');
	gr.query();

	while(gr.next()) {
		var count = gr.getAggregate('SUM', 'count');
		var total_processing = gr.getAggregate('SUM', 'total');
		var avg_processing_time = total_processing/count;
		var total_lateness = gr.getAggregate('SUM', 'total_lateness');
		var max_processing_time = gr.getAggregate('MAX', 'max_duration');

		v_table.addRow({
			"sys_id": gr.job_classification,
			"job_classification": gr.job_classification,
			'priority': gr.priority,
			'average_processing_time': parseFloat((avg_processing_time/1000).toFixed(fixedDecimalLength)),
			'max_processing_time': parseFloat((max_processing_time/1000).toFixed(fixedDecimalLength)),
			'total_processing_time': parseFloat((total_processing/1000).toFixed(fixedDecimalLength)),
			'total_lateness': total_lateness ? 
				parseFloat((total_lateness/1000).toFixed(fixedDecimalLength)) : 
				null,
			'average_lateness': total_lateness ? 
				parseFloat(((total_lateness/count)/1000).toFixed(fixedDecimalLength)) : 
				null,
			'execution_count': count,
			'time_range_start': gr.getAggregate('MIN', 'time_range_start'),
			'time_range_end': gr.getAggregate('MAX', 'time_range_end'),
		});	
	}
})(v_table, v_query);
