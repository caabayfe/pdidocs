var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '20ac5a8cb76010103186f2b1de11a977, 398e9accb76010103186f2b1de11a906, 6c6ede8cb76010103186f2b1de11a900, 7ee616c8b76010103186f2b1de11a96d');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
