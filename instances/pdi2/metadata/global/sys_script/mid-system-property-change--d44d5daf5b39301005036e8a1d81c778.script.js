(function executeRule(current, previous /*null when async*/) {

	new MIDSystemPropertyChange().broadcast(current);

})(current, previous);
