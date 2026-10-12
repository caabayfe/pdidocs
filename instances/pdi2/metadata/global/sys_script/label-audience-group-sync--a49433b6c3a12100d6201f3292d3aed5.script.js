syncGroupListChanges();

function syncGroupListChanges() {
	if (current.operation() == 'update' && !current.group_list.changes())
		return;
	
	var changesTo = current;
	var changesFrom = (typeof previous != undefined) ? previous : null;
	(new LabelUpdate()).syncGroupListChanges(changesFrom, changesTo);
}
