if (gs.tableExists('sn_aisearch_global_job_completion')) {
    var gr = new GlideRecord("sn_aisearch_global_job_completion");
    gr.addQuery("destination_sys_id", "52d4697943a151103084a921eab8f2d9");
    gr.addQuery("source_sys_id", "f1633693c3733010965e070e9140dd13");
    gr.addQuery("table_name", "sys_search_context_config");
    gr.query();
    if (!gr.next()) {
        gr = new GlideRecord("sn_aisearch_global_job_completion");
        gr.initialize();
        gr.setValue("destination_sys_id", "52d4697943a151103084a921eab8f2d9");
        gr.setValue("source_sys_id", "f1633693c3733010965e070e9140dd13");
        gr.setValue("table_name", "sys_search_context_config");
        gr.insert();
    }
}
