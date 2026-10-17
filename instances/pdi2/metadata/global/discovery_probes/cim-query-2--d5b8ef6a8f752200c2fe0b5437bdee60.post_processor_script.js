ArrayPolyfill;
ObjectPolyfill;

/*
 * Use CimQuery to query an SMI-S server for storage array information and
 * extract the data we're interested in.
 * I try to keep the result data as small as possible.  Even so, I've seen
 * response payloads up to about 1 MB long.  Extremely large arrays may
 * require additional optimization.
 */
(function() {

var json, maxPayload,
	protocol = 'https',
	port = 5989,
	instanceXml = CimQuery.getInstanceXml('' + probe.getParameter('instance')),
	queries = '' + probe.getParameter('queries'),
	result = [ ],
	output = { result: result, errors: [ ] },
	url = (probe.getParameter('source') + '').split(':');

	if (url.length == 3) {
		protocol = url[0];
		port = url[2];
		url = url[1].split('//')[1];
	} else if (url.length == 2) {
		if (url[1].indexOf('//') == 0) {
			protocol = url[0];
			url = url[1].split('//')[1];
			if (protocol.toLowerCase() == 'http')
				port = 5988;
		} else {
			port = url[1];
			url = url[0];
			if (port == 5988)
				protocol = 'http';
		}
	}

	queries = [ JSON.parse('' + queries) ];
	queries[0].result = result;


	// Execute the queries defined above
	output.profile = CimQuery.query({
		url: protocol + '://' +  url + ':' + port,
		credIterator: probe.getCredentials('cim'),
		namespace: probe.getParameter('namespace'),
		probeId: probe.getParameter('sys_id'),
		queries: queries,
		reportProgress: true,
		// Try to get the parameter.  getParameter() returns null if the
		// parm doesn't exist - make sure we have something useful (with the ||
		// operator) and then convert whatever we have from a Java string to
		// the right JavaScript type.
		timeout: probe.getIntParameter('cimquery.timeout') || 15 * 60 * 1000,
		debug: probe.getBooleanParameter('cimquery.debug'),
		debugXmlRequest: probe.getBooleanParameter('cimquery.show.xml.request'),
		debugXmlResponse: probe.getBooleanParameter('cimquery.show.xml.response'),
		debugJsonResponse: probe.getBooleanParameter('cimquery.show.json.response'),
		chunkSize: +probe.getIntParameter('chunkSize') || 1,
		limit: +probe.getIntParameter('limit') || 0,
		writeProgress: true,
		errorHandler: errorHandler,
		msgHandler: msgHandler
	});

	maxPayload = getProperty('MAX_DISCOVERY_PAYLOAD_SIZE') || 5000000;
	json = JSON.stringify(output);
	if (json.length > maxPayload) {
		output.result = { Name: 'Content too long', ContentLength: json.length, MaxPayload: maxPayload };
		json = JSON.stringify(output);
	}
	probe.setPostProcessOutput(json);

/*
 * Handler for errors from CimQuery script include
 */
function errorHandler(msg) {
	if (typeof msg == 'object')
		output.errors.push(msg);
	else
		output.errors.push({ message: msg });

	ms.log('Got error: ' + JSON.stringify(output));
}

function msgHandler(msg) {
	output.msgs = output.msgs || [ ];
	output.msgs.push(msg);
}

/*
 * Get a MID server property
 */
function getProperty(name) {
	var MIDConfigParameter = Packages.com.snc.commons.MIDConfigParameter;
	var config = Packages.com.service_now.mid.services.Config.get();

	if (config.isPropertyDefined(MIDConfigParameter[name]))
		return config.getIntProperty(MIDConfigParameter[name]);
}

})();
