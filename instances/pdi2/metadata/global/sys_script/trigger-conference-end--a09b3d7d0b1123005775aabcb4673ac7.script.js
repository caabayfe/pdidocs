(function executeRule(current, previous /*null when async*/) {

	gs.eventQueue("notify.conference.end", current, undefined, undefined);

})(current, previous);
