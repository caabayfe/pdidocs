function transform(input) {
    var response = {};
    try {
		response["isBUPluginActive"] = GlidePluginManager.isActive('sn_generative_ai');
		response["isDTPluginActive"] = GlidePluginManager.isActive('com.glide.cs.dynamic.translation.virtual_agent');
    } catch (e) {
        gs.error('Failed to get Dynamic translation for Virtual Agent plugin status');
    }
    return response;
}
