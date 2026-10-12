var curHubInstanceId = GlideProperties.get('glide.apps.hub.current');
if(current.instance_id == curHubInstanceId) { 
	GlidePropertiesDB.set('glide.apps.hub.current','');
}
