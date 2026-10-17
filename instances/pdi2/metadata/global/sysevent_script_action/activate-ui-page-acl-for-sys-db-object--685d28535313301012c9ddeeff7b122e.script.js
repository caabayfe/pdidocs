var aclGr = new GlideRecord('sys_security_acl');
aclGr.addQuery('sys_id', 'IN', 'b90d24535313301012c9ddeeff7b124f');
aclGr.setWorkflow(false);
aclGr.query();
while (aclGr.next()) {
    aclGr.setValue('active', true);
    aclGr.update();
}
