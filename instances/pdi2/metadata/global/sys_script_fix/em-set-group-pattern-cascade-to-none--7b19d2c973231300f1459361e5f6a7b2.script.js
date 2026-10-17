gs.log('Starts removing cascade delete from pattern_id field in sa_agg_group_pattern table');

// Update the value of reference_cascade_rule to none for all the records that were found
var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sa_agg_group_pattern");
gr.addQuery("element", "pattern_id");
gr.addQuery("reference_cascade_rule", "!=", "none");
gr.query();

if (gr.getRowCount() > 1) {
	gs.error('Error on removing cascade delete from pattern_id field in sa_agg_group_pattern table, more then 1 row was found');
} 

if (gr.next()) {
	gs.log('Setting cascade delete to none for pattern_id field in sa_agg_group_pattern table');
	gr.setValue("reference_cascade_rule", "none");	
	gr.update();
}

gs.log('Ended removing cascade delete from pattern_id field in sa_agg_group_pattern table');
