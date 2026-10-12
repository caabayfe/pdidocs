(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	gs.log('==== get CIs by type');
	var result={};
	result.result=[];
	var domain = "";

	var bsId = request.queryParams["bs_id"][0];	
	var searchText = request.queryParams["text"][0];
	var type = request.queryParams["type"][0];
	var filterCIsStr  =request.queryParams["filter"];

	var limit = gs.getProperty("glide.ngbsm.search_ci_limit");
	limit=limit ? limit : 10;

	var domainProvider = new CiDomainIdProvider();
	domain = domainProvider.getDomainId(bsId);

	var gr = new GlideRecord(type);

	var filterCIsList = "";
	if (filterCIsStr && filterCIsStr.length > 0){
		for (var i = 0; i < filterCIsStr.length; i++) {
			filterCIsList += (filterCIsStr[i]) + ",";
		}
	}
	filterCIsList += bsId;
	gr.addQuery("sys_id","NOT IN", filterCIsList);

	var dh = new SNC.DomainHelper();
	gs.log("Domain of business service is " + domain);
	if (dh.isDomainPluginInstalled()) {
		gr.addQuery('sys_domain', domain);
	}

	gr.addQuery("name" , "CONTAINS", searchText);

	var bsManager = new SNC.BusinessServiceManager();
	var blackListedDerivedClasses = bsManager.getBlacklistedDerivedClasses(type);
	if (blackListedDerivedClasses) {
		var blackListedDerivedClassesArray =  blackListedDerivedClasses.split(',');
		gr.addQuery('sys_class_name', 'NOT IN', blackListedDerivedClassesArray);
	}

	// Bring only CI of the specific class
	gr.addQuery('sys_class_name', type);

	gr.setLimit(limit);

	gr.query();
	while(gr.next()){
		var obj={};
		obj.sys_id=gr.getValue("sys_id");
		obj.name=gr.getDisplayValue();

		result.result.push(obj);
	}

	return result;
})(request, response);
