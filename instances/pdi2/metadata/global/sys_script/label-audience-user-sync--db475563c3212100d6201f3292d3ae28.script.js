syncUserListChanges();

function syncUserListChanges() {
	if (current.operation() == 'update' && !current.user_list.changes())
		return;
	
	var changesTo = current;
	var changesFrom = (typeof previous != undefined) ? previous : null;
	(new LabelUpdate()).syncUserListChanges(changesFrom, changesTo);
}
