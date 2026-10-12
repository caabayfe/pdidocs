if(current.state == 2) {
	var cast = new GlideRecord('live_poll_cast');
	cast.addQuery('poll', current.sys_id);
	cast.query();
	var notify = [];
	while(cast.next()){
		notify.push(cast.profile.document);
	}
	gs.eventQueue('live_poll.closed', current, notify);
}
