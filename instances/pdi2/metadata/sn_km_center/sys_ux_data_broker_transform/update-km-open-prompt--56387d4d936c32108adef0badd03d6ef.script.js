function transform(params) {
    if (gs.nil(params.payload) || !GlidePluginManager.isActive('sn_km_gen_ai')) {
        return {
            success: false
        };
    }

    const api = new sn_km_center.KMOpenPromptUtils();
    let outcome = {};
    const payload = params.payload;
    if (payload.operation === 'feedback') {
        outcome = api.updateFeedback(payload.contextId, payload.args);
    } else if (payload.operation === 'terminate') {
        outcome = api.terminateProcess(payload.contextId);
    } else {
        return {
            success: false,
            error: 'Invalid Operation'
        };
    }
    return outcome;
}
