(function() {
    var sys_gr = new GlideRecord("sys_properties");
    sys_gr.addQuery("sys_id", "a861b547eb302110e4aaf288b552281a");
    sys_gr.query();
    if (sys_gr.next()) {
        if (sys_gr.getValue("value") != "true") {
            sys_gr.setValue("value", true);
            sys_gr.update();
            gs.info("Workflow Similarity is enabled as default similarity capability");
        } else {
            gs.info("Workflow Similarity is already enabled as default similarity capability");
        }

    } else {
        gs.info("Enable Workflow Similarity sys property is not found");
    }

}());
