current.insert();
_createErrCodeTaskMapping();

function _createErrCodeTaskMapping() {
	var errorCodeId = current.error_code + '';
		
	if (errorCodeId)
		_createErrcodeTaskRecord(errorCodeId, current.getUniqueValue());
	
}

function _createErrcodeTaskRecord(errCodeId, taskId) {
	var codeTaskGr = new GlideRecord("automation_error_code_task");
	codeTaskGr.initialize();
	codeTaskGr.setValue('code', errCodeId);
	codeTaskGr.setValue('code_task', taskId);
	codeTaskGr.insert();
}
