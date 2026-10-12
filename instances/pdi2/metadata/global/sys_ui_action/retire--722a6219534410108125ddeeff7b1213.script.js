/* global assetSetDomainParameters */
function retire() {
	var dialogClass = (typeof GlideModal !== 'undefined') ? GlideModal : GlideDialogWindow;
	// eslint-disable-next-line new-cap
	var dd = new dialogClass('retire_consumable');
	dd.setTitle(new GwtMessage().getMessage('Retire Asset: {0}', g_form.getValue('display_name')));
	dd.setPreference('sysparm_total_qty', g_form.getIntValue('quantity'));
	dd.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	dd.setPreference('sysparm_status_label', getMessage('In Stock'));
	dd.setPreference('sysparm_status', '6');
	assetSetDomainParameters(dd);
	dd.setWidth(600);
	dd.render();
}
