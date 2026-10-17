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
		
		related_data.services = [];
		// Services is a java ArrayList
		var services = XMLUtil.getChildrenByTagName(parent, "services");
		for (var i = 0; i < services.size(); i++) {
			var service = {};
			service.name = XMLUtil.getAttribute(services.get(i), "xmi:type");
			service.id = XMLUtil.getAttribute(services.get(i), "xmi:id");
			related_data.services.push(service);
		}

	},

	type: "ProbePostProcessor"
});
