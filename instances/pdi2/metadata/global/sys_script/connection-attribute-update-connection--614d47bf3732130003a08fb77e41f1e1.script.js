function updateConnection() {
	var connGr = new GlideRecord('sys_connection');
	var aliasId = current.getValue('model_id');
	connGr.addQuery('connection_alias', aliasId);
	connGr.query();
	if (connGr.next()) { //could be multiple attached but not currently supporting multiple conns in int hub
		var probe = new SncProbe();
		probe.topic = "SystemCommand";
		probe.source = "connection_cache_update";
		probe.setEccPriority("0");
		probe.addParameter("skip_sensor", "true");
		probe.addParameter("new_connection_info_cache_key", aliasId);
		probe.addParameter("remove_connection_info_cache_key", "");
		probe.addParameter("connection_resolver", SNC.ConnectionPayloadBuilder.generateECCPayload(aliasId, ""));
		probe.create("mid.server.*");
	}
}
            
updateConnection();
