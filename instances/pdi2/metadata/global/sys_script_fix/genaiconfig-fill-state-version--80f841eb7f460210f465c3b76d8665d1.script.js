gs.info("Started executing fix script: GenAIConfig: Fill state & version");
var genAIConfigGr = new GlideRecord("sys_generative_ai_config");
genAIConfigGr.query();

// Populate state and version field for existing genAIConfigs(sys_generative_ai_config) records.
while (genAIConfigGr.next()) {
    if (global.JSUtil.nil(genAIConfigGr.getValue('state'))) {
        genAIConfigGr.setValue("state", "published");
    }
    if (global.JSUtil.nil(genAIConfigGr.getValue('version'))) {
        genAIConfigGr.setValue("version", 1);
    }
    genAIConfigGr.update();
}
gs.info("Successfully completed executing fix script: GenAIConfig: Fill state & version");
