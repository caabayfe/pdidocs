var fieldChange = (current.name.changes() || current.filter.changes());

var desiredStateUtil = new DesiredStateUtil;
var currentId = String(current.sys_id);
var clonedCondition = desiredStateUtil.clonedConditions(currentId);
for (var i = 0; i < clonedCondition.length; i++)
	fieldChange = fieldChange || clonedCondition[i].hasNext();

if (fieldChange) {
	var newRecordId = SNC.VersionControl.createNewVersion(current, false);  // do not move references to latest version
	(new VersionControlUtil).redirect('cert_template', newRecordId);
	desiredStateUtil.copyConditions(currentId, newRecordId, clonedCondition);
} else if(current.isValidRecord() && (current.operation() === 'insert'))
	SNC.VersionControl.createNewVersion(current, false);	// used by Clone UI action
