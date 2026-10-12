(function($sp) {
    var isVAActive = GlidePluginManager.isActive('com.glide.cs.chatbot') || GlidePluginManager.isActive("com.glide.cs.chatbot.lite");
    var themeToBrandingMap = {
        'EC Theme': 'ec_branding',
        'Employee Center Coral Theme': 'coral_light'
    };

    var themeName = $sp.getPortalRecord().getDisplayValue('theme');
    var brandingKey = themeToBrandingMap[themeName] || 'ec_branding';

    var configObj = {
        live_agent_queue: $sp.getDisplayValue('sp_chat_queue'),
        branding_key: brandingKey,
        portal: $sp.getValue('url_suffix'),
        live_agent_only: !isVAActive,
        consumer_account_context: 'esc'
    };
    return configObj;
})($sp);
