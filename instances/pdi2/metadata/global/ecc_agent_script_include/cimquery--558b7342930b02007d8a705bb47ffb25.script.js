/* jshint -W030, -W014, -W061, -W054 */
// W030: Expected an assignment or function call and instead saw an expression
// W014: Bad line breaking
// W061: eval can be harmful
// W054: The Function constructor is a form of eval

var CimQuery;
// This is defined by automated tests to allow CimQuery to be tested
// without making network requests.  During normal execution the
// value of this variable will be undefined.
var mockHttpRequest;

/*
 * Standalone code to execute CIM queries against a CIM server.
 *   This code does its best to keep from stressing the memory on the MID
 * server.  The XML result is converted to a JS object and then discarded,
 * object identifiers are only kept until sub-queries are executed, etc.
 * Handlers are encouraged to discard CIM results (by truncating the array)
 * when they're no longer needed.
 */
(function() {

var cred,   // The current credential we're trying
	credIterator,   // A cred iterator.  Zeroed out to indicate that we've found the correct cred
	namespace,   // The CIM namespace
	namespaceXml,   // The CIM namespace formatted as XML
	timeout,   // The HTTP query timeout
	parms,   // Parameters passed to query()
	start,            // Start time (for collecting performance data)
	profile = getProfileObject(0),
	progressId = 1,   // Counter for progress messages.  Provides useful context when scanning logs
	HttpRequest = mockHttpRequest || Packages.com.glide.communications.HTTPRequest,
	StringReader = Packages.java.io.StringReader,
	InputSource = Packages.org.xml.sax.InputSource,
	xmlHelper = new XMLHelper(),
	messageId = 329194;   // Arbitrary value for CIM message ID

// Exported functions
CimQuery = {
	getInstanceXml: getInstanceXml,
	getInstanceJS: getInstanceJS,
	query: query,
	writeProgress: writeProgress
};

/*
 * Execute a list of CIM queries.
 *  parms.url: The URL (with port) of the CIM server
 *  parms.cred: The credential to use.
 *  parms.credIterator: A credential iterator.
 *  parms.namespace: The namespace to use
 *  parms.queries: An array of queries to execute
 *
 * Each query looks like: {
 *    name: Query name.  Used for debugging only.
 *    method: CIM method.  I've ony used GetInstance, EnumerateInstances,
 *                         EnumerateInstanceNames, Associators and AssociatorNames
 *    parms: Parameters to pass to the CIM method.  Sub-queries can pass 0 to cause the
 *           method to be called once with each result identifier of the parent query
 *    result: An array to contain the results.  Sub-queries don't need to include this -
 *            results will be attached to the parent object's 'associators' in this case.
 *    queries: Sub-queries to execute.
 *    handler: A handler to be called once when the query and all subqueries are complete
 *    handlerForEach: A handler to be called for each object when the query and all subqueries are complete
 * }
 *
 */
function query(p) {

	try {
		parms = p;
		credIterator = parms.credIterator;
		cred = parms.cred;
		// The default timeout is 1 hour.  This is pretty long, but:
		// (a) This is the transaction timeout.  There's a separate
		//     connection timeout (currently hardcoded as 5 seconds)
		// (b) We've already successfully communicated with the CIM
		//     server, so we know it's up and responsive
		// (c) We make some queries that are extremely slow - I've
		//     seen queries that took 20 minutes.
		timeout = +parms.timeout || 60 * 60 * 1000;

		queryList(parms.queries);
	} catch (e) {
		errorHandler({ message: e.toString(), parms: p }, e);
	}

	// These messages will be included in the result.  Remove them from the
	// profile so they're not included twice.
	profile.messages = undefined;

	profile.total_ms = profile.query_ms + profile.process_ms + (profile.multi_query_ms || 0) + (profile.multi_process_ms || 0);

	for (var name in profile) {
		var o = profile[name];
		if (typeof o == 'object' && o.dups) {
			profile.dup_save_ms = profile.dup_save_ms || 0;
			var time = o.query_ms + o.process_ms + (o.multi_query_ms || 0) + (o.multi_process_ms || 0);
			time /= o.query_count + (o.multi_query_count || 0);
			time *= o.dups;
			profile.dup_save_ms += time;
		}
	}
	profile.dup_save_ms = profile.dup_save_ms && parseInt(profile.dup_save_ms);
	return formatTimes(profile);
}


/*
 * queries: An array of queries to execute, as defined above
 * parentIdentifiers: Identifies the object to query against (subqueries only)
 * parentObjects: The results of a previous query (subqueries only)
 */
function queryList(queries, parentIdentifiers, parentObjects) {
	var chunkSize = parms.chunkSize || 1;

	if (parms.debug)
		writeProgress('Using chunk size of ' + chunkSize);

	queries.forEach(function(query) {
		var res, nextIdentifiers, nextObjs, current, identifierChunk, identifierNames, idName, identifier, now;

		try {
			if (!parentIdentifiers) {
				res = queryListChunk(query);
				nextIdentifiers = res[0].ids;
				nextObjs = res[0].objs;
				if (query.hasOwnProperty('result'))
					nextObjs.forEach(function(result) { query.result.push(result); });
			} else {
				current = 0;
				query.cache = query.cache || { };

				// Query for anything that's not in the cache
				while (current < parentIdentifiers.length) {
					identifierChunk = [ ];
					identifierNames = [ ];
					while (current < parentIdentifiers.length && identifierChunk.length < chunkSize) {
						identifier = parentIdentifiers[current];
						current++;
						idName = getObjectName(identifier);
						if (query.cache.hasOwnProperty(idName)) {
							addProfileScalar(query.name, 'dups', 1);
						} else {
							query.cache[idName] = undefined;
							identifierChunk.push(identifier);
							identifierNames.push(idName);
						}
					}

					if (identifierChunk.length)
						queryListChunk(query, identifierChunk, identifierNames);
				}

				nextObjs = [ ];
				nextIdentifiers = [ ];

				parentIdentifiers.forEach(
					function(identifier, idx) {
						var idName = getObjectName(identifier),
							object = parentObjects[idx],
							result = query.cache[idName],
							associations = [ ];

						if (!result)
							return;

						object.associations = object.associations || { };
						object.associations[query.name] = associations;

						if (parms.limit)
							result.objs.length = Math.min(result.objs.length, parms.limit);

						result.objs.forEach(
							function(entry, idx) {
								associations.push(entry);
								nextIdentifiers.push(result.ids[idx]);
								nextObjs.push(entry);
								if (query.hasOwnProperty('result'))
									query.result.push(entry);
							});
					});

				query.cache = undefined;
			}

			// Execute sub-queries
			if (query.queries && nextIdentifiers.length)
				queryList(query.queries, nextIdentifiers, nextObjs);

			now = new Date().getTime();

			// Execute handlers
			if (query.handler) {
				if (typeof query.handler == 'string')
					query.handler = eval(query.handler);

				if (parms.debug)
					writeProgress({ message: 'Calling handler ' + query.handler.name + ' on ' + nextObjs.length}, true);

				query.handler(nextObjs);
			}

			// Execute forEach() handlers
			if (query.handlerForEach) {
				if (typeof query.handlerForEach == 'string')
					query.handlerForEach = eval(query.handlerForEach);

				if (parms.debug)
					writeProgress({ message: 'Calling handlerForEach ' + query.handlerForEach.name + ' on ' + nextObjs.length}, true);

				nextObjs.forEach(query.handlerForEach);
			}

			addProfilePoint(query.name, 'handler_ms', now);
		} catch (e) {
			errorHandler({ message: 'Error on query ' + query.name + ': ' + e.toString(), query: query, objects: nextObjs, queryListChunkResponse: res }, e);
		}
	});

	// Make the query, process the results and stick them into the cache.
	function queryListChunk(query, parentIdentifiers, identifierNames) {
		var now;

		try {
			var response, prefix,
				results = [ ];

			now = start = new Date().getTime();

			setNamespace((parentIdentifiers && parentIdentifiers[0].namespace) || query.namespace || parms.namespace);

			// Make the query
			response = makeQuery(query, parentIdentifiers);

			prefix = parentIdentifiers && (parentIdentifiers.length > 1) ? 'multi_' : '';
			addProfileScalar(query.name, prefix + 'query_count', 1);
			addProfilePoint(query.name, prefix + 'query_ms', now);

			if (!response)
				throw "No response received to query " + query.name;

			now = new Date().getTime();

			addProfileScalar(query.name, 'process_count', 1);
			addProfileScalar(query.name, 'xml_size', response.length);
			addProfilePoint(query.name, 'getBody_ms');

			// Pull out identifiers and results
			results = processResult(query, response);

			// Stick the results in the cache
			identifierNames && identifierNames.forEach(
				function(name, idx) {
					query.cache[name] = results[idx];
				});

			addProfilePoint(query.name, 'cache_ms');
			addProfilePoint(query.name, prefix + 'process_ms', now, true);

			return results;

		} catch (e) {
			errorHandler({ message: 'Error on query ' + query.name + ': ' + e.toString(), query: query, identifiers: parentIdentifiers, response: encode(response) }, e);
			return [ ];
		}
	}
}

function encode(xml) {
	return xml.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/*
 * Execute a CIM query
 */
function makeQuery(query, object) {
	var responseTxt,
		request,   // HTTP request
		response,   // HTTP response
		status = 401,  // HTTP status.  Default to "unauthorized"
		xml = buildXml(query, object),   // Build the query XML
		retries = 0;

	if (!xml)
		return;

	addProfilePoint(query.name, 'buildXml_ms');

	while (status == 401) {

		// If we have a credIterator, we don't expect to have a valid cred
		if (credIterator) {
			if (!credIterator.hasNext())
				break;
			cred = credIterator.next();
		}

		if (retries++ > 10000) {
			errorHandler('Could not find credential.  Too many retries');
			return;
		}

		if (!cred)
			continue;

		addProfilePoint(query.name, 'retries_ms');

		if (parms.debug)
			writeProgress('Executing query ' + (query.name || ''));

		// Make the request
		request = new HttpRequest(parms.url + '/cimom');
		request.setHttpTimeout(timeout, 5000);
		request.setContentType('application/xml');
		request.addHeader('CIMOperation', 'MethodCall');
		request.addHeader('CIMProtocolVersion', '1.0');
		if ((object instanceof Array) && (object.length > 1))
			request.addHeader('CIMBatch', "CIMBatch");
		else {
			request.addHeader('CIMObject', namespace);
			request.addHeader('CIMMethod', query.method);
		}
		request.setBasicAuth(cred.getUsername(), cred.getPassword());
		if (parms.debugXmlRequest)
			writeProgress({ Request: xml });

		response = request.post(xml);

		status = response && response.getStatusCode();

		// Some CIM servers return HTTP 200 with 'Invalid Credential' in
		// the response body.  I will keep my opinion of this practice
		// to myself so as to avoid offending the offenders.
		if (response) {
			responseTxt = '' + response.getBody();
			if ((responseTxt.indexOf('Invalid Credential') > 0) || (responseTxt.indexOf('CIM_ERR_ACCESS_DENIED') > 0))
				status = 401;
		}
	}

	// We found a working credential - clear the iterator & return the response
	if ((status == 200) || ((object.length > 1) && (status == 207))) {
		if (parms.debug)
			writeProgress((query.name || 'Query') + ' succeeded');

		credIterator && credIterator.worked(parms.probeId);    // sys_id of probe
		credIterator = 0;

		return responseTxt;
	}

	// We tried all the credentials.
	if (status == 401)
		errorHandler('No credential would authenticate');
	else if (response) {
		// We got a response, but it wasn't success or authentication failure.
		// Report everything we can.
		errorHandler({ message: 'CIM query ' + query.name + ' failed'
					  + '\nError code: ' + response.getErrorCode()
					  + '\nError msg: ' + response.getErrorMessage()
					  + '\nStatus code: ' + status
					  + '\nHeaders: ' + response.getHeaders(),
					  postBody: xml,
					  response: responseTxt });
	} else
		errorHandler('' + request.getErrorMessage());
}

/*
 * Build the XML for a query
 *    This is pretty simplistic.  query.parms is an object containing
 * name/value pairs.  If the value is a string, the query gets
 *    <IPARAMVALUE NAME="name"><CLASSNAME NAME="value"/></IPARAMVALUE>
 * If the value is not a string, it's used as:
 *    <IPARAMVALUE NAME="name">value</IPARAMVALUE>
 * 'object' replaces any falsey parmameters (it's expected that there will
 * be at most one).  It can be an identifier returned from a previous query.
 */
function buildXml(query, object) {
	var xml,
		xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>' +
		'<CIM CIMVERSION="2.0" DTDVERSION="2.0">' +
		'<MESSAGE ID="' + (messageId++) + '" PROTOCOLVERSION="1.0">',
		xmlFooter = '</MESSAGE></CIM>';

	if ((object instanceof Array) && (object.length == 1))
		object = object[0];

	if (object instanceof Array) {
		xml = object.map(buildSimple);
		xml = '<MULTIREQ>' + xml.join('') + '</MULTIREQ>';
	} else
		xml = buildSimple(object);

	return xmlHeader + xml + xmlFooter;

	function buildSimple(object) {
		var name,   // name part of name/value pair in the query
			value,   // value part of the name/value pair
			instanceName,
			savedNamespace,
			returnXml,
			parms = query.parms,
			o = object,
			xml = [
				'<SIMPLEREQ>',
				'<IMETHODCALL NAME="' + query.method + '">',
				namespaceXml
			];

		if (query.method == 'GetInstance' || query.method == 'GetProperty') {
			instanceName = [ ];
			instanceName.push('<IPARAMVALUE NAME="InstanceName"><INSTANCENAME CLASSNAME="', parms.CreationClassName, '">');

			for (name in parms) {
				if (name.toLowerCase() == 'propertyname') {
					xml.push('<IPARAMVALUE NAME="' + name + '">' + parms[name] + '</IPARAMVALUE>');
					continue;
				}
				instanceName.push('<KEYBINDING NAME="' + name + '">');
				instanceName.push('<KEYVALUE VALUETYPE="string" TYPE="string">');
				instanceName.push(parms[name]);
				instanceName.push('</KEYVALUE></KEYBINDING>');

				returnXml = true;
			}
			instanceName.push('</INSTANCENAME></IPARAMVALUE>');
			instanceName = instanceName.join('');
			xml.push(instanceName);

			query.instanceName = xmlHelper.toObject(instanceName, true).INSTANCENAME;
		} else {
			if (!parms || !Object.keys(parms).length)
				returnXml = true;

			for (name in parms) {
				value = parms[name];
				if (value === undefined)
					continue;

				if (name.toLowerCase() == 'role') {
					xml.push('<IPARAMVALUE NAME="' + name + '" VALUE="' + value + '" />');
					returnXml = true;
					continue;
				}

				o = value || object;
				if (!o)
					continue;

				xml.push('<IPARAMVALUE NAME="' + name + '">');
				returnXml = true;

				if (typeof value == 'string')
					xml.push('<CLASSNAME NAME="' + value + '" />');
				else {
					// This hack is necessary because of a previous hack...
					// I added the namespace to the identifier because I didn't have an easy way to
					// save it otherwise.  According to the spec this should be OK (I think) - the
					// SMI-S server should simply ignore it.  Unfortunately, some SMI-S servers barf
					// when I include it in the IPARAMVALUE.  So this code removes it, generates the
					// XML for IPARAMVALUE and then puts the namespace back.
					savedNamespace = o.namespace;
					delete o.namespace;
					xml.push(xmlHelper.toXMLStr(o));
					o.namespace = savedNamespace;
				}
				xml.push('</IPARAMVALUE>');
			}
		}

		xml.push('</IMETHODCALL></SIMPLEREQ>');

		if (returnXml)
			return xml.join('');
	}
}

/*
 * Turn a CIM result into a meaningful JS object
 *    Another simplistic function.  We're only interested in simple properties, so we can ignore most types
 * defined in the CIM to XML mapping.  CimQL (the Java code this replicates) does something similar.
 * This code extracts simple values from a very wordy object that was created from XML. See
 * https://www.dmtf.org/sites/default/files/standards/documents/CIM_XML_Mapping20.html for a complete
 * description of the XML.
 *
 * Returns an array of objects.  (For a simple request this will be an array of length 1.)
 * Each object in the array is the response to a single query. These objects contain 'ids'
 * and 'objs'.  These are arrays of the same length where ids[n] is the identifier for objs[n]
 */
function processResult(query, body) {
	var msg,
		parsed,  // To save the parsed XML result
		instances,     // local variable to store object instances in the response
		results = [ ],
		// Create a new parser every time to (potentially) save memory.  
		// Yah, that makes sense...
		// The problem is that I don't know what state the parser might save after it's done
		// parsing.  Presumably any state would be discarded the next time I parse something, but
		// I want the memory back as quickly as possible
		parser = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance().newDocumentBuilder();

	addProfilePoint(query.name, 'createParser_ms');

	if (parms.debugXmlResponse)
		writeProgress({ Response: body });

	parsed = parser.parse(new InputSource(new StringReader(body)));
	// Ugh.  We're done with the parser.  Allow it to be garbage collected
	parser = 0;

	addProfilePoint(query.name, 'parseXml_ms');

	// Re-assign to body so the string can be thrown away
	body = body && xmlHelper.toObject(parsed, true);

	// xmlHelper saves the last XML string it parsed.  Why?  Who knows?
	// I would simply re-create a new xmlHelper on every call to processResult()
	// like I do with parser, but creating an xmlHelper takes close to 100ms.
	// Why?  Who knows?
	xmlHelper.xml = undefined;

	addProfilePoint(query.name, 'toJson_ms');

	if (body) {
		body = body && body.MESSAGE;

		try {
			if (parms.debugJsonResponse) {
				if (body.SIMPLERSP.IMETHODRESPONSE.IRETURNVALUE)
					writeProgress({ 'Return Value': body.SIMPLERSP.IMETHODRESPONSE.IRETURNVALUE });
				else if (body.MULTIRSP)
					writeProgress({ 'Return Value': body.MULTIRSP });
			}
		} catch (e) {
			writeProgress({ 'Return Value': body });
		}

		if (body && body.SIMPLERSP)
			results.push(processSimpleResponse(body.SIMPLERSP.IMETHODRESPONSE));
		else if (body && body.MULTIRSP)
			body.MULTIRSP.SIMPLERSP.forEach(function(simpleResp) { results.push(processSimpleResponse(simpleResp.IMETHODRESPONSE)); } );
	}

	addProfilePoint(query.name, 'simplify_ms');

	return results;

	// returns an object containing 'ids' and 'objs'.  These are arrays
	// of the same length where ids[n] is the identifier for objs[n]
	function processSimpleResponse(body) {
		var returnValue,
			identifiers = [ ],
			results = [ ],
			result = { ids: identifiers, objs: results };

		if (body.ERROR) {
			// The backendArray query is IBM-specific and will cause an error on
			// other storage servers.  Ignore these errors.  This means that we could
			// ignore real errors, but there's no other safe way to ignore the
			// expected errors.
			if (query.name == 'backendArrays')
				return result;

			// body.ERROR might be an object with only @CODE and @DESCRIPTION
			// or it might be a CIM_Error object
			if (body.ERROR['@DESCRIPTION'])
				msg = 'Error ' + body.ERROR['@CODE'] + ': ' + body.ERROR['@DESCRIPTION'];
			else {
				var err = simplify(body.ERROR, true);
				msg = 'Error ' + err.CIMStatusCode + ' (' + err.CIMStatusCodeDescription + '): ' + err.Message;
			}

			errorHandler({ message: msg, query: query, responseBody: body });
			return result;
		}

		// This could re-assign to body again, but there's not much baggage left
		returnValue = body && body.IRETURNVALUE;

		instances = returnValue
			&& (returnValue['VALUE.NAMEDINSTANCE'] 
				|| returnValue['VALUE.OBJECTWITHPATH'] 
				|| returnValue.OBJECTPATH 
				|| returnValue.INSTANCENAME 
				|| returnValue.INSTANCE);
		if (returnValue && !instances) {
			if (returnValue.CLASS)
				simplifyClass(returnValue);
		}

		if (instances) {
			if (instances instanceof Array)
				instances.forEach(function(instance) { simplify(instance); });
			else
				simplify(instances);
		}

		return result;

		// Extract values into the query results and identifiers into
		// the outer scope's variable 'identifiers'.
		function simplify(value, justProps) {
			var identifier,  // local variable to store the value's identifier
				identifierPath,
				instanceIdentifier,
				keys,   // keybinding names
				bindings,  // keyindings in the value's identifier
				instance = value.INSTANCE || value.INSTANCEPATH || value,
				properties = instance && instance.PROPERTY,
				arrays = instance && instance['PROPERTY.ARRAY'],
				references = (instance && instance['PROPERTY.REFERENCE']) || value.KEYBINDING,
				simple = { };   // Will contain the simplified object

			addProfileScalar(query.name, 'object_count', 1);

			// Extract properties, references and array properties.  These functions extract values
			// into the 'simple' variable in this scope.
			properties && properties.forEach(extractProperty);
			references && references.forEach(extractReference);
			arrays && arrays.forEach(extractArray);

			if (justProps)
				return simple;

			// Apply the filter if there is one
			if (typeof query.filter == 'string')
				query.filter = new Function('simplified', query.filter);
			if (query.filter && !query.filter(simple)) {
				addProfileScalar(query.name, 'filtered_count', 1);
				return;
			}

			// Extract the identifier and turn it into a string (string comparisons are
			// so much easier than object comparisons)
			identifier = value.INSTANCENAME || (value.INSTANCEPATH && value.INSTANCEPATH.INSTANCENAME) || (value.LOCALINSTANCEPATH && value.LOCALINSTANCEPATH.INSTANCENAME);
			identifier = identifier || query.instanceName;

			identifierPath = value.INSTANCEPATH || value.LOCALINSTANCEPATH;
			identifierPath = identifierPath && identifierPath.NAMESPACEPATH && identifierPath.NAMESPACEPATH.LOCALNAMESPACEPATH;
			identifierPath = identifierPath && identifierPath.NAMESPACE;
			if (identifierPath) {
				if (identifierPath instanceof Array)
					identifierPath = identifierPath.map(function(element) { return element['@NAME']; }).join('/');
				else
					identifierPath = identifierPath['@NAME'];
			}

			bindings = extractBindings(identifier);
			keys = Object.keys(bindings).sort();   // Sort the result - keys can be enumerated in any order.
			keys = keys.map(function(key) { return key + ':' + bindings[key]; } );
			keys = keys.join('*');
			if (keys)
				simple.identifier = keys;

			instanceIdentifier = { INSTANCENAME: identifier };
			if (identifierPath) {
				instanceIdentifier.namespace = identifierPath;
				simple.namespace = identifierPath;
			}

			results.push(simple);
			identifiers.push(instanceIdentifier);

			/* Extract a single simple property (into the 'simple' variable in the outer scope.)
			// Example XML for a property:
			//    <PROPERTY NAME="Caption"  PROPAGATED="true" TYPE="string">
			//      <VALUE>ONTAP_ConcretePool</VALUE>
			//    </PROPERTY>
			// Gets converted by xmlHelper to a JS object as:
			//  {
			//    "@NAME": 'Caption',
			//    "@PROPAGATED": 'true',
			//    "@TYPE": 'string',
			//    "VALUE": 'ONTAP_ConcretePool'
			//  }
			// Which sets this in 'simple':
			//    Caption: 'ONTAP_ConcretePool'
			*/
			function extractProperty(prop) {
				var value = prop.VALUE;
				if (value)
					simple[prop['@NAME']] = value; 			
			}

			/* Extract a reference into the 'simple' variable in the outer scope.  This is the identifier of a
			// different CIM element.  Example XML:
			// <KEYBINDING NAME="Antecedent">
			//   <VALUE.REFERENCE>
			//     <LOCALINSTANCEPATH>
			//       <LOCALNAMESPACEPATH>
			//         <NAMESPACE NAME="root"/>
			//         <NAMESPACE NAME="ibm"/>
			//       </LOCALNAMESPACEPATH>
			//       <INSTANCENAME CLASSNAME="IBMTSSVC_ProtocolController">
			//         <KEYBINDING NAME="CreationClassName">
			//           <KEYVALUE VALUETYPE="string">IBMTSSVC_ProtocolController</KEYVALUE>
			//         </KEYBINDING>
			//         <KEYBINDING NAME="DeviceID">
			//           <KEYVALUE VALUETYPE="string">000002006041C640:0</KEYVALUE>
			//         </KEYBINDING>
			//         <KEYBINDING NAME="SystemCreationClassName">
			//           <KEYVALUE VALUETYPE="string">IBMTSSVC_Cluster</KEYVALUE>
			//         </KEYBINDING>
			//         <KEYBINDING NAME="SystemName">
			//           <KEYVALUE VALUETYPE="string">000002006041C640:000002006041C640</KEYVALUE>
			//         </KEYBINDING>
			//       </INSTANCENAME>
			//     </LOCALINSTANCEPATH>
			//   </VALUE.REFERENCE>
			// </KEYBINDING>
			// Gets converted to a JS object as:
			// {
			//    "@NAME":"Antecedent",
			//    "VALUE.REFERENCE": {
			//      "LOCALINSTANCEPATH": {
			//        "INSTANCENAME": {
			//          "@CLASSNAME":"IBMTSSVC_ProtocolController",
			//          "KEYBINDING": [ {
			//              "@NAME":"CreationClassName",
			//              "KEYVALUE": {
			//                "#text":"IBMTSSVC_ProtocolController",
			//                "@VALUETYPE":"string"
			//              }
			//          }, {
			//            "@NAME":"DeviceID",
			//            "KEYVALUE": {
			//              "#text":"000002006041C640:0",
			//              "@VALUETYPE":"string"
			//            }
			//          }, {
			//            "@NAME":"SystemCreationClassName",
			//            "KEYVALUE": {
			//              "#text":"IBMTSSVC_Cluster",
			//              "@VALUETYPE":"string"
			//            }
			//          }, {
			//            "@NAME":"SystemName",
			//            "KEYVALUE": {
			//              "#text":"000002006041C640:000002006041C640",
			//              "@VALUETYPE":"string"
			//            }
			//          } ]
			//        },
			//        "LOCALNAMESPACEPATH":{
			//          "NAMESPACE":[ {
			//            "@NAME":"root"
			//          }, {
			//            "@NAME":"ibm"
			//          } ]
			//        }
			//      }
			//    }
			// }
			// Which sets this in 'simple':
			//    Antecedent: {
			//      CreationClassName: 'IBMTSSVC_ProtocolController',
			//      DeviceID: '000002006041C640:0',
			//      SystemCreationClassName: 'IBMTSSVC_Cluster',
			//      SystemName: '000002006041C640:000002006041C640'
			//	  }
			*/
			function extractReference(ref) {
				var val = ref['VALUE.REFERENCE'];

				val = val && (val.INSTANCEPATH && val.INSTANCEPATH.INSTANCENAME) || (val.LOCALINSTANCEPATH && val.LOCALINSTANCEPATH.INSTANCENAME);
				if (val.KEYBINDING)
					simple[ref['@NAME']] = extractBindings(val);
			}

			/* Extract keybindings, i.e. an object identifier
			// Unlike the other extractX() functions, this function returns the value (rather
			// than setting it as a property on 'simple' in the outer scope).  Example XML:
			//       <KEYBINDING NAME="CreationClassName">
			//         <KEYVALUE VALUETYPE="string">IBMTSSVC_ProtocolController</KEYVALUE>
			//       </KEYBINDING>
			//       <KEYBINDING NAME="DeviceID">
			//         <KEYVALUE VALUETYPE="string">000002006041C640:0</KEYVALUE>
			//       </KEYBINDING>
			//       <KEYBINDING NAME="SystemCreationClassName">
			//         <KEYVALUE VALUETYPE="string">IBMTSSVC_Cluster</KEYVALUE>
			//       </KEYBINDING>
			//       <KEYBINDING NAME="SystemName">
			//         <KEYVALUE VALUETYPE="string">000002006041C640:000002006041C640</KEYVALUE>
			//       </KEYBINDING>
			// Returns this:
			//  {
			//    CreationClassName: 'IBMTSSVC_ProtocolController',
			//    DeviceID: '000002006041C640:0',
			//    SystemCreationClassName: 'IBMTSSVC_Cluster',
			//    SystemName: '000002006041C640:000002006041C640'
			//	}
			*/
			function extractBindings(bindings) {
				var prop = { };
				bindings = bindings && bindings.KEYBINDING;
				if (bindings && !(bindings instanceof Array))
					bindings = [ bindings ];

				bindings && bindings.forEach(
					function(binding) {
						if (binding.KEYVALUE)
							prop[binding['@NAME']] = binding.KEYVALUE['#text'];
					});
				return prop;
			}

			/* Extract an array of values into the 'simple' variable in the outer scope.
			// Example XML:
			// <PROPERTY.ARRAY NAME="Dedicated" TYPE="uint16">
			//   <VALUE.ARRAY>
			//	   <VALUE>15</VALUE>
			//	   <VALUE>21</VALUE>
			//	  </VALUE.ARRAY>
			// </PROPERTY.ARRAY>
			// Sets this in 'simple':
			//  Dedicated: [ 15, 21 ]
			*/
			function extractArray(prop) {
				var values = prop['VALUE.ARRAY'],
					propName = prop['@NAME'],
					newValues = simple[propName] = [ ];

				if (!values)
					return;

				if (!(values instanceof Array))
					values = [ values ];
				values.forEach(function(value) { newValues.push(value.VALUE); });
			}
		}

		function simplifyClass(value) {
			var simple = { };
			value.CLASS.forEach(
				function(cls) {
					var props = { },
						refs = { },
						o = { properties: props, refs: refs };

					simple[cls['@NAME']] = o;
					o.qualifier = extractQualifiers(cls);

					cls.PROPERTY.forEach(
						function(p) {
							props[p['@NAME']] = extractQualifiers(p);
						});
					cls['PROPERTY.ARRAY'].forEach(
						function(p) {
							props[p['@NAME']] = extractQualifiers(p);
						});
					cls['PROPERTY.REFERENCE'].forEach(
						function(r) {
							refs[r['@NAME']] = extractQualifiers(r);
						});
					delete cls['@NAME'];
					delete cls.QUALIFIER;
					delete cls['PROPERTY.ARRAY'];
					delete cls['PROPERTY.REFERENCE'];
					writeProgress(Object.keys(cls));
				});

			results.push(simple);

			function extractQualifiers(o) {
				var qual = { };

				if (o.QUALIFIER instanceof Array)
					o.QUALIFIER.forEach(getQual);
				else
					getQual(o.QUALIFIER);

				return qual;

				function getQual(q) {
					var v = q.VALUE || '';
					v = v.replace(/\\n/g, '<br />').replace(/\\"/g, '"').replace(/\\'/g, "'");
					qual[q['@NAME']] = v;
				}
			}
		}
	}
}

/*
 * We need the namespace as a string (for an HTTP header) and also in an XML
 * representation.
 */
function setNamespace(ns) {
	var xml = ns.split('/').map(function(name) { return '<NAMESPACE NAME="' + name + '"/>'; });

	namespace = ns;
	namespaceXml = '<LOCALNAMESPACEPATH>' + xml.join('') + '</LOCALNAMESPACEPATH>';
}

/*
 * CimProbe passes the instance identifier in as a string that looks like:
 *   Clar_StorageSystem{CreationClassName='Clar_StorageSystem',Name='CLARiiON+APM00140416614'}
 * Get a JS object that xmlHelper will turn into the right XML to identify the instance.
 */
function getInstanceXml(instance) {
	var bindings = [ ],
		instanceName = { KEYBINDING: bindings },
		instanceXml = { INSTANCENAME: instanceName };

	instance = ('' + instance).split('{');
	instanceName['@CLASSNAME'] = instance[0];
	instance = instance[1].split(',');

	instance.forEach(extract);

	return instanceXml;

	function extract(val) {
		val = val.split('=');
		bindings.push({
			"@NAME": val[0],
			KEYVALUE: { "#text": val[1].split("'")[1] }
		});
	}
}

/*
 * Parse the 'instance' parameter into a JS object
 */
function getInstanceJS(instance) {
	var result = { },
		values = ('' + instance).split('{')[1].split(',');

	values.forEach(extract);

	return result;

	function extract(val) {
		val = val.split('=');
		result[val[0]] = val[1].split("'")[1];
	}
}

/*
 * A simple error handler.
 * Objects or strings are written as-is to agent log & cim_query2.
 * Only the "message" field of objects is sent to the error handler.
 */
function errorHandler(msg, e) {

	if (typeof msg == 'object') {
		msg.stack = (e && e.stack) || getStackTrace();
		writeProgress(msg);
		msg = msg.message || msg;
	}

	msg = removeCache(msg);

	profile.errors = profile.errors || [ ];
	profile.errors.push(msg);

	parms.errorHandler && parms.errorHandler(msg);
}

// The message might contain a query object and the query object
// might have cached data.  This causes way too much data to be
// logged, so we'll copy the object and remove any 'cache' members.
function removeCache(obj) {
	var str;

	if (obj && (typeof obj == 'object')) {
		str = JSON.stringify(obj, replacer);
		return JSON.parse(str);
	}
	return obj;

	// Replacer function for JSON.stringify to strip cache objects
	function replacer(key, value) {
		if (key == 'cache' && value && (typeof value == 'object'))
			return '<' + Object.keys(value).length + ' cached objects>';

		return value;
	}
}

/*
 * Converts an identifier to a string for use as a cache key
 */
function getObjectName(id) {
	if (!id)
		return 'none';

	if (typeof id != 'object')
		return id;

	if (id.INSTANCENAME)
		return getObjectName(id.INSTANCENAME);

	var keys = Object.keys(id).sort();
	keys = keys.map(function(key) { return key + ':' + getObjectName(id[key]); } );
	return keys.join('*');
}

/*
 * A utility function to write a progress message.  Useful for
 * logging really big messages.
 */
function writeProgress(msg, outputEccRec) {
	var i = 0;

	msg = removeCache(msg);

	profile.messages = profile.messages || [ ];
	profile.messages.push(msg);

	writeECCProgressRecord(outputEccRec);

	parms.msgHandler && parms.msgHandler(msg);

	if (typeof msg == 'object')
		msg = JSON.stringify(msg);

	// The message might be too large.  Write it out in 100 KB chunks
	while (i < msg.length) {
		writePart(msg.substring(i, i + 100000));
		i += 100000;
	}

	function writePart(msg) {
		var num = '0000' + progressId;
		progressId++;
		num = num.substring(num.length-5);
		ms.log(num + ': ' + msg);
	}
}

/*
 * Gather performance data.  The CimQuery2 tool reports this information.
 */
function addProfileScalar(qName, name, add, outputEccRec) {
	profile[qName] = profile[qName] || getProfileObject();
	profile[name] = (profile[name] || 0) + add;
	profile[qName][name] = (profile[qName][name] || 0) + add;
	writeECCProgressRecord(outputEccRec);
}
function addProfilePoint(qName, name, begin, outputEccRec) {
	profile[qName] = profile[qName] || getProfileObject();

	if (!begin)
		name = '|--> ' + name;

	begin = begin || start;
	start = new Date().getTime();
	profile[name] = profile[name] || 0;
	profile[name] += start - begin;
	profile[qName][name] = profile[qName][name] || 0;
	profile[qName][name] += start - begin;

	writeECCProgressRecord(outputEccRec);
}

// Get an empty profile object.  All values are pre-set to 0 or undefined to ensure the
// correct reporting order.  undefined values will only be reported if the event occurs.
// Note that some values are 0 for the main profile object and undefined for sub-objects.
// Pass total == 0 for the main object.
function getProfileObject(total) {
	total = total && 0;
	return { messages: undefined, total_ms: total, query_count: 0, multi_query_count: total,
			xml_size: 0, xml_stripped_size: undefined, dups: undefined, dup_save_ms: undefined,
			process_count: 0, object_count: 0, filtered_count: undefined, query_ms: 0,
			multi_query_ms: undefined, '|--> buildXml_ms': 0, '|--> retries_ms': 0,
			process_ms: 0, multi_process_ms: undefined, '|--> getBody_ms': 0,
			'|--> createParser_ms': undefined, '|--> parseXml_ms': undefined,
			'|--> stripXml_ms': undefined, '|--> toJson_ms': 0, '|--> simplify_ms': 0,
			'|--> cache_ms': 0, handler_ms: undefined };
}


function writeECCProgressRecord(outputEccRec) {
	var gr;

	if (outputEccRec && parms.reportProgress) {
		gr = new GlideRecord('ecc_queue');
		gr.queue = 'input';
		gr.response_to = '' + parms.probeId;
		gr.payload = '<?xml version="1.0" encoding="UTF-8"?><results><result><output>' + JSON.stringify(formatTimes(profile)) + '</output></result></results>';
		gr.topic = 'Progress';
		gr.name = 'CIMQuery2Tool';
		gr.insert();
	}
}

function formatTimes(profile) {
	var name, o, time, a, b,
		fp = { };

	for (name in profile) {
		o = profile[name];
		if (typeof o == 'object')
			o = formatTimes(o);

		if (name.substring(name.length - 3) == '_ms') {
			name = name.substring(0, name.length - 3);
			time = +o;
			if (time > 120000) {
				time = time / (1000 * 60);
				o = time.toFixed(1) + ' m';
			} else if (time > 0) {
				time = time / 1000;
				if (time > 5)
					o = time.toFixed(1) + ' s';
				else
					o = time.toFixed(3) + ' s';
			}
		} else if (typeof o == 'number') {
			// Put some commas in.  toLocaleString() doesn't work.
			a = ('' + o).split('');
			b = [ ];
			while (a.length)
				b.unshift(a.splice(-3,3).join(''));
			o = b.join(',');
		}

		fp[name] = o;
	}

	return fp;
}
/*
 * Get a stack trace
 */
function getStackTrace() {
	try {
		throw new Error();
	} catch (e) {
		return e.stack;
	}
}

})();
