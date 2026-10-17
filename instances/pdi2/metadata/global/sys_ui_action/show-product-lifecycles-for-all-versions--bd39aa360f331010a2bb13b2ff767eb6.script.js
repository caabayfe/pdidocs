function showLifecycles() {
	var publisherStr = '';
	var productStr = '';
	if (g_form.hasField('product')) {
		productStr = 'norm_product=' + g_form.getValue('product');
	} else {
		publisherStr = 'publisher=' + g_form.getValue('manufacturer');
		productStr = '^product_name=' + g_form.getValue('name');
	}

	var query = 'sysparm_query=' + publisherStr + productStr;
	var url = 'sam_sw_product_lifecycle_list.do?' + query;
	window.open(url, '_blank');
}
