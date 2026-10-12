function onChange(control, oldValue, newValue, isLoading) {

	var location = gel('requestor_location');

	if (!location || isLoading)
		return;

	var request  = new GlideAjax('ServiceCatalogGetLocation');
	request.addParam('sysparm_name', 'retrieveAddress');
	request.addParam('sysparm_sysId', newValue);
	request.getXML(parseResponse);

	function parseResponse(response) {
		var address = response.responseXML.documentElement.getAttribute("answer");
		setLocation(address, true);

		if (typeof g_form != 'undefined' && g_form != null && g_form != '') {
			var cartId = g_form.getValue('sysparm_cart_id');
			var location = gel('requestor_location');
			if (cartId != null && cartId != '' && typeof cartId != 'undefined' && location && !location.hasAttribute('readonly'))
				catDeliveryAddress(cartId, 'requestor_location');
		}
	}
}

function setLocation(address, focus) {
	var location = gel('requestor_location');

	if (typeof g_form != 'undefined' && g_form != null && g_form != '') {
		if (g_form.getControl('requestor_location'))
			g_form.setValue('requestor_location', address);
		else
			location.value = address;
	}

	if (focus && location && !location.hasAttribute('readonly'))
		location.focus();

}
