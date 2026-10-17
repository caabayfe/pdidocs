var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '916b8a44b76010103186f2b1de11a9c0, 13290604b76010103186f2b1de11a949, 37698604b76010103186f2b1de11a9aa, e6ca4644b76010103186f2b1de11a940');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
