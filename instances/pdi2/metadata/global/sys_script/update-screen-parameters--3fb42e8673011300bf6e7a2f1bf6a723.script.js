(function executeRule(current, previous /* null when async */) {
	var itemParameters;
	var uiParameterId;
	var currentUiParamOrder = 0;
	if (sys_action === 'delete' || sys_action === 'update') {
		_removeParameterMappings(current.getUniqueValue());
		_removeScreenUIParameters(current.getUniqueValue());		
	}

	if (sys_action === 'insert' || sys_action === 'update') {
		itemParameters = _getItemParameters(current.data_item);
		for (var index in itemParameters) {
			uiParameterId = _insertNewUIParameter(current.getUniqueValue(), itemParameters[index].name);
			_insertScreenParameterMapping(current.getUniqueValue(), itemParameters[index].id, uiParameterId);
		}
	}

	function _removeScreenUIParameters(screenId) {
		var uiParameterGR = new GlideRecord('sys_sg_ui_parameter');
		uiParameterGR.addQuery('screen', screenId);
		uiParameterGR.query();
		while (uiParameterGR.next())
			uiParameterGR.deleteRecord();
	}

	function _removeParameterMappings(screenId) {
		var screenParamMapGR = new GlideRecord('sys_sg_screen_param_map');
		screenParamMapGR.addQuery('screen', screenId);
		screenParamMapGR.query();
		while (screenParamMapGR.next())
			screenParamMapGR.deleteRecord();
	}

	function _insertScreenParameterMapping(screenId, itemParameterId, uiParamId) {
		var itemParamMappingGR = new GlideRecord('sys_sg_screen_param_map');
		itemParamMappingGR.initialize();
		itemParamMappingGR.screen = screenId;
		itemParamMappingGR.item_parameter = itemParameterId;
		itemParamMappingGR.ui_parameter = uiParamId;
		itemParamMappingGR.insert();
	}

	/* Returns the Id of the newly created parameter */
	function _insertNewUIParameter(screenId, paramName) {
		var uiParamGR = new GlideRecord('sys_sg_ui_parameter');
		uiParamGR.initialize();
		uiParamGR.setValue('name', paramName);
		uiParamGR.setValue('parameter_type', 'screen');
		uiParamGR.setValue('screen', screenId);
		uiParamGR.setValue('order', currentUiParamOrder);
		uiParamGR.input_style = 'inline';
		uiParamGR.input_source = 'user';
		uiParamGR.input_type = 'text';
		uiParamGR.insert();
		
		currentUiParamOrder += 10;

		return uiParamGR.getUniqueValue();
	}

	function _getItemParameters(dataItemId) {
		var itemParamArray = [];
		var itemParameterGR = new GlideRecord('sys_sg_item_parameter');
		itemParameterGR.addQuery('parent', dataItemId);
		itemParameterGR.query();
		while (itemParameterGR.next())
			itemParamArray.push({
				id: itemParameterGR.getUniqueValue(),
				name: itemParameterGR.getValue('name')
			});

		return itemParamArray;
	}
})(current, previous);
