(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);

    // SAM use case
    if (GlidePluginManager.isActive("com.snc.sams")) {
        current.addQuery('norm_product', parent.product);
    } else {
        current.addQuery('publisher', parent.manufacturer);
        current.addQuery('product_name', parent.name);
    }
	current.addQuery('active', 'true');

})(current, parent);
