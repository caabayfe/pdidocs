(function executeRule(current, previous /*null when async*/) {
	var scope = current.sys_scope.scope;

	if (scope.nil())
		scope = 'global';

	var api_name = '';

	if (!current.name.nil())
		api_name = scope + '.' + current.name;	

	current.api_name = api_name;
})(current, previous);
