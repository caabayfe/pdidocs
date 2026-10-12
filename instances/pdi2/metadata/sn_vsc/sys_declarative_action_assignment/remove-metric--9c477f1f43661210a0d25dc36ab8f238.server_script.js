if (current && current.sys_id) {
    /**
     * If the metric exists, remove it from the table
     * From the UI: Once the function returns, the list gets updated, and the removed entries will not be there
     */
    var gr = new GlideRecordSecure("sn_vsc_key_metrics");
    if (gr.get("indicator", current.sys_id)) {
        gr.deleteRecord();
    }
}
