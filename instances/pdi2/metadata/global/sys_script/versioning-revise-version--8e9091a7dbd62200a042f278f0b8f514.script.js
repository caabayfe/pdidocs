(function executeRule(current, previous /*null when async*/) {

	new KBVersioning().updateVersionSnapshot(current);

})(current, previous);
