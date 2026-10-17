(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const LOG = new Logger(`GET:/api/sn_udc/v1/applications`);
    try {
        const params = UDCUtil.assign({},
            UDCUtil.normalizeQueryParams(request.queryParams)
        );
        const validatedQueryParams = ApplicationService.validateQueryParams(params);
        return ApplicationService.getApplicationList(validatedQueryParams);
    } catch (error) {
        LOG.error(`Failed to send application list: ${error.toString()}`);
        return response.setError(new sn_ws_err.BadRequestError(error.toString()));
    }
})(request, response);
