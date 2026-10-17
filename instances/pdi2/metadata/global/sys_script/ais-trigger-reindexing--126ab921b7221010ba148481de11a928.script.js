(function executeRule(current, previous /*null when async*/) {
	if (current.sys_id != previous.sys_id)
		return;

	var newAudience = current.viewable_by;
	var oldAudience = previous.viewable_by;
	var audienceChanged = (newAudience != oldAudience);
	var nameChanged = (current.name.tolowerCase() != previous.name.toLowerCase());

	if (current.operation() == 'delete') {
		gs.getSession().putClientData('glide.ais.recent.label.deletion', current.sys_id + ',' + newAudience);
		return;
	}

	if (!audienceChanged && !nameChanged)
		return;

	var triggerIndexAllShared = false;
	var triggerIndexEveryoneOnly = false;
	if (audienceChanged) {

		// only from private or to private require re-indexing
		if (newAudience == 'me' || oldAudience == 'me')
			triggerIndexAllShared = true;

		// only from or to everyone require re-indexing
		if (newAudience == 'everyone' || oldAudience == 'everyone')
			triggerIndexEveryoneOnly = true;
	}
	if (nameChanged) {
		// reindex all shared tags
		if (newAudience != 'me')
			triggerIndexAllShared = true;
		if (newAudience == 'everyone')
			triggerIndexEveryoneOnly = true;
	}

	new sn_ais.IndexEvent().indexLabelChange(current.sys_id, triggerIndexAllShared, triggerIndexEveryoneOnly);


})(current, previous);
