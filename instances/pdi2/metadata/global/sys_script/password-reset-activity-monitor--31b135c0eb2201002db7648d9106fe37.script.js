run();

function run() {
	// continue only for 'Max Failed Attempt Reached' lockout type
	if (current.type != 0) 
		return;
	
	// get all records from pwd_activity_monitor for given process and time interval
	var now = GlideDateTime();
	var processId = current.process;
	var monitor = GlideRecord('pwd_activity_monitor');
	monitor.addQuery('sys_created_on', '<=', now.getValue());
	monitor.addQuery('expiration', '>', now.getValue());
	monitor.addQuery('process', processId);
	monitor.orderByDesc('sys_created_on');
	monitor.query();
	
	// pick up latest created
	if (monitor.next()) {
		var cnt = monitor.getValue('counter');
		++cnt;
		monitor.setValue('counter', cnt);
		var threshold = GlideProperties.get('password_reset.activity_monitor.incident_threshold');
		threshold = parseInt(threshold);
		// create event
		if (cnt > threshold && monitor.getValue('event_created') == false) {
			createEvent(monitor);
			monitor.setValue('event_created', 'true');
		}
		monitor.update();
	} else { // there are no records whith in the time window, create new 
		addMonitorRecord(processId);
	}
}

function addMonitorRecord(processId) {
	var expiration = GlideDateTime();
	var window = GlideProperties.get('password_reset.activity_monitor.incident_window');
	window = parseInt(window);
	expiration.addSeconds(60 * window);
	var gr = new GlideRecord('pwd_activity_monitor');
	gr.initialize();
	gr.setValue('process', processId);
	gr.setValue('expiration', expiration.getValue());
	gr.insert();
}

function createEvent(currentRecord) {
	var eventName = 'pwd.activity_monitor.lockout_threshold';
	var gr = new GlideRecord('pwd_process');
	gr.get(currentRecord.getValue('process'));
	var param1 = gr.getValue('name');
	var param2 = gs.getUserName();
	gs.eventQueue(eventName, currentRecord, param1, param2);
}
