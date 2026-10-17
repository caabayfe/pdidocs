changeFieldsIntoReadOnly();
		
		
function changeFieldsIntoReadOnly() {
	gs.log('running fix script to set fields severity and state into read only, time: ' + gs.nowDateTime());
	var gr = new GlideRecord('sys_dictionary');
	var fields = ['severity','state'];

	gr.addQuery('name', 'em_alert_history');
	gr.addQuery('element', fields);
	gr.addQuery('read_only', false);
	gr.query();

	while (gr.next()) {
		gr.read_only=true;
		gr.update();
	}
	gs.log('finish running fix script, time: ' + gs.nowDateTime());
}
