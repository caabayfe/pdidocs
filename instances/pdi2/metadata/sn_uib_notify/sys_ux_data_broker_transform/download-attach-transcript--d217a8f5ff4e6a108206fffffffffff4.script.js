function transform(input) {
    if (gs.nil(input.confId)) return null;
    var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.downloadAndAttachTranscript(input.confId);
}
