function onSubmit() {
	g_form.hideFieldMsg("title");
	
	var catGr = new GlideRecord("sc_category");
	catGr.addQuery("title", g_form.getValue("title"));
	catGr.addQuery("sc_catalog", g_form.getValue("sc_catalog"));
	var parentCat = g_form.getValue("parent");
	if (parentCat != "")
		catGr.addQuery("parent", parentCat);
	catGr.query();
	
	if (catGr.hasNext()) {
		g_form.showFieldMsg("title", "There is already a Category with this name in the selected catalog" + (parentCat != "" ? " and parent category" : ""), "error");
		return false;
	}
}
