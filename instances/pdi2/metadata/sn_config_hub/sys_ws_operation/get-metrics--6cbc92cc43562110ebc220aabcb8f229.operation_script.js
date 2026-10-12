(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const METRIC_TYPE = {
        RELEASE_INFO: 'release_info',
        SUBSCRIPTION_STATUS: 'subscription_status',
        PERFORMANCE_DATA: 'performance_data'
    };

    const metricType = request.queryParams?.type[0] ? request.queryParams.type[0] : null;
    const packageIds = request.queryParams?.packageIds[0] ? request.queryParams.packageIds[0] : null;
    const result = getMetric(metricType, packageIds);

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

    function getMetric(metricType, packageIds) {
        if (!metricType || !packageIds)
            return {};

        let configurationHubUtil = new ConfigurationHubUtil();
        let metricData;

        switch (metricType) {
            case METRIC_TYPE.RELEASE_INFO:
                metricData = configurationHubUtil.getCustomizedMetric(packageIds);
                break
            case METRIC_TYPE.SUBSCRIPTION_STATUS:
                metricData = configurationHubUtil.getSubscriptionData(packageIds);
                break;
            case METRIC_TYPE.PERFORMANCE_DATA:
                metricData = configurationHubUtil.getPerformanceData(packageIds);
                break;
        }

        return {
            type: metricType,
            data: metricData
        };
    }
})(request, response);
