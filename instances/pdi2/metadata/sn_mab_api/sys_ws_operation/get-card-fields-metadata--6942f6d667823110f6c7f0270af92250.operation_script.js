(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

      var viewConfigSysId = request.pathParams.viewConfigSysId;
    	var viewTemplateSysId = Array.isArray(request.queryParams.viewTemplateSysId) 
                            ? request.queryParams.viewTemplateSysId[0] 
                            : request.queryParams.viewTemplateSysId;
      var viewConfigTable = Array.isArray(request.queryParams.viewConfigTable) 
                          ? request.queryParams.viewConfigTable[0] 
                          : request.queryParams.viewConfigTable;
    	var viewConfigMetadata = new sn_mab_api.ViewConfigMetadata(viewConfigSysId);
    	return viewConfigMetadata.getElementAttributeFieldMetadata(viewTemplateSysId, viewConfigTable);
  
    })(request, response);
