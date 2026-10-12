(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sysevent_event_queue_map');
	var queue = current.queue == '' ? 'DEFAULT' : current.queue;
	gr.addQuery('event', current.event_name);
	gr.addQuery('queue',queue);
	gr.query();
	if(!gr.hasNext()){
		gr.setValue('event', current.event_name);
		gr.setValue('queue', queue);
		gr.insert();
	}

})(current, previous);
