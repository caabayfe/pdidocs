function transform(input) {
    var filterId = input.filterId;
    try {
        if (gs.nil(filterId)) {
            return null;
        }
        var nowAssistGuardianFilterUtil = new sn_nowassist_admin.NowAssistGuardianFilterUtil();

        var filterDetails = nowAssistGuardianFilterUtil.getGenAIFilterByFilterId(filterId);

        var samplePhrases = nowAssistGuardianFilterUtil.getSamplePhrasesByFilterId(filterId);

        var deploymentChannels = nowAssistGuardianFilterUtil.getActiveVADeploymentChannels(filterId);

        return {
            filterDetails: filterDetails,
            samplePhrases: samplePhrases,
            deploymentChannels: deploymentChannels?.activeVa,
            activeDeploymentChannelsCount: deploymentChannels?.activeVaCount
        };
    } catch (e) {
        gs.error("Failed fetch Sensitive Filter Details- " + e.toString());
        return {};
    }

}
