var saveFlowDesignerFeatures = Class.create();
saveFlowDesignerFeatures.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	saveFeatures: function() {
		var glideLists = this.getParameter("sysparm_glideLists");
		var featureAccessEnabledChecked = this.getParameter("sysparm_featureAccessEnabled");
		try {
			var parsedGlideLists = JSON.parse(glideLists);
		} catch (e) {
			return false;
		}
		for (var i = 0; i < parsedGlideLists.length; i++){
			var gr = new GlideRecord("sys_hub_resource_filter_rule");
			var resourceFilterRuleName = this.buildName(parsedGlideLists[i].id);
			gr.query("name", resourceFilterRuleName);
			if(gr.next()) {
			  var role = parsedGlideLists[i].innerHTML || "";
			  gr.setValue("role", role);
			  gr.update();
			}
		}
		
		var gr2 = new GlideRecord("sys_hub_resource_filter_rule");

		// either make all inactive/active for UI Elements, or else "All UI elements" will override the individual records
		if (!featureAccessEnabledChecked) {
			gr2.addQuery("resource.name", "All UI Elements");
			gr2.query();
			while(gr2.next()) {
				gr2.setValue("active", true);
				gr2.update();
			}
		} else {
			gr2.addQuery("resource.name", "All UI Elements");
			gr2.query();
			while(gr2.next()) {
				gr2.setValue("active", false);
				gr2.update();
			}
		}
		return true;
	},
	bulkAddRole: function() {
		var elementNames = this._parseElementNames();
		var roleData = this.getParameter("sysparm_roleData");
		if (!elementNames || !roleData) return false;

		var newRoles = roleData.split(",");
		for (var k = 0; k < newRoles.length; k++) {
			newRoles[k] = newRoles[k].trim();
		}

		for (var i = 0; i < elementNames.length; i++) {
			var gr = new GlideRecord("sys_hub_resource_filter_rule");
			gr.get("name", "(Feature Access Page) " + elementNames[i]);
			if (gr.isValidRecord()) {
				var current = gr.getValue("role") || "";
				var currentRoles = current ? current.split(",") : [];
				for (var j = 0; j < currentRoles.length; j++) {
					currentRoles[j] = currentRoles[j].trim();
				}
				for (var j = 0; j < newRoles.length; j++) {
					if (newRoles[j] && currentRoles.indexOf(newRoles[j]) === -1) {
						currentRoles.push(newRoles[j]);
					}
				}
				gr.setValue("role", currentRoles.join(","));
				gr.update();
			}
		}
		return true;
	},
	bulkRemoveRole: function() {
		var elementNames = this._parseElementNames();
		var roleData = this.getParameter("sysparm_roleData");
		if (!elementNames || !roleData) return false;

		// Use object map instead of Array.indexOf to avoid Rhino Java/JS string comparison issues
		var toRemoveMap = {};
		var names = ('' + roleData).split(",");
		for (var k = 0; k < names.length; k++) {
			var name = ('' + names[k]).trim();
			if (name) {
				toRemoveMap[name] = true;
			}
		}

		for (var i = 0; i < elementNames.length; i++) {
			var gr = new GlideRecord("sys_hub_resource_filter_rule");
			gr.get("name", "(Feature Access Page) " + elementNames[i]);
			if (gr.isValidRecord()) {
				var current = '' + (gr.getValue("role") || "");
				if (current) {
					var currentRoles = current.split(",");
					var filtered = [];
					for (var j = 0; j < currentRoles.length; j++) {
						var entry = ('' + currentRoles[j]).trim();
						if (entry && !toRemoveMap[entry]) {
							filtered.push(entry);
						}
					}
					gr.setValue("role", filtered.join(","));
					gr.update();
				}
			}
		}
		return true;
	},
	bulkClearRoles: function() {
		var elementNames = this._parseElementNames();
		if (!elementNames) return false;

		for (var i = 0; i < elementNames.length; i++) {
			var gr = new GlideRecord("sys_hub_resource_filter_rule");
			gr.get("name", "(Feature Access Page) " + elementNames[i]);
			if (gr.isValidRecord()) {
				gr.setValue("role", "");
				gr.update();
			}
		}
		return true;
	},
	_parseElementNames: function() {
		try {
			return JSON.parse(this.getParameter("sysparm_elementNames"));
		} catch (e) {
			return null;
		}
	},
	buildName: function(name) {
		var splitName = name.split('_');
		var result = "";
		// this removes the "zmyListCollector" and "nonedit" from the beginning and end, respectively
		// so we can get the name by itself
		splitName.shift();
		splitName.pop();
		result = splitName.join('_');
		return "(Feature Access Page) " + result;
	},
    type: 'saveFlowDesignerFeatures'
});
