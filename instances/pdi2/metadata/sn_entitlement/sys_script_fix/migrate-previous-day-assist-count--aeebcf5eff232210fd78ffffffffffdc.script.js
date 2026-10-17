var featureMap = getFeatureMap();
migrateCount(featureMap);

function getFeatureMap() {
    var featureMap = {};
    var featureMapGR = new GlideRecord("sys_gen_ai_feature_mapping");
    featureMapGR.query();
    while (featureMapGR.next()) {
        featureMap[featureMapGR.getValue("feature_name")] = featureMapGR.getUniqueValue();
    }
    return featureMap;
}

function migrateCount(featureMap) {
    var daysAgo = 400;
    var cutoffDate = new GlideDateTime();
    cutoffDate.addDaysUTC(-daysAgo);

    var defnGR = new GlideRecord("ua_defn_agg_data");
    defnGR.addQuery("sys_created_on", '>=', cutoffDate);
    defnGR.addQuery("agg_type", "sum");
    defnGR.orderByDesc("sys_created_on");
    defnGR.addQuery("definition_id", "DEFN2004047");
    defnGR.query();

    while (defnGR.next()) {
        var featureName = defnGR.getValue("group1");
        var featureSysID = featureMap[featureName];
        var assistCount = parseInt(defnGR.getValue("agg_val")) || 0;
        var accrualTime = defnGR.getValue("sys_created_on");
        var assistGR = new GlideRecord("now_assists_skills");
        assistGR.initialize();
        assistGR.setValue("feature", featureSysID);
        assistGR.setValue("lookback", "1");
        assistGR.setValue("used_assists", assistCount);
        assistGR.setValue("accrual_time", accrualTime);
        assistGR.insert();
    }
}
