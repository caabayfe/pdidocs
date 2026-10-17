copyGuidance();
function copyGuidance() {
	var field;
	var existing = new GlideRecordSecure('help_guidance');
	existing.addQuery('sys_id',current.sys_id);
    existing.query();
	if(existing.next()){
		var copy = new GlideRecordSecure('help_guidance');
		for(field in existing)
			copy.setValue(field, existing.getValue(field));
		
		copy.active = 'true';
		copy.name = "Copy of " + existing.getValue("name");
		copy.snc_created = 'false';
		copy.status = 'draft';
		var id = copy.insert();
		if(id)
			action.setRedirectURL(copy);
		else
			action.setRedirectURL(existing);
	}
}
