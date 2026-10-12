function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.showFieldMsg("template", new GwtMessage().getMessage("You can use the template field above to only get the template data classes specific to that template"));
    }
}
