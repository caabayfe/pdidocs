function onLoad() {
	if (g_form.getValue("active") === "false") {
		g_form.setReadOnly("state", true);
	}
}
