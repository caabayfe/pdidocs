// Delete records in mb_validation_run older than 3 days
var daysAgo = new GlideDateTime();
daysAgo.addDays(-3);
var query = 'sys_created_on<'+daysAgo.getValue();
var gr = new GlideRecord('mb_validation_run');
gr.addQuery(query);
gr.deleteMultiple();
