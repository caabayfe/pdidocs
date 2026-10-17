(function() {
	data.portal_suffix = $sp.getPortalRecord().getValue("url_suffix");
	var request_id = options.sys_id || input.request_id;
	var gr = new GlideRecord('sc_request');
	if (!gr.get(request_id) || !gr.canRead())
		return;

	var roles = gs.getProperty('glide.sc.allow.clone.roles', '');
	if (roles != '' && !gs.hasRole(roles))
		return;

	if (input.action == "progress_worker") {
		var pgr = new GlideRecord('sys_progress_worker');
		if (pgr.get(input.pid)) {
			data.result = {
				name: pgr.name +'',
				message: pgr.message + '',
				output_summary: pgr.output_summary + '',
				state: pgr.state + ''
			};
		}
		return;
	}
	var cloneWorker = new GlideCatalogCloneWorker();
	cloneWorker.setProgressName(gs.getMessage('Cloning Request: {0}', gr.number));
	cloneWorker.setRequest(request_id);
	cloneWorker.setUserList(options.users);
	cloneWorker.setBackground(true);
	cloneWorker.setEngagementChannel(options.engagement_channel);
	cloneWorker.setReferrer(options.referrer);
	cloneWorker.start();
	options.pid = cloneWorker.getProgressID();
	options.request_id = request_id;
})();
