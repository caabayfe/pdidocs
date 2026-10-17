var aclGR = new GlideRecord('sys_security_acl');
if (aclGR.get('39f25eb4dbbd1010542ae8cd13961952')) {
    aclGR.setValue('active', true);
    aclGR.update();
}
