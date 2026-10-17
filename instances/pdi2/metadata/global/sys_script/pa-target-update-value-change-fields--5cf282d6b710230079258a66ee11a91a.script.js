(function executeRule(current, previous /*null when async*/) {

	var now = new GlideDateTime();
	var target = new GlideRecord('pa_targets');
	if (target.get(current.target)) {
		target.values_modified_at = now;
		target.update();
	}

	if (current.target.changes() && target.get(previous.target)) {
		target.values_modified_at = now;
		target.update();
	}
	
	// if insert, delete, or target_at modified
	if (!current || !previous || current.target_at != previous.target_at) {
		
		var targetId = current.target || previous.target;
		
		// introduce myself to the new neighbours
		if (current) {
			var newValues = new GlideRecord('pa_target_values');
			newValues.addQuery('target', targetId);
			newValues.addQuery('target_at', '<', current.target_at);
			newValues.orderByDesc('target_at');
			newValues.limit(1);
			newValues.query();

			if (newValues.next()) {
				newValues.setValue('next_target', current.target_at + '');
				newValues.update();
			}
			
			newValues.init();
			if (!newValues.get(current.sys_id)) {
				// this record should always exist
				return;
			}
			
			var currentNext = new GlideRecord('pa_target_values');
			currentNext.addQuery('target', targetId);
			currentNext.addQuery('target_at', '>', current.target_at);
			currentNext.orderBy('target_at');
			currentNext.limit(1);
			currentNext.query();
			
			// update my next to the following
			if (currentNext.next()) {
				newValues.setValue('next_target', currentNext.target_at + '');
				newValues.update();
			} else {
				newValues.setValue('next_target', '');
				newValues.update();
			}
			
		}
	
		// the old neighbour must make friends with whoever remains
		if (previous) {
			var oldValues = new GlideRecord('pa_target_values');
			oldValues.addQuery('target', targetId);
			oldValues.addQuery('target_at', '<', previous.target_at);
			oldValues.orderByDesc('target_at');
			oldValues.limit(1);
			oldValues.query();

			if (oldValues.next()) {
				var oldNext = new GlideRecord('pa_target_values');
				oldNext.addQuery('target', targetId);
				oldNext.addQuery('target_at', '>', oldValues.target_at);
				oldNext.orderBy('target_at');
				oldNext.limit(1);
				oldNext.query();
				
				if (oldNext.next()) {
					oldValues.setValue('next_target', oldNext.target_at + '');
					oldValues.update();
				} else {
					oldValues.setValue('next_target', '');
					oldValues.update();
				}
				
			}
		}
		
	}
	
	
	GlideCacheManager.flush('pa_targets');

})(current, previous);
