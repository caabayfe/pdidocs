var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '6d5cc5b8b7601010a4fbfa13ee11a90c, 061ca078b7201010a4fbfa13ee11a98b');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
