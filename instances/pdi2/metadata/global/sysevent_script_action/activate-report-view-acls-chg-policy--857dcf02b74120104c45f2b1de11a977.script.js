var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '4f9b1604736010102eb52d2b04f6a73b, 7d8952c0736010102eb52d2b04f6a798, 2f881a80736010102eb52d2b04f6a76a');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
