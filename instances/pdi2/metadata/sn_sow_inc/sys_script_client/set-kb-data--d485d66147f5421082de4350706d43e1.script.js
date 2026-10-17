function onLoad() {
    if (g_form.getValue('source') && g_form.isNewRecord()) {
        var gr = new GlideRecord('incident');
        gr.addQuery('sys_id', g_form.getValue('source'));
        gr.query(cb);

        function cb(item) {
            gr.next();
            if (!g_form.getValue("short_description")) {
                g_form.setValue("short_description", gr.getValue('short_description'));
            }
            if (!g_form.getValue("text")) {
                var issueLabel = getMessage("Issue");
                var resolutionLabel = getMessage("Resolution");
                var textData = "<p><strong>" + issueLabel + "</strong> - " + gr.getValue('description') + "</p><p><strong>" + resolutionLabel + "</strong> - " + gr.getValue('close_notes') + "</p>";
                g_form.setValue("text", textData);
            }
        };
    }
}
