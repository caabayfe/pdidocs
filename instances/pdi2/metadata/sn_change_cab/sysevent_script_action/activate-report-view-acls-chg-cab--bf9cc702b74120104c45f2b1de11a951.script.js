var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '29098204b76010103186f2b1de11a988, 55aac244b76010103186f2b1de11a941, 1e8cca44b76010103186f2b1de11a91f, a3e9ca04b76010103186f2b1de11a921, c39d4e84b76010103186f2b1de11a931');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
