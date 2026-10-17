function onLoad() {
    if (g_form.getValue("stage") == "paused"){
        var message = getMessage("Paused on {0}");
        g_form.showFieldMsg("stage", new GwtMessage().format(message, g_form.getValue("pause_time")), "info");
    }
}
