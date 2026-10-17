var progressId = event.parm1;
var input = JSON.parse(event.parm2);
if (input && input.action) {
	var result = {};
	var util = new sn_cmdb_ws.CMDBAttestationUtil();
	result = util.performAttestationAction(
		input.taskSysId,
		input.sysIds,
		input.action,
		input.userComment,
		input.allRecordsSelected,
		input.currentAttestationStatus,
		input.excludedSysIds,
		progressId,
		input.query
	);
	var progressGr = new sn_cmdb_ws.CMDBWsProgressMonitorUtil().getProgressById(progressId);
	if (progressGr) {
		progressGr.setValue('result', JSON.stringify(result));
		progressGr.update();
	}
}
