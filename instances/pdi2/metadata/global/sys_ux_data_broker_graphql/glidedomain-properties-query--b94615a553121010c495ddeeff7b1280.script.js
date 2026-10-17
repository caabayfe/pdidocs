(function buildQuery(query, inputs) {
    var properties = (inputs.properties || "").trim().split(",");	  
    query.append("{\r\n  GlideDomain_Query {\r\n");
	for (var i = 0; i < properties.length; i++) {
		var property = properties[i].trim();
		var prefix = "    property_" + i + ": ";
		var fragment = prefix + "property(name: \"" + property + "\") {\r\n" +
			"      name\r\n" +
			"      isDefined\r\n" +
			"      value\r\n" +
			"      intValue\r\n" +
			"      booleanValue\r\n" + 			
			"    }\r\n";
		query.append(fragment);
	}
    query.append("  }\r\n}");	
})(query, inputs);
