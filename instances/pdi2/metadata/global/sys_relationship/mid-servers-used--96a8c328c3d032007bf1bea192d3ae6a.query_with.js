(function refineQuery(current, parent) {

	current.addQuery('sys_id', "IN", parent.mid_server_list);

})(current, parent);
