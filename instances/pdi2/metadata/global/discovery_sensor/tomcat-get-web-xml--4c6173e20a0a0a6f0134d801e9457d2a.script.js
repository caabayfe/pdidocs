var webxml = g_probe.getParameter("filename");

if (webxml) {
  // assume document base is between webapps/ and /WEB-INF
  var begin = webxml.indexOf("webapps/") + 8;
  var end = webxml.indexOf("/WEB-INF");

  var docBase = webxml.substring(begin, end);
  current.addQuery("app_server", g_device.getCmdbCi());
  current.addQuery("document_base", docBase);
  current.query();
  if (!current.next()) {
    current.initialize();
    current.setNewGuid();
    current.app_server = g_device.getCmdbCi();
    current.document_base = docBase;
	
	if (short_description)
		current.short_description = GlideStringUtil.normalizeWhitespace(short_description);
	
    current.insert();

    // make relationship
    g_disco_functions.createRelationship(g_device.getCmdbCi(), current.sys_id, "Contains::Contained by");
  }
}
