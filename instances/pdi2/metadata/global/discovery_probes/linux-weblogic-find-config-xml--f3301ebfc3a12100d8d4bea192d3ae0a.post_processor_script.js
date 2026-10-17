new ProbePostProcessor({

	/**
     * Runs the probe instance
     */
    process : function() {
		related_data.apps = [];
		related_data.servers = [];

		if (output == "This is not an AdminServer") {
			related_data.info = "This probe was triggered on a Managed Server and not an AdminServer so processing will be skipped.";
			return;
		}

        // Parse config.xml for server info
        var xmlDoc = XMLUtil.parse(output);

		if (!xmlDoc)
			return;

        var parent = xmlDoc.getDocumentElement();
        var version = this.getTextFromChildNode(parent, "domain-version");
        current.version = version;
		var domain = this.getTextFromChildNode(parent, "name");
        current.weblogic_domain = domain;

        var servers = XMLUtil.selectNodes(parent, "//server");
        // Create or Update weblogic server CIs
        for (var i = 0; i < servers.length; i++) {
			var serverNode = servers.item(i);
			var name = this.getTextFromChildNode(serverNode, "name");
			related_data.servers.push(name);
		}

		var apps = XMLUtil.selectNodes(parent, "//app-deployment");
        for (var i = 0; i < apps.length; i++) {
			var appNode = apps.item(i);
			var target = this.getTextFromChildNode(appNode, "target");
			// Case when same app is deployed to multiple servers
			// Commas are not valid server names so this should be safe
			var targets = target.split(",");
			for (var j = 0; j < targets.length; j++) {
				if (targets[j] != "") {
					var app = {
						'name' : this.getTextFromChildNode(appNode, "name"),
						'path' : this.getTextFromChildNode(appNode, "source-path"),
						'target' : targets[j] + ''
					};
					related_data.apps.push(app);
				}
			}
		}
	},

	getTextFromChildNode: function(parent, target) {
		var node = XMLUtil.getChildByTagName(parent, target);
		return XMLUtil.getAllText(node);
    },

	type: "ProbePostProcessor"
});
