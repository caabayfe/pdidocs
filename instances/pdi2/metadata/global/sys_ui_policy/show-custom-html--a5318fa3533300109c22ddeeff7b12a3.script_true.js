function onCondition() {
	if(g_form.getValue("type") === "table") {
		g_form.setDisplay("image", false);
		g_form.setDisplay("has_image_link", false);
		g_form.setDisplay("image_alt", false);
	} 
}
