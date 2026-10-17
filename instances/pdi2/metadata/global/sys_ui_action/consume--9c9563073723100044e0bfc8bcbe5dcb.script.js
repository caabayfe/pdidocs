function consume() {
	var stock = g_form.getReference('stockroom');
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass('consume_a_consumable');
	dd.setTitle(new GwtMessage().getMessage("Consume: {0}", g_form.getValue('display_name')));
	dd.setPreference('sysparm_sys_id', gel('sys_uniqueValue').value);
	dd.setPreference('sysparm_total_qty', g_form.getIntValue('quantity'));
	dd.setPreference('sysparm_name', g_form.getValue('display_name'));
	dd.setPreference('sysparm_stockroom', stock.name);
	assetSetDomainParameters(dd);
	dd.setWidth(600);
	dd.render();
}
