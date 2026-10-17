removeMandatoryForProductID();

function removeMandatoryForProductID() {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "pc_product_cat_item");
	gr.addQuery("element", "product_id");
	gr.query();
	if (gr.next()) {
		gr.setValue("mandatory", false);
		gr.update();
	}
}
