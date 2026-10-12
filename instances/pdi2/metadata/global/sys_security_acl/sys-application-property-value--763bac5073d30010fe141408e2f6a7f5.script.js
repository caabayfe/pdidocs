var appProp = new GlideRecord('sys_application_property');
appProp.get(current.sys_application_property);
if (appProp.sys_scope.scope != gs.getCurrentApplicationScope())
	answer = false;
else
	answer = appProp.canWrite();
