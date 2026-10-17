(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	// Checking if TLS is enabled b/w LB and app-nodes 
	var inboundTLSEnabled = gs.getProperty("tomcat.connector.main.SSLEnabled") == "true" || gs.getProperty("tomcat.connector.secure.SSLEnabled") == "true";	

    // implement resource here
	response.setBody({
		inboundTLSEnabled: inboundTLSEnabled,
	});
	response.setStatus(200);
})(request, response);
