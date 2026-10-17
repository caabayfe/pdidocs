function onLoad() {
   //Type appropriate comment here, and begin script below
   g_form.addInfoMessage(getMessage("extension_point_information"));
	g_form.showFieldMsg("controller",getMessage("extension_point_controller"), "info");
	g_form.showFieldMsg("controller_dependencies",getMessage("extension_point_controller_dependencies"), "info");
}
