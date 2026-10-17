var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '1cc74f2573151010d70877186bf6a77b,7bd6c32573151010d70877186bf6a7f7,dab38ba173151010d70877186bf6a758,eb768fe173151010d70877186bf6a778');
aclGR.query();
while (aclGR.next()) {
	aclGR.setValue('active', true);
	aclGR.update();
}
