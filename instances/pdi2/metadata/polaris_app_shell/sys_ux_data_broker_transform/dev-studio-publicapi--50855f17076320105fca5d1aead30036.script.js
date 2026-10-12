function transform(input) {
	var has_dev_studio = GlidePluginManager.isActive('com.glide.dev-studio') || GlidePluginManager.isActive('sn_devstudio');

	if(!has_dev_studio || !sn_devstudio) return {value: null};
	
	return {value: sn_devstudio.PublicAPI.getUserPreference(gs.getUserID(), input.preference)};
}
