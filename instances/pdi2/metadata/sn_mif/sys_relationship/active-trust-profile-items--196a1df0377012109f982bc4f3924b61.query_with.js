(function refineQuery(current, parent) {
    gs.getSession().putClientData('mif_application', parent.application.toString());
    var capabilityIds = [];
    var gr = new GlideRecord("sn_mif_capability");
    gr.addQuery("application", parent.application);
    gr.query();
    while (gr.next())
        capabilityIds.push(gr.getValue("sys_id"));

    current.addQuery("active", true);
    current.addQuery("capability", capabilityIds);
})(current, parent);
