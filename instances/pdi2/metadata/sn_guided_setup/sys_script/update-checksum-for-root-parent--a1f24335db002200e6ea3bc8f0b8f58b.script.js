(function executeRule(current, previous /*null when async*/) {

	//This br will run when the parent of any content is updated and will not run during insert and delete
	new GuidedSetupUtilSNC().updateChecksumForRoot(current);

})(current, previous);
