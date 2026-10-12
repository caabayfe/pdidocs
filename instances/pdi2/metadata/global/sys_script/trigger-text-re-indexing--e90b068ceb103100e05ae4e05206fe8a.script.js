function onAfter(current, previous) {
	// we index only shared tags, and only based on the table indexing parameters
	var tsUtil = new GlideTSUtil();
	if (tsUtil.hasTextIndex(current.table)) {
		var tagIndexLevel = tsUtil.getTableLevelConfiguration(current.table, 'text_index_tags');
		var triggerIndex = false;
	
		if (tagIndexLevel == 'all_shared' || tagIndexLevel == 'everyone_only') {
			var label = new GlideRecord('label');
			if (label.get(current.label)) {
				if (tagIndexLevel == 'all_shared' && label.viewable_by != 'me')
					triggerIndex = true;
				else if (tagIndexLevel == 'everyone_only' && label.viewable_by == 'everyone')
					triggerIndex = true;
			}
		}
		
		if (triggerIndex)
			new GlideTextIndexEvent().update(current.table, current.table_key, 'tags');
	}
}
