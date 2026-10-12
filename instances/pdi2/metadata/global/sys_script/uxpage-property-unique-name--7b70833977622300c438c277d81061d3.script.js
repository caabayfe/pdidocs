(function executeRule(current, previous /*null when async*/) {
	var routeSysId = current.getValue('route');
	var propName = current.getValue('name');
	var domain = current.getValue('sys_domain');
	var baseName = !routeSysId ? 'root.' + domain + "." + propName : 'route.' + domain + "." + propName + '.' + routeSysId;
	var scopePrefix = current.sys_scope.source + "." + current.page + ".";
	var uniqueName = (propName.indexOf(scopePrefix) == 0) ? baseName : scopePrefix + baseName;	
	current.setValue('unique_name', uniqueName);
	
	var fType = current.getValue('type');
	if (fType == 'choicelist')
		current.setValue('value', current.getValue('choices'));
	else
		current.setValue('choices', '');
})(current, previous);
