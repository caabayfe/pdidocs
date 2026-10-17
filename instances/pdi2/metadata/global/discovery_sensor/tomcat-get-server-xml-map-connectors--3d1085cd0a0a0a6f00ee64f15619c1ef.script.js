current.addQuery("tomcat", g_device.getCmdbCi());
current.addQuery("port", portVar);
current.query();

if (!current.next()) {
  current.initialize();
  current.setNewGuid();
  current.tomcat = g_device.getCmdbCi();
  current.port = portVar;
  current.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
  current.insert();

  g_disco_functions.createRelationship(g_device.getCmdbCi(), current.sys_id, "Contains::Contained by");
}
