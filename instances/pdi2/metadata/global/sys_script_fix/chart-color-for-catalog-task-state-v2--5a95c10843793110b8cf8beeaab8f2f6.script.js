(function() {
	var ootbColors = "91d65878c7033010d7e818b1c7c26014,98a51838c7033010d7e818b1c7c260a6,eea61878c7033010d7e818b1c7c260e7,ee171878c7033010d7e818b1c7c260f8,86679878c7033010d7e818b1c7c260fb,8bb79c78c7033010d7e818b1c7c260cb";
    var gr = new GlideRecord("sys_report_chart_color");
    gr.addQuery("name", "sc_task");
    gr.addQuery("element", "state");
	gr.addQuery("sys_id","NOT IN", ootbColors);
	gr.setLimit(1);
    gr.query();
    if (!gr.hasNext()) {
        gs.log("Loading sys_report_chart_color for sc_task.state", "[com.glideapp.servicecatalog.platform][Fix Script: Load chart color for catalog task state]");
        GlideUpdateManager2().load("com.glideapp.servicecatalog.platform", "update.sc_task_chart_colors");
    }
})();
