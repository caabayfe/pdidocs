validateRecord(current.parent, current.child);

function validateRecord(parent, child) {
	// check we don't have a loop

	if (parent == child) {
		gs.addErrorMessage(gs.getMessage('Component model is already in bundle hierarchy'));
		current.setAbortAction(true);
		return true;
	}

	var myChildsBundles = new GlideRecord('cmdb_m2m_model_component');
	myChildsBundles.addQuery('parent', child);
	myChildsBundles.query();
	while (myChildsBundles.next()) {
		if (validateRecord(parent, myChildsBundles.child))
			return true;
	}
	return false;
}
