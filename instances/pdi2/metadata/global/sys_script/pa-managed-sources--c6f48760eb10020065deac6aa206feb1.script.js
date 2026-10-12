function onAfter(current, previous) {
    var gr = new GlideRecord('sys_app_module');
	if (gr.get('8cf32540eb23310065deac6aa206fef0')) {
		gr.active = (current.value.toString() == 'true' && current.operation() != 'delete');
		gr.update();
	}   
}
