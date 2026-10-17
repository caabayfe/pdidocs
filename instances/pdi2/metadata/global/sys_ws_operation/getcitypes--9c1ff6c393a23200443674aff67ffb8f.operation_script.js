(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	//System exclusion List
	var manager = new global.CreateOrUpdateITService() ;
	var systemExclusionList = manager.retrieveSystemExcludeList();

	//Returns true if typeName appears in the excludeList list
	var checkIfInList = function(excludeList, typeName) {
		var iterator = excludeList.iterator();
		while (iterator.hasNext()) {
			var parentInstanceName = iterator.next();
			var test =  GlideDBObjectManager.get().isInstanceOf(typeName,parentInstanceName);
			if (test) {
				return true;
			}
		}

		return false;
	};

	//sorts two types according to their label (ascending)
	var comperator = function(typeA, typeB) {
		var typeLC_a = typeA.label.toLowerCase();
		var typeLC_b = typeB.label.toLowerCase();
		if (typeLC_a < typeLC_b){
			return -1;
		} else if (typeLC_a > typeLC_b){
			return  1;
		} else {
			return 0;
		}
	};


	//used to allow only a specific type
	var expectedTypeSource = request.queryParams["expectedType"];

	var expectedType = null;
	if (expectedTypeSource) {
		expectedType= expectedTypeSource;
	}


    // implement resource here
	var ciClasses = [];
    var children = GlideDBObjectManager.get().getAllExtensions("cmdb_ci");

    for (var index = 0; index < children.size(); index++) {
		var retJson = {};
		var typeName = children.get(index);

		var isInSystemExclusionList = checkIfInList(systemExclusionList, typeName);
		if (isInSystemExclusionList) {
			continue;
		}

		var isExpectedType = (!expectedType) || (typeName == expectedType);
		var isDirectConfigurationItem = (typeName == "cmdb_ci");
		if (isExpectedType && !isDirectConfigurationItem){
			retJson.id = typeName;
			retJson.name = typeName;
			var tableDesc = GlideTableDescriptor.get(typeName);
			retJson.label =  tableDesc.getLabel();
			retJson.sys_id = tableDesc.getUniqueID();
			ciClasses.push(retJson);
		}
	}
	return ciClasses.sort(comperator);
})(request, response);
