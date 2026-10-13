// Discovery

var DiscoverySmiFabricSensor;

(function() {

var locationId,
	schema = {
		cmdb_ci_san: {
			index: [ 'san_id' ],
			fixup: function(san) { san.location = locationId; san.san_id = san.wwn; }
		}, cmdb_ci_san_fabric: {
			index: [ 'fabric_id' ],
			fixup: function(fabric) { fabric.location = locationId; fabric.fabric_id = fabric.wwn; }
		}, cmdb_ci_san_endpoint: {
			index: [ 'endpoint_id', 'san' ],
			fixup: fixupEndpoint
		}, cmdb_ci_san_connection: {
			index: [ 'san', 'endpoint1', 'endpoint2' ],
			fixup: function(connection) { connection.location = locationId; }
		}, cmdb_ci_san_zone_set: {
			index: [ 'zone_set_id', 'fabric' ],
			fixup: function(zoneset) { zoneset.location = locationId; zoneset.zone_set_id = zoneset.name; }
		}, cmdb_ci_san_zone: {
			index: [ 'zone_id', 'zone_set' ],
			fixup: function(zone) { zone.location = locationId; zone.zone_id = zone.name; }
		}, cmdb_ci_san_zone_member: {
			index: [ 'endpoint', 'zone' ],
			fixup: function(zoneMember) { zoneMember.location = locationId; zoneMember.zone_id = zoneMember.name; }
		}, cmdb_ci_san_zone_alias: {
			index: [ 'zone_alias_id', 'zone' ],
			fixup: function(zoneAlias) { zoneAlias.location = locationId; zoneAlias.zone_id = zoneAlias.name; }
		}, cmdb_ci_san_zone_alias_member: {
			index: [ 'zone_alias', 'zone_member' ],
			fixup: function(zoneAliasMember) { zoneAliasMember.location = locationId; zoneAliasMember.zone_id = zoneAliasMember.name; }
		}
	},
	args = {
		schema: schema
	};

DiscoverySmiFabricSensor = {
	process: process
};

function process(result) {
		args = {
			results: output,
			schema: schema,
			isDebugging: this.isDebugging()
		};

	args.location = this.getLocationID();
	args.statusId = new DiscoveryStatus(g_probe.getParameter('agent_correlator')+'');

	device = this.getCmdbRecord();
	deviceSysId = device && ('' + device.sys_id);  // device.sys_id only looks like a string.  Convert it to a real string.
	locationId = this.getLocationID();

	// prepare() does a few things to all returned objects and then
	// reattaches them, returning the same JS object produced by the probe.
	args.results = JsonCi.prepare(args);

	JsonCi.writeJsObject(args);
	JsonCi.writeRelationships(args);
}

function fixupEndpoint(endpoint) {
	var fc_port, qc,
		gr = new GlideRecord('cmdb_ci_fc_port');

	endpoint.location = locationId;
	endpoint.endpoint_id = endpoint.name;

	gr.addQuery('wwpn', endpoint.name);
	gr.query();
	if (!gr.hasNext() && endpoint.portId) {
		gr = new GlideRecord('cmdb_ci_fc_port');
		gr.addQuery('device_id', endpoint.portId);
		gr.addQuery('computer.sys_class_name', 'cmdb_ci_storage_switch');
		qc = gr.addQuery('computer.name', StorageWWN.parse(endpoint.computerId));
		qc.addOrCondition('computer.name', endpoint.computerId);
		qc.addOrCondition('computer.wwnn', StorageWWN.parse(endpoint.computerId));
		gr.query();
	}

	if (gr.next())
		endpoint.fc_port = '' + gr.sys_id;
}

})();
