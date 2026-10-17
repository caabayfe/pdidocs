// Trigger a SystemCommand for MID Server to initiate a reload of Cloud Service Account data from the instance
var util = new MIDServerSystemCommandUtil();
util.issueSystemCommandToAllMIDs('service_account_reload', true, true);
