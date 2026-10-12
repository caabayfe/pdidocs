copyHelpContent();
function copyHelpContent() {
    var existing = new GlideRecordSecure('sys_embedded_help_content');
	existing.addQuery('sys_id',current.sys_id);
    existing.query();
	if(existing.next()){
		var copy = new GlideRecordSecure('sys_embedded_help_content');
		copy.name = current.name;
		copy.page = current.page;
		copy.modifier = current.modifier;
		copy.product = current.product;
		copy.content = current.content;
		copy.version = current.version;
		copy.role = current.role;
		copy.role_order = current.role_order;
		copy.active = 'true';
		copy.snc_created = 'false';
		var id = copy.insert();
		if(id)
			action.setRedirectURL(copy);
		else
			action.setRedirectURL(existing);
	}
}
