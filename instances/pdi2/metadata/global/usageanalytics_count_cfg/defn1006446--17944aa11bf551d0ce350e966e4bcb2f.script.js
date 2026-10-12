answer = countACLs();

function countACLs() {
	var gr = new GlideAggregate('sys_security_acl');
	gr.addAggregate('COUNT');
	var join = gr.addJoinQuery('sys_security_acl_role', 'sys_id', 'sys_security_acl');
	gr.addQuery('active', '1');
	gr.addNullQuery('condition');
	gr.addNullQuery('script');
	join.addCondition('sys_security_acl', '!=', '');
	gr.query();
	if (gr.next())
		return gr.getAggregate('COUNT');

	return 0;
}
