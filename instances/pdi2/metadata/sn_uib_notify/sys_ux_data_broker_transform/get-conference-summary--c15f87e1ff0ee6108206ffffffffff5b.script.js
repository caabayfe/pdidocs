function transform(input) {
    if (gs.nil(input.confId)) return {};
    var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.getConferenceCallSummary(input.confId);
}
