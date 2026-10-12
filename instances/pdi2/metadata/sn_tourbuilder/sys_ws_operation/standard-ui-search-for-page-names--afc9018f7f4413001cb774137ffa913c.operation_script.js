(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var apn = new sn_tourbuilder.AJAXAppPageNames();
	var name = request.queryParams.sysparm_name || '';
	var limit = Number(request.queryParams.sysparm_limit) || 20;
	var offset = Number(request.queryParams.sysparm_offset) || 0;
	
	var res = apn.getPlatfromPageNames({name:name, limit:limit, offset:offset});
	if(res.data && res.data.length){
		response.setBody(res);
		response.setStatus(200);
	}else{
		response.setBody({data:[],totalRecords:0});
		response.setStatus(200);
	}

})(request, response);
