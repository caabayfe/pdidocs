(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const filterId = request?.queryParams?.filterId[0];
    if (filterId) {
        const payload = {
            "UXAFilterId": filterId
        };
        const params = {
            configuration: {
                payload
            },
            selectedValues: [],
            maxNbRecords: null,
            nextRecordIdx: null,
            search: null,
            sort: null
        };
        const filterData = new UXAHandler().handleMetadataRequest(params);
        response.setStatus(200);
        response.setBody({
            "value": filterData?.value?.availableElements
        });
    }

})(request, response);
