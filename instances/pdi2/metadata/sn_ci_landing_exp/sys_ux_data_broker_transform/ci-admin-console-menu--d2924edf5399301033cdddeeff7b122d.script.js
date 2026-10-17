function transform(input) {
    var res = {
        tabNameTranslations: {
            home: gs.getMessage("Home"),
            chat_settings: gs.getMessage("Chat Settings")
        }
    };
    if (GlidePluginManager.isActive("com.glide.cs.chatbot") || GlidePluginManager.isActive("com.glide.cs.chatbot.lite")) {
        var adminConsolePages = [];
        // Home page
        adminConsolePages.push({
            id: "general",
            label: gs.getMessage("General")
        });

        // VA Branding and General settings pages
        var csSettingsPlugin = "com.glide.cs.settings";
        if (GlidePluginManager.isActive(csSettingsPlugin)) {
            adminConsolePages.push({
                id: "virtual-agent",
                label: gs.getMessage("Virtual Agent"),
            });
        }

        // Agent chat page - require sys_cs_live_agent_setup
        var liveAgentSettingsPlugin = "com.glide.cs.live_agent_settings";
        if (GlidePluginManager.isActive(liveAgentSettingsPlugin)) {
            adminConsolePages.push({
                id: "agent-chat",
                label: gs.getMessage("Agent Chat"),
            });
        }
        res["adminConsolePages"] = adminConsolePages;
    }

    return res;
}
