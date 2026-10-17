var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '485fcdf8b7601010a4fbfa13ee11a9fd, afef053cb7601010a4fbfa13ee11a979, fa61157cb7601010a4fbfa13ee11a9d0, cc6fc13cb7601010a4fbfa13ee11a914');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
