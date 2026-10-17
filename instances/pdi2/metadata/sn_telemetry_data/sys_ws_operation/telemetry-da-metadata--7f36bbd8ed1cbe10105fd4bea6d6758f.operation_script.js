(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const body = request.body?.data;
    const {
        configuration: {
            payload: {
                metric_attribute_value,
                MetricName,
                observability,
                ServiceName,
                filterId
            }
        },
        selectedValues,
        maxNbRecords,
        search
    } = body;
    return new TelemetryDAMetadataHandler().getMetadata({
        metric_attribute_value,
        MetricName,
        observability,
        ServiceName,
        filterId,
        selectedValues,
        maxNbRecords,
        search
    });

})(request, response);
