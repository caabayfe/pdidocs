function append(currentUser) {
	return (function(list) {
		return !list ? currentUser : list + ',' + currentUser;
	});
}
function replace(currentUser, previousUser) {
	return (function(list) {
		return list.replace(previousUser, currentUser);
	});
}
function remove(previousUser) {
	return (function(list) {
		return list.replace(previousUser,'').replace(',,', ',').replace(/^,|,$/, '');
	});
}
function updateEntityResponsibleUsers(responsibilityRecord, listOperation) {
	var entityRecord = new GlideRecord(responsibilityRecord.table);
	if (!entityRecord.get(responsibilityRecord.entity)) {
		return;
	}
	if (!entityRecord.hasOwnProperty('responsible_users')) {
		return;
	}
	entityRecord.setWorkflow(false);
	entityRecord.responsible_users = listOperation(entityRecord.responsible_users);
	entityRecord.update();
}
(function executeRule(current, previous /*null when async*/) {
	switch (sys_action) {
		case 'insert':
			updateEntityResponsibleUsers(current, append(current.user));
			break;
		case 'update':
			updateEntityResponsibleUsers(current, replace(current.user, previous.user));
			break;
		case 'delete':
			updateEntityResponsibleUsers(current, remove(current.user));
			break;
	}
})(current, previous);
