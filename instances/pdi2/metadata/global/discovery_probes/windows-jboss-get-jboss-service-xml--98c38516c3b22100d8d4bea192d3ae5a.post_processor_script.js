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
		var node = XMLUtil.getChildByTagName(parent, "mbean");
		related_data.name = XMLUtil.getAttribute(node, "name");
		var attr = XMLUtil.getChildByTagName(node, "attribute");
		related_data.desc = XMLUtil.getAttribute(attr, "name");
	},

	type: "ProbePostProcessor"
});
