(function() {
	var changedBy = current.changed_by.toString() || '';
	var arr = changedBy.split(',');
	var me = current.version.sys_created_by.toString();

	// Resolve to real user id.
	var meUser = GlideUser.getUser(me);
	if (meUser != null)
		me = meUser.getID();

	// Prepend me so I show up first in the list
	var newChangedBy = me;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == me)
			continue;
	
		newChangedBy += "," + arr[i];
	}

	current.changed_by = newChangedBy;
})();
