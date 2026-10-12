(function executeRule(current, previous /*null when async*/) {

	// we ignore non trivial changes in sys updated
	if (previous && current.operation() != 'delete') {
		var changed = false;
		for (var k in current) {
			if (k != 'read' && k != 'sys_mod_count' && k != 'sys_updated_on' && k != 'sys_updated_by' && current[k] != previous[k])
				changed = true;
		}
		if (!changed)
			return;
	}

	// we index only shared tags, and only based on the table indexing parameters
	var aisConfig = new sn_ais.AisUtil();
	if (aisConfig.isTableIndexable(current.table)) {
		var tagIndexLevel = aisConfig.getTableLevelAttribute(current.table, 'index_tags', 'none');
		var triggerIndex = false;

		if (tagIndexLevel == 'all_shared' || tagIndexLevel == 'everyone_only') {
			var viewableBy = null;

			var recentDeletion = gs.getSession().getClientData('glide.ais.recent.label.deletion');
			if (recentDeletion) {
				var parts = recentDeletion.split(',', 2);
				if (parts.length == 2 && parts[0] == current.label)
					viewableBy = parts[1];
			}

			if (!viewableBy) {
				var label = new GlideRecord('label');
				if (label.get(current.label))
					viewableBy = label.viewable_by;
			}

			if (tagIndexLevel == 'all_shared' && viewableBy != 'me')
				triggerIndex = true;
			else if (tagIndexLevel == 'everyone_only' && viewableBy == 'everyone')
				triggerIndex = true;

		}

		if (triggerIndex)
			new sn_ais.IndexEvent().indexRecord(current.table, current.table_key, 'tags');
	}

})(current, previous);
