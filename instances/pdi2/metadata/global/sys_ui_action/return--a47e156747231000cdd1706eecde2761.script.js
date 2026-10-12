function return_item() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var d = new dialogClass("transfer_order_return");
	d.setTitle("Return items" + g_form.getValue('display_name'));
	d.setPreference('sysparm_sys_id', gel('sys_uniqueValue').value);
	d.setPreference('sysparm_quantity_received', g_form.getValue('quantity_received'));
	d.setPreference('sysparm_quantity_returned', g_form.getValue('quantity_returned'));
	d.setPreference('sysparm_asset', g_form.getValue('asset'));
	assetSetDomainParameters(d);
	d.setWidth(600);
	d.render();
}
