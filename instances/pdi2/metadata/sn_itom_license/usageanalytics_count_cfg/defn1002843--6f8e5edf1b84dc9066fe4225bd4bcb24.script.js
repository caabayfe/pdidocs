answer = getCount();

function getCount() {
    var gr = new GlideRecord('itom_lu_usage_account');

    if (gr.isValid()) {
        gr.addQuery('sku_name', 'Service Mapping');
        gr.query();

        if (gr.next()) {
            return parseInt(gr.getValue('accounted_usage'));
        }
    }

    var productCountGr = new GlideRecord('itom_lu_product_count');
	if (productCountGr.isValid()) {
		productCountGr.addQuery('product', 'Service Mapping');
		productCountGr.orderByDesc('count');
		productCountGr.setLimit(1);
		productCountGr.query();

		if (productCountGr.next())
			return parseInt(productCountGr.getValue('count'));
	}

	return 0;
}
