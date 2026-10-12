function transform(input) {
    try {
        for (let config of input.sessionConfigFields) {
            let gr = new GlideRecord("sn_um_upgrade_session_config");
            gr.addQuery("upgrade_session_id", config.sessionId);
            gr.addQuery("setting_key", config.key);
            gr.query();

            if (gr.next()) {
                gr.setValue("setting_value", config.value);
                gr.update();
            }
        }
    } catch (error) {
        gs.info("Error: " + error);
    }
}
