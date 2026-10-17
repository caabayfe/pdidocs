function transform(input) {

    const insightsUtil = new sn_access_analyzer.AccessInsightsUtil();

    const InsightsUtil = {

        loadInsightsConfiguration: insightsUtil.loadInsightsConfiguration,

        getInsightsData: (payload) => insightsUtil.getInsightsData(payload),

        saveInsightsConfiguration: (payload) => insightsUtil.saveInsightsConfiguration(payload),

        base64Encode: str => gs.base64Encode(str),

        base64Decode: str => gs.base64Decode(str)

    };

    return {
        action: input.action,
        request: input,
        result: InsightsUtil[input.action](input.payload)
    };
}
