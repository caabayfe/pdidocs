function hideStartRule(table, qualifier, reference) {
	var gr = new GlideRecord("sys_dictionary");
	gr.setWorkflow(false);
	gr.addQuery("name", table);
	gr.addQuery("element", "start_rule");
    gr.query();

    while (gr.next()) {
        gr.setValue("reference", reference);
        gr.setValue("internal_type", "reference");
        gr.setValue("reference_qual", "active=true^EQ");
        gr.update();
    }
}

function deleteStarRuleChoices() {
	var gr = new GlideRecord("sys_choice");
	gr.setWorkflow(false);
	gr.addQuery("name", "IN", "sys_pd_activity,sys_pd_lane");
	gr.addQuery("element", "start_rule");
    gr.query();
	
	while (gr.next()) {
		gr.deleteRecord();
    }
}

hideStartRule("sys_pd_lane", "sys_id!=77ebf7a3533110108b45ddeeff7b125a^EQ", "sys_pd_lane_start_rule_definition");
hideStartRule("sys_pd_activity", "sys_id!=4d197b23533110108b45ddeeff7b129c^EQ", "sys_pd_activity_start_rule_definition");
deleteStarRuleChoices();
