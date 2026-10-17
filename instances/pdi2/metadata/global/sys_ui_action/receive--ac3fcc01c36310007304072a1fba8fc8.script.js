// This version of Receive works for receiving consumables of multiple quantity
function pushStageFromTOL() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var gDialog = new dialogClass('transfer_order_quantity_receiver');
	gDialog.setTitle('Receive Quantity');
	var sysid = g_form.getUniqueValue();
	gDialog.setPreference('sysparm_sysID', sysid + "");
	gDialog.setPreference('sysparm_transfer_order', g_form.getValue('transfer_order'));
	gDialog.render();
}
