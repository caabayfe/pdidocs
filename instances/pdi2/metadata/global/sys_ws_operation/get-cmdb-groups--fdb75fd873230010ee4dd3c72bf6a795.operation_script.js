(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	var queryParams = request.queryParams;
	var savedGroupSysId = queryParams.custom_query[0];
	var term = queryParams.term[0];
	var grs = new GlideRecordSecure("cmdb_group");
	grs.addEncodedQuery("group_nameSTARTSWITH" + term);
	if(queryParams.encoded_query){
		grs.addEncodedQuery(queryParams.encoded_query);
	}
	grs.query();
	
	var groups = {};
	var groupsArr = [];
	while(grs.hasNext()){
		grs.next();
		groups[grs.getValue("sys_id")] = grs.getValue("group_name");
		// If there is a saved group in this application service do not filter it out
		if (!savedGroupSysId || savedGroupSysId !== grs.getValue("sys_id"))
			groupsArr.push(grs.getValue("sys_id"));
	}
	
	//check for groups that are already used
	var grG = new GlideRecord("cmdb_ci_query_based_service");
	grG.addQuery("cmdb_group", groupsArr);
	grG.query();
	
	while(grG.hasNext()){
		grG.next();
		delete groups[grG.getValue("cmdb_group")];
	}
	
	var groupKeys = Object.keys(groups);
	
	for(var i=0; i<groupKeys.length; i++){
		result.push({sys_id: groupKeys[i], name: groups[groupKeys[i]]});
	}

	response.setStatus(200);
	response.setBody(result);
	
})(request, response);
