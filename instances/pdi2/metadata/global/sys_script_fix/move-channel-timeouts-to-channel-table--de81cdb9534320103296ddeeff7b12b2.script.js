var sysPropGR = new GlideRecord('sys_properties');
sysPropGR.addQuery('name', 'ENDSWITH', '_idle_timeout');
sysPropGR.query();

while(sysPropGR.next()) {
	try{
		var name = sysPropGR.getValue('name');
		var channelName = name.match(/com.glide.cs.(.*)_idle_timeout/)[1];

		var channelGR = new GlideRecord('sys_cs_channel');
		channelGR.addQuery('name', channelName);
		channelGR.query();

		if(channelGR.next()) {
			channelGR.setValue('timeout', sysPropGR.getValue('value'));
			channelGR.update();
		}
	}
	catch(ex) {
		gs.error('Failed to migrate sys property for custom channel timeout for ' + name);
	}
}
