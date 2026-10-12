function onLoad() {
    g_form.addInfoMessage(getMessage("component_preset_information"));
    g_form.showFieldMsg("controller", getMessage("component_preset_controller"), "info");
    g_form.showFieldMsg("controller_dependencies", getMessage("component_preset_controller_dependencies"), "info");
}
