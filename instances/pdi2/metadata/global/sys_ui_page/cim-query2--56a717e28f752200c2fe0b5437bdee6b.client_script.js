var ArrayPolyfill, firstClick, group, name, fullQuery,
	responseNode = document.querySelector('#cqResponse'),
	historyNode = document.querySelector('#cqHistory'),
	// Generic
	//   Method{parameters}.method{parameters}
	predefinedQueries = {
		Classification: {
			Arrays: "CIM_RegisteredProfile{{RegisteredName='Array'}}.CIM_ElementConformsToProfile{Resultclass=CIM_ComputerSystem}",
			nasHead: "CIM_RegisteredProfile{{RegisteredName='NAS Head'}}.CIM_ElementConformsToProfile{Resultclass=CIM_ComputerSystem}",
			Virtualizer: "CIM_RegisteredProfile{{RegisteredName='Storage Virtualizer'}}.CIM_ElementConformsToProfile{Resultclass=CIM_ComputerSystem}",
			FileExport: "CIM_RegisteredSubProfile{{RegisteredName='File Export'}}.CIM_SubProfileRequiresProfile{{RegisteredName='NAS Head'}}.CIM_ElementConformsToProfile{ResultClass:'CIM_ComputerSystem'}",
			Switches: "CIM_RegisteredProfile{{RegisteredName='Switch'}}.CIM_ElementConformsToProfile{ResultClass:'CIM_ComputerSystem'}",
			ObjectManager: "CIM_ObjectManager",
		},
		Probes: {
			"SMI - Storage Server": getProbeQueries,
			"SMI 1.5 - Storage Server": getProbeQueries,
			"SMI - Fabric": getProbeQueries
		},
		Array: {
			Volumes: ".CIM_SystemDevice{ResultClass=CIM_StorageVolume}",
			Controllers: "CIM_ProtocolControllerForUnit",
			Extents: ".CIM_SystemDevice{ResultClass=CIM_DiskDrive}\n" +
					 "    .CIM_MediaPresent{ResultClass=CIM_StorageExtent}",
			ScsiControllers: ".CIM_SystemDevice{ResultClass=CIM_SCSIProtocolController}",
			FCPorts: ".CIM_SystemDevice{ResultClass=CIM_SCSIProtocolController}\n" +
					 "    .CIM_ProtocolControllerForPort{ResultClass=CIM_FCPort}",
			Authorized: ".CIM_SystemDevice{ResultClass=CIM_SCSIProtocolController}\n" +
						"    .CIM_AuthorizedTarget\n" +
						"    .CIM_AuthorizedSubject\n",
			Pools: ".CIM_HostedStoragePool\n" +
			       "    .CIM_AllocatedFromStoragePool{ResultClass=CIM_StorageVolume}",
		},
		"Array 1.5": {
			'Controller for LUN': '.CIM_SystemDevice{ResultClass=CIM_StorageVolume}\n' +
			                      '    .References{Role=Dependent,ResultClass=CIM_ProtocolControllerForUnit}\n',
			'Controller for volume': '.CIM_SystemDevice{ResultClass=CIM_StorageVolume}\n' +
			                         '    .CIM_ProtocolControllerForUnit{ResultClass=CIM_SCSIProtocolController}',
			SAP: '.CIM_SystemDevice{ResultClass=CIM_StorageVolume}\n' +
			     '    .CIM_ProtocolControllerForUnit{ResultClass=CIM_SCSIProtocolController}\n' +
			     '    .CIM_SAPAvailableForElement{ResultClass=CIM_ProtocolEndpoint}',
			'FC Ports for controllers': '.CIM_SystemDevice{ResultClass=CIM_StorageVolume}\n' +
			                            '    .CIM_ProtocolControllerForUnit{ResultClass=CIM_SCSIProtocolController}\n' +
			                            '    .CIM_SAPAvailableForElement{ResultClass=CIM_ProtocolEndpoint}\n' +
			                            '    .CIM_DeviceSAPImplementation{ResultClass=CIM_FCPort}',
			Initiators: '.CIM_SystemDevice{ResultClass=CIM_StorageVolume}\n' +
			            '    .CIM_ProtocolControllerForUnit{ResultClass=CIM_SCSIProtocolController}\n' +
			            '    .CIM_AuthorizedTarget{ResultClass=CIM_AuthorizedPrivilege}\n' +
			            '    .CIM_AuthorizedSubject{ResultClass=CIM_StorageHardwareID}',
			'FCPorts 1.5': '.CIM_SystemDevice{ResultClass=CIM_FCPort}',
			'FCPorts 1.5 (old)': '.CIM_Dependency{ResultClass=CIM_ControllerConfigurationService}\n' +
			                     '    .CIM_Dependency{ResultClass=CIM_SCSIProtocolController}\n' +
			                     '    .CIM_Dependency{ResultClass=CIM_FCPort}'
		},
		Misc: {
			HostedShares: '.CIM_HostedShare',
			HostedPools: '.CIM_HostedStoragePool',
			ComponentSystems: ".CIM_ComponentCS{ResultClass:'CIM_ComputerSystem'}",
			SwitchPorts: ".CIM_SystemDevice{{ResultClass:'CIM_FCPort'}}",
			WBEM: "CIM_WBEMService",
			VFiler: "ONTAP_VFiler",
			Backing: ".CIM_Dependency{ResultClass=IBMTSSVC_BackendController}"
		},
		Identity: {
			Chassis: ".CIM_SystemPackaging{ResultClass:'CIM_Chassis'}",
			ChassisPhysical: ".CIM_SystemPackaging{ResultClass:'CIM_PhysicalPackage'}{{PackageType='3'}}",
			Computer: "",
			RemoteAccess: ".CIM_HostedAccessPoint{ResultClass:'CIM_RemoteServiceAccessPoint'}"
		},
		Fabric: {
			Fabrics: "CIM_RegisteredProfile{{RegisteredName='Fabric'}}\n" +
			         "    .CIM_ElementConformsToProfile{ResultClass:'CIM_AdminDomain'}",
			ConnectivityCollections: ".CIM_HostedCollection{ResultClass:'CIM_ConnectivityCollection'}",
			ZoneSets: ".CIM_HostedCollection{ResultClass:'CIM_ZoneSet'}",
			SAN: "CIM_RegisteredProfile{{RegisteredName='Fabric'}}\n" +
			     "    .CIM_ElementConformsToProfile{ResultClass:'CIM_AdminDomain'}\n" +
			     "    .CIM_ContainedDomain{ResultClass:'CIM_AdminDomain'}",
			Endpoints: ".CIM_HostedCollection{ResultClass:'CIM_ConnectivityCollection'}\n" +
			           "    .CIM_MemberOfCollection{ResultClass:'CIM_ProtocolEndpoint'}",
			Zones: ".CIM_HostedCollection{ResultClass:'CIM_ZoneSet'}\n" +
			          "    .CIM_MemberOfCollection{ResultClass:'CIM_Zone'}",
			EndpointConnections: ".CIM_HostedCollection{ResultClass:'CIM_ConnectivityCollection'}\n" +
			           "    .CIM_MemberOfCollection{ResultClass:'CIM_ProtocolEndpoint'}\n" +
			           "    .CIM_ActiveConnection{ResultClass:'CIM_ProtocolEndpoint'}",
			ZoneAliases:".CIM_HostedCollection{ResultClass:'CIM_ZoneSet'}\n" +
			          "    .CIM_MemberOfCollection{ResultClass:'CIM_Zone'}\n" +
			          "    .CIM_MemberOfCollection{ResultClass:'CIM_NamedAddressCollection'}",
			ZoneMembers: ".CIM_HostedCollection{ResultClass:'CIM_ZoneSet'}\n" +
			          "    .CIM_MemberOfCollection{ResultClass:'CIM_Zone'}\n" +
			          "    .CIM_ElementSettingData{ResultClass:'CIM_ZoneMembershipSettingData'}",
			ZoneAliasMembers: ".CIM_HostedCollection{ResultClass:'CIM_ZoneSet'}\n" +
			          "    .CIM_MemberOfCollection{ResultClass:'CIM_Zone'}\n" +
			          "    .CIM_MemberOfCollection{ResultClass:'CIM_NamedAddressCollection'}\n" +
			          "    .CIM_ElementSettingData{ResultClass:'CIM_ZoneMembershipSettingData'}"
	},
		General: {
			Profiles: 'CIM_RegisteredProfile',
			ManagedElements: 'CIM_ManagedElement',
			Dependencies: 'EnumerateInstances{ClassName=CIM_ManagedElement}.Associators{AssocClass=CIM_Dependency}',
			Classes: 'EnumerateClasses',
			Namespaces: 'CIM_Namespace'
		}
	};

$('cqIp').value = getPreference('ip') || '127.0.0.1';
$('cqNamespace').value = getPreference('namespace') || 'interop';
$('cqQuery').value = getPreference('query') || 'CIM_ComputerSystem.*';
$('cqCurrent').value = getPreference('current') || "StorageSystem{Name='GenericSystem'}";
$('xmlRequest').checked = getPreference('xmlRequest') == 'false';
$('xmlResponse').checked = getPreference('xmlResponse') == 'false';
$('jsonResponse').checked = getPreference('jsonResponse') == 'false';
var mid = getPreference('mid');
$('mids').innerHTML = '<option value="' + escapeHTML(mid) + '">' + escapeHTML(mid) + '</option>';
$('mids').value = mid;
$('cqChunkSize').value = getPreference('chunkSize') || 1;
$('cqLimit').value = getPreference('limit') || '';

// Global functions expected to exist by queries we fetch directly from probes
CimQuery = {
	getInstanceXml: function() { },
	query: function() { },
	getInstanceJS: function(instance) {
		var result = { },
			values = ('' + instance).split('{')[1].split(',');

		values.forEach(extract);

		return result;

		function extract(val) {
			val = val.split('=');
			result[val[0]] = val[1].split("'")[1];
		}
	}
};
probe = {
	getCredentials: function() { },
	setPostProcessOutput: function() { },
	getParameter: function() {
		return $('cqCurrent').value;
	}
};
JsonCi = { decircularize: function() { } };

getMids();

$('cqIp').on('blur', function() {
	getMids();
});

html = '';
buttons = '';
for (group in predefinedQueries) {
	html += '<a style="margin-top: 5px;margin-right:15px;" id="' + group + '">' + group + '</a>';
	buttons += '<span class="hidden" id="ButtonGroup' + group + '">';
	for (name in predefinedQueries[group])
		buttons += '<button style="margin-top: 5px;" id="' + name + '">' + name + '</button>';
	buttons += '</span>';
}

$('cqPredfined').innerHTML = html + '<br />' + buttons;
for (group in predefinedQueries) {
	$(group).on('click', function(event) { event.stop(); showGroup(event.currentTarget.id); });
	for (name in predefinedQueries[group])
		$(name).on('click', function(event) { event.stop(); fillPredefined(event.currentTarget.id); });
}

showGroup('Array');
function showGroup(name) {
	var group, groupName;
	
	currentGroup = name;
	for (group in predefinedQueries) {
		groupName = 'ButtonGroup' + group;
		if (group == name) {
			removeClass(groupName, 'hidden');
			addClass(group, 'selected');
			removeClass(group, 'notSelected');
		}
		else {
			addClass(groupName, 'hidden');
			removeClass(group, 'selected');
			addClass(group, 'notSelected');
		}
	}
}
function fillPredefined(name) {
	var predefined = predefinedQueries[currentGroup][name];

	if (typeof predefined == 'function')
		predefined(name);
	else {
		$('cqQuery').value = predefined;
		if (predefined.trim().substr(0,1) != '.')
			$('cqNamespace').value = 'interop';
		$('cqJsonQuery').value = parseQuery(predefined);
	}
}

$('help').on('click', toggleHelp);
$('closeHelp').on('click', toggleHelp);
function toggleHelp() { event.stop(); toggleClass($('helpDiv'), 'hidden'); }

query = { probeid: undefined };

window.onload = setTimeout(function() {

	doc = (window.parent && window.parent.document) || document;
	hash = doc.location.hash;
	if (!hash) {
		qp = decodeURIComponent(doc.location.search).split('sys_id=');
		if (qp.length != 2)
			qp = decodeURIComponent(doc.location.search).split('probeid=');
		if (qp.length == 2)
			query.probeid = qp[1].split('&')[0];
	} else {
		hash = hash.substr(1).split('&');
		hash.forEach(function(nameVal) { var idx = nameVal.indexOf('='); query[nameVal.substr(0,idx)] = decodeURIComponent(nameVal.substr(idx+1)); });
	}
	parseQuery();

	if (!query.probeid)
		restoreValues(query);
	else {
		var gr = new GlideRecord('ecc_queue');
		gr.addQuery('sys_id', query.probeid);
		gr.query();
		if (gr.next()) {
			p = new DOMParser();
			d = p.parseFromString(gr.payload, 'text/xml');
			d = d.getElementsByTagName('parameter');
			for (i = 0; i < d.length; i++) {
				p = d[i];
				if (p.attributes[0].value == 'allQueryParms') {
					q2 = JSON.parse(p.attributes[1].value);
					for (name in q2)
						query[name] = q2[name];
				}
			}
			$('cqResponse').innerHTML = '<div class="cqResponseWrapper collapsable clickable">Reloading results...</div>';
			wrapperNode = document.querySelector('#cqResponse .cqResponseWrapper');
			startPolling(query, wrapperNode, new Date());
		}
	}
}, 1000);

var CimUI = {
	_CANVAS: $('cqResponse'),

	draw: function(answer, node, time, inProgress) {
		var i, div, msg, realCount, queryCount,
			objectCount = 0,
			instances = answer.result,
			errors = answer.errors,
			msgs = answer.msgs,
			profile = answer.profile;

		if (instances)
			objectCount -= instances.length;

		if (inProgress) {
			queryCount = (+answer.result[0].query_count) + (+(answer.result[0].multi_query_count || 0));

			msg = '<a class="cq2Result allCollapsable">In progress.  Executed ' + queryCount + ' queries and received ' + answer.result[0].object_count + ' objects ';
			if (answer.result[0].filtered_count)
				msg += '(' + answer.result[0].filtered_count + ' filtered) ';
			msg += 'in ' + time + '</a>';
			profile = answer.result[0];
			delete answer.result[0];
		}
		
		delete answer.result;
		delete answer.errors;
		delete answer.msgs;
		delete answer.profile;

		var html = '';
		if (instances)
			html = renderObject(instances);
		realCount = objectCount;
		if (errors && errors.length)
			html += renderObject({ errors: errors }, 'errors');
		if (msgs && msgs.length)
			html += renderObject({ messages: msgs }, 'messages');
		if (profile)
			html += renderObject(profile, 'profile');

		var summary = [];
		if (instances && instances.length) {
			summary.push(instances.length + ' object');
			if (instances.length > 1)
				summary[0] += 's';
			if (realCount) {
				summary[0] += ' with ' + realCount + ' decendent';
				if (realCount > 1)
					summary[0] += 's';
			}
		}
		if (errors && errors.length)
			summary.push(errors.length + (errors.length > 1) ? 'errors' : 'error');

		if (Object.keys(answer).length)
			html += renderObject(answer);

		msg = msg || '<a class="cq2Result allCollapsable">Received ' + summary.join(' and ') + ' in ' + time + '</a>';

		return msg + html;

		function renderObject(object, defaultName) {

			if (!object || (typeof object != 'object'))
				return escapeHTML(object);

			if ((Object.keys(object).length == 2) && object.hasOwnProperty('@name') && object.hasOwnProperty('@value'))
				return '<tr class="clickable"><th>' + object['@name'] + '</th><td>' + object['@value'] + '</td></tr>';

			if (arguments.length > 1)
				defaultName = '' + defaultName;

			var key, value,
				html = '<div class="cq2ResponseInstance clickable collapsable" data-instance="' + (object && object.identifier || '');
			
			if (object.namespace)
				html += '" data-namespace="' + object.namespace;

			html += '"><a class="cq2ObjectName">'
					   + getObjectName()
					   + '</a><table class="cq2ResponseInstanceProperties cqResponseInstanceProperties">';

			if (object instanceof Array) {
				if (object[0] && (typeof object[0] == 'object')) {
					if ((object[0] instanceof Array) && (object.length == 1) && (typeof object[0][0] != 'object'))
						return escapeHTML(object[0].join(', '));
					html = object.map(renderObject).join('');
					return html;
				} else
					return escapeHTML(object.join(', '));
			} else {
				objectCount++;
				for (key in object) {
					if (object.hasOwnProperty(key)) {
						value = object[key];
						if (key == 'associations') {
							Object.keys(value).forEach(
								function(key) {
									html += '<tr class="clickable"><th><a class="cq2Query allCollapsable">.' + key + '</a></th><td>' + renderObject(value[key]) + '</td></tr>';
								});
						} else {
							if (value && (typeof value == 'object'))
								html += '<tr class="clickable allCollapsable"><th>' + key + '</th><td>' + renderObject(value) + '</td></tr>';
							else
								html += '<tr class="clickable"><th>' + key + '</th><td>' + renderObject(value) + '</td></tr>';
						}
					}
				}
			}

			html += '</table></div>';

			return html;

			function getObjectName() {
				var caption = (object && (object.ClassName || object.CreationClassName || object.Caption || object.DeviceID)) || '',
					name = (object && (object.Name || object.ElementName || object.SystemName || object.name)) || defaultName || '';

				if (name || caption)
					return escapeHTML(caption + ' ' + name);

				if (object && object.identifier) {
					ids = object.identifier.split('*');
					ids = ids.map(function(id) { return id.split(':')[1]; });
					if (ids.length)
						return escapeHTML(ids.join(' '));
				}
				return escapeHTML('<No Name>');
			}
		}
	},

	createInstanceDiv: function(instance) {
		
		var div = document.createElement('div');
		div.setAttribute('style', 'color:white;background-color:black');
		div.setAttribute('class', 'cq2ResponseInstance');
		div.innerHTML = renderObject(instance);
		div.dataset.instance = instance.identifier;
		return div;
	}
};

function parseError(message) {
	return message.substring(6);
}

var clickClasses = {
	allCollapsable: 'allCollapsed',
	collapsable: 'collapsed'
};

$('cqResponseContainer').on('click', '.cqLabel', toggleWidths);
$('cqHistoryContainer').on('click', '.cqLabel', toggleWidths);
function toggleWidths(event, element) {
	$('cqResponseContainer').toggleClassName('wide');
	$('cqResponseContainer').toggleClassName('even');
	$('cqHistoryContainer').toggleClassName('narrow');
	$('cqHistoryContainer').toggleClassName('even');
}

$('cqContainer').on('click', '.clickable', function(event, element) {
	event.stop();

	if (!firstClick) {
		firstClick = true;
		setTimeout(handleClick, 300);
	}

	function handleClick() {
		var name;

		if (!firstClick)
			return;
		firstClick = false;
		for (name in clickClasses) {
			if (event.srcElement.hasClassName(name)) {
				element.toggleClassName(clickClasses[name]);
				return;
			}
		}
		for (name in clickClasses) {
			if (element.hasClassName(name))
				element.toggleClassName(clickClasses[name]);
		}
	}
});
	
function addClickHandler(className, toggleClassName) {
	$('cqContainer').on('click', '.' + className, function(event, element) {
		event.stop();

		if (!firstClick) {
			firstClick = true;
			setTimeout(handleClick, 300);
		}

		function handleClick() {
			if (!firstClick)
				return;
			firstClick = false;
			toggleClass(event.srcElement, toggleClassName);
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////
$('cqContainer').on('dblclick', '.clickable', function(event, element) {
	firstClick = false;
	event.stop();

	restoreValues(event.srcElement.dataset, element.dataset);
});

function restoreValues(queryValues, instanceValues) {
	var doc, name, val,
		hash = [ ];

	$('cqQuery').value = queryValues.query || $('cqQuery').value;
	$('cqIp').value = queryValues.ip || $('cqIp').value;
	$('cqNamespace').value = queryValues.namespace || $('cqNamespace').value;
	$('mids').value = queryValues.mid || $('mids').value;
	$('cqChunkSize').value = queryValues.chunksize || $('cqChunkSize').value;
	$('cqLimit').value = queryValues.limit || $('cqLimit').value;

	instanceValues = instanceValues || { };

	$('cqCurrent').value = instanceValues.currentInstance || queryValues.current || $('cqCurrent').value;
	$('cqNamespace').value = instanceValues.namespace || queryValues.namespace || $('cqNamespace').value;

	if (instanceValues.instance) {
		var instance = instanceValues.instance,
			query = [ ],
			root = 'CIM_ManagedElement';

		instance = instance.split('*');
		instance.forEach(
			function(identifier) {
				
				identifier = identifier.split(':');
				if (identifier[0] == 'ClassName')
					root = identifier[1];
				else
					query.push(identifier.shift() + "='" + identifier.join(':') + "'");
			});
		$('cqCurrent').value = root + '{' + query.join(',') + '}';
	}

	queryValues.current = $('cqCurrent').value;
	queryValues.namespace = $('cqNamespace').value;
	
	doc = (window.parent && window.parent.document) || document;
	for (name in queryValues) {
		val = queryValues[name];
		if ((name != 'probeid') && (name != 'fullQuery') && (name != 'parsedQuery') && val)
			hash.push(name + '=' + encodeURIComponent(val));
	}

	$('cqJsonQuery').value = parseQuery();

	if (hash.length) {
		if (window.parent)
			window.parent.history.replaceState({}, 'cim_query2', '/nav_to.do?uri=%2Fcim_query2.do#' + hash.join('&'));
		else
			history.replaceState({}, 'cim_query2', doc.location.origin + doc.location.pathname + '#' + hash.join('&'));
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////
$('cqQuery').on('blur', function() {
	$('cqJsonQuery').value = parseQuery();
});

$('cqCurrent').on('blur', function() {
	$('cqJsonQuery').value = parseQuery();
});

////////////////////////////////////////////////////////////////////////////////////////////////
$('cqQueryButton').on('click', function(event) {
	var wrapperNode,
		query = {
			probeid: undefined,
			ip: $('cqIp').value,
			namespace: $('cqNamespace').value,
			query: $('cqQuery').value,
			current: $('cqCurrent').value,
			xmlRequest: $('xmlRequest').checked,
			xmlResponse: $('xmlResponse').checked,
			jsonResponse: $('jsonResponse').checked,
			mid: $('mids').value,
			chunksize: $('cqChunkSize').value,
			limit: $('cqLimit').value
		},
		now = new Date();

	event.stop();

	$('cqJsonQuery').value = $('cqJsonQuery').value || parseQuery();

	query.parsedQuery = $('cqJsonQuery').value;

	try {
		try {
			JSON.parse(query.parsedQuery);
		} catch (e) {
			eval("o = " + query.parsedQuery);
			query.parsedQuery = JSON.stringify(o);
		}

		query.fullQuery = fullQuery;

		// Move the previous response from the response area to the history area
		var oldAnswer = responseNode.querySelector('.cqResponseWrapper');
		if (oldAnswer) {
			addClass(oldAnswer, 'collapsed');
			responseNode.removeChild(oldAnswer);
			historyNode.insertBefore(oldAnswer, historyNode.children[0]);
			addRemoveDiv(oldAnswer);
		}
	} catch (e) {
		$('cqResponse').innerText = 'Caught exception: ' + e.toString() + ': ' + e.stack + '\n' + query.parsedQuery;
		return;
	}

	$('cqResponse').innerHTML = '<div class="cqResponseWrapper collapsable clickable">Creating probe...</div>';
	wrapperNode = document.querySelector('#cqResponse .cqResponseWrapper');

	var ajaxQuery = new GlideAjax('DiscoveryCimQueryAjax2');
	ajaxQuery.addParam('sysparm_name', 'query');
	for (var field in query)
		ajaxQuery.addParam('sysparm_' + field, query[field]);

	ajaxQuery.getXML(function(queryResponse) {
		wrapperNode.innerText = 'Executing query ' + query.query + ' at ' + now.toLocaleTimeString();
		query.probeid = queryResponse.responseXML.documentElement.getAttribute('answer');
		if (!query.probeid || query.probeid.startsWith('error:')) {
			if (!query.probeid)
				wrapperNode.innerText = 'Failed to create probe. See logs for details ...';
			else
				wrapperNode.innerText = 'Failed to create probe: ' + parseError(query.probeid);
			return;
		}

		startPolling(query, wrapperNode, now);
	});
});

function startPolling(query, wrapperNode, now) {
	var interval = 100;

	restoreValues(query);
	poll();

	function poll() {
		var timeoutSet, msg,
			ajaxPoll = new GlideAjax('DiscoveryCimQueryAjax2');

		ajaxPoll.addParam('sysparm_name', 'poll');
		ajaxPoll.addParam('sysparm_probe_id', query.probeid);
		ajaxPoll.addParam('sysparm_ip', query.ip);
		ajaxPoll.addParam('sysparm_mid', query.mid);
		ajaxPoll.getXML(function(pollResponse) {
			var answer = pollResponse.responseXML.documentElement.getAttribute('answer');
			interval = Math.min(interval*1.1, 5000);
			if (!answer) {
				setTimeout(poll, interval);
				return;
			}

			try {
				if (answer.startsWith('error:'))
					answer = parseError(answer);

				answer = JSON.parse(answer);
				if (typeof answer == 'string')
					answer = JSON.parse(answer);
				if (!(answer.result))
					answer = { result: [ answer ], errors: [ ] };

				if (!answer.profile) {
					setTimeout(poll, interval);
					timeoutSet = true;
					msg = getAnchor() + '<br />' + CimUI.draw(answer, wrapperNode, getTimeString(new Date(new Date() - now)), true);
				}

				$('cqAnswer').value = JSON.stringify(answer, 0, '    ');

				msg = msg || (getAnchor() + '<br />')
					+ CimUI.draw(answer, wrapperNode, getTimeString(new Date(new Date() - now)));

				wrapperNode.innerHTML = msg;
			} catch (e) {
				wrapperNode.innerText = 'Caught exception: ' + e.toString() + '\n:' + e.stack + '\n:' + JSON.stringify(answer);
				if (!timeoutSet)
					setTimeout(poll, interval);
				return;
			}

			addRemoveDiv(wrapperNode);
		});

		function getAnchor() {
			return '<a class="cq2Query" ' + 
				'data-query="' + query.query + '" ' +
				'data-ip="' + query.ip + '" ' +
				'data-namespace="' + query.namespace + '" ' +
				'data-mid="' + query.mid + '" ' +
				'data-chunksize="' + query.chunksize + '"' +
				'data-limit="' + query.limit + '"' +
				'data-probeid="' + query.probeid + '"' +
				'data-current="' + query.current + '"' +
				(query.predefined ? 'data-predefined="' + query.predefined + '"' : '') +
				'>' + query.ip + '/' + query.namespace + '/' + query.fullQuery + '</a>';
		}
	}
}

function addRemoveDiv(node) {
	var removeDiv;

	if (node != document.querySelector('#cqResponse .cqResponseWrapper')) {
		removeDiv = document.createElement('div');
		removeDiv.setAttribute('style', 'display:inline-block;width:15px;height:15px;border-radius:50%;margin-right:5px;background-color:red;');
		node.insertBefore(removeDiv, node.firstChild);
		removeDiv.onclick = function() { node.parentElement.removeChild(node); };
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////
function countObjects(result) {
	var root = 0,
		descendents = 0,
		answer = [ 'Received ' ];
	
	result.forEach(
		function(o) {
			root++;
			countDescendents(o);
		});
	
	answer.push(result.length == 1 ? '1 object ' : result.length + ' objects ');
	if (descendents)
		answer.push(descendents == 1 ? 'with 1 descendent' : 'with ' + descendents + ' descendents');

	return answer.join('');
	
	function countDescendents(o) {
		var name, value;
		
		for (name in o) {
			if (!o.hasOwnProperty(name))
				continue;
			
			value = o[name];
			if (typeof value == 'object') {
				if (value[0] && (typeof value[0] == 'object') && (value[0] instanceof Array) && (value.length == 1) && (typeof value[0][0] != 'object'))
					;
				else {
					descendents++;
					countDescendents(value);
				}
			}
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////
$('cimQuery').on('change', function() { toggleClass('cimQueryDebug', 'hidden'); });

/*
    CIM Command        Required Parameters
	-----------        -------------------
	GetClass           ClassName
	EnumerateInstances ClassName
	GetInstance        InstanceName
	EnumerateClasses
	EnumerateClassNames
	ExecQuery          QueryLanguage, Query
	Associators        ObjectName
	References         ObjectName
	GetProperty        InstanceName, PropertyName
	GetQualifier       QualifierName
	EnumerateQualifiers
	
*/
////////////////////////////////////////////////////////////////////////////////////////////////
function parseQuery(queryString) {

	var props, rootQuery, query, bindings, name, parts, first,
		defaultMethod = 'EnumerateInstances',
		defaultParameter = 'ClassName';

	queryString = queryString || $('cqQuery').value;
	if (!queryString || queryString.indexOf('.') == 0) {
		defaultMethod = 'GetInstance';
		defaultParameter = 'CreationClassName';
		queryString = $('cqCurrent').value + queryString;
	}

	fullQuery = queryString;
	
	parts = split(queryString, '.');
	first = parts.shift().trim();

	props = getProps(first);
	query = rootQuery = getQuery(props, defaultParameter, defaultMethod);

	while (parts.length) {
		props = getProps(parts.shift());
		query.queries = [ getQuery(props, 'AssocClass', 'Associators') ];
		query = query.queries[0];
		if (query.parms)
			query.parms.ObjectName = 0;
	}

	return JSON.stringify(rootQuery, 0, '    ');

	function split(string, chr) {
		var c,
			open = false,
			i = 0,
			result = [ ];

		while (i < string.length) {
			c = string[i++];
			if (c == "'" || c == '"')
				open = !open;
			else if (!open && string[i] == chr) {
				result.push(string.substr(0, i));
				string = string.substr(i+1);
				i = 0;
			}
		}
		if (string)
			result.push(string);
		
		return result;
	}

	function getQuery(props, defaultParameter, defaultMethod) {
		var filter,
			parms = { ObjectName: undefined, ClassName: undefined, CreationClassName: undefined },
			query = { name: props.name, method: defaultMethod, filter: undefined, parms: undefined };

		parms[defaultParameter] = undefined;

		props.values.forEach(
			function(parm) {
				parms[parm.name] = parm.value;
			});

		if (defaultMethod == 'GetInstance')
			defaultParameter = 'CreationClassName';

		filter = props.filters[0];
		if (filter)
			query.filter = '{ return simplified.' + filter.name + ".toLowerCase() == '" + filter.value.toLowerCase() + "'; }";

		if (props.root && (props.root.indexOf('_') == -1))
			query.method = props.root;
		else {

			// I don't know what method to use.  Make a reasonable guess.
			if (defaultMethod == 'EnumerateInstances' && (parms.Name || parms.DeviceID)) {
				query.method = 'GetInstance';
				defaultParameter = 'CreationClassName';
			}

			// I don't think the root is a method so use it as the default parameter
			parms[defaultParameter] = parms[defaultParameter] || props.root;
		}

		for (name in parms) {
			if (parms[name] === undefined)
				delete parms[name];
		}
		if (Object.keys(parms).length)
			query.parms = parms;

		return query;
	}

	// Root
	// Root{Parm=Value}
	// Root{{Filter=Value}}
	// Root{Parm=Value}{{Filter=Value}}
	function getProps(query) {
		var items, part, name, value, target,
			parts = query.split(/{/),
			result = { name: query.trim(), root: parts.shift().trim(), values: [ ], filters: [ ] };

		while (parts.length) {
			items = parts.shift();
			target = 'values';
			if (!items) {
				target = 'filters';
				items = parts.shift();
			}
			items = tokenizeCIMQuery(items);
			while (items.length) {
				part = items.shift().split(/[:=]/);
				name = part.shift();
				value = part.join(':');
				if (value)
					value = value.match(/\s*['"]?([^'"{}]*)/)[1];
				result[target].push( { name: name.trim(), value: value.trim() });
			}
		}
		
		return result;

		/*
		* @PURPOSE
		* Sometimes the system name (device name) may not be a simple scalar name i.e., "CLSA_HKD_XtremIO_1"
		* but instead it can be "[CLSA_HKD_XtremIO_1,abc,_CLSA_HKD_XtremIO_1]".
		*
		* Example:
		* CIM QUERY:
		* ECOM_ObjectManager{CreationClassName='ECOM_ObjectManager',
		*					 Name='EMC:[CLSA_HKD_XtremIO_1,_CLSA_HKD_XtremIO_1]',
		*					 SystemCreationClassName='ECOM_ComputerSystem',
		*					 SystemName='[CLSA_HKD_XtremIO_1,_CLSA_HKD_XtremIO_1]'}
		*
		* If we split by query by "," (comma) then it results in an invalid query as the name gets sliced
		* so the below function is to split properly
		*
		* @INPUT - query - a plain query string
		* Example:
		*  query = "CreationClassName='ECOM_ObjectManager',
		*			Name='EMC:[CLSA_HKD_XtremIO_1,abc,_CLSA_HKD_XtremIO_1]',
		*			SystemCreationClassName='ECOM_ComputerSystem',
		*			SystemName='[CLSA_HKD_XtremIO_1,_CLSA_HKD_XtremIO_1]'"
		*
		* @OUTPUT - an array containing query tokens
		* Example:
		*  [ "CreationClassName='ECOM_ObjectManager'" ,
		*	 "Name='EMC:[CLSA_HKD_XtremIO_1,abc,_CLSA_HKD_XtremIO_1]'" ,
		*	 "SystemCreationClassName='ECOM_ComputerSystem'" ,
		*	 "SystemName='[CLSA_HKD_XtremIO_1,_CLSA_HKD_XtremIO_1]'" ]
		*/
		function tokenizeCIMQuery(items) {
			var result = [ ],
				temp = [ ];
			
			items.split(',').forEach(function(item) {
				if (temp.length || (item.indexOf('[') != -1) || (item.indexOf(']') != -1)) {
					temp.push(item);
					if (item.indexOf(']') != -1) {
						result.push(temp.join(','));
						temp = [ ];
					}
				} else
					result.push(item);
			});

			return result;
		}
	}

}

////////////////////////////////////////////////////////////////////////////////////////////////
function getMids(ip) {

	var firstMid,
		selectedMid = { },
		currentMid = $('mids').value,
		ajaxQuery = new GlideAjax('DiscoveryCimQueryAjax2');

	ajaxQuery.addParam('sysparm_name', 'getMids');
	ajaxQuery.addParam('sysparm_ip', $('cqIp').value);

	ajaxQuery.getXML(
		function(queryResponse) {
			mids = JSON.parse(queryResponse.responseXML.documentElement.getAttribute('answer'));
			if (mids.length) {
				firstMid = mids[0];
				mids.forEach(
					function(mid, idx) {
						selectedMid[mid] = 1;
						mids[idx] = '<option value="' + escapeHTML(mid) + '">' + escapeHTML(mid) + '</option>';
					});
				mids.sort();
				var mids2 = [ ],
					gr = new GlideRecord('ecc_agent');

				gr.query();
				while (gr.next()) {
					if (!selectedMid['' + gr.name])
						mids2.push('<option value="' + escapeHTML(gr.name) + '">' + escapeHTML(gr.name) + '</option>');
				}
				mids2.sort();

				$('mids').innerHTML = mids.join('') + (mids2.length ? '<option>- Not Returned by Mid Selector-</option>' + mids2.join('') : '');
				$('mids').value = currentMid;
				$('mids').value = $('mids').value || firstMid;
			}
		});
	
}

////////////////////////////////////////////////////////////////////////////////////////////////
function getPreference(shortName) {
	var prefGr = new GlideRecord('sys_user_preference');
	prefGr.addQuery('name', 'cimquery2.' + shortName);
	prefGr.query();
	if (prefGr.next())
		return ''+prefGr.value;

	prefGr = new GlideRecord('sys_user_preference');
	prefGr.addQuery('name', 'cimquery.' + shortName);
	prefGr.query();
	if (prefGr.next())
		return ''+prefGr.value;
}

function toggleClass(element, className) {
	return changeClass(element, className,
		function(classes) {
			var idx = classes.indexOf(className);
			if (idx == -1)
				classes.push(className);
			else
				classes.splice(idx, 1);
		});
}

function escapeHTML(unsafe) {
	if (unsafe === 0 || unsafe === false)
		return unsafe;
	unsafe = unsafe || '';
	unsafe = '' + unsafe;
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function removeClass(element, className) {
	return changeClass(element, className,
		function(classes) {
			classes.some(function(name, idx) { if (name == className) { classes.splice(idx, 1); return true; } });
		});
}

function addClass(element, className) {
	return changeClass(element, className,
		function(classes) {
			if (!classes.some(function(name) { return name == className; }))
				classes.push(className);
		});
}

function changeClass(element, className, changeFn) {
	if (typeof element == 'string')
		element = $(element);
	if (!element)
		return;
	var classes = element.getAttribute('class') || '';
	classes = classes.split(' ');
	changeFn(classes);
	element.setAttribute('class', classes.join(' '));

	return element;
}

function getTimeString(date) {
	var dtf = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', second: 'numeric', timeZone: 'UTC' });
	
	date = dtf.format(date) + '.' + date.getMilliseconds();
	return date;
}

function getProbeQueries(name) {
	$('cqQuery').value = name;
	
	var query = JSON.parse(parseQuery($('cqCurrent').value));

	var gr = new GlideRecord('discovery_probes');
	gr.addQuery('name', name);
	gr.addQuery('ecc_queue_topic', 'JavascriptProbe');
	gr.query();
	gr.next();

	var queries = eval(gr.post_processor_script).queries;
	queries.forEach(function(query) { if (query.parms.hasOwnProperty('ObjectName')) query.parms.ObjectName = 0; });
	query.queries = queries;

	$('cqJsonQuery').value = JSON.stringify(query, 0, '    ');
}
