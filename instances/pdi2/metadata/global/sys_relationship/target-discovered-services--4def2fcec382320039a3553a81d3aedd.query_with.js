(function refineQuery(current, parent) {
	var bs_ids = [];
	var ep_ids = [];
	var gr = GlideRecord('cmdb_ci_endpoint');
	gr.addQuery('port', parent.target_port);
	var cnd = gr.addQuery('ip_address', parent.target_ip);
	cnd.addOrCondition('host', parent.target_ip);
	gr.query();
	while (gr.next()) {
		ep_ids.push('' + gr.sys_id);
	}
	gs.print('RRRRRRRRR: ' + JSON.stringify(ep_ids));
	gr = new GlideRecord('svc_ci_assoc');
	gr.addQuery('ci_id', 'IN', ep_ids);
	gr.query();
	while (gr.next()) {
		bs_ids.push('' + gr.service_id);
	}
	current.addQuery('sys_id', 'IN', bs_ids);

})(current, parent);
