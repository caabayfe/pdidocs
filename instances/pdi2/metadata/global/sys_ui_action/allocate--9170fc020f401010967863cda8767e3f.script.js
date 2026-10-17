/* global assetSetDomainParameters */
function allocateItem() {
	var DialogClass = (typeof GlideModal !== 'undefined') ? GlideModal : GlideDialogWindow;
	var dd = new DialogClass('pre_allocated_allocate');
	dd.setTitle(new GwtMessage().getMessage('Enter required information for {0}', g_form.getValue('display_name')));
	dd.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	dd.setPreference('sysparm_asset_tag', g_form.getValue('asset_tag'));
	dd.setPreference('sysparm_serial_number', g_form.getValue('serial_number'));
	dd.setPreference('sysparm_user', g_form.getValue('reserved_for'));
	dd.setPreference('sysparm_user_name', g_form.getReference('reserved_for').name);
	assetSetDomainParameters(dd);
	dd.setWidth(600);
	dd.render();
}
