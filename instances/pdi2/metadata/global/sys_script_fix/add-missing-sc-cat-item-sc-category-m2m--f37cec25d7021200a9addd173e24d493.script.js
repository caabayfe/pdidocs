addMissingItemCategoryM2M();

function addMissingItemCategoryM2M() {
	gs.print("Adding missing sc_cat_item::sc_category m2m records");
	var gr = new GlideRecord('sc_cat_item');
	gr.addNotNullQuery("category");
    gr.query();
	while (gr.next()) {
		var cat = gr.getValue("category");
		var m2m = new GlideRecord("sc_cat_item_category");
		m2m.addQuery("sc_cat_item", gr.getUniqueValue());
		m2m.addQuery("sc_category", cat);
		m2m.query();
		if (m2m.next()) {
			//gs.print("Found existing m2m record for item: " + m2m.sc_cat_item.getDisplayValue() + ", category: " + m2m.sc_category.getDisplayValue());
			continue;
		}
			
		m2m.sc_cat_item = gr.getUniqueValue();
		m2m.sc_category = cat;
		gs.print("***** Creating missing m2m record for item: " + gr.name + ", category: " + gr.category.getDisplayValue());
		m2m.insert();
	}
}
