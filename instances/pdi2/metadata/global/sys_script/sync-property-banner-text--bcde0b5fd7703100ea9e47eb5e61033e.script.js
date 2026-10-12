function onAfter(current, previous) {
    var gr = new GlideRecord("core_company");
    gr.addQuery("primary", "true");
    gr.query();
	if (gr.next()) {
		// update primary core banner text
		gr.banner_text = current.value;
		gr.setWorkflow(false);
		gr.update();
	}
}
