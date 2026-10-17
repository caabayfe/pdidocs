(function executeRule(current, previous /*null when async*/) {

	new SNC.MassEncryptionJob().deleteJob(current);

})(current, previous);
