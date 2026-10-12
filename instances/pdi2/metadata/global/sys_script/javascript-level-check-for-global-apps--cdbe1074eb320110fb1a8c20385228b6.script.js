(function executeRule(current, previous /*null when async*/) {

	if ((current.scope == 'global' && current.js_level == 'es_latest') ||
		(current.scope.nil() && current.js_level == 'es_latest')) {
		gs.warn(gs.getMessage("Global applications do not support 'ECMAScript 2021 (ES12)' javascript mode. Setting javascript mode to 'ES5 Standards Mode'."));
		current.setValue('js_level', 'helsinki_es5');
	}

})(current, previous);
