(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var manager = new sn_svcerr.ErrorMgrScript();
	
	return manager.countUnclassifiedErrors();

})(request, response);
