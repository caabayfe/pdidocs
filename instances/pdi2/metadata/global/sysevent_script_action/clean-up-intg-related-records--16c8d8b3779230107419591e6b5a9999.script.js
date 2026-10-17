var tableName = event.parm1;
var recordId = event.parm2;

new global.IntegrationHubInstanceUtil()
	.deleteIntegrationRecordDetails(tableName, recordId);
