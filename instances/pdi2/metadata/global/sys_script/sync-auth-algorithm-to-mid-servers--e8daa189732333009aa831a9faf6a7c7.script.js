(function executeRule(current, previous /*null when async*/) {
	var credential = new GlideRecord('aws_credentials');
	credential.addQuery('auth_algorithm', previous.getUniqueValue());
	credential.query();
	
	if (credential.next()){
		var util = new MIDServerSystemCommandUtil();
		util.issueSystemCommandToAllMIDs('credentials_reload');
	}	
})(current, previous);
