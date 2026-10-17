function syncRules() {
    var grs = new GlideRecord("ecc_agent");
    grs.addQuery('validated', true);
    grs.query();
    while (grs.next()) {
        var gr = new GlideRecord("ecc_queue");
        gr.initialize();
        gr.setValue("agent", "mid.server." + grs.name);
        gr.setValue("topic", "SystemCommand");
        gr.setValue("source", "load_ip_access");
        gr.setValue("queue", "output");
        gr.insert();
    }
}
