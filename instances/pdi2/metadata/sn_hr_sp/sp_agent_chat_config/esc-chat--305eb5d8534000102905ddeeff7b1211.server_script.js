(function($sp) {
    var isVAActive = GlidePluginManager.isActive('com.glide.cs.chatbot') || GlidePluginManager.isActive("com.glide.cs.chatbot.lite");
    var configObj = {};
    configObj.portal = $sp.getValue('url_suffix');
    configObj.live_agent_only = !isVAActive;
    configObj.consumer_account_context = 'esc';
    return configObj;
})($sp);
