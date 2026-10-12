var cpUtils = new global.CPIARUtils();
var slaRecordID = cpUtils.getIARSLARecord(current.getValue('target_table_name'));

answer = JSON.stringify({
	title: slaRecordID,
	description: gs.getMessage('Utilize Now Platform\'s Task SLA Engine to remind users to view recommendations scheduled intervals or, transfer to an agent for assistance after SLA expiry'),
    sla: current.getValue("use_sla")
});
