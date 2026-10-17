var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN' , 'beab8ab3531d1010c5e2ddeeff7b124a, 7a5b86b3531d1010c5e2ddeeff7b12f1, 56cb0eb3531d1010c5e2ddeeff7b1240');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
