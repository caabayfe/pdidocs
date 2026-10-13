new DiscoverySensor({
    process: function(result) {		
        // Parse config.xml for server info test
		var cleanedOutput = result.replace("<![CDATA[", "");
		cleanedOutput = cleanedOutput.replace("]]>", "");
        var xmlDoc = XMLUtil.parse(cleanedOutput);
		
		if (!xmlDoc)
			return;
		
	    var parent = xmlDoc.getDocumentElement();
        var name = this.getTextFromChildNode(parent, "display-name");
		var description = this.getTextFromChildNode(parent, "description");
		var servlet = XMLUtil.selectSingleNode(parent, "//servlet")
		var servletName = this.getTextFromChildNode(servlet, "servlet-name");
		var servletClass = this.getTextFromChildNode(servlet, "servlet-class");
		
		// assume document base is before \WEB-INF
	    var path = g_probe.getParameter("filename");
	    var end = path.indexOf("\\WEB-INF");

        var docBase = path.substring(0, end);
		
		var gr = new GlideRecord('cmdb_ci_web_application');
        gr.addQuery("app_server", g_device.getCmdbCi());
		gr.addQuery("document_base", docBase);
        gr.query();
        if (!gr.next()) {
            gr.initialize();
            gr.app_server = g_device.getCmdbCi();
            gr.name = name;
			gr.servlet_name = servletName;
			gr.servlet_class = servletClass;
			gr.document_base = docBase;
			gr.tcp_port = this.getCmdbRecord().tcp_port;
			gr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
			
			if (description)
				gr.short_description = GlideStringUtil.normalizeWhitespace(description);
			
            gr.insert();
            g_disco_functions.createRelationship(g_device.getCmdbCi(), gr, "Contains::Contained by");
        }

	},
	
	getTextFromChildNode: function(parent, target) {
		var node = XMLUtil.getChildByTagName(parent, target);
		return XMLUtil.getAllText(node);
	},
	
    type: "DiscoverySensor "
});
