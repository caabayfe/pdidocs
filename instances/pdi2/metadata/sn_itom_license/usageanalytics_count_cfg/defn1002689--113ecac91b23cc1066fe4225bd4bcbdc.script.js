answer = getCount();

function getCount() {
    var gr = new GlideRecord('itom_lu_usage_account');

    if (gr.isValid()) {
        gr.addQuery('sku_name', 'ITOM Enterprise');
        gr.query();

        if (gr.next()) {
            return parseInt(gr.getValue('accounted_usage'));
        }
    }

	var maxCount = 0;
	var count, product;

	// Following products make up the 'ITOM Enterprise' bundle
	var bundledProducts = [
		'Discovery',
		'Service Mapping',
		'Operational Intelligence',
		'Event Management',
		'Cloud'
	];

	var productCountGr = new GlideRecord('itom_lu_product_count');

	if (productCountGr.isValid()) {

		productCountGr.addQuery('product', 'IN', bundledProducts);
		productCountGr.query();

		while (productCountGr.next()) {
			count = parseInt(productCountGr.getValue('count'), 10);
			product = productCountGr.getValue('product');

			// Service mapping has special x10 modifier for licensing
			if (product == 'Service Mapping')
				count *= 10;

			if (count > maxCount)
				maxCount = count;
		}
	}

	return maxCount;
}
