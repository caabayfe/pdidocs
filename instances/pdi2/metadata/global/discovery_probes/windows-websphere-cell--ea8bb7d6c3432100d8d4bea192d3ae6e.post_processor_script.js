new ProbePostProcessor({

	/**
     * Runs the probe instance
     */
    process : function() {
		var cleanedOutput = output.replace("<![CDATA[", "");
		cleanedOutput = cleanedOutput.replace("]]>", "");
        var xmlDoc = XMLUtil.parse(cleanedOutput);
		
        if (!xmlDoc) 
			return;
			
		var parent = xmlDoc.getDocumentElement();
		related_data.cell_type = XMLUtil.getAttribute(parent, "cellType");
		related_data.cell_id = XMLUtil.getAttribute(parent, "xmi:id");
	    related_data.cell_discovery_protocol = XMLUtil.getAttribute(parent, "cellDiscoveryProtocol");
		related_data.name = XMLUtil.getAttribute(parent, "name");
		related_data.short_description = XMLUtil.getChildTextByTagName(parent, "contact");

	},

	type: "ProbePostProcessor"
});
