var scope = gs.nil(current.sys_scope) ? 'global' : current.sys_scope.scope;
var name = new TSConfigurationAjax().getValidIndexGroupName(current.label, scope);
if (gs.nil(name))
	current.setAbortAction(true);
else
	current.name = name;
