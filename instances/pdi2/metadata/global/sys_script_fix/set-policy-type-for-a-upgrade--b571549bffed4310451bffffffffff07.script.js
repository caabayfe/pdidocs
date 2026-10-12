if (!pm.isZboot()) {
    const AI_GATEWAY_CHANNEL_ID = "ff1df80d979272109e81697bf5ac4a35";
    const logSource = "[DataPrivacyCore]";
    setPolicyType(logSource, AI_GATEWAY_CHANNEL_ID);
    migrateAllowedRoles(logSource, AI_GATEWAY_CHANNEL_ID);
}


function setPolicyType(logSource, channelId) {
    gs.info("Changing Ai Gateway policies to discovery starting", logSource);
    var gr = new GlideRecord("dp_configuration_domain_separated");
    gr.addQuery("channel", channelId);
    gr.query();
    gr.setWorkflow(false);
    while (gr.next()) {
        gr.setValue("policy_type", "discovery");
        if (!gr.update()) {
            gs.error(logSource + "Failed to set policy_type to discovery for this record: " + gr.getUniqueValue());
        } else {
            gs.info(logSource + "This record already has discovery as policy type or was successfully changed: " + gr.getUniqueValue());
        }
    }
    gs.info(logSource + "Changing Ai Gateway policies to discovery completed");
}

function migrateAllowedRoles(logSource, channelId) {
    gs.info(logSource + "Migrating allowed roles to discovery allowed roles for AI Gateway Data Channel starting");
    var gr = new GlideRecord("dp_channel");
    gr.setWorkflow(false);
    if (!gr.get(channelId)) {
        gs.info(logSource + "Ai Gateway does not exist, canceling job");
        return;
    }
    var allowedRoles = gr.getValue("allowed_roles");
    gr.setValue("discovery_allowed_roles", allowedRoles);
    gr.setValue("allowed_roles", "");
    if (!gr.update()) {
        gs.error(logSource + "Failed to migrate allowed roles to discovery allowed roles for Ai Gateway Data Channel: " + channelId);
    }
    gs.info(logSource + "Migrating allowed roles to discovery allowed roles for AI Gateway Data Channel completed");
}
