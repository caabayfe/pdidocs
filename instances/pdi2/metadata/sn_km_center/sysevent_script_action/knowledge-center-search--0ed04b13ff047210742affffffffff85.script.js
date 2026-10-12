if (gs.tableExists('sn_aisearch_global_job_completion')) {
	// destination_sys_id = AI search context config ID - 85ac5bee475a221019f80fdc416d430f
	// source_sys_id = Zing search context config Id - 2fcbd8cbff332210be3cffffffffff12
    var gr = new GlideRecord("sn_aisearch_global_job_completion");
    gr.addQuery("destination_sys_id", "85ac5bee475a221019f80fdc416d430f");
    gr.addQuery("source_sys_id", "2fcbd8cbff332210be3cffffffffff12");
    gr.addQuery("table_name", "sys_search_context_config");
    gr.query();
    if (!gr.next()) {
        gr = new GlideRecord("sn_aisearch_global_job_completion");
        gr.initialize();
        gr.setValue("destination_sys_id", "85ac5bee475a221019f80fdc416d430f");
        gr.setValue("source_sys_id", "2fcbd8cbff332210be3cffffffffff12");
        gr.setValue("table_name", "sys_search_context_config");
        gr.insert();
    }
}
