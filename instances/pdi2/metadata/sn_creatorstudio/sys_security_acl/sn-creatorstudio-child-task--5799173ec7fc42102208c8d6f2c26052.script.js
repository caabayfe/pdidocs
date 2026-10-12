if (current.parent) {
	var parent = current.parent.getRefRecord();
	answer = parent.isValidRecord() && parent.canRead();
}
