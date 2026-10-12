var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'ec58b09d3b0e501006f1600713efc489');
aclGR.query();
if (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
