function transform(input) {
    var translatorConfiguration = "";
    try {
        var translatorConfigurationSysId = gs.getProperty("com.snc.gen_ai.translator_configuration.sys_id", "");
        if (gs.nil(translatorConfigurationSysId)) {
            translatorConfiguration = "ServiceNow";
        } else {
            var translatorConfigurationGr = new GlideRecord("sn_dt_translator_configuration");
            translatorConfigurationGr.get(translatorConfigurationSysId);
            translatorConfigurationGr.query();
            if (translatorConfigurationGr.getRowCount() === 0) {
                translatorConfiguration = "INVALID";
            }
            if (translatorConfigurationGr.next()) {
                translatorConfiguration = translatorConfigurationGr.getValue('name');
            }
        }
    } catch (e) {
        gs.error('Failed to get Translator Configuration');
    }
    return translatorConfiguration;

}
