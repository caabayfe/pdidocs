function onAfter(current, previous) {
    var gr = new GlideRecord("sys_properties");
    gr.addQuery("name", "glide.product.description");
    gr.query();
	if (gr.next()) {
		// update sys prop description
		gr.value = current.banner_text;
		gr.setWorkflow(false);
		gr.update();
	}
}
