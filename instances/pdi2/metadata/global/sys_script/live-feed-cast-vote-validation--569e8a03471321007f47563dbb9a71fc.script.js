var abort = false;

if(current.poll.state == "2") {
	var msg = gs.getMessage('The poll is already closed');
	gs.addInfoMessage(msg);
	abort = true;
}
if(!abort) {
	var poll = current.poll + '';
	poll = poll.substring(0,32);
	var gr = new GlideRecord('live_poll_cast');
	gr.addQuery('poll', poll);
	gr.addQuery('profile', new LiveFeedUtil().getSessionProfile());
	gr.query();

	if(gr.hasNext()) {
		var msg = gs.getMessage('You have already taken this poll');
		gs.addInfoMessage(msg);
		abort = true;
	}
}

if(abort)
	current.setAbortAction(true);
