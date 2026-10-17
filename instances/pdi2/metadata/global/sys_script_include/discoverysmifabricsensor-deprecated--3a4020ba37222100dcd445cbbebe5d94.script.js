// Discovery

ArrayPolyfill;

/**
 * Processes SAN fabric topologies per SMI-S.
 * @author roy.laurie
 */
var DiscoverySmiFabricSensor_deprecated = Class.create();

DiscoverySmiFabricSensor_deprecated.prototype = Object.extendsObject(CimSensor, {	
	processCim: function(results, deviceCi) {
		if (output.length && (JSON.stringify(results) == '{}'))
			results = JSON.parse(output);

		var sanCi = this._processSan(results);
		if (sanCi === null)
			return;

		this._setCiLocation(deviceCi);

		// link the switch to the SAN
		deviceCi.data.san = sanCi;
		sanCi.addReferral(deviceCi);

		var fabricCis = this._processFabrics(deviceCi, results, sanCi);
		var zoneSetCis = this._processZoneSets(results, fabricCis);
		var zoneCis = this._processZones(results, zoneSetCis);		
		
		var endpointCis = this._processEndpoints(results, sanCi);
		var endpointConnectionCis = this._processEndpointConnections(results, sanCi, endpointCis);
		
		var zoneMemberCis = this._processZoneMembers(results, zoneCis, endpointCis);
		var zoneAliasCis = this._processZoneAliases(results, zoneCis, zoneMemberCis);
		var zoneAliasMemberCis = this._processZoneAliasMembers(results, zoneAliasCis, zoneMemberCis);
	},
	
	_processSan: function(results) {
		if (results.san.length !== 1) {
			this.warn('SAN results not available.');
			return null;
		}
		
		if (this.isDebugging())
			Debug.logObject('SAN results', results.san);
		
		var ciSchema = this.getCiSchema();
		var sanData = results.san[0];
	
		// wwn
		var wwn = null;
		if (sanData.NameFormat === 'WWN')
			wwn = new DiscoveryWWN(sanData.Name).toString();
		
		var sanCi = ciSchema.createCi('cmdb_ci_san', {
			name: sanData.ElementName,
			san_id: ( wwn || sanData.Name ),
			wwn: wwn,
		});

		this._setCiLocation(sanCi);
		
		if (this.isDebugging())
			Debug.logObject('SAN Ci', sanCi.toShallowObj());
		
		return sanCi;
	},
	
	_processFabrics: function(deviceCi, results, sanCi) {
		if (this.isDebugging())
			Debug.logObject('SAN Fabric results', results.fabrics);

		var wwn,
			fabricCis = {},
			fabricData = results.fabrics[0],
			fabricCiData = deviceCi.data;

		if (fabricData.NameFormat === 'WWN')
			wwn = new DiscoveryWWN(fabricData.Name).toString();

		fabricCiData.name = fabricData.ElementName;
		fabricCiData.fabric_id = ( wwn || fabricData.Name );
		fabricCiData.wwn = wwn;
		fabricCiData.san = sanCi;
		
		this._setCiLocation(sanCi);
			
		sanCi.addReferral(deviceCi);
			
		fabricCis[fabricData._path] = deviceCi;
			
		if (this.isDebugging())
			Debug.logObject('Fabric Ci', deviceCi.toShallowObj());

		return fabricCis;
	},
	
	_processZoneSets: function(results, fabricCis) {
		if (this.isDebugging())
			Debug.logObject('SAN Zone Set results', results.zoneSets);
		
		var ciSchema = this.getCiSchema();
		
		var zoneSetCis = {};
		for (var i = 0; i < results.zoneSets.length; ++i) {
			var zoneSetData = results.zoneSets[i];
			
			var fabricCi = fabricCis[zoneSetData._associations[0].originPath];
			if (typeof fabricCi === 'undefined') {
				this.warn('Unable to find a Fabric for Zone Set: ' + zoneSetData.ElementName);
				continue;
			}
			
			var zoneSetCi = ciSchema.createCi('cmdb_ci_san_zone_set', {
				name: zoneSetData.ElementName,
				zone_set_id: zoneSetData.ElementName,
				fabric: fabricCi,
			});

			this._setCiLocation(zoneSetCi);
			
			fabricCi.addReferral(zoneSetCi);
			
			zoneSetCis[zoneSetData._path] = zoneSetCi;
			
			if (this.isDebugging())
				Debug.logObject('Zone Set Ci', zoneSetCi.toShallowObj());
		}
		
		return zoneSetCis;
	},
	
	_processZones: function(results, zoneSetCis) {
		if (this.isDebugging())
			Debug.logObject('SAN Zone results', results.zones);
		
		var ciSchema = this.getCiSchema();
		
		var zoneCis = {};
		for (var i = 0; i < results.zones.length; ++i) {
			var zoneData = results.zones[i];
			
			var zoneSetCi = zoneSetCis[zoneData._associations[0].originPath];
			if (typeof zoneSetCi === 'undefined') {
				this.warn('Unable to find a Zone Set for Zone: ' + zoneData.ElementName);
				continue;
			}
			
			var zoneCi = ciSchema.createCi('cmdb_ci_san_zone', {
				name: zoneData.ElementName,
				zone_id: zoneData.ElementName,
				operational_status: ( zoneData.active === 'TRUE' ? 1 : 0 ),
				zone_set: zoneSetCi,
			});
			
			this._setCiLocation(zoneCi);
			
			zoneSetCi.addReferral(zoneCi);
			
			zoneCis[zoneData._path] = zoneCi;
			
			if (this.isDebugging())
				Debug.logObject('Zone Ci', zoneCi.toShallowObj());
		}
		
		return zoneCis;
	},
	
	_processEndpoints: function(results, sanCi) {
		if (this.isDebugging())
			Debug.logObject('SAN Endpoint results', results.endpoints);
		
		var ciSchema = this.getCiSchema();
		
		var endpointCis = {};
		for (var i = 0; i < results.endpoints.length; ++i) {
			var endpointData = results.endpoints[i];
			
			var wwn = new DiscoveryWWN(endpointData.Name).toString();
			var endpointCi = ciSchema.createCi('cmdb_ci_san_endpoint', {
				name: wwn,
				endpoint_id: wwn,
				san: sanCi
			});
			
			this._setCiLocation(endpointCi);
			
			sanCi.addReferral(endpointCi);
			
			if (this.isDebugging())
				Debug.logObject('Endpoint Ci', endpointCi.toShallowObj());
			
			endpointCis[endpointData._path] = endpointCi;
		}
		
		return endpointCis;
		
	},

	_processZoneMembers: function(results, zoneCis, endpointCis) {
		if (this.isDebugging())
			Debug.logObject('Zone Member results', results.zoneMembers);
		
		var ciSchema = this.getCiSchema();
		
		var zoneMemberCis = [];
		for (var i = 0; i < results.zoneMembers.length; ++i) {
			var zoneMemberData = results.zoneMembers[i];
			
			var zoneCi = zoneCis[zoneMemberData._associations[0].originPath],
				parsedCMID = StorageWWN.parse(zoneMemberData.ConnectivityMemberID);

			if (typeof zoneCi === 'undefined') {
				this.warn('Unable to find a Zone for Zone Member: ' + parsedCMID);
				continue;
			}
			
			var endpointCi = null;

			for (var endpointCimPath in endpointCis) {
				var ci = endpointCis[endpointCimPath];
				if ((ci.data.endpoint_id === parsedCMID) || (ci.data.endpoint_id === zoneMemberData.ConnectivityMemberID)) {
					endpointCi = ci;
					break;
				}
			}
			
			if (endpointCi === null) {
				this.warn('Unable to find Endpoint for Zone Member: ' + parsedCMID);
				continue;
			}
			
			var zoneMemberCi = ciSchema.createCi('cmdb_ci_san_zone_member', {
				name: endpointCi.data.name,
				zone: zoneCi,
				endpoint: endpointCi
			});
			
			this._setCiLocation(zoneMemberCi);
			
			zoneCi.addReferral(zoneMemberCi);
			endpointCi.addReferral(zoneMemberCi);
			
			if (this.isDebugging())
				Debug.logObject('Zone Member Ci', zoneMemberCi.toShallowObj());
			
			zoneMemberCis[zoneMemberData._path] = zoneMemberCi;
		}

		return zoneMemberCis;
		
	},
	
	_processZoneAliases: function(results, zoneCis) {
		if (this.isDebugging())
			Debug.logObject('Zone Alias results', results.zoneAliases);
		
		var ciSchema = this.getCiSchema();
		
		var zoneAliasCis = [];
		for (var i = 0; i < results.zoneAliases.length; ++i) {
			var zoneAliasData = results.zoneAliases[i],
				aliasId = zoneAliasData.CollectionAlias || zoneAliasData.ElementName;

			var zoneCi = zoneCis[zoneAliasData._associations[0].originPath];
			if (typeof zoneCi === 'undefined') {
				this.warn('Unable to find a Zone for Zone Alias: ' + aliasId);
				continue;
			}
			
			var zoneAliasCi = ciSchema.createCi('cmdb_ci_san_zone_alias', {
				name: aliasId,
				zone_alias_id: aliasId,
				zone: zoneCi,
			});
			
			this._setCiLocation(zoneAliasCi);
			
			zoneCi.addReferral(zoneAliasCi);
			
			if (this.isDebugging())
				Debug.logObject('Zone Alias Ci', zoneAliasCi.toShallowObj());
			
			zoneAliasCis[zoneAliasData._path] = zoneAliasCi;
		}
		
		return zoneAliasCis;
		
	},
	
	_processZoneAliasMembers: function(results, zoneAliasCis, zoneMemberCis) {
		if (this.isDebugging())
			Debug.logObject('Zone Alias Member results', results.zoneAliasMembers);

		var ciSchema = this.getCiSchema();
		
		var zoneAliasMemberCis = [];
		for (var i = 0; i < results.zoneAliasMembers.length; ++i) {
			var zoneAliasMemberData = results.zoneAliasMembers[i],
				parsedCMID = StorageWWN.parse(zoneAliasMemberData.ConnectivityMemberID);
			
			var zoneAliasCi = zoneAliasCis[zoneAliasMemberData._associations[0].originPath];
			if (typeof zoneAliasCi === 'undefined') {
				this.warn('Unable to find a Zone Alias for Zone Alias Member: ' + parsedCMID);
				continue;
			}
			
			var zoneMemberCi = zoneMemberCis[zoneAliasMemberData._path];
			if (typeof zoneMemberCi === 'undefined') {
				this.warn('Unable to find a Zone Member for Zone Alias Member: ' + parsedCMID);
				continue;
			}
			
			var zoneAliasMemberCi = ciSchema.createCi('cmdb_ci_san_zone_alias_member', {
				name: parsedCMID,
				zone_alias: zoneAliasCi,
				zone_member: zoneMemberCi
			});
			
			this._setCiLocation(zoneAliasMemberCi);
			
			zoneAliasCi.addReferral(zoneAliasMemberCi);
			zoneMemberCi.addReferral(zoneAliasMemberCi);
			
			if (this.isDebugging())
				Debug.logObject('Zone Alias Member Ci', zoneAliasMemberCi.toShallowObj());
			
			zoneAliasMemberCis[zoneAliasMemberData._path] = zoneAliasMemberCi;
		}
		
		return zoneAliasMemberCis;
		
	},
	
	_processEndpointConnections: function(results, sanCi, endpointCis) {
		if (this.isDebugging())
			Debug.logObject('Endpoint Connection results', results.endpointConnections);
		
		var ciSchema = this.getCiSchema();
		
		var endpointConnectionCis = [];
		for (var i = 0; i < results.endpointConnections.length; ++i) {
			var endpointConnectionData = results.endpointConnections[i];
			
			var endpoint1Ci = endpointCis[endpointConnectionData._associations[0].originPath];
			if (typeof endpoint1Ci === 'undefined') {
				this.warn('Unable to find a Endpoint #1 for Connection: ' + endpointConnectionData._path);
				continue;
			}
			
			var endpoint2Ci = endpointCis[endpointConnectionData._path];
			if (typeof endpoint2Ci === 'undefined') {
				this.warn('Unable to find a Downstream Endpoint for Connection: ' + endpointConnectionData._path);
				continue;
			}
			
			// determine which ci should be "endpoint1". swap references if necessary.
			var lhWwn = new DiscoveryWWN(endpoint1Ci.data.endpoint_id);
			if (lhWwn.greaterThan(endpoint2Ci.data.endpoint_id)) {
				var ci1 = endpoint1Ci;
				endpoint1Ci = endpoint2Ci;
				endpoint2Ci = ci1;
			}
			
			var endpointConnectionCi = ciSchema.createCi('cmdb_ci_san_connection', {
				endpoint1: endpoint1Ci,
				endpoint2: endpoint2Ci,
				san: sanCi,
			});
			
			this._setCiLocation(endpointConnectionCi);
			
			endpoint1Ci.addReferral(endpointConnectionCi, 'cmdb_ci_san_connection', 'endpoint1');
			endpoint2Ci.addReferral(endpointConnectionCi, 'cmdb_ci_san_connection', 'endpoint2');
			sanCi.addReferral(endpointConnectionCi);
			
			if (this.isDebugging())
				Debug.logObject('SAN Connection Ci', endpointConnectionCi.toShallowObj());
			
			endpointConnectionCis[endpointConnectionData._path] = endpointConnectionCi;
		}
		
		return endpointConnectionCis;
	},
	
	_setCiLocation: function(ci) {
		// update location if set
		var locationId = this.getLocationID();
		if (!gs.nil(locationId))
			ci.data.location = locationId;
	},

    type: 'DiscoverySmiFabricSensor_deprecated'
});
