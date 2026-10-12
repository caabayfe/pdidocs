function transform(input) {
    try {
        return NAAPrivacyPolicyUtil.getDataPrivacyDetails();
    } catch {
        gs.error("Now Assist Get Data Privacy Channels: Could not fetch details ")
        return [];
    }

}
