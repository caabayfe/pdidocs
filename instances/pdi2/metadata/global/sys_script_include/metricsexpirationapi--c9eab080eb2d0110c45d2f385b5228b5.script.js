var MetricsExpirationAPI = Class.create();

MetricsExpirationAPI.SA_METRIC_MAP = "sa_metric_map";

/*
 * Given a list of metric sys_ids, update the Expiration date field of these records in the sa_metric_map table.
 * sysIdList = "metric1_sys_id, metrc2_sys_id, ..."
 */
MetricsExpirationAPI.updateMetricsExpirationDate = function(sysIdList) {
    var glideTime = new GlideDateTime();
    // The default is to advance the Expiration date in 5 days (= 7200 minutes)
    var advanceExpirationMin = gs.getProperty("sa.metric.map.advance.expiration.min", 7200);
    var advanceExpirationMilli = advanceExpirationMin * 60000; // Convert minutes to milliseconds
    glideTime.add(advanceExpirationMilli);

    try {
        var currentTime = new GlideDateTime();
        var updateMetricsExpGr = new GlideMultipleUpdate(MetricsExpirationAPI.SA_METRIC_MAP);
        updateMetricsExpGr.addQuery("sys_id", "IN", sysIdList);
        updateMetricsExpGr.setValue("expiration", glideTime.getDisplayValue());
        updateMetricsExpGr.setValue("sys_updated_on", currentTime);
        updateMetricsExpGr.setValue("updated_on_milliseconds", currentTime.getNumericValue() + "");
        updateMetricsExpGr.execute();
        return null;
    } catch (e) {
        return e;
    }
};

MetricsExpirationAPI.prototype = {
    type: 'MetricsExpirationAPI'
};
