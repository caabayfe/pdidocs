var appProp = new GlideRecord('sys_application_property');
appProp.get(current.sys_application_property);
answer = appProp.canWrite();
