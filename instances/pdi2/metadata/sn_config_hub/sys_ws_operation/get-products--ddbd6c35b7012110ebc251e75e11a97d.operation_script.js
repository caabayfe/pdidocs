(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    function hasApplications(dfcProductSysId) {
        let dfcApplicationGr = new GlideRecord('sn_dfc_application');
        dfcApplicationGr.addQuery('product', dfcProductSysId);
        dfcApplicationGr.query();
        while (dfcApplicationGr.next()) {
            let sysPackageGr = new GlideRecord('sys_package');
            sysPackageGr.addQuery('source', dfcApplicationGr.getValue('package_id'));
            sysPackageGr.query();
            if (sysPackageGr.hasNext())
                return true;
        }
		
        return false;
    }

    const sysId = request.queryParams?.sysId ? request.queryParams.sysId : null;
    let products = [];

    let dfcProductGr = new GlideRecord('sn_dfc_product');
    
    if (sysId && sysId.length > 0)
        dfcProductGr.addQuery('sys_id', 'IN', sysId.join(','));
    
    dfcProductGr.orderBy('name');
    dfcProductGr.query();

    while (dfcProductGr.next()) {
        let dfcProductSysId = dfcProductGr.getValue('sys_id');
        if (hasApplications(dfcProductSysId))
            products.push({
                id: dfcProductSysId,
                label: dfcProductGr.getDisplayValue('name')
            });
    }

    result = {
        products: products
    };

    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

})(request, response);
