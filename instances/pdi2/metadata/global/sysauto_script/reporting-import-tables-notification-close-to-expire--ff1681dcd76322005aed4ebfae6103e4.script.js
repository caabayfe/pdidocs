//read the import tables that expires in 2 or 1 days and send an event (for sending an email)
var event = 'report.import.expire_on_date.notify';

var gr = new GlideRecord('sys_report_import_table');
gr.addQuery('active','true');
var qc2 = gr.addQuery('expire_on_date', gs.daysAgo(-2)); // 2 days
qc2.addOrCondition('expire_on_date', gs.daysAgo(-1)); // 1 days
gr.query();
while(gr.next()){
	// raise an event to send the email
    gs.eventQueue(event, gr, gr.getValue('created_by_user'));
	gs.print('Reporting - Import Tables notification close to expire with sys_id' + gr.sys_id);
}
