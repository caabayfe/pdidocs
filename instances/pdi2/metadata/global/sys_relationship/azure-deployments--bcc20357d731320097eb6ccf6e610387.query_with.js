(function refineQuery(current, parent) {
	var rel = new GlideRecord('cmdb_rel_ci');
	rel.addQuery('child', parent.getUniqueValue());
	rel.addQuery('type.name', "Hosted on::Hosts");
	rel.addQuery('parent.sys_class_name', "cmdb_ci_azure_deployment");
	rel.query();
	var ciIds = [];
	while (rel.next())
		ciIds.push(rel.getValue('parent'));
	
	current.addQuery('sys_id', 'IN', ciIds);

})(current, parent);
