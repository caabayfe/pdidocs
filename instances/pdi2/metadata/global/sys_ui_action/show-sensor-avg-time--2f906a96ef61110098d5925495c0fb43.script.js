showSensorAvg();

function showSensorAvg() {
    var statusID = current.sys_id;
	calculateAVG(statusID);
	var gr = new GlideRecord("discovery_metric");
	gr.query();
	gr.next();
	gs.log("name is " + gr.discovery_status);
	
    var url = 'discovery_metric_list.do?sysparm_query=discovery_status%3D';
    url += statusID;
    url += '^ip_address%3D';
    url += "Average";
	
	action.setRedirectURL(url);
}

function calculateAVG(statusId) {
	// Check to see if we have already calculated it...
	var gr = new GlideRecord("discovery_metric");
	gr.addQuery("discovery_status", statusId);
	gr.addQuery("ip_address", "Average");
	gr.query();    
	if (gr.next())
		return;
		
	var totalProcessTime = {};
	var totalQueueTime = {};
	var totalSQLCount = {};
	var totalCount = {};
	
	gr.initialize();
	gr.addQuery("discovery_status", statusId);
	gr.addQuery("ip_address", "!=", "Average");
	gr.query();
	while (gr.next()) {
		var context = gr.context;
		var identifier = gr.identifier;
		var processTime = gr.process_time;
		var queueTime = gr.queue_time;
		var sqlcount = gr.sql_count;
		var unique = context+":"+identifier;
	
		if (totalProcessTime[unique] === undefined) {
			totalProcessTime[unique] = 0;
			totalQueueTime[unique] = 0;
			totalSQLCount[unique] = 0;
		}
	
		totalProcessTime[unique] += parseInt(processTime);
		totalQueueTime[unique] += parseInt(queueTime);
		totalSQLCount[unique] += parseInt(sqlcount);
	
		if (totalCount[unique] === undefined)
			totalCount[unique] = 0;
	
		totalCount[unique]++;
	}
	
	var avgProcessTime = {}
	var avgQueueTime = {}
	var avgSqlCount = {}		
	for (var unique in totalProcessTime) {
		avgProcessTime[unique] = totalProcessTime[unique]/totalCount[unique];
		avgQueueTime[unique] = totalQueueTime[unique]/totalCount[unique];
		avgSqlCount[unique] = totalSQLCount[unique]/totalCount[unique];
	}
	
	for (var unique in avgProcessTime) {
		var parts = unique.split(":");
		var context = parts[0];
		var identifier = parts[1];
	  
		var gr = new GlideRecord("discovery_metric");
		gr.discovery_status = statusId;
		gr.ip_address = "Average"
	
		gr.context = context;
		gr.identifier = identifier;
		gr.process_time = avgProcessTime[unique];
		gr.queue_time = avgQueueTime[unique];
		gr.sql_count = avgSqlCount[unique];		
		gr.insert();
	}
}
