(function executeRule(current, previous /*null when async*/) {
 var webClient_channel_id = 'ecc77b49533100102f40ddeeff7b125d';
	var gr = new GlideRecord('sys_notification_channel');
	gr.get(webClient_channel_id);
	gr.setValue('active', current.getValue('notification_enabled'));
	gr.update();

})(current, previous);
