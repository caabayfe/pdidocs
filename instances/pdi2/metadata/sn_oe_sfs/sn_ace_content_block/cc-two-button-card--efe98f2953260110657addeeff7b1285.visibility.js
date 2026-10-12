var pluginsList = ["com.glide.cs.custom.adapter","com.sn.va.as.service", "com.glide.interaction.awa", "com.sn_openframe", "com.sn.amzn.conect.spk", "com.sn.s3.spoke", "com.sn.omnichannel.callback", "com.sn.va.amz.connect"];
answer = pluginsList.every(function(pluginId){
	return GlidePluginManager.isActive(pluginId);
});
