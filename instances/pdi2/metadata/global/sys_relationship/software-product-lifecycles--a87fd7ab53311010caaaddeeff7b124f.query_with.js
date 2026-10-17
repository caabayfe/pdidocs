(function refineQuery(current, parent) {
    // SAM use case
    if (GlidePluginManager.isActive("com.snc.sams")) {
        current.addQuery("norm_product", parent.product);
    } else {
        current.addQuery("publisher", parent.manufacturer);
        current.addQuery("product_name", parent.name);
    }
	current.addQuery('active', 'true');
	SamLifeCycleUtils.queryVersionAndEdition(current, parent);

    current.orderBy("norm_version");
    current.orderBy("norm_full_version");
    current.orderBy("start_date");

})(current, parent);
