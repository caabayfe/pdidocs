var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', 'd4eba6c4b7a010103186f2b1de11a994');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
