deactivateClientScript();

function deactivateClientScript() {
    if (GlidePluginManager.isZboot()) {
        gs.info("Skipping fix script to deactivate hide wsa field client script on zboot");
        return;
    }
    gs.info("Executing fix script to deactivate hide wsa field client script on upgrade");
    var gr = new GlideRecord("sys_script_client");
    gr.get("dcd09c1f2cb76210f87796e2265d210b");
    gr.setValue("active", false);
    gr.update();
    gs.info("Deactivated hide wsa field client script on upgrade");
}
