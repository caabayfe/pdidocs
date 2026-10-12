(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    let result = {
        companyKey: '',
        companyName: ''
    };

    try {
        const vendorInfo = new sn_appauthor.ScopedAppVendorInfoObtainer().obtainFromAppRepo();

        result.companyKey = vendorInfo.key || '';
        result.companyName = vendorInfo.name || '';
    } catch (e) {
        const message = gs.getMessage('Unable to get vendor information. Failed with error - {0}', e.message);
        gs.error(message);
        
		throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage(message);
    }

    response.setBody(result);
    response.setStatus(200);


})(request, response);
