function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	if (!g_form.isNewRecord()) {
		if (newValue == 'true')
			g_form.setValue("client_callable", false);

		return;
	}

	var name = '' + g_form.getValue('name');
	if (typeof window !== 'undefined' && window && window.NOW && window.NOW.SyntaxEditor && window.NOW.SyntaxEditor.sanitizeVarName) {
		name = window.NOW.SyntaxEditor.sanitizeVarName(name);
	}
	if (!name)
		return;

	var script = '' + g_form.getValue('script');
	var scope = '' + g_form.getValue('sys_scope');
	var ajaxProcessor = 'AbstractAjaxProcessor';
	var abstractMobileCallableInclude = 'AbstractMobileCallableInclude';
	if (scope && scope != 'global') {
		ajaxProcessor = 'global.' + ajaxProcessor;
		abstractMobileCallableInclude = 'global.' + abstractMobileCallableInclude;
	}
	
	var clientCallable = g_form.getBooleanValue("client_callable") == true;	
	var mobileCallable = newValue == 'true';
	if (mobileCallable) {
		var oldProto;
		if (clientCallable) {
			oldProto = name + '.prototype = Object.extendsObject(' + ajaxProcessor + ', {';
			g_form.setValue("client_callable", false);
		} else {
			oldProto = name + '.prototype = {\n';
			oldProto += '    initialize: function() {\n';
			oldProto += '    },';
		}

		var newProto = name + '.prototype = Object.extendsObject(' + abstractMobileCallableInclude + ', {';
		script = script.replace(oldProto, newProto);
		if (!_endsWith(script, '});') && _endsWith(script, '};')) {
			script = script.substring(0, script.length - 1);}
		if (!_endsWith(script, ');')) {
			script += ');';
		}
	} else if (!clientCallable) {
		var oldProto = name + '.prototype = Object.extendsObject(' + abstractMobileCallableInclude + ', {';
		var newProto = name + '.prototype = {\n';
		newProto += '    initialize: function() {\n';
		newProto += '    },';
		script = script.replace(oldProto, newProto);
		if (_endsWith(script, ');')) {
			script = script.substring(0, script.length - 2);
			script += ';';
		}
	}
	g_form.setValue('script', script);	

	function _endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

}
