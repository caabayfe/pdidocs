/* global assetSetDomainParameters */
function markPlannedForDisposal() {
	var dialogClass = (typeof GlideModal !== 'undefined') ? GlideModal : GlideDialogWindow;
	// eslint-disable-next-line new-cap
	var md = new dialogClass('alm_consumable_mark_for_disposal');
	md.setTitle(new GwtMessage().getMessage('Planned for disposal: {0}', g_form.getValue('display_name')));
	md.setPreference('sysparm_total_qty', g_form.getIntValue('quantity'));
	md.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	md.setPreference('sysparm_status', '6');
	md.setPreference('sysparm_substatus', 'pending_disposal');
	assetSetDomainParameters(md);
	md.setWidth(400);
	md.render();
}
