var today = new GlideDateTime();
today.addDaysUTC(-1);

var gr = new GlideRecord('cmdb_ci_business_process');
gr.addQuery('life_cycle_stage', 'Operational');
gr.addNotNullQuery('assignment_group');
gr.addQuery('next_review_date', today.getDate());
gr.query();

while (gr.next()) {
    gs.eventQueue('business_process.review', gr);
}
