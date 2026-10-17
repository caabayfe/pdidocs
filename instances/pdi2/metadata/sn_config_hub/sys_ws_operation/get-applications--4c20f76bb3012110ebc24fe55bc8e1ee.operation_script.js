(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const productId = request.queryParams?.product && request.queryParams.product.length > 0 ? request.queryParams.product[0] : null;

    /**
     * applications[] is an array of applications coming from the Frontend. When passing an array as query string, the API will create a request
     * as: .../config/applications?applications[]=1163fa730f102010e8c940c1df767e8c&applcations[]=3a606699c931211001ff2ef35f8ede98
     */
    const packageIds = request.queryParams['applications[]'] ? request.queryParams['applications[]'] : null;

    let configurationHubUtil = new ConfigurationHubUtil();

    let resultApplications = [];

    if (productId)
        resultApplications = configurationHubUtil.getApplicationsLabel(configurationHubUtil.getProductApplicationsPackageIds(productId));

    let visitedApplicationsSet = new Set(resultApplications.map(app => app.id));
    let packageIdIndex = 0;
    while (packageIds && packageIds[packageIdIndex]) {
        let packageId = packageIds[packageIdIndex];
        if (!visitedApplicationsSet.has(packageId))
            resultApplications.push(...configurationHubUtil.getApplicationsLabel([packageId]));

        packageIdIndex++;
    }

    result = {
        product: productId,
        applications: resultApplications
    };

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
