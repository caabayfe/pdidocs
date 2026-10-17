function transform(input) {
    try {
        var result = sn_one_extend.GenerativeAIUtility.getGeoRoutingDetails();
        result = typeof result === "string" ? JSON.parse(result) : result;
        return result.geoRoutingEnabled;
    } catch (error) {
        gs.error("Failed to fetch geo routing details :" + error.toString());
        return error.toString();
    }
}
