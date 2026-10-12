function updateConnection() {
    var probe = new SncProbe();
	probe.topic = "SystemCommand";
	probe.source = "connection_cache_update";
	probe.setEccPriority("0");
	probe.addParameter("skip_sensor", "true");
	var addAliasIdToCache = (current ? (current.connection_alias ? current.connection_alias.sys_id : "") : "");
	var removeAliasIdFromCache = (previous ? (previous.connection_alias ? previous.connection_alias.sys_id : "") : "");
	probe.addParameter("new_connection_info_cache_key", addAliasIdToCache);
	probe.addParameter("remove_connection_info_cache_key", removeAliasIdFromCache);
	probe.addParameter("connection_resolver", SNC.ConnectionPayloadBuilder.generateECCPayload(addAliasIdToCache, removeAliasIdFromCache));
	probe.create("mid.server.*");
}
            
updateConnection();
