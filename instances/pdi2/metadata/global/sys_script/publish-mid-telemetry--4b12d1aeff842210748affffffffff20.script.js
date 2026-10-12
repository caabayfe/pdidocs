(function executeRule(current, previous /*null when async*/) {

	gs.eventQueue('publish.midserver.metrics', current, current.getUniqueValue(), current.getDisplayValue('mid_server'));

})(current, previous);
