(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("sys_ux_app");
    gr.setWorkflow(false);
    gr.addQuery("sys_id", "c86a62e2c7022010099a308dc7c26022");
    gr.setValue("multiple_experiences", current.value);
    gr.updateMultiple();

})(current, previous);
