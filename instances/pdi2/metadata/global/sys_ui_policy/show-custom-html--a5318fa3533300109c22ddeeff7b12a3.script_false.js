function onCondition() {
	if(g_form.getValue("type") === "image") {
		g_form.setDisplay("image", true);
		g_form.setDisplay("has_image_link", true);
		g_form.setDisplay("image_alt", true);
	}
}
