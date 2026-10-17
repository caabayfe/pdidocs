function transform(input) {
    // Get the route maps from the associated route config
    function getMapping(mappingGroup, resultMap) {
        var mappings = mappingGroup.mappings;
		var table = mappingGroup.table;
		
		// there has to be a table (null value for default) and a payload to map to.
		if (!table || !mappings)
			return '';
		
        mappings.forEach(function(mapping) {
            var map = {};
			var source_component = mapping.source_key;
			var payload = mapping.payload;
			
            // If there is a table value passed in, build a map object that has the table's name as key,
            // and payload under it.
			map[source_component] = {
                payload: mapping.payload,
            };

            // Now add the table map, or default payload to the source_component (matches elementId in event) 
            // object. 
            // If the elementId object already exists, add to it to support multiple table definitions; otherwise create it.
            if (resultMap[table])
                resultMap[table][source_component] = map[source_component];
            else resultMap[table] = map;
        });
        return resultMap;
    }

    // Get the route configs from the associated query
    function getConfig(gql) {
        var result = {};
        var mappingGroups = gql.data.GlideUxDynamicRoute_Query.dynamicRouteConfig.mappingGroups;

        // Handle multiple config records if there are any passed in.
        mappingGroups.forEach(function(mappingGroup) {
            result = getMapping(mappingGroup, result);
		});
        return result;
    }
    // Return the filled out route map for client scripts to use.
	if(input.gqlData) 
		return getConfig(input.gqlData);
	
	return noop;
}
