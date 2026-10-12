(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {};
	var pathParamsVar = request.pathParams;
	var mapId = pathParamsVar.id;
	
	var requestbodyDataObj = request.body.data;
	var filterItemVals = {};
	if (JSUtil.notNil(requestbodyDataObj) && JSUtil.notNil(requestbodyDataObj.f_item_val)) {
		filterItemVals = requestbodyDataObj.f_item_val;
	}
	
	var mapInputData = {};
	if (JSUtil.notNil(requestbodyDataObj) && JSUtil.notNil(requestbodyDataObj.mapInputData)) {
		mapInputData = requestbodyDataObj.mapInputData;
	}
	
	result = global.SNMapHelper.getMapData(mapId, filterItemVals, mapInputData);
	if (result) {
		response.setContentType('application/json');
		response.setBody(result);
	}
})(request, response);
