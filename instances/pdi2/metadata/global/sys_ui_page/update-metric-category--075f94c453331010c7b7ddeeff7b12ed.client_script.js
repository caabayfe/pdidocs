function okHandler() {
    g_form.setValue("depends_on", "");
    var gr = new GlideRecord("asmt_metric");
    gr.addQuery("depends_on", g_form.getUniqueValue());
    gr.query();
    while (gr.next()) {
        gr.depends_on = "";
        gr.update();
    }
    GlideDialogWindow.get().destroy();
    return;
}

function cancel() {
    var sysID = gel('catId').value;
    g_form.setValue("category", sysID);
    GlideDialogWindow.get().destroy();
    return;
}
