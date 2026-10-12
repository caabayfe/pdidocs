var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'b4a9cb6573151010d70877186bf6a783');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
