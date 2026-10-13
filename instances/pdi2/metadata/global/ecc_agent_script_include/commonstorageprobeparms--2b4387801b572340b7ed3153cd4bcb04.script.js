var CommonStorageProbeParms;

(function() {

	CommonStorageProbeParms = { getParms: getParms };

	function getParms(queries, errorHandler, multipleOperationsSupported) {
		var json,
			result = [ ],
			output = { result: result, errors: [ ] },
			protocol = probe.getParameter('schema'),
			port = probe.getParameter('port'),
			url = (probe.getParameter('source') + '').split(':'),
			chunkSize = probe.getParameter('chunk_size') || probe.getParameter('chunkSize'),
			useFastXmlParser = probe.getParameter('cimquery.fastxmlparse'),
			stripXml = probe.getParameter('cimquery.reducexml');

		multipleOperationsSupported = multipleOperationsSupported || probe.getParameter('multipleOperationsSupported');

		// chunkSize isn't initialized with a default value to avoid a call to eval().
		// The default value is provided when the return value is constructed.
		if (!multipleOperationsSupported || (multipleOperationsSupported.toLowerCase() != 'true'))
			chunkSize = 1;
		else if (chunkSize) {
			try {
				chunkSize = eval('' + chunkSize);
			} catch (e) {
				errorHandler && errorHandler('Error in chunkSize: ' + e.toString());
			}
		}

		// Try to get protocol, host & port from url
		if (url.length == 3) {
			protocol = url[0];
			port = url[2];
			url = url[1].split('//')[1];
		} else if (url.length == 2) {
			if (url[1].indexOf('//') == 0) {
				protocol = url[0];
				url = url[1].split('//')[1];
			} else {
				port = url[1];
				url = url[0];
			}
		} else
			url = url[0];

		// Set port & protocol as needed
		if (!port) {
			protocol = protocol || 'https';
			port = 5989;
			if (protocol == 'http')
				port = 5988;
		} else if (!protocol) {
			protocol = 'https';
			if (port == 5988)
				protocol = 'http';
		}

		return {
			url: protocol + '://' +  url + ':' + port,
			credIterator: probe.getCredentials('cim'),
			namespace: probe.getParameter('namespace'),
			probeId: '' + probe.getParameter('sys_id'),
			queries: queries,
			reportProgress: probe.getParameter('cimquery.show.progress') || false,
			// Try to get the parameter.  getParameter() returns null if the
			// parm doesn't exist - make sure we have something useful (with the ||
			// operator) and then convert whatever we have from a Java string to
			// the right JavaScript type.
			timeout: probe.getIntParameter('cimquery.timeout') || 15 * 60 * 1000,
			debug: probe.getBooleanParameter('cimquery.debug'),
			debugXmlRequest: probe.getBooleanParameter('cimquery.show.xml.request'),
			debugXmlResponse: probe.getBooleanParameter('cimquery.show.xml.response'),
			debugJsonResponse: probe.getBooleanParameter('cimquery.show.json.response'),
			chunkSize: chunkSize || 1,
			limit: +probe.getIntParameter('limit') || 0,
			errorHandler: errorHandler,
			useFastXmlParser: (useFastXmlParser && useFastXmlParser.toLowerCase() == 'true') || false,
			stripXml: (stripXml && stripXml.toLowerCase() == 'true') || false
		};
	}

})();
