new DiscoverySensor({
    process: function(result) {
        // Parse config.xml for server info
		var cleanedOutput = result.replace("&lt;![CDATA[", "");
		cleanedOutput = cleanedOutput.replace("]]&gt;", "");
        var xmlDoc = XMLUtil.parse(cleanedOutput);

		if (!xmlDoc)
			return;

	    var parent = xmlDoc.getDocumentElement();
        var version = this.getTextFromChildNode(parent, "domain-version");
        current.version = version;
        var domain = this.getTextFromChildNode(parent, "name");
        current.weblogic_domain = domain;


		// Parse out applications
		var appList = [];
		var apps = XMLUtil.selectNodes(parent, "//app-deployment");
		var appServerName = this.getCmdbRecord().name;
		if (appServerName.indexOf('@') > -1)
			appServerName = appServerName.split('@')[0];

        for (var i = 0; i < apps.length; i++) {
			var appNode = apps.item(i);
			var target = this.getTextFromChildNode(appNode, "target");
			// Case when same app is deployed to multiple servers
			// Commas are not valid server names so this should be safe
			var targets = target.split(",");
			for (var j = 0; j < targets.length; j++) {
				if (appServerName && ('' + targets[j] == '' + appServerName.trim())) {
					var app = {
						'name' : this.getTextFromChildNode(appNode, "name"),
						'path' : this.getTextFromChildNode(appNode, "source-path")
					};
					this.triggerProbe(app.path + "\\WEB-INF\\web.xml");
				}
			}

		}

	},

	triggerProbe: function(fileName) {
        var probe = new Probe.get("Windows - Weblogic - Get web.xml");
        if (probe) {
            probe.setSource(this.getSource());
            probe.addParameter("cmdb_ci", this.getCmdbCi());
            probe.addParameter("filename", fileName);
			probe.setEccPriority(this.getParameter("priority"));
			probe.setMidSelectDetails(this.getParameter("mid_selector_details"));
			var ssmObject = this.getParameter("ssm_object");
			if (ssmObject)
				probe.addParameter("ssm_object", ssmObject);
            probe.create(this.getAgent(), this.getEccQueueId());
        }
    },

	getTextFromChildNode: function(parent, target) {
		var node = XMLUtil.getChildByTagName(parent, target);
		return XMLUtil.getAllText(node);
	},
    type: "DiscoverySensor "
});
