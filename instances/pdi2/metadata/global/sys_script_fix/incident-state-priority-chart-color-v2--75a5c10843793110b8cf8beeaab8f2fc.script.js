(function() {

    var ootbStateColors = "27379791b7d630104088bc16de11a960,541a2e27b70230104088bc16de11a99d,1c1a2e27b70230104088bc16de11a99d,941a6e27b70230104088bc16de11a9a3,5c1a6e27b70230104088bc16de11a9a3,141a6e27b70230104088bc16de11a9a4";
    var gr = new GlideRecord("sys_report_chart_color");
    gr.addQuery("name", "incident");
    gr.addQuery("element", "state");
    gr.addQuery("sys_id", "NOT IN", ootbStateColors);
    gr.setLimit(1);
    gr.query();
    if (!gr.hasNext()) {
        gs.log("Loading sys_report_chart_color for incident.state", "[com.snc.incident.updates][Fix Script: Load Incident state priority chart color]");
        GlideUpdateManager2().load("com.snc.incident.updates", "update.chart_colors_state");
    }

    var ootbPriorityColors = "541a2e27b70230104088bc16de11a99c,e3379791b7d630104088bc16de11a95e,af379791b7d630104088bc16de11a95e,6b379791b7d630104088bc16de11a95f,ef379791b7d630104088bc16de11a95c";
    var gr1 = new GlideRecord("sys_report_chart_color");
    gr1.addQuery("name", "incident");
    gr1.addQuery("element", "priority");
    gr1.addQuery("sys_id", "NOT IN", ootbPriorityColors);
    gr1.setLimit(1);
    gr1.query();
    if (!gr1.hasNext()) {
        gs.log("Loading sys_report_chart_color for incident.priority", "[com.snc.incident.updates][Fix Script: Load Incident state priority chart color]");
        GlideUpdateManager2().load("com.snc.incident.updates", "update.chart_colors_priority");
    }
})();
