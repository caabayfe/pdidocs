try {
    if (gs.getProperty('com.glide.one_extend.default_provider_sync', 'true') === 'true') {
        var util = new global.GenAIProviderUtil();
        util.processCustomizedSettings('EVENT: Plugin upgrade/install - NA Platform');
    }
} catch (e) {
    gs.error('[Fix default provider settings event] threw an exception' + e.message);
}
