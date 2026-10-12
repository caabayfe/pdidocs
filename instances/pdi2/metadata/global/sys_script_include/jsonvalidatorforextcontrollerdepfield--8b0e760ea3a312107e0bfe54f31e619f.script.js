var JsonValidatorForExtControllerDepField = Class.create();
JsonValidatorForExtControllerDepField.prototype = {
    initialize: function() {
    },

	validateJsonRecord: function(current) {	
		var extControllerDep;
		try {
			extControllerDep = JSON.parse(current.ext_controller_dep);
		} catch(e) {
			gs.addErrorMessage(gs.getMessage("Unable to parse external controller dependencies: {0}", e));
			current.setAbortAction(true);
			return;
		}

		var sysId = current.sys_id;
		var isCbComponent = UxFrameworkScriptables.isCBComponent(sysId);
		var category = current.category;
		if (category != "ui_controller" && category != "bundle" && !isCbComponent && JSUtil.has(extControllerDep)) {
			gs.addErrorMessage(gs.getMessage("External controller dependencies can only be populated when Category is \"UI Controller\", \"Bundle\", or the Macroponent is a Controller Builder component."));
			current.setAbortAction(true);
			return;
		}

		// Check if external controller dependencies is an array
		if (!Array.isArray(extControllerDep)) {
			gs.addErrorMessage(gs.getMessage("External controller dependencies needs to be an array."));
			current.setAbortAction(true);
			return;
		}

		// Iterate through each item in the array and validate
		for (var i = 0; i < extControllerDep.length; i++) {
			var item = extControllerDep[i];
			this.validate(i, item, category, isCbComponent, current);
		}
    },

	validate: function(i, item, category, isCbComponent, current) {
		var rules = this.getRules(i, item, category, isCbComponent);

		for (var j = 0; j < rules.length; j++) {
			var rule = rules[j];
			
			if (rule.errorCondition()) {
				gs.addErrorMessage(rule.message);
				current.setAbortAction(true);
				return;
			}
		}
	},

	getRules: function(i, item, category, isCbComponent) {
		return [{
				// Check if the item is an object
				errorCondition: function() {
					return JSUtil.doesNotHave(item) || typeof item !== 'object';
				},
				message: gs.getMessage("Item at index {0} needs to be an object.", i)
			},
			{
				// Check if name field is present, of string data type and non-null
				errorCondition: function() {
					return !item.name || typeof item.name !== 'string';
				},
				message: gs.getMessage("Item at index {0} \"name\" field needs to be present and a string.", i)
			},
			{
				// Check if label field is present, of string data type and non-null
				errorCondition: function() {
					return !item.label || typeof item.label !== 'string';
				},
				message: gs.getMessage("Item at index {0} \"label\" field needs to be present and a string.", i)
			},
			{
				// Check if controllerSysId is a valid controller id
				errorCondition: function() {
					var gr = new GlideRecord('sys_ux_controller');
					return !gr.get(item.controllerSysId);
				},
				message: gs.getMessage("The sys_id {0} was not found in the sys_ux_controller table. Please use a valid sys_id.", item.controllerSysId)
			},
			{
				// Check if event mapping is an array when category is UI controller
				errorCondition: function() {
					return category == "ui_controller" && JSUtil.has(item.eventMappings) && !Array.isArray(item.eventMappings);
				},
				message: gs.getMessage("Item at index {0} \"event mapping\" needs to be an array when category is UI controller.", i)
			},
			{
				// Check if event mapping not present when it's CB component
				errorCondition: function() {
					return isCbComponent && JSUtil.has(item.eventMappings);
				},
				message: gs.getMessage("Item at index {0} \"event mapping\" is not allowed to be present when the Macroponent is a Controller Builder component.", i)
			}
		];
	},

    type: 'JsonValidatorForExtControllerDepField'
};
