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
		var serverEntries = XMLUtil.getChildByTagName(parent, "serverEntries");
		related_data.apps = [];
		// apps is a java ArrayList
		var apps = XMLUtil.getChildrenByTagName(serverEntries, "deployedApplications");
		for (var i = 0; i < apps.size(); i++) {
			var name = XMLUtil.getText(apps.get(i));
			// websphere applications have the format xxx.ear/deployments/xxx
    		// we just use the last part for the app name
			name = name.substring(name.lastIndexOf("/") + 1);
			related_data.apps.push(name);
		}
	},

	type: "ProbePostProcessor"
});
