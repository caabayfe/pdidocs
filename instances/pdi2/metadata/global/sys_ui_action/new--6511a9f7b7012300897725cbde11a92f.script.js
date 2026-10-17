function newUIParameter() {
	var currentUrl = new URL(top.window.location);
	var uiParameterTableURL = new GlideURL('sys_sg_ui_parameter.do');
	uiParameterTableURL.addParam('sys_id', -1);
	_addParmReferringIfExists(currentUrl, uiParameterTableURL);
	_addParmQueryIfNeeded(uiParameterTableURL);
	top.window.location = _getFullURL(currentUrl, uiParameterTableURL);

	function _getFullURL(currentUrl, uiParameterTableURL) {
		var fullUrl;
		if (!currentUrl.pathname.substring(1).startsWith('nav_to.do'))
			return uiParameterTableURL.getURL();

		fullUrl = new GlideURL('nav_to.do');
		fullUrl.addParam('uri', uiParameterTableURL.getURL());
		return fullUrl.getURL();
	}

	function _addParmReferringIfExists(url, uiParameterTableURL) {
		var parmView = url.searchParams.get('sysparm_view');
		var refUrl;
		var target;
		var targetValue;
		if (!parmView || parmView !== 'sys_ref_list')
			return;

		uiParameterTableURL.addParam('sysparm_view', parmView);
		refUrl = new GlideURL(url.pathname.substring(1));
		target = url.searchParams.get('sysparm_target');
		if (target)
			refUrl.addParam('sysparm_target', target);

		targetValue = url.searchParams.get('sysparm_target_value');
		if (targetValue)
			refUrl.addParam('sysparm_target_value', targetValue);

		uiParameterTableURL.addParam('sysparm_referring_url', refUrl.getURL());
	}

	// In case of Related List
	function _addParmQueryIfNeeded(uiParameterTableURL) {
		if (typeof g_form === 'undefined' || typeof g_form === 'function')
			return;

		uiParameterTableURL.addParam('sysparm_query', _getRelatedLinkQuery());
	}

	function _getRelatedLinkQuery() {
		var parentTableName = g_form.getTableName();
		var parentRecordId = g_form.getUniqueValue();
		var parentType;
		if (parentTableName == 'sys_sg_button')
			parentType = 'button';
		else
			parentType = 'screen';
		
		return parentType + '=' + parentRecordId + '^parameter_type=' + parentType;
	}
}
