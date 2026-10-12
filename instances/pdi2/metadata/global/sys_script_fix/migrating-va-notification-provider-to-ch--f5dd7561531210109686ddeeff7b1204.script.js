
//get all the notification providers related to CAF.
var gr = new GlideRecord('sys_cs_notification_channel_configuration');
gr.query();

//for each notification provider update the notification_channel with single CAF notification provider and delete the old notification provider.
while(gr.next()) {
	var provider_gr = new GlideRecord('sys_notification_provider');
	var channel_gr = new GlideRecord('sys_notification_channel');
	
	provider_gr.get(gr.get('notification_provider'));
	provider_gr.deleteRecord();
	
	channel_gr.setValue('provider', 'dfd16d88531610109686ddeeff7b126b');
	channel_gr.update;
	
	gr.setValue('notification_provider', 'dfd16d88531610109686ddeeff7b126b');
	gr.update();	
}
