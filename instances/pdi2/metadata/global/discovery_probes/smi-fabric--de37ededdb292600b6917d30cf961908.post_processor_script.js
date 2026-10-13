/*
 * Use CimQuery to query an SMI-S server for fabric information and
 * extract the data we're interested in.
 * I try to keep the result data as small as possible.  Even so, I've seen
 * response payloads up to about 1 MB long.  Extremely large fabrics may
 * require additional optimization.
 */
(function() {

var san,
	endpointMap = { },   // Map WWN -> endpoint
	memberMap = { },     // Map endpoint name -> zone member or zone alias member
	fabrics = [ ],
	endpoints = [ ],
	endpointConnections = [ ],
	zoneSets = [ ],
	zones = [ ],
	zoneMembers = [ ],
	zoneAliases = [ ],
	zoneAliasMembers = [ ],
	// See the CimQuery script include for a description of this structure.
	// These queries will be executed in order.  Some handlers use the results
	// of previous queries, so don't re-order the queries without verifying the
	// handlers.
	// CIM responses can be huge.  We try to execute the largest queries first
	// and to throw away the data we're not interested in to keep the memory
	// strain on the MID server as small as possible.
	// The "SMI - Storage Server" probe stored these queries in the database.  I'm
	// putting the queries here for several reasons:
	//  1. The queries are tightly coupled to the probe/sensor code. Storing them
	//     separately just obfuscates what's going on
	//  2. Queries are structured, without the need to invent and parse a query
	//     language
	//  3. Associated queries can be represented naturally without the need to
	//     create a query tree of some sort
	queries = [ {
		name: 'fabric',
		method: 'GetInstance',
		handlerForEach: handler,
		parms: CimQuery.getInstanceJS(probe.getParameter('instance')),
		queries: [ 
			{
			name: 'san',
			method: 'Associators',
			parms: {
				ObjectName: 0,
				AssocClass: 'CIM_ContainedDomain',
				ResultClass: 'CIM_AdminDomain'
			}
		} , {
			name: 'connectivityCollections',
			method: 'Associators',
			parms: {
				ObjectName: 0,
				AssocClass: 'CIM_HostedCollection',
				ResultClass: 'CIM_ConnectivityCollection'
			},
			queries: [ {
				name: 'endpoints',
				method: 'Associators',
				parms: {
					ObjectName: 0,
					AssocClass: 'CIM_MemberOfCollection',
					ResultClass: 'CIM_ProtocolEndpoint'
				},
				queries: [ {
					name: 'endpointConnections',
					method: 'Associators',
					parms: {
						ObjectName: 0,
						AssocClass: 'CIM_ActiveConnection',
						ResultClass: 'CIM_ProtocolEndpoint'
					},
				} ]
			} ]
		}, {
			name: 'zoneSets',
			method: 'Associators',
			filter: "{ return simplified.Active.toLowerCase() == 'true'; }",
			parms: {
				ObjectName: 0,
				AssocClass: 'CIM_HostedCollection',
				ResultClass: 'CIM_ZoneSet'
			},
			queries: [ {
				name: 'zones',
				method: 'Associators',
				parms: {
					ObjectName: 0,
					AssocClass: 'CIM_MemberOfCollection',
					ResultClass: 'CIM_Zone'
				},
				queries: [ {
					name: 'zoneAliases',
					method: 'Associators',
					parms: {
						ObjectName: 0,
						AssocClass: 'CIM_MemberOfCollection',
						ResultClass: 'CIM_NamedAddressCollection'
					},
					queries: [ {
						name: 'zoneAliasMembers',
						method: 'Associators',
						parms: {
							ObjectName: 0,
							AssocClass: 'CIM_ElementSettingData',
							ResultClass: 'CIM_ZoneMembershipSettingData'
						}							
					} ]
				}, {
					name: 'zoneMembers',
					method: 'Associators',
					parms: {
						ObjectName: 0,
						AssocClass: 'CIM_ElementSettingData',
						ResultClass: 'CIM_ZoneMembershipSettingData'
					}
				} ]
			}]
		} ],
	}],
	result = {
		cmdb_ci_san:                     [ ],
		cmdb_ci_san_fabric:              fabrics,
		cmdb_ci_san_endpoint:            endpoints,
		cmdb_ci_san_connection:          endpointConnections,
		cmdb_ci_san_zone_set:            zoneSets,
		cmdb_ci_san_zone:                zones,
		cmdb_ci_san_zone_member:         zoneMembers,
		cmdb_ci_san_zone_alias:          zoneAliases,
		cmdb_ci_san_zone_alias_member:   zoneAliasMembers
	},
	protocol = probe.getParameter('schema'),
	port = probe.getParameter('port') || 5989,
	device_instance = probe.getParameter('device_instance'),
	namespace = probe.getParameter('namespace'),
	multipleOperationsSupported = probe.getParameter('multipleOperationsSupported'),
	chunkSize = probe.getParameter('chunk_size');

// We queried the SMI-S server in CIM - Classify to see if it supports multiple
// operations.  If it doesn't we use a chunk size of 1, which isn't a multiple
// operation.
if (!multipleOperationsSupported || (multipleOperationsSupported.toLowerCase() != 'true'))
	chunkSize = 1;
else if (chunkSize) {
	try {
		chunkSize = eval('' + chunkSize);
	} catch (e) {
		chunkSize = 1;
		errorHandler('Error in chunkSize: ' + e.toString());
	}
}

if (!protocol) {
	protocol = 'http';
	if (port == '5989')
		protocol = 'https';
}

// Execute the queries defined above
CimQuery.query({
	url: protocol + '://' + probe.getParameter('source') + ':' + port,
	credIterator: probe.getCredentials('cim'),
	namespace: probe.getParameter('namespace'),
	probeId: probe.getParameter('probe'),
	queries: queries,
	// Try to get the parameter.  getParameter() returns null if the
	// parm doesn't exist - make sure we have something useful (with the ||
	// operator) and then convert whatever we have from a Java string to
	// the right JavaScript type.
	timeout: +(probe.getParameter('cimquery.timeout') || 15 * 60 * 1000),
	debug: (probe.getParameter('cimquery.debug') || '') + '',
	debugXmlRequest: (probe.getParameter('cimquery.show.xml.request') || '') + '',
	debugXmlResponse: (probe.getParameter('cimquery.show.xml.response') || '') + '',
	debugJsonResponse: (probe.getParameter('cimquery.show.json.response') || '') + '',
	chunkSize: chunkSize || 1,
	errorHandler: errorHandler
});

// A SAN consists of a single fabric.  A fabric consists of a bunch of connections
// between endpoints.  These connections can be collected into a zone (also called a VSAN)
// and zones can be collected into a zoneset.  Zones can also have aliases and the aliases
// can (strangely) have their own members.
// We have to use decircularize() instead of JSON.stringify() because we need to recreate
// the same object graph.  I don't think there are any circular references, but we will
// have multiple references to the same object.  A simplified example:
//
// result = {
//   san: { name: 'My SAN' },
//   fabric: { name: 'My fabric', san: <reference to result.san> }
// };
//
// JSON.parse(JSON.stringify(result)) will not be the same as 'result' - result.san won't
// equal result.fabric.san.  Instead there will be two different objects containing all
// the same values.  decircularize(result) will return something like:
// '{ san: { name: "My SAN" }, fabric: { name: "My fabric", san: "$^1" } }'
// reattach() will recognize "$^1" as a reference to the first object in the serialized
// string and will set the value correctly instead of making a duplicate object.
result = JsonCi.decircularize(result);

probe.setPostProcessOutput(result);

return { queries: queries };

/*
 * Handler for errors from CimQuery script include
 */
function errorHandler(msg) {
	probe.appendWarning(msg);
}

function handler(cimFabric) {
	var fabric = {
			name: cimFabric.ElementName,
			wwn: cimFabric.NameFormat == 'WWN' ? StorageDiscoveryUtil.parseStorageWWN(cimFabric.Name) : cimFabric.Name
		};

	cimFabric.associations.san.some(
		function(cimSan) {
			san = {
				name: cimSan.ElementName,
				wwn: cimSan.NameFormat == 'WWN' ? StorageDiscoveryUtil.parseStorageWWN(cimSan.Name) : cimSan.Name
			};
			result.cmdb_ci_san.push(san);
			return true;
		});

	fabric.san = san;
	fabrics.push(fabric);

	cimFabric.associations.connectivityCollections.forEach(
		function(cimConnectivityCollection) {
			cimConnectivityCollection.associations.endpoints.forEach(
				function(cimEndPoint) {
					var endpoint1, endpoint2, ep;
					endpoint1 = getEndpoint(cimEndPoint.Name);
					cimEndPoint.associations.endpointConnections.forEach(
						function(cimEndpointConnection) {
							endpoint2 = getEndpoint(cimEndpointConnection.Name);
							if (endpoint1.name > endpoint2.name) {
								ep = endpoint1;
								endpoint1 = endpoint2;
								endpoint2 = ep;
							}
					
							endpointConnections.push({
								endpoint1: endpoint1,
								endpoint2: endpoint2,
								san: san
							});
						});
				});
		});

	// Iterate over zonesets
	cimFabric.associations.zoneSets.forEach(
		function(cimZoneSet) {
			var zoneSet = {
				name: cimZoneSet.ElementName,
				fabric: fabric
			};
			zoneSets.push(zoneSet);
			// Iterate over zones in a zoneset
			cimZoneSet.associations.zones.forEach(
				function(cimZone) {
					var zone = {
						name: cimZone.ElementName,
						operational_status: cimZone.active == 'TRUE' ? 1 : 0,
						zone_set: zoneSet
					};
					zones.push(zone);
					// Iterate over members in a zone
					cimZone.associations.zoneMembers.forEach(
						function(cimZoneMember) {
							getMember(cimZoneMember.ConnectivityMemberID, zone);
						});
					// Iterate over aliases in a zone
					cimZone.associations.zoneAliases.forEach(
						function(cimZoneAlias) {
							var zoneAlias = {
								name: cimZoneAlias.ElementName,
								zone_alias_id: cimZoneAlias.CollectionAlias,
								zone: zone
							};
							zoneAliases.push(zoneAlias);
							// Iterate over alias members in a zone alias
							cimZoneAlias.associations.zoneAliasMembers.forEach(
								function(cimZoneAliasMember) {
									zoneAliasMembers.push({
										name: StorageDiscoveryUtil.parseStorageWWN(cimZoneAliasMember.ConnectivityMemberID),
										zone_alias: zoneAlias,
										zone_member: getMember(cimZoneAliasMember.ConnectivityMemberID, zone)
									});
								});
						});
				});
		});
	
	function getMember(name, zone) {
		var member,
			endpoint = getEndpoint(name);
		if (!memberMap[endpoint.name]) {
			member = {
				name: endpoint.name,
				zone: zone,
				endpoint: endpoint
			};
			memberMap[endpoint.name] = member;
			zoneMembers.push(member);
		}

		return memberMap[endpoint.name];
	}

	function getEndpoint(name) {
		var endpoint;

		name = StorageDiscoveryUtil.parseStorageWWN(name);
		if (!endpointMap[name]) {
			endpoint = {
				name: name,
				san: san
			};
			endpointMap[name] = endpoint;
			endpoints.push(endpoint);
		}

		return endpointMap[name];
	}
}

/*
 * Get a probe parameter or a MID server property
 */
function getProperty(name) {
	// Try to get the parameter.  getParameter() and getProperty() return null if the
	// parm/prop doesn't exist.  Return an empty string in this case.
	var val = probe.getParameter(name) || midConfig.getProperty('mid.' + name) || midConfig.getProperty(name) || '';
	// If we didn't get an empty string in the previous statement, we need to convert
	// the value to a JavaScript string.
	return '' + val;
}

})();
