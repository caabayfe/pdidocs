(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

   function insertOrUpdateUIParameter(data) {
		var gr = new GlideRecord('sys_sg_ui_parameter');

		if (data.sys_id !== '-1') {
			gr.get(data.sys_id);

			if (!gr.isValidRecord()) {
				throw new Error('Invalid GlideRecord');
			}

		} else {
			gr.newRecord();
		}

		gr.setValue('sys_scope', data.scope);
		gr.setValue('input_source', getValueFromRequest('input_source'));
		gr.setValue('name', getValueFromRequest('name'));
		gr.setValue('input_type', getValueFromRequest('input_type'));
	    gr.setValue('screen', getValueFromRequest('screen'));
	    gr.setValue('parameter_type', 'screen');
	   
	   if (getValueFromRequest('input_source') === 'user') {
		    gr.setValue('order', getValueFromRequest('order'));
			gr.setValue('table_name', getValueFromRequest('table_name'));
			gr.setValue('field_name', getValueFromRequest('field_name'));
			gr.setValue('default_value', getValueFromRequest('default_value'));
			gr.setValue('default_value_type', getValueFromRequest('default_value_type'));
			gr.setValue('input_style', getValueFromRequest('input_style'));
			gr.setValue('placeholder', getValueFromRequest('placeholder'));
			gr.setValue('mandatory', getValueFromRequest('mandatory'));
		   
		   if (getValueFromRequest('input_type') === 'list') {
			   gr.setValue('multi_select', getValueFromRequest('multi_select'));
		   }
	   }

		if (gr.isNewRecord()) {
			gr.insert();
		} else {
			gr.update();
		}

		return {
			input_source: gr.getValue('input_source'),
			name: gr.getValue('name'),
			input_type: gr.getValue('input_type'),
			sys_id: gr.getUniqueValue()
		}

		function getValueFromRequest(field) {
			var fieldObject = data[field];
			if (fieldObject && fieldObject.value) {
				return fieldObject.value;
			}

			return null;
		}
	}

	return insertOrUpdateUIParameter(request.body.data);
})(request, response);
