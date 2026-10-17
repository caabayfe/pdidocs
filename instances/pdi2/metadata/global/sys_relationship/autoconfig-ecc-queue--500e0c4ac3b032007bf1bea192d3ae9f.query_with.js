(function refineQuery(current, parent) {

 	current.addQuery('agent_correlator', 'IN', parent.range_assign_status);

})(current, parent);
