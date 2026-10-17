answer = totalViewsofKBarticles();

function totalViewsofKBarticles () {
	if (!GlideTableDescriptor.isValid('kb_knowledge'))
		return 0;
	
	var ga = new GlideAggregate('kb_knowledge');
	ga.setGroup(false);
	ga.addAggregate('SUM', 'sys_view_count');
	ga.query();
	if (ga.next())
		return ga.getAggregate('SUM', 'sys_view_count')
	
	return 0;
}
