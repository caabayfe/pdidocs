function onCondition() {
	/* Hide irrelevant fields for help resources */
	["type","video_link","video_alt","footer","text","default_content","has_custom_html","guidance_step"].forEach(function(field) {
		g_form.setDisplay(field, false);
	});
	//show type field for creating resource type, eg - image/table
	g_form.setDisplay("type", true);

	/* Hide Irrelevant type for help resources */
	["video","text","image_text","image_question","question"].forEach(function(field) {
		g_form.removeOption("type", field);
	});
}
