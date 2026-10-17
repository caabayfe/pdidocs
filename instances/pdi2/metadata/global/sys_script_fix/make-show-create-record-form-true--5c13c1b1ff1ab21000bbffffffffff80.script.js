var gr = new GlideRecord("sys_playbook_experience_record_generator");
var qc = gr.addQuery('show_create_record_form', false);
qc.addOrCondition('show_create_record_form', 'ISEMPTY', '');
gr.addNotNullQuery('create_record_form_view');
gr.query();
var updatedCount = 0;
while (gr.next()) {
	gr.setValue('show_create_record_form', true);
	gr.update();
	updatedCount++;
}
gs.info('Updated ' + updatedCount + ' records to set show_create_record_from to true');
