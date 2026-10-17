(function() {
    var ootbRange = "d13b4615b7610110c5aebc16de11a94a,cc2784e7738130102eb52d2b04f6a73d,d878cce7738130102eb52d2b04f6a7e0,1e5b4c6b738130102eb52d2b04f6a71a,326b8c6b738130102eb52d2b04f6a708,1f1dcc6b738130102eb52d2b04f6a702";
    var gr = new GlideRecord("sys_report_range");
    gr.addQuery("name", "task_sla");
    gr.addQuery("element", "time_left");
    gr.addQuery("sys_id", "NOT IN", ootbRange);
    gr.setLimit(1);
    gr.query();
    if (!gr.hasNext()) {
        gs.log("Loading sys_report_ranges for task_sla.time_left", "[com.snc.sla][Fix Script: Load SLA Report Ranges]");
        GlideUpdateManager2().load("com.snc.sla", "update.report_ranges");
    }

})();
