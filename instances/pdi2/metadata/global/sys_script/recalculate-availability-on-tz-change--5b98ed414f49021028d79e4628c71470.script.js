(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("sys_ui_action");
    if (gr.get("78b8d1014f09021028d79e4628c7149a")) {
        gr.setValue("active", true);
        gr.update();
    }
})(current, previous);
