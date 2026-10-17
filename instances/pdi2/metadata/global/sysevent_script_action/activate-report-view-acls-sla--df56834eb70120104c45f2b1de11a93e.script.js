var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '508a4938b7601010a4fbfa13ee11a990, 0df8c5f4b7601010a4fbfa13ee11a9c6, ea8a8178b7601010a4fbfa13ee11a942, 7bc741f4b7601010a4fbfa13ee11a9c8, b98a4938b7601010a4fbfa13ee11a939');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
