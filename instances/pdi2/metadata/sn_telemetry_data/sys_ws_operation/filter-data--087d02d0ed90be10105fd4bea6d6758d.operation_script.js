(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const params = request.queryParams;
    const {
        filterId,
        ServiceName,
        metric_attribute_value,
        MetricName,
        observability
    } = params;
    const requestFilterId = filterId && filterId[0];
    const requestServiceName = ServiceName && ServiceName[0];
    const requestMetricName = MetricName && MetricName[0];
    const requestObservability = observability && observability[0];
    return new TelemetryDAMetadataHandler().handleResolutionDataApi({requestFilterId, requestServiceName, requestMetricName, requestObservability});

})(request, response);
