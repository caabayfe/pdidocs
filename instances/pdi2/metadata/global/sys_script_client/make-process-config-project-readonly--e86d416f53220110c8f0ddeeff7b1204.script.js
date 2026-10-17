function onLoad() {
    //Type appropriate comment here, and begin script below
    if (!g_form.isNewRecord()) {
        g_form.setReadOnly("process_def", true);
        g_form.setReadOnly("project", true);
		g_form.setReadOnly("type", true);
    } 
}
