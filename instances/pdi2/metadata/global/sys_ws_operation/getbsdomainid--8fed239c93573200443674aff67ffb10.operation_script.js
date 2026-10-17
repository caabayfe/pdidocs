(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var params =   request.queryParams;
	var bsId = String(params["bs_id"][0]);
	
	var domainProvider = new CiDomainIdProvider();
	var domain = domainProvider.getDomainId(bsId);
	return String(domain);

})(request, response);
