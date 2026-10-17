var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '0be212cc732010102eb52d2b04f6a7f3');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
