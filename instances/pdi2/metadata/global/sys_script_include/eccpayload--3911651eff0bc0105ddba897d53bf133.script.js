function EccPayload(current) {
	var payload, xmlHelper, singleProbe, initializedFromXml, source,
		topics = [ ],
		probes = [ ],
		originalProbes = [ ],
		notParameterNodes = { },
		textNodes = { },
		escapeChars = {
			'&': '&amp;',
			'"': '&quot;',
			'<': '&lt;',
			'>': '&gt;',
			'\n': '&#10;',
			'\r': '&#13;'
		},
		escapeRegex = {
			'&': /&/g,
			'"': /"/g,
			'<': /</g,
			'>': />/g,
			'\n': /\n/g,
			'\r': /\r/g
		};

	return {
		getProbeParameters: getProbeParameters,
		getProbeTopics: getProbeTopics,
		//		addProbeParameter: addProbeParameter,
		//		removeProbeParameter: removeProbeParameter,
		//		replaceProbeParameter: replaceProbeParameter,

		getPayload: getPayload,
		updatePayload: updatePayload,
	};

	// Read the payload, parse and return the parameters
	// 'probe' is the name, sysid or index of the probe to get (for multiprobes)
	// 'gr' is the ecc_queue record to get parameters from
	//
	// Both probe and gr are optional.  If 'probe' isn't passed then an array of
	// all probe parameters is returned.  In the array, parameters can be accessed
	// by probe name, sysid or index.
	// If 'gr' isn't passed then 'current' is used.
	//
	// For convenience 'probe' and 'gr' can be passed in either order.
	function getProbeParameters(probe, gr) {
		var temp, parameters;

		if (probe instanceof GlideRecord) {
			temp = gr;
			gr = probe;
			probe = temp;
		}

		source = gr || current;
		if (!initializedFromXml) {
			initializedFromXml = true;

			getPayload();
			xmlHelper = new XMLHelper();
			xmlHelper.setTrim(false);
			parameters = xmlHelper.toObject(payload);

			if (!parameters)
				return;

			convertProbe(parameters);
			if (parameters.probe) {
				if (parameters.probe instanceof Array)
					parameters.probe.forEach(convertProbe);
				else
					convertProbe(parameters.probe);
			} else
				singleProbe = true;
		}

		if (probe || (probe === 0))
			return probes[probe];

		return probes;
	}

	function getProbeTopics() {
		return topics;
	}

	function convertProbe(probe) {
		var probeParms, parmName,
			parameters = { },
			probeXml = {
				idx: probes.length,
				xmlObj: probe
			},
			name = probe['@name'],
			sysId = probe['@id'];

		topics.push(probe['@topic'] || source.topic);

		probeParms = probe.parameters || probe;

		for (parmName in probeParms) {
			if (!parmName.startsWith('@') && parmName != 'parameter' && parmName != 'textnode_parameter' && probeParms[parmName]) {
				parameters[parmName] = probeParms[parmName];
				notParameterNodes[parmName] = true;
			}
		}

		extractParms('parameter', '@value');
		extractParms('textnode_parameter', '#text', true);

		if (!sysId) {
			sysId = parameters.patternId || parameters.probe;
			name = parameters.pattern || parameters.probe_name;
		}

		originalProbes.push({
			idx: probes.length,
			sysId: sysId,
			xmlObj: probe
		});

		probes.push(parameters);
		probes[sysId] = parameters;
		if (name !== undefined)
			probes[name] = parameters;
		
		function extractParms(memberName, valueName, isTextNode) {
			memberName = memberName || 'parameter';
			valueName = valueName || '@value';

			if (probeParms[memberName]) {
				if (!(probeParms[memberName] instanceof Array))
					probeParms[memberName] = [ probeParms[memberName] ];
				probeParms[memberName].forEach(function(parm) {
					var name = parm['@name'];
					parameters[name] = parm[valueName];
					textNodes[name] = isTextNode;
				});
				probeParms[memberName] = undefined;
			}
		}
	}

	// Adds the given parameter to the payload
	// if getProbeParameters() has been called this will operate on
	// the parameters that were extracted.  Otherwise this will work
	// directly on the payload using a regex.
	function addProbeParameter(probe, name, value) {
		// TODO:
	}

	// Removes the parameter if it's there, otherwise do nothing
	// if getProbeParameters() has been called this will operate on
	// the parameters that were extracted.  Otherwise this will work
	// directly on the payload using a regex.
	function removeProbeParameter(probe, name) {
		// TODO:
	}

	// Replaces the parameter if it's there, otherwise adds it.
	// if getProbeParameters() has been called this will operate on
	// the parameters that were extracted.  Otherwise this will work
	// directly on the payload using a regex.
	function replaceProbeParameter(probe, name, newValue) {
		// TODO:
	}

	function getPayload() {
		var sa;

		// EccPayload may have been initialized by a different business rule.
		// Don't re-read the payload if it's not necessary
		payload = payload || source.payload + '';
		if (payload == '<see_attachment/>') {
			sa = new GlideSysAttachment();
			payload = sa.get(source, 'payload');
		}

		return payload;
	}

	// Write the payload back to the record.
	// TODO: Check to see if it should be converted to an attachment
	// (based on the size of the payload) and do so if necessary.
	// TODO: If getProbeParameters() has not been called then just write
	// the payload back (with any regex-based changes it may have.)
	function updatePayload(gr) {
		var xmlObj = { };

		if (!singleProbe) {
			xmlObj.probes = { probe: [ ] };
			originalProbes.forEach(function(probe, idx) {
				if (!idx)
					setParameters(xmlObj.probes, probes[probe.sysId]);
				else {
					xmlObj.probes.probe.push(probe.xmlObj);
					setParameters(probe.xmlObj, probes[probe.sysId]);
				}
			});
		} else
			setParameters(xmlObj, probes[0]);

		gr = gr || source;
		gr.payload = '<?xml version="1.0" encoding="UTF-8"?>' + xmlHelper.toXMLStr(xmlObj);
		return gr.payload;

		function setParameters(dest, src) {
			var destObj;

			escapeObj(dest);
			dest.parameters = { parameter: [ ] };
			dest = dest.parameters;
			for (name in src) {
				if (notParameterNodes[name]) {
					dest[name] = src[name];
					continue;
				}
				destObj = { };
				destObj['@name'] = name;
				if (textNodes[name]) {
					dest.textnode_parameter = dest.textnode_parameter || [ ];
					dest.textnode_parameter.push(destObj);
					destObj['#text'] = src[name];
				} else {
					dest.parameter.push(destObj);
					destObj['@value'] = src[name];
				}
				escapeObj(destObj);
			}
		}

		function escapeObj(obj) {
			var name, escape, val;

			for (name in obj) {
				val = obj[name];
				if (typeof val == 'string') {
					for (escape in escapeChars)
						val = val.replace(escapeRegex[escape], escapeChars[escape]);
					obj[name] = val;
				}
			}
		}
	}
}
