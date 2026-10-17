(function checkScreenVisibility(params) {
	return gs.getProperty("glide.ui.show_template_bar." + params.table, true) == "true";
})(inputProperties);
