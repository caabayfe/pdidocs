syncFields();

function syncFields() {
	if (current.operation() == 'insert') {
		// insert --> beware of default values
		if (current.global == true)
			current.viewable_by = 'everyone';
		else if (current.viewable_by == 'everyone')
			current.global = true;
	} else {
		// update --> when unchecking global, leave viewable_by alone if it was users and groups
		if (current.global.changes()) {
			if (current.global == true)
				current.viewable_by = 'everyone';
			else if (current.viewable_by == 'everyone')
				current.viewable_by = 'me';
		} else if (current.viewable_by.changes()) {
			if (current.viewable_by == 'everyone')
				current.global = true;
			else
				current.global = false;
		}
	}

	// now that viewable_by is in sync, check that it's legit
	if (current.viewable_by == 'everyone' && !gs.getUser().hasRole('global_tags_creator') &&
	!new VTBGlobalTags().checkCanCreateGlobalTag()) {
		gs.addErrorMessage(gs.getMessage('You do not have permission to share tags with everyone'));
		current.setAbortAction(true);
	}

	// users and groups lists are relevant only for 'groups and users' viewable_by type
	if (current.viewable_by != 'groups and users') {
		current.user_list.setValue('');
		current.group_list.setValue('');
	}
}
