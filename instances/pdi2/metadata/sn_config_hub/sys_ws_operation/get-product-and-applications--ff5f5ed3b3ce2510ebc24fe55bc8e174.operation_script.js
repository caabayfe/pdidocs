(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    let product = request.queryParams.product ? request.queryParams.product[0] : null;
    let scopes = request.queryParams.scopes ? JSON.parse(request.queryParams.scopes) : [];
    let packageIds = request.queryParams.packageIds ? JSON.parse(request.queryParams.packageIds) : [];
    let bestProductMatch = product;

    let resultProduct = null;
    let configurationHubUtil = new ConfigurationHubUtil();

    let allPackagesIds = configurationHubUtil.getPackageIds(product, scopes, packageIds);

    // Preparing packageIds when only an application is requested
    let productPackageIds = [];
    if (allPackagesIds.length >= 1 && !product) {

        // Selecting best product match
        let bestProductMatchSet = new Set();
        for (let packageId of allPackagesIds) {
            let matchedProduct = configurationHubUtil.getBestProductMatch(packageId);
            if (bestProductMatchSet.has(matchedProduct)) {

                // If packages belong to different products, we use default product
                bestProductMatch = configurationHubUtil.getDefaultProductSysId();
                break;
            }
            bestProductMatchSet.add(matchedProduct);
            bestProductMatch = matchedProduct;
        }
        productPackageIds = configurationHubUtil.getProductApplicationsPackageIds(bestProductMatch);

        // add application if not already part of the product
        let allPackageIdsSet = new Set([...allPackagesIds, ...productPackageIds]);
        allPackagesIds = Array.from(allPackageIdsSet);
    }

    if (bestProductMatch)
        resultProduct = configurationHubUtil.getProduct(bestProductMatch);

    const sortByText = (a, b) => {
        const textA = (a || '').toLowerCase();
        const textB = (b || '').toLowerCase();
        if (textA < textB)
            return -1;

        if (textA > textB)
            return 1;

        return 0;
    };

    let applications = configurationHubUtil.getApplicationsStore(allPackagesIds);
    applications.sort((applicationA, applicationB) => sortByText(applicationA.label, applicationB.label));

    let result = {
        applications,
        product: resultProduct,
        showLogCard: gs.getProperty('sn_config_hub.errorslogs.card.visible', 'true')
    };

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
