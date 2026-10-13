function(cidata, result, scanner, status, midServer, sensor) { 
	if (!gs.nil(scanner.contents.InteropSchemaNamespace)) 
		cidata.getData().interopNamespace = scanner.contents.InteropSchemaNamespace;
} 
