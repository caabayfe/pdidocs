(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var manager = new sn_svcerr.ErrorMgrScript();
	
	return manager.retryUnclassifiedErrors();

})(request, response);
