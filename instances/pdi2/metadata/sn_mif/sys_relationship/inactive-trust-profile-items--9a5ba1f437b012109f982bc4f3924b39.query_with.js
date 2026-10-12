(function refineQuery(current, parent) {

    var capabilityIds = [];
    var gr = new GlideRecord("sn_mif_capability");
    gr.addQuery("application", parent.application);
    gr.query();
    while (gr.next())
        capabilityIds.push(gr.getValue("sys_id"));

    current.addQuery("active", false);
    current.addQuery("capability", capabilityIds);
})(current, parent);
