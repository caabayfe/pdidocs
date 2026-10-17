var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '9f32928c732010102eb52d2b04f6a716, 588e020c732010102eb52d2b04f6a766');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
