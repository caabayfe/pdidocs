(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        const {
            id,
        } = request.queryParams;
        new UXAQueryBuilderConfigurationService().deleteNonUserQBPreference(id[0]);
        response.setStatus(200);
        response.setBody({
            message: 'Success'
        });
    } catch {
        response.setStatus(500);
        response.setBody({
            message: 'Error while deleteing data'
        });
    }

})(request, response);
