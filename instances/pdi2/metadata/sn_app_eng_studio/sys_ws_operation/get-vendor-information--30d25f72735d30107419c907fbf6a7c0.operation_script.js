(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var result = {
        companyKey: '',
        companyName: ''
    };

    try {
        var vendorInfo = new sn_appauthor.ScopedAppVendorInfoObtainer().obtainFromAppRepo();

        result.companyKey = vendorInfo.key || '';
        result.companyName = vendorInfo.name || '';
    } catch (e) {
        var message = gs.getMessage('Unable to get vendor information. Failed with error - {0}', e.message);
        gs.error(message);
        
		throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage(message);
    }

    response.setBody(result);
    response.setStatus(200);


})(request, response);
