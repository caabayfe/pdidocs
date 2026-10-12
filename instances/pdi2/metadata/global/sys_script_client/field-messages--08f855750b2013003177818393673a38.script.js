function onLoad() {
	if (g_form.getValue("stage") == "paused") {
		if (typeof format == "function") {
			var message = getMessage("Paused on {0}");
			g_form.showFieldMsg("stage", format(message, {0: g_form.getValue("pause_time")}), "info");
		}
	}
}
