var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', ['529ccbb83bca101006f1600713efc4c2', 'af2b03743bca101006f1600713efc497']);
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
