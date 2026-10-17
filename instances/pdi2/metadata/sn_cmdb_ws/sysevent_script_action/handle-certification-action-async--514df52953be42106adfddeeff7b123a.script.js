var progressId = event.parm1;
var input = JSON.parse(event.parm2);
if (input && input.action) {
	var result = {};
	var taskMgr = new sn_cmdb_ws.CMDBWsDMTaskManager();
	if (input.action == 'DM_CERTIFY_RECORDS' || input.action == 'DM_FAIL_RECORDS') {
		result = taskMgr._updateRecordCertificationStatus(input.action, input.taskId, input.selectionObject, input.certificationStatus, progressId);
	} else if (input.action == 'DM_CERTIFY_ATTRIBUTES' || input.action == 'DM_FAIL_ATTRIBUTES') {
		result = taskMgr._updateAttributeCertificationStatus(input.action, input.taskId, input.attributes, input.comment, input.selectionObject, input.certificationStatus, progressId);
	} else if (input.action == 'DM_SAVE_RECORDS_COMMENT') {
		result = taskMgr._updateRecordsComment(input.action, input.taskId, input.comment, input.selectionObject, progressId);
	} else if (input.action == 'DM_SAVE_ATTRIBUTES_COMMENT') {
		result = taskMgr._updateAttributesComment(input.action, input.taskId, input.attributes, input.comment, input.selectionObject, progressId);
	}
	var gr = new GlideRecord('sn_cmdb_ws_progress_monitor');
	if (gr.get(progressId)) {
		gr.setValue('result', JSON.stringify(result));
		gr.update();
	}
}
