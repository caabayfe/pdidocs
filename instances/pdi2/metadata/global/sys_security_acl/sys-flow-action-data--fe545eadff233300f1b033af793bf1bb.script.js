answer = false;
(function () {
	var flow;
	if (!gs.nil(current.flow)) {
		flow = new GlideRecord('sys_hub_flow');
		if (flow.get('sys_id', current.flow))
			answer = flow.canRead();
		
	}
}());
