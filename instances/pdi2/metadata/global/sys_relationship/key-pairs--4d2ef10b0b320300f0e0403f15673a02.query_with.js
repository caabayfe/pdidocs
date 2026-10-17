(function refineQuery(current, parent) {
	
	var cond=current.addJoinQuery('cmdb_rel_ci','sys_id','parent');
	cond.addCondition('child', parent.sys_id);
	cond.addCondition('type','5f985e0ec0a8010e00a9714f2a172815'); //Hosted on::Hosts

})(current, parent);
