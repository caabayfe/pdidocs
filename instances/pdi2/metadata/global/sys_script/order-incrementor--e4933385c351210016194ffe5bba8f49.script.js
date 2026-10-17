incrementOrder();
function incrementOrder() {
	if(JSUtil.notNil(current.order))
		return;
	var gr = new GlideRecord('ldap_server_url');
	gr.addQuery('server', current.server);
	gr.orderByDesc('order');
	gr.setLimit(1);
	gr.query();
	if (gr.next())
		current.order = gr.order + 100;
	else
		current.order = 100;
}
