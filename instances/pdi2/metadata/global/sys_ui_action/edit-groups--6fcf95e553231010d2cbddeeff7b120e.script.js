function editGroups() {
	if (g_form.getValue('license_type') === '2') {
		var gdw = new GlideModal('glide_confirm_basic');
		
		gdw.setTitle(new GwtMessage().getMessage('Edit Groups'));
		gdw.setPreference('title', new GwtMessage().getMessage('Do you want to modify users for all Unrestricted User subscriptions sharing allocated users?'));
		gdw.setPreference('onPromptComplete',  editGroupsConfirm);
		gdw.setPreference('onPromptCancel', cancel);
		gdw.render();
	} else {
		this.editGroupsConfirm();
	}
}

function editGroupsConfirm() {
	var current_location = window.location;
	var url = new GlideURL('sys_m2m_template.do');
	
	url.addParam('sys_is_list', true);
	url.addParam('sys_is_related_list', true);
	url.addParam('sys_target', 'license_group_has_subscription');
	url.addParam('sysparm_collection', gel('sys_target').value);
	url.addParam('sysparm_collectionID', g_form.getUniqueValue());
	url.addParam('sysparm_collection_key', 'license');
	url.addParam('sysparm_collection_label', 'Groups');
	url.addParam('sysparm_collection_related_field', 'group');
	url.addParam('sysparm_collection_related_file', 'sys_user_group');
	url.addParam('sysparm_m2m_ref', 'license_group_has_subscription');
	url.addParam('sysparm_referring_url', current_location);

	window.location.href=url.getURL();		
}

function cancel() {
}
