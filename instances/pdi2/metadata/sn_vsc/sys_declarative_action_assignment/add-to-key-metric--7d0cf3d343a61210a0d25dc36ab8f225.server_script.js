if (current && current.sys_id) {
    /**
     * If the metric exists, noop.
     * It it doesn't, add it to the table.
     * From the UI: User can select same record(s) multiple times and can hit the "Add to key metric" button. This way, we can skip over the already pushed metrics in the "sn_vsc_key_metrics" table.
     */
    var gr = new GlideRecordSecure("sn_vsc_key_metrics");
    if (!gr.get("indicator", current.sys_id)) {
        gr.initialize();
        gr.setValue("indicator", current.sys_id);
        gr.insert();
    }
}
