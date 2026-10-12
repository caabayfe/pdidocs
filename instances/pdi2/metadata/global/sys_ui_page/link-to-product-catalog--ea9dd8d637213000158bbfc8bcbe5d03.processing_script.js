if (cancel_or_submit == "submit") {
	if (catalog == 'hardware')
		catalog = 'pc_hardware_cat_item';
	else if (catalog == 'software')
		catalog = 'pc_software_cat_item';
	else
		catalog = 'pc_product_cat_item';

    var gr = new GlideRecord('pc_vendor_cat_item');
    gr.get(item);
    gr.product_catalog_item = sc_cat_item;
    gr.update();
    var gr = new GlideRecord('sc_cat_item');
	gr.get(sc_cat_item);
    response.sendRedirect(gr.sys_class_name + ".do?sys_id=" + sc_cat_item);
} else {
    var urlOnStack = GlideSession.get().getStack().bottom();
    response.sendRedirect(urlOnStack);
}
