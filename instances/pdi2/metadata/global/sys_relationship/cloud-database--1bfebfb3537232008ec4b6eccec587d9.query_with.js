(function refineQuery(current, parent) {

	current.addJoinQuery('cmdb_rel_ci', 'sys_id', 'parent').addCondition('child', parent.getUniqueValue()).addCondition('type.parent_descriptor', "Hosted on");

})(current, parent);
