var getEntryPointTypes = Class.create();
getEntryPointTypes.prototype = {
	process: function(){
		
		var dbom = GlideDBObjectManager.get();
		var endPointTypes = dbom.getTableExtensions('cmdb_ci_endpoint');
		var inclusionEndpoints = dbom.getTableExtensions('cmdb_ci_endpoint_inclusion');
		
		var inclusionEndpointsMap = {};
		for (var i = 0; i < inclusionEndpoints.size(); i++) 
			inclusionEndpointsMap[inclusionEndpoints.get(i)] = true;
		inclusionEndpointsMap["cmdb_ci_endpoint_inclusion"] = true;
		
		var result = [];
		var curr;
		for (var j = 0; j < endPointTypes.size(); j++) {
			curr = endPointTypes.get(j);
			if (!inclusionEndpointsMap[curr])
				result.push('' + curr);
		}
		
		return result;
	},
	
	
	type: 'getEntryPointTypes'
};
