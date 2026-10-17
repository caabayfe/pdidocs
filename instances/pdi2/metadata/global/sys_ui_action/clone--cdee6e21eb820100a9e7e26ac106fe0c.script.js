cloneUtil();

function cloneUtil() {
	var desiredStateUtil = new DesiredStateUtil;
	var currentId = String(current.sys_id);
	var previous = new GlideRecord(current.getTableName());
	if (previous.get(currentId))
		gs.addInfoMessage(gs.getMessage('Cloned from {0}', previous.name));
	
	var clonedCondition = desiredStateUtil.clonedConditions(currentId);
	current.number = getNextObjNumberPadded(); //fixing non updating number on insert
	
	var newRecordId = current.insert();
	desiredStateUtil.copyConditions(currentId, newRecordId, clonedCondition);
	(new VersionControlUtil).redirect('cert_template', newRecordId);
}
