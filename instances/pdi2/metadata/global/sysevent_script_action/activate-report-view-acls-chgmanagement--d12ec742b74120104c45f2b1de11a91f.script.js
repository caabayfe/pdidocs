var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '050c1a04736010102eb52d2b04f6a7ac, 11579ec8b76010103186f2b1de11a956, ed8f9200b7a010103186f2b1de11a986, 28471e40736010102eb52d2b04f6a764, bc1a96c0736010102eb52d2b04f6a74f, 5e3d9e8cb76010103186f2b1de11a990, eda1e240b7a010103186f2b1de11a9fc, 9198a644b7a010103186f2b1de11a9e8, 85d833a0b72010103186f2b1de11a993, 7e9ecf2673a010102eb52d2b04f6a7dc');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
