var AlertCount = Class.create();
AlertCount.prototype = {
    initialize: function() {
    },
	alertCount: function() {
		// For performance
		var sw = new GlideStopWatch();

		// Date and time
		var today = new GlideDateTime();
		var date = gs.getProperty('date',"");
		if(date=="")
			today = today.getDate();
		else
			today = date;
		var start = new GlideDateTime(today + ' 00:00:00');
		var end = new GlideDateTime(today + ' 23:59:59');
		gs.log("Alert Count: Calculating number of events and alerts created from " + start + " to " + end);
		// Count daily events
		var eventRowCount = 0;
		var eventGra = new GlideAggregate("em_event");
		eventGra.addQuery('time_of_event', '>=' , start);
		eventGra.addQuery('time_of_event', '<=' , end);
		eventGra.addAggregate('COUNT');
		eventGra.query();   
		if (eventGra.next())
			eventRowCount = eventGra.getAggregate('COUNT');
		
		// Count daily alerts
		var alertRowCount = 0;
		var alertGra = new GlideAggregate("em_alert");
		alertGra.addQuery('is_group_alert',false);
		alertGra.addQuery('sys_created_on', '>=' , start);
		alertGra.addQuery('sys_created_on', '<=' , end);
		alertGra.addAggregate('COUNT');
		alertGra.query();   
		if (alertGra.next())
			alertRowCount = alertGra.getAggregate('COUNT');
		
		// Compression rate calculation
		var rate = 0;
		if (eventRowCount != 0){
			rate = ((1-(alertRowCount/eventRowCount))*100).toFixed(2);
			if (rate <= 0 || rate >= 100)
				rate = 0;
		}
		gs.log("AlertCount: Found " + eventRowCount + " events, and " + alertRowCount + " alerts, compression rate is " + rate);
		// Delete duplicate records
		var md = new GlideMultipleDelete("em_alert_count");
		md.addQuery('date','=',today);
		md.execute();

		// Populating the Alert Count table
		var gr = new GlideRecord("em_alert_count");
		gr.query();
		gr.initialize();
		gr.date_of_counting = today;
		gr.event_count = eventRowCount;
		gr.alert_count = alertRowCount;
		gr.compression_rate = rate;
		gr.insert();
		
		gs.log("AlertCount: Script finished in " + sw.getTime() + " milliseconds");
	}, 
    type: 'AlertCount'
};
