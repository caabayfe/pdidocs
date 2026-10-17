(function runMailScript(current, template, email) {
    var gr = new GlideRecord("vtb_card");
    gr.addQuery("lane", current.lane);
    gr.addQuery("removed", false);
    gr.query();
    template.print(gr.getRowCount());
})(current, template, email);
