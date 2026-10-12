function transform(input) {
    return {
        "on": gs.getMessage("on"),
        "off": gs.getMessage("off").toLowerCase(),
        "activate": gs.getMessage("Activate"),
        "deflection_settings_activate": gs.getMessage("Tracking of deflection metrics in Virtual Agent is enabled"),
        "deflection_settings_deactivate": gs.getMessage("Tracking of deflection metrics in Virtual Agent is disabled"),
        "deflection_pattern_success": gs.getMessage("Deflection Pattern changes saved successfully"),
        "deflection_config_success": gs.getMessage("Deflection Configuration changes saved successfully"),
        "deflection_alert": gs.getMessage("The following mandatory fields are not filled in:\nName"),
        "chat_settings_success": gs.getMessage("Agent Chat settings saved successfully"),
        "chat_notification_success": gs.getMessage("Chat client notification settings saved successfully"),
        "update_failed": gs.getMessage("Something went wrong while updating the settings, please refresh the page"),
        "virtual_agent": gs.getMessage("Virtual Agent"),
        "nlu": gs.getMessage("Natural Language Understanding (NLU)"),
        "nlu_settings_success": gs.getMessage("NLU settings saved successfully"),
        "upgrade_alert": gs.getMessage("Please upgrade to access all features. Contact your account executive for more information"),
        "mandatory_alert": gs.getMessage("Please fill all the mandatory fields"),
        "icon": gs.getMessage("Icon"),
        "label": gs.getMessage("Label"),
        "type": gs.getMessage("Type"),
        "value": gs.getMessage("Value"),
        "conversation_history_settings": gs.getMessage("Conversation History Settings"),
        "conversation_history_settings_success": gs.getMessage("Conversation history settings saved successfully")
    };
}
