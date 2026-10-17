try {
    if (gs.getProperty('com.glide.one_extend.default_provider_sync', 'true') === 'true') {
        var util = new global.GenAIProviderUtil();
        util.processCustomizedSettings('SCH JOB: Fix default provider settings');
    }
} catch (e) {
    gs.error('[Fix default provider settings] scheduled job threw an exception' + e.message);
}
