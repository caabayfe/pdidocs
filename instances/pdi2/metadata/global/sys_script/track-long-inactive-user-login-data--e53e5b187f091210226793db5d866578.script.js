(function executeRule(current, previous /*null when async*/) {
	new TrackLongInactiveUserLogin().trackUsers(current, previous);
})(current, previous);
