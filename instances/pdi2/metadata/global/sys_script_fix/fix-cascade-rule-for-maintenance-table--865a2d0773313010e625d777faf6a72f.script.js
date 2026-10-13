gs.log('Starts fixing cascade rule for maintenance table');

// Update the value of reference_cascade_rule to delete to support upgrade see PRB1515558
var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "em_impact_maint_cmdb_ci_alert");
gr.addQuery("element", "ci_id");
gr.query();

if (gr.next()) {
	gs.log('Setting cascade rule for maintenance table to delete');
	gr.setValue("reference_cascade_rule", "delete");	
	gr.update();
}

gs.log('Ended fixing cascade rule for maintenance table');
