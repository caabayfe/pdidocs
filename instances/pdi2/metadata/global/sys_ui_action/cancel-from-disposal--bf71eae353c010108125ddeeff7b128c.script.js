function openCancelFromDisposal() {
	var stockroom = '';
	if (g_form.getValue('install_status') === '6') {
		stockroom = g_form.getValue('stockroom');
	}
	var dialogClass = (typeof GlideModal !== 'undefined') ? GlideModal : GlideDialogWindow;
	// eslint-disable-next-line new-cap
	var cd = new dialogClass('alm_consumable_cancel_from_disposal');
	cd.setTitle(new GwtMessage().getMessage('Cancel from disposal: {0}', g_form.getValue('display_name')));
	cd.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	cd.setPreference('sysparm_current_stockroom', stockroom);
	cd.setPreference('sysparm_status_label', getMessage('In Stock'));
	cd.setPreference('sysparm_status', '6');
	cd.setWidth(600);
	cd.render();
}
