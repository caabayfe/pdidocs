/* global assetSetDomainParameters */
function consumableSplit() {
	var dialogClass = (typeof GlideModal !== 'undefined') ? GlideModal : GlideDialogWindow;
	// eslint-disable-next-line new-cap
	var dd = new dialogClass('consumable_split');
	dd.setTitle(new GwtMessage().getMessage('Asset Split: {0}', g_form.getValue('display_name')));
	dd.setPreference('sysparm_total_qty', g_form.getIntValue('quantity'));
	dd.setPreference('sysparm_asset_function', g_form.getValue('asset_function'));
	dd.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	dd.setPreference('sysparm_status_label', getMessage('In Stock'));
	dd.setPreference('sysparm_status', '6');
	assetSetDomainParameters(dd);
	dd.setWidth(600);
	dd.render();
}
