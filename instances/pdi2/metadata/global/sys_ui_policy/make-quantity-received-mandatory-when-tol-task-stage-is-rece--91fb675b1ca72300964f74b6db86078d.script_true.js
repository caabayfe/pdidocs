function onCondition() {
	function handleResponse(response) {
		var res = response.responseXML.documentElement.getAttribute('answer');
		if (res === 'true') {
			g_form.setDisplay('quantity_received', true);
			g_form.setMandatory('quantity_received', true);
		} else {
			g_form.setDisplay('quantity_received', false);
			g_form.setMandatory('quantity_received', false);
		}
	}
	var ga = new GlideAjax('global.TransferOrderLineBulkUpdateAjax');
	ga.addParam('sysparm_name', 'showQuantityReceivedField');
	ga.addParam('sysparm_to_line', g_form.getValue('transfer_order_line'));
	ga.getXML(handleResponse);
}
