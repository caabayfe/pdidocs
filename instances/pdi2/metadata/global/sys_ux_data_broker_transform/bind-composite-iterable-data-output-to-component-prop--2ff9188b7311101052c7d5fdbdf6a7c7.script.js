function transform(input) {
	
	var compositeData = input
		.graphqlData
		.data
		.GlideCompositeIterableData_Query
		.getCompositeData;
	
	if (!compositeData) {
		return [];
	}
	
	var templateIds = [];
	
	compositeData
		.items
		.forEach(function (item) {
			if (templateIds.indexOf(item.template) === -1) {
				templateIds.push(item.template);
			}
		});
	var templates = [];
	var gr = new GlideRecord("sys_ux_composite_data_template");
	gr.addQuery("sys_id", "IN", templateIds.toString());
	gr.addActiveQuery();
	gr.query();
	while (gr.next()) {
		var template = {"id": gr.getUniqueValue(),
						"template" : JSON.parse(gr.getValue("template"))};
		templates.push(template);
	}
	var result = [];
	input
		.graphqlData
		.data
		.GlideCompositeIterableData_Query
		.getCompositeData
		.items
		.forEach(function (item) {
			for (template in templates) {
				templateObj = templates[template];
				if (templateObj.id.indexOf(item.template) > -1) {
					var propMap = {};
					item.props.forEach(function(fieldValue) {
						if (fieldValue.name === 'sys_id')
							propMap['sysId'] = fieldValue.value;
						propMap[fieldValue.name] = fieldValue.value;
					});

					var templateResult = {
						"template": templateObj.template.component,
						"propValues": getPropValues(propMap, item.actions, templateObj.template)
					};

					result.push(templateResult);
				}
			}
		});
	
	function getPropValues(propMap, actions, template) {
		var propValues = {};
		getPropsFromFieldMappings(propValues, propMap, template.mappings);
		getPropsFromStaticValues(propValues, template.staticValues);
		getPropsFromActionMappings(propValues, propMap, actions, template.actionMappings);
		return propValues;
	}

	function getPropsFromFieldMappings(result, propMap, propFieldMappings) {
		for (var prop in propFieldMappings) {
			if (propFieldMappings.hasOwnProperty(prop)) {
				result[prop] = propMap[propFieldMappings[prop]] || '';
			}
		}
	}

	function getPropsFromStaticValues(result, staticPropValues) {
		for (var prop in staticPropValues) {
			if (staticPropValues.hasOwnProperty(prop)) {
				result[prop] = getTranslatedStaticValues(staticPropValues[prop]);
			}
		}
	}

	function getTranslatedStaticValues(propVal) {
		if (propVal === null || typeof propVal !== 'object')
			return '';
		var propValKey = GlideStringUtil.escapeHTML(propVal.key);
		return propVal.translatable ? gs.getMessage(propValKey) : propValKey;
	}

	function getPropsFromActionMappings(result, propMap, actions, actionMappings) {
		var actionMap = {};
		actions.forEach(function(action) {
			actionMap[action.name] = action;
		});

		for (var prop in actionMappings) {

			if (actionMappings.hasOwnProperty(prop)) {
				var mappedActions = actionMappings[prop];

				if (Array.isArray(mappedActions)) {
					var actionArr = [];
					mappedActions.forEach(function(actionName) {
						var processedAction = getProcessedAction(actionMap, actionName, propMap);
						if (processedAction)
							actionArr.push(processedAction);
					});
					result[prop] = actionArr;
				} else {
					result[prop] = getProcessedAction(actionMap, mappedActions, propMap);
				}
			}
		}
		result['model'] = propMap;
	}

	function getProcessedAction(actionMap, actionName, propMap) {
		try {
			var action = actionMap[actionName] ? JSON.parse(JSON.stringify(actionMap[actionName])) : null;
			if (action === null) {
				return null;
			}
			var actionType = action.actionType;
			if (actionType !== "uxf_client_action") {
				return action;
			}

			var actionPayloadMapFieldValues = action.actionPayloadMap;
			action.actionPayload = resolveActionPayloadDataBinding(propMap, JSON.parse(action.actionPayload), actionPayloadMapFieldValues);
			delete(action.actionPayloadMap);

			return action;
		} catch (e) {
			gs.logError("Error resolving/processing declarative action: " + e);
			return null;
		}
	}

	function resolveActionPayloadDataBinding(propMap, actionPayload, actionPayloadMapFieldValues) {
		var actionPayloadMap = {};
		actionPayloadMapFieldValues.forEach(function(fieldValue) {
			var key = fieldValue.name;
			var value = fieldValue.value;
			if (/{{.*}}/.test(value)) {
				var dynamicBindingVar = value.match(/{{(.*)}}/)[1];
				value = propMap[dynamicBindingVar] || '';
			} else {
				value = GlideStringUtil.escapeHTML(value);
			}
			actionPayloadMap[key] = value;
		});
		var resolvedActionPayload = {};
		for (var key in actionPayload) {
			if (actionPayload.hasOwnProperty(key)) {
				var value = actionPayload[key];
				if (/{{.*}}/.test(value)) {
					resolvedActionPayload[key] = actionPayloadMap[key] || '';
				} else {
					resolvedActionPayload[key] = GlideStringUtil.escapeHTML(value);
				}
			}
		}
		return resolvedActionPayload;
	}
	return {
		items: result,
		all_actions: compositeData.all_actions
	};
}
