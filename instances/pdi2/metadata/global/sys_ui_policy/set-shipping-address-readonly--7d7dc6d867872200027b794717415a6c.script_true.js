function onCondition() {
	g_form.clearValue('sc_shipping_address');
	var msg = getMessage("Please select either Shipping Address or Shipping Location. Both fields are not supported simultaneously.");
	g_form.showFieldMsg('sc_shipping_address', msg);
}
