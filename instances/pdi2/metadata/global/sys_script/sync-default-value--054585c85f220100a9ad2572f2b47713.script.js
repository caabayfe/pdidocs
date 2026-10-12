synchronizeDefaultValue(current);

function synchronizeDefaultValue(gr) {
	if (gr.default_value.changes()) {
		processDefaultValue(gr);
	} else if (gr.dynamic_default_value.changes()) {
		gr.default_value = getDefaultValue(gr);
		gr.use_dynamic_default = (gr.default_value == '') ? false : true;
	} else if (gr.use_dynamic_default.changesTo(false)) {
		if (!gr.default_value.nil()) {
			processDefaultValue(gr);
		} else {
			gr.default_value = '';
			gr.dynamic_default_value = '';
		}
	}
}

function processDefaultValue(gr) {
	gr.dynamic_default_value = getDynamicDefaultValue(gr.default_value.toString(), gr.reference.toString());
	gr.use_dynamic_default = (gr.dynamic_default_value == '') ? false : true;	
}

function getDynamicDefaultValue(defaultValue, reference_table) {
	defaultValue = defaultValue.trim();
	if (isValidJavascriptCall(defaultValue)) {
		defaultValue = defaultValue.substring("javascript:".length);
		if (defaultValue.endsWith(';'))
			defaultValue = defaultValue.substring(0, defaultValue.length - 1);
		
		var dyn = new GlideRecord('sys_filter_option_dynamic');
		dyn.addQuery('script', defaultValue).addOrCondition('script', defaultValue + ';');
		
		if (!reference_table.nil())
			dyn.addQuery('table', reference_table);		

		dyn.query();
		if (dyn.next())
			return dyn.sys_id.toString();
	}
	
	return '';
}

function isValidJavascriptCall(str) {
	if (str.indexOf('javascript:') != 0)
			return false;
			
	if (str.substring('javascript:'.length) == '')
		return false;
		
	return true;
}

function getDefaultValue(gr) {
	if (gr.dynamic_default_value.script.nil())
		return '';
	
	return 'javascript:' + gr.dynamic_default_value.script;
}
