(function() {
	if (pm.isZboot())
		return;
	
	var aclToRemove = [
			'411372e2c3223010a282a539e540dd1f',
			'4a68f896c3e13010a282a539e540ddba',
			'37e27492c3e13010a282a539e540dd1b',
			'79c6e89ac3a13010a282a539e540ddd1'
		];

		var aclCheckGR = new GlideRecord('sys_security_acl');
		aclCheckGR.addQuery('sys_id', 'IN', aclToRemove);
		aclCheckGR.deleteMultiple();
})();
