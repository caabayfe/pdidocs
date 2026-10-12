(function executeRule(current, previous /*null when async*/) {

	//This br will run during insert or delete of any content
	new GuidedSetupUtilSNC().updateChecksumForRoot(current);

})(current, previous);
