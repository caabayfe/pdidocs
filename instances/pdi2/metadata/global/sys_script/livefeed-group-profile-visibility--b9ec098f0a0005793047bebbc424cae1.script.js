// Limit a user's access to group profiles
if(!GlidePluginManager.isActive("com.glideapp.live_feed_v2"))
	new LiveFeedUtil().adjustSessionGroupProfileQuery(current);
