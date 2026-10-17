migrateData();

function migrateData(){
	//If the sys_prop is not found, the sys_id for the "CC voice" channel will be used as default.
	var sysProp = gs.getProperty("com.glide.cs.multiple_conversations_per_consumer_channels", "991f3f81b7031110b6e8bc15ae11a912");
	var channels = sysProp.split(",");
	for(var i = 0; i < channels.length; i++) {
		var sysChannelGr = new GlideRecord("sys_cs_channel");
		sysChannelGr.setWorkflow(false);
		if(sysChannelGr.get(channels[i])){
			sysChannelGr.supports_multiple_conversations = true;
			sysChannelGr.update();
		}
	}
}
